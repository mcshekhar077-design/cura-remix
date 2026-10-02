import crypto from "crypto";
import { db } from "../storage/postgres/client";
import { redis } from "../storage/redis/client";
import { cryptoLedger } from "../gateway/cryptoAudit";

export interface Appointment {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  scheduledStart: string;
  scheduledEnd: string;
  tokenNumber: number;
  queueStatus: "SCHEDULED" | "CHECKED_IN" | "IN_CONSULT" | "COMPLETED" | "CANCELLED";
  consultationMode: "IN_PERSON" | "VIDEO" | "AUDIO";
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

export class AppointmentDomainService {
  public static async getAppointments(tenantId: string, doctorId?: string): Promise<Appointment[]> {
    const table = (db as any).getTable("appointments");
    const results: Appointment[] = [];
    for (const item of table.values()) {
      if (item.tenant_id === tenantId) {
        if (!doctorId || item.doctor_id === doctorId) {
          results.push({
            id: item.id,
            tenantId: item.tenant_id,
            patientId: item.patient_id,
            doctorId: item.doctor_id,
            scheduledStart: item.scheduled_start,
            scheduledEnd: item.scheduled_end,
            tokenNumber: item.token_number || 1,
            queueStatus: item.queue_status || "SCHEDULED",
            consultationMode: item.consultation_mode || "IN_PERSON",
            meetingLink: item.meeting_link,
            notes: item.notes,
            createdAt: item.created_at
          });
        }
      }
    }
    return results;
  }

  public static async scheduleAppointment(
    tenantId: string,
    data: {
      patientId: string;
      doctorId: string;
      scheduledStart: string;
      scheduledEnd: string;
      consultationMode?: "IN_PERSON" | "VIDEO" | "AUDIO";
      notes?: string;
    }
  ): Promise<Appointment> {
    const table = (db as any).getTable("appointments");
    const existing = Array.from(table.values()).filter((a: any) => a.tenant_id === tenantId);
    const tokenNumber = existing.length + 1;

    const id = `apt_${crypto.randomBytes(6).toString("hex")}`;
    const apt: Appointment = {
      id,
      tenantId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      tokenNumber,
      queueStatus: "SCHEDULED",
      consultationMode: data.consultationMode || "IN_PERSON",
      meetingLink: data.consultationMode === "VIDEO" ? `https://telehealth.clinitial.in/room/meet_${id}` : undefined,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    table.set(id, {
      id: apt.id,
      tenant_id: apt.tenantId,
      patient_id: apt.patientId,
      doctor_id: apt.doctorId,
      scheduled_start: apt.scheduledStart,
      scheduled_end: apt.scheduledEnd,
      token_number: apt.tokenNumber,
      queue_status: apt.queueStatus,
      consultation_mode: apt.consultationMode,
      meeting_link: apt.meetingLink,
      notes: apt.notes,
      created_at: apt.createdAt
    });

    // Enqueue SMS & WhatsApp notification via Redis
    await redis.enqueue("notifications", "Send Appointment Confirmation SMS", {
      patientId: data.patientId,
      tokenNumber,
      scheduledStart: data.scheduledStart
    });

    cryptoLedger.appendBlock({
      tenantId,
      eventType: "APPOINTMENT_SCHEDULED",
      actorId: data.doctorId,
      actorRole: "doctor",
      resourceType: "Appointment",
      resourceId: id,
      eventData: { tokenNumber, scheduledStart: data.scheduledStart }
    });

    return apt;
  }

  public static async updateQueueStatus(
    tenantId: string,
    appointmentId: string,
    status: "SCHEDULED" | "CHECKED_IN" | "IN_CONSULT" | "COMPLETED" | "CANCELLED"
  ): Promise<Appointment | null> {
    const table = (db as any).getTable("appointments");
    const existing = table.get(appointmentId);
    if (!existing || existing.tenant_id !== tenantId) return null;

    existing.queue_status = status;
    table.set(appointmentId, existing);

    return {
      id: existing.id,
      tenantId: existing.tenant_id,
      patientId: existing.patient_id,
      doctorId: existing.doctor_id,
      scheduledStart: existing.scheduled_start,
      scheduledEnd: existing.scheduled_end,
      tokenNumber: existing.token_number,
      queueStatus: existing.queue_status,
      consultationMode: existing.consultation_mode,
      meetingLink: existing.meeting_link,
      notes: existing.notes,
      createdAt: existing.created_at
    };
  }
}

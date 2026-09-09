import crypto from "crypto";
import { db } from "../storage/postgres/client";
import { cryptoLedger } from "../gateway/cryptoAudit";

export interface DiagnosticOrder {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  orderType: "PATHOLOGY" | "RADIOLOGY" | "CARDIOLOGY_ECG";
  testCode: string;
  testName: string;
  urgency: "ROUTINE" | "URGENT" | "STAT";
  status: "ORDERED" | "SAMPLE_COLLECTED" | "PROCESSING" | "COMPLETED";
  results?: any;
  findings?: string;
  fileAttachmentUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export class DiagnosticDomainService {
  public static async getOrders(tenantId: string, patientId?: string): Promise<DiagnosticOrder[]> {
    const table = (db as any).getTable("diagnostic_orders");
    const results: DiagnosticOrder[] = [];
    for (const item of table.values()) {
      if (item.tenant_id === tenantId) {
        if (!patientId || item.patient_id === patientId) {
          results.push({
            id: item.id,
            tenantId: item.tenant_id,
            patientId: item.patient_id,
            doctorId: item.doctor_id,
            orderType: item.order_type,
            testCode: item.test_code,
            testName: item.test_name,
            urgency: item.urgency,
            status: item.status,
            results: item.results,
            findings: item.findings,
            fileAttachmentUrl: item.file_attachment_url,
            createdAt: item.created_at,
            completedAt: item.completed_at
          });
        }
      }
    }
    return results.reverse();
  }

  public static async createOrder(
    tenantId: string,
    data: {
      patientId: string;
      doctorId: string;
      orderType: "PATHOLOGY" | "RADIOLOGY" | "CARDIOLOGY_ECG";
      testCode: string;
      testName: string;
      urgency?: "ROUTINE" | "URGENT" | "STAT";
    }
  ): Promise<DiagnosticOrder> {
    const id = `diag_${crypto.randomBytes(6).toString("hex")}`;
    const order: DiagnosticOrder = {
      id,
      tenantId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      orderType: data.orderType,
      testCode: data.testCode,
      testName: data.testName,
      urgency: data.urgency || "ROUTINE",
      status: "ORDERED",
      createdAt: new Date().toISOString()
    };

    const table = (db as any).getTable("diagnostic_orders");
    table.set(id, {
      id: order.id,
      tenant_id: order.tenantId,
      patient_id: order.patientId,
      doctor_id: order.doctorId,
      order_type: order.orderType,
      test_code: order.testCode,
      test_name: order.testName,
      urgency: order.urgency,
      status: order.status,
      created_at: order.createdAt
    });

    cryptoLedger.appendBlock({
      tenantId,
      eventType: "DIAGNOSTIC_ORDER_PLACED",
      actorId: data.doctorId,
      actorRole: "doctor",
      resourceType: "DiagnosticOrder",
      resourceId: id,
      eventData: { testName: data.testName, urgency: order.urgency }
    });

    return order;
  }
}

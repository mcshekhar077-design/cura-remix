import crypto from "crypto";
import { db } from "../storage/postgres/client";
import { redis } from "../storage/redis/client";
import { cryptoLedger } from "../gateway/cryptoAudit";
import { PatientDomainService } from "./patientDomainService";

export interface ClinicalEncounter {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  encounterType: "OPD" | "IPD" | "EMERGENCY" | "TELEMEDICINE";
  specialty: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    spo2: number;
    temperatureF: number;
  };
  provisionalDiagnosis: string;
  icd10Codes: string[];
  clinicalNotes: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  tenantId: string;
  encounterId: string;
  patientId: string;
  doctorId: string;
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    route: string;
    durationDays: number;
    instructions?: string;
  }>;
  instructions: string;
  contraindicationsChecked: boolean;
  allergyAlerts: string[];
  dispenseStatus: "PENDING" | "PARTIAL" | "DISPENSED";
  createdAt: string;
}

export class ClinicalDomainService {
  public static async getEncountersByPatient(tenantId: string, patientId: string): Promise<ClinicalEncounter[]> {
    const encountersTable = (db as any).getTable("clinical_encounters");
    const encounters: ClinicalEncounter[] = [];
    for (const item of encountersTable.values()) {
      if (item.tenant_id === tenantId && item.patient_id === patientId) {
        encounters.push({
          id: item.id,
          tenantId: item.tenant_id,
          patientId: item.patient_id,
          doctorId: item.doctor_id,
          encounterType: item.encounter_type,
          specialty: item.specialty,
          chiefComplaint: item.chief_complaint,
          historyOfPresentIllness: item.history_of_present_illness,
          vitals: item.vitals,
          provisionalDiagnosis: item.provisional_diagnosis,
          icd10Codes: item.icd10_codes || [],
          clinicalNotes: item.clinical_notes,
          createdAt: item.created_at
        });
      }
    }
    return encounters.reverse();
  }

  public static async createEncounter(
    tenantId: string,
    data: {
      patientId: string;
      doctorId: string;
      encounterType?: "OPD" | "IPD" | "EMERGENCY" | "TELEMEDICINE";
      specialty?: string;
      chiefComplaint: string;
      historyOfPresentIllness?: string;
      vitals: {
        bpSystolic: number;
        bpDiastolic: number;
        heartRate: number;
        spo2: number;
        temperatureF: number;
      };
      provisionalDiagnosis: string;
      icd10Codes?: string[];
      clinicalNotes?: string;
    }
  ): Promise<ClinicalEncounter> {
    const id = `enc_${crypto.randomBytes(6).toString("hex")}`;
    const newEncounter: ClinicalEncounter = {
      id,
      tenantId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      encounterType: data.encounterType || "OPD",
      specialty: data.specialty || "General Medicine",
      chiefComplaint: data.chiefComplaint,
      historyOfPresentIllness: data.historyOfPresentIllness,
      vitals: data.vitals,
      provisionalDiagnosis: data.provisionalDiagnosis,
      icd10Codes: data.icd10Codes || [],
      clinicalNotes: data.clinicalNotes || "",
      createdAt: new Date().toISOString()
    };

    const encountersTable = (db as any).getTable("clinical_encounters");
    encountersTable.set(id, {
      id: newEncounter.id,
      tenant_id: newEncounter.tenantId,
      patient_id: newEncounter.patientId,
      doctor_id: newEncounter.doctorId,
      encounter_type: newEncounter.encounterType,
      specialty: newEncounter.specialty,
      chief_complaint: newEncounter.chiefComplaint,
      history_of_present_illness: newEncounter.historyOfPresentIllness,
      vitals: newEncounter.vitals,
      provisional_diagnosis: newEncounter.provisionalDiagnosis,
      icd10_codes: newEncounter.icd10Codes,
      clinical_notes: newEncounter.clinicalNotes,
      created_at: newEncounter.createdAt
    });

    // Record Immutable Audit Log
    cryptoLedger.appendBlock({
      tenantId,
      eventType: "CLINICAL_ENCOUNTER_RECORDED",
      actorId: data.doctorId,
      actorRole: "doctor",
      resourceType: "ClinicalEncounter",
      resourceId: id,
      eventData: { patientId: data.patientId, diagnosis: data.provisionalDiagnosis }
    });

    return newEncounter;
  }

  public static async issuePrescription(
    tenantId: string,
    data: {
      encounterId: string;
      patientId: string;
      doctorId: string;
      medications: Array<{
        drugName: string;
        dosage: string;
        frequency: string;
        route?: string;
        durationDays: number;
        instructions?: string;
      }>;
      instructions?: string;
    }
  ): Promise<Prescription> {
    const patient = await PatientDomainService.getPatientById(tenantId, data.patientId);
    const allergyAlerts: string[] = [];

    // Allergy contraindication screening
    if (patient && patient.allergies.length > 0) {
      for (const allergy of patient.allergies) {
        for (const med of data.medications) {
          if (med.drugName.toLowerCase().includes(allergy.toLowerCase())) {
            allergyAlerts.push(`CONTRAINDICATION: Patient has documented allergy to ${allergy}. Prescribed: ${med.drugName}`);
          }
        }
      }
    }

    const id = `rx_${crypto.randomBytes(6).toString("hex")}`;
    const newRx: Prescription = {
      id,
      tenantId,
      encounterId: data.encounterId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      medications: data.medications.map(m => ({
        drugName: m.drugName,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route || "Oral",
        durationDays: m.durationDays,
        instructions: m.instructions
      })),
      instructions: data.instructions || "Take with water after food.",
      contraindicationsChecked: true,
      allergyAlerts,
      dispenseStatus: "PENDING",
      createdAt: new Date().toISOString()
    };

    const rxTable = (db as any).getTable("prescriptions");
    rxTable.set(id, {
      id: newRx.id,
      tenant_id: newRx.tenantId,
      encounter_id: newRx.encounterId,
      patient_id: newRx.patientId,
      doctor_id: newRx.doctorId,
      medications: newRx.medications,
      instructions: newRx.instructions,
      contraindications_checked: newRx.contraindicationsChecked,
      allergy_alerts: newRx.allergyAlerts,
      dispense_status: newRx.dispenseStatus,
      created_at: newRx.createdAt
    });

    // Enqueue background Redis task for Pharmacy dispensing notifications
    await redis.enqueue("pharmacy_dispense_queue", "Dispatch E-Prescription to Pharmacy", {
      prescriptionId: id,
      patientId: data.patientId,
      medicationCount: data.medications.length
    });

    // Append cryptographic audit entry
    cryptoLedger.appendBlock({
      tenantId,
      eventType: "PRESCRIPTION_ISSUED",
      actorId: data.doctorId,
      actorRole: "doctor",
      resourceType: "Prescription",
      resourceId: id,
      eventData: { patientId: data.patientId, medications: data.medications.map(m => m.drugName), allergyAlerts }
    });

    return newRx;
  }
}

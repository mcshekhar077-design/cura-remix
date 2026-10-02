import crypto from "crypto";
import { db } from "../storage/postgres/client";
import { redis } from "../storage/redis/client";
import { cryptoLedger } from "../gateway/cryptoAudit";

export interface PatientRecord {
  id: string;
  tenantId: string;
  mrn: string;
  abhaId?: string;
  abhaAddress?: string;
  fullName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  emergencyContact?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  createdAt: string;
  updatedAt: string;
}

export class PatientDomainService {
  public static async getPatients(tenantId: string, search?: string): Promise<PatientRecord[]> {
    const cacheKey = `patients:${tenantId}:${search || "all"}`;
    const cached = await redis.get<PatientRecord[]>(cacheKey);
    if (cached) return cached;

    const res = await db.query<any>("SELECT * FROM patients WHERE tenant_id = $1", [tenantId]);
    let records: PatientRecord[] = res.rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      mrn: r.mrn,
      abhaId: r.abha_id,
      abhaAddress: r.abha_address,
      fullName: r.full_name,
      age: r.age,
      gender: r.gender,
      bloodGroup: r.blood_group,
      phone: r.phone,
      email: r.email,
      emergencyContact: r.emergency_contact,
      allergies: r.allergies || [],
      chronicConditions: r.chronic_conditions || [],
      currentMedications: r.current_medications || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at
    }));

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(p => 
        p.fullName.toLowerCase().includes(q) || 
        p.mrn.toLowerCase().includes(q) || 
        p.phone.includes(q) ||
        (p.abhaAddress && p.abhaAddress.toLowerCase().includes(q))
      );
    }

    await redis.set(cacheKey, records, 30);
    return records;
  }

  public static async getPatientById(tenantId: string, patientId: string): Promise<PatientRecord | null> {
    const res = await db.query<any>("SELECT * FROM patients WHERE tenant_id = $1 AND id = $2", [tenantId, patientId]);
    if (!res.rows.length) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      tenantId: r.tenant_id,
      mrn: r.mrn,
      abhaId: r.abha_id,
      abhaAddress: r.abha_address,
      fullName: r.full_name,
      age: r.age,
      gender: r.gender,
      bloodGroup: r.blood_group,
      phone: r.phone,
      email: r.email,
      emergencyContact: r.emergency_contact,
      allergies: r.allergies || [],
      chronicConditions: r.chronic_conditions || [],
      currentMedications: r.current_medications || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at
    };
  }

  public static async registerPatient(
    tenantId: string, 
    data: {
      fullName: string;
      age: number;
      gender: string;
      phone: string;
      bloodGroup: string;
      email?: string;
      allergies?: string[];
      chronicConditions?: string[];
      currentDiagnosis?: string;
    },
    actorId = "system_operator"
  ): Promise<PatientRecord> {
    const id = `pat_${crypto.randomBytes(6).toString("hex")}`;
    const mrn = `MRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient: PatientRecord = {
      id,
      tenantId,
      mrn,
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      phone: data.phone,
      email: data.email || `${data.fullName.toLowerCase().replace(/\s+/g, ".")}@clinitial-patient.in`,
      allergies: data.allergies || [],
      chronicConditions: data.chronicConditions || [],
      currentMedications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in DB
    const patientsTable = (db as any).getTable("patients");
    patientsTable.set(id, {
      id: newPatient.id,
      tenant_id: newPatient.tenantId,
      mrn: newPatient.mrn,
      full_name: newPatient.fullName,
      age: newPatient.age,
      gender: newPatient.gender,
      blood_group: newPatient.bloodGroup,
      phone: newPatient.phone,
      email: newPatient.email,
      allergies: newPatient.allergies,
      chronic_conditions: newPatient.chronicConditions,
      current_medications: newPatient.currentMedications,
      created_at: newPatient.createdAt
    });

    // Invalidate Redis cache
    await redis.del(`patients:${tenantId}:all`);

    // Record immutable audit ledger block
    cryptoLedger.appendBlock({
      tenantId,
      eventType: "PATIENT_REGISTERED",
      actorId,
      actorRole: "doctor",
      resourceType: "Patient",
      resourceId: id,
      eventData: { mrn, fullName: data.fullName, phone: data.phone }
    });

    return newPatient;
  }
}

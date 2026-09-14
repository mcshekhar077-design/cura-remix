export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  licenseNumber?: string;
  tier: "starter" | "pro" | "enterprise";
  status: "active" | "suspended" | "trial";
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  phone?: string;
  fullName: string;
  role: "super_admin" | "hospital_admin" | "doctor" | "nurse" | "pharmacist" | "radiologist" | "patient" | "auditor";
  specialization?: string;
  registrationCouncilNumber?: string;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUserContext {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: string;
  patientId?: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface Patient {
  id: string;
  tenantId: string;
  mrn: string;
  abhaId?: string;
  abhaAddress?: string;
  fullName: string;
  dateOfBirth?: string;
  age?: number;
  gender: string;
  bloodGroup?: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalEncounter {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  encounterType: "OPD" | "IPD" | "EMERGENCY" | "TELEMEDICINE";
  chiefComplaint: string;
  clinicalNotes: string;
  vitals: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    spo2?: number;
    temperature?: number;
    respiratoryRate?: number;
    bmi?: number;
  };
  diagnoses: Array<{ code: string; name: string; type: "provisional" | "final" }>;
  status: "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  tenantId: string;
  encounterId?: string;
  patientId: string;
  doctorId: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  status: "draft" | "signed" | "dispensed";
  isHitlApproved: boolean;
  approvedByDoctorId?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure" | "denied";
  details?: Record<string, any>;
  timestamp: string;
}

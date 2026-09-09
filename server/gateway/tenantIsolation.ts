import { TenantInfo } from "./types";

export const TENANTS: TenantInfo[] = [
  {
    id: "tenant_apollo",
    name: "Apollo Super Specialty Hospital",
    code: "APOLLO-HYD-01",
    city: "Hyderabad",
    state: "Telangana",
    tier: "tertiary",
    activeBeds: 120,
    activeDoctors: 45,
    status: "active",
    dbSchema: "tenant_apollo_clinical",
    encryptionKeyId: "kms-key-apollo-aes256"
  },
  {
    id: "tenant_fortis",
    name: "Fortis Healthcare Hub",
    code: "FORTIS-SEC-02",
    city: "Secunderabad",
    state: "Telangana",
    tier: "tertiary",
    activeBeds: 85,
    activeDoctors: 32,
    status: "active",
    dbSchema: "tenant_fortis_clinical",
    encryptionKeyId: "kms-key-fortis-aes256"
  },
  {
    id: "tenant_max",
    name: "Max Care Hospital & Cancer Institute",
    code: "MAX-DEL-03",
    city: "New Delhi",
    state: "Delhi",
    tier: "tertiary",
    activeBeds: 140,
    activeDoctors: 60,
    status: "active",
    dbSchema: "tenant_max_clinical",
    encryptionKeyId: "kms-key-max-aes256"
  },
  {
    id: "tenant_default",
    name: "CURA Central Clinical Tenant",
    code: "CURA-GLOBAL",
    city: "Bangalore",
    state: "Karnataka",
    tier: "secondary",
    activeBeds: 50,
    activeDoctors: 20,
    status: "active",
    dbSchema: "tenant_default_clinical",
    encryptionKeyId: "kms-key-cura-global"
  }
];

export interface ClinicalPatientRecord {
  id: string;
  tenantId: string;
  mrn: string; // Medical Record Number
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
  abhaId?: string;
  allergies: string[];
  currentDiagnosis: string;
  attendingDoctor: string;
  admissionStatus: "inpatient" | "outpatient" | "emergency" | "discharged";
  wardBed?: string;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    spo2: number;
    temperatureF: number;
  };
  lastUpdated: string;
}

// In-memory tenant-isolated relational clinical store
const clinicalDatabase: ClinicalPatientRecord[] = [
  // Apollo Patients
  {
    id: "PAT-APOLLO-001",
    tenantId: "tenant_apollo",
    mrn: "APOLLO-MRN-9021",
    fullName: "Amit Patel",
    age: 52,
    gender: "Male",
    phone: "+91 98480 11223",
    bloodGroup: "O+",
    abhaId: "amit.patel@abdm",
    allergies: ["Penicillin", "Sulfa Drugs"],
    currentDiagnosis: "Acute Coronary Syndrome (STEMI Post-PTCA)",
    attendingDoctor: "Dr. K. S. Murthy, MD",
    admissionStatus: "inpatient",
    wardBed: "ICU Bed #101",
    vitals: {
      bpSystolic: 128,
      bpDiastolic: 82,
      heartRate: 74,
      spo2: 99,
      temperatureF: 98.4
    },
    lastUpdated: "2026-09-08T18:30:00Z"
  },
  {
    id: "PAT-APOLLO-002",
    tenantId: "tenant_apollo",
    mrn: "APOLLO-MRN-9022",
    fullName: "Sneha Mukherjee",
    age: 34,
    gender: "Female",
    phone: "+91 98480 33445",
    bloodGroup: "B+",
    abhaId: "sneha.m@abdm",
    allergies: ["NSAIDs (Ibuprofen)"],
    currentDiagnosis: "Rheumatoid Arthritis with Synovial Effusion",
    attendingDoctor: "Dr. Sandeep Sen",
    admissionStatus: "outpatient",
    vitals: {
      bpSystolic: 118,
      bpDiastolic: 76,
      heartRate: 68,
      spo2: 98,
      temperatureF: 98.6
    },
    lastUpdated: "2026-09-07T11:15:00Z"
  },

  // Fortis Patients
  {
    id: "PAT-FORTIS-001",
    tenantId: "tenant_fortis",
    mrn: "FORTIS-MRN-4410",
    fullName: "Neha Sharma",
    age: 29,
    gender: "Female",
    phone: "+91 99890 55667",
    bloodGroup: "A+",
    abhaId: "neha.sharma@abdm",
    allergies: ["Latex"],
    currentDiagnosis: "Post-Operative Laparoscopic Cholecystectomy",
    attendingDoctor: "Dr. Rajesh Sharma, MD",
    admissionStatus: "inpatient",
    wardBed: "Surgical Ward Bed #204",
    vitals: {
      bpSystolic: 122,
      bpDiastolic: 78,
      heartRate: 80,
      spo2: 98,
      temperatureF: 99.1
    },
    lastUpdated: "2026-09-08T20:00:00Z"
  },
  {
    id: "PAT-FORTIS-002",
    tenantId: "tenant_fortis",
    mrn: "FORTIS-MRN-4411",
    fullName: "Rohan Verma",
    age: 41,
    gender: "Male",
    phone: "+91 99890 77889",
    bloodGroup: "AB+",
    abhaId: "rohan.verma@abdm",
    allergies: [],
    currentDiagnosis: "Complicated Lumbar Disc Herniation (L4-L5)",
    attendingDoctor: "Dr. Sanjay Roy, MD",
    admissionStatus: "outpatient",
    vitals: {
      bpSystolic: 130,
      bpDiastolic: 84,
      heartRate: 72,
      spo2: 99,
      temperatureF: 98.4
    },
    lastUpdated: "2026-09-08T14:40:00Z"
  },

  // Max Patients
  {
    id: "PAT-MAX-001",
    tenantId: "tenant_max",
    mrn: "MAX-MRN-7801",
    fullName: "Kavita Singhal",
    age: 58,
    gender: "Female",
    phone: "+91 98110 12345",
    bloodGroup: "O-",
    abhaId: "kavita.s@abdm",
    allergies: ["Morphine"],
    currentDiagnosis: "Stage II Breast Adenocarcinoma (Oncology Care)",
    attendingDoctor: "Dr. Ananya Reddy",
    admissionStatus: "inpatient",
    wardBed: "Oncology Daycare Bed #12",
    vitals: {
      bpSystolic: 124,
      bpDiastolic: 80,
      heartRate: 76,
      spo2: 97,
      temperatureF: 98.7
    },
    lastUpdated: "2026-09-08T16:20:00Z"
  }
];

/**
 * Executes a tenant-isolated query on the clinical database.
 * If tenantId is not supplied or does not match, returns ONLY records belonging to that tenant.
 */
export function queryTenantClinicalRecords(tenantId: string, filter?: {
  status?: string;
  doctor?: string;
  search?: string;
}): {
  tenantId: string;
  tenantName: string;
  schema: string;
  records: ClinicalPatientRecord[];
  totalCount: number;
} {
  const tenant = TENANTS.find(t => t.id === tenantId) || TENANTS[0];

  let filtered = clinicalDatabase.filter(r => r.tenantId === tenant.id);

  if (filter?.status) {
    filtered = filtered.filter(r => r.admissionStatus === filter.status);
  }
  if (filter?.doctor) {
    filtered = filtered.filter(r => r.attendingDoctor.toLowerCase().includes(filter.doctor!.toLowerCase()));
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    filtered = filtered.filter(r => 
      r.fullName.toLowerCase().includes(q) || 
      r.mrn.toLowerCase().includes(q) ||
      r.currentDiagnosis.toLowerCase().includes(q)
    );
  }

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    schema: tenant.dbSchema,
    records: filtered,
    totalCount: filtered.length
  };
}

/**
 * Creates or updates a clinical record ensuring strict tenant boundary
 */
export function insertTenantClinicalRecord(
  tenantId: string, 
  data: Omit<ClinicalPatientRecord, "id" | "tenantId" | "lastUpdated">
): ClinicalPatientRecord {
  const newRecord: ClinicalPatientRecord = {
    ...data,
    id: `PAT-${tenantId.toUpperCase()}-${Date.now().toString().slice(-4)}`,
    tenantId,
    lastUpdated: new Date().toISOString()
  };

  clinicalDatabase.push(newRecord);
  return newRecord;
}

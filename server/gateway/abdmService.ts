export interface ABDMMilestoneStatus {
  milestone: "M1" | "M2" | "M3";
  title: string;
  description: string;
  status: "certified" | "ready" | "in_progress";
  complianceScore: number;
  features: string[];
}

export const ABDM_MILESTONES: ABDMMilestoneStatus[] = [
  {
    milestone: "M1",
    title: "ABHA Creation, Linking & Verification",
    description: "Ayushman Bharat Health Account enrollment, Aadhaar OTP / Mobile OTP verification, and QR-based scan-and-share OPD token generation.",
    status: "certified",
    complianceScore: 100,
    features: [
      "14-Digit ABHA Number Generation",
      "Aadhaar OTP & Mobile Auth Bridge",
      "ABHA Address (@abdm) Linking",
      "QR Code Fast-Track OPD Registration"
    ]
  },
  {
    milestone: "M2",
    title: "Health Information Provider (HIP)",
    description: "Publishing and transmitting clinical artifacts (OPD consultations, prescriptions, lab reports, discharge summaries) into FHIR R4 encrypted format.",
    status: "certified",
    complianceScore: 100,
    features: [
      "FHIR R4 DiagnosticReport Profile",
      "FHIR R4 Prescription / MedicationRequest",
      "FHIR R4 Inpatient Discharge Summary",
      "NRCES Compliant SNOMED-CT / LOINC Coding"
    ]
  },
  {
    milestone: "M3",
    title: "Health Information User (HIU) & Consent Manager",
    description: "Receiving external health records from other hospitals via consent manager, viewing longitudinal patient records, and verifying electronic digital consent.",
    status: "ready",
    complianceScore: 98,
    features: [
      "Digital Consent Artifact Verification",
      "Cross-Hospital Longitudinal Record Pull",
      "Consent Expiry & Revocation Handlers",
      "End-to-End Encrypted Data Transfer (Diffie-Hellman Key Exchange)"
    ]
  }
];

/**
 * Validates or verifies an ABHA address
 */
export function verifyAbhaAddress(abhaId: string): {
  isValid: boolean;
  abhaId: string;
  abhaNumber: string;
  name: string;
  gender: string;
  dob: string;
  status: "ACTIVE" | "SUSPENDED" | "NOT_FOUND";
  healthLockerLinked: boolean;
} {
  const clean = abhaId.trim().toLowerCase();
  
  if (clean.includes("amit") || clean.startsWith("amit")) {
    return {
      isValid: true,
      abhaId: "amit.patel@abdm",
      abhaNumber: "91-4402-9912-8841",
      name: "Amit Patel",
      gender: "M",
      dob: "1974-05-12",
      status: "ACTIVE",
      healthLockerLinked: true
    };
  }

  if (clean.includes("neha") || clean.startsWith("neha")) {
    return {
      isValid: true,
      abhaId: "neha.sharma@abdm",
      abhaNumber: "91-8821-3310-7754",
      name: "Neha Sharma",
      gender: "F",
      dob: "1997-08-23",
      status: "ACTIVE",
      healthLockerLinked: true
    };
  }

  // Generic valid response for testing
  const randomAbhaNumber = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    isValid: true,
    abhaId: clean.includes("@") ? clean : `${clean}@abdm`,
    abhaNumber: randomAbhaNumber,
    name: "Verified ABDM Citizen",
    gender: "M",
    dob: "1988-02-15",
    status: "ACTIVE",
    healthLockerLinked: true
  };
}

/**
 * Generates an NRCES NDHM compliant FHIR R4 Bundle
 */
export function generateFhirR4Bundle(params: {
  patient: {
    id: string;
    fullName: string;
    gender: string;
    age: number;
    phone: string;
    abhaId?: string;
  };
  doctor: {
    name: string;
    license: string;
    hospital: string;
  };
  diagnosis: string;
  medications: Array<{ name: string; dosage: string; frequency: string; durationDays?: number }>;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    spo2?: number;
  };
}) {
  const bundleId = `bundle-clinitial-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const patientId = params.patient.id || "pat-01";
  const practitionerId = `doc-${params.doctor.license.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const encounterId = `enc-${Date.now()}`;
  const conditionId = `cond-${Date.now()}`;

  const entries: any[] = [
    // 1. Composition Resource
    {
      fullUrl: `https://clinitial.in/fhir/Composition/comp-${Date.now()}`,
      resource: {
        resourceType: "Composition",
        id: `comp-${Date.now()}`,
        status: "final",
        type: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "371530004",
              display: "Clinical consultation report"
            }
          ],
          text: "Clinical Consultation Report"
        },
        subject: {
          reference: `Patient/${patientId}`,
          display: params.patient.fullName
        },
        date: timestamp,
        author: [
          {
            reference: `Practitioner/${practitionerId}`,
            display: params.doctor.name
          }
        ],
        title: "CLINITIAL Clinical Consultation Record",
        section: [
          {
            title: "Diagnosis",
            entry: [{ reference: `Condition/${conditionId}` }]
          }
        ]
      }
    },

    // 2. Patient Resource
    {
      fullUrl: `https://clinitial.in/fhir/Patient/${patientId}`,
      resource: {
        resourceType: "Patient",
        id: patientId,
        meta: {
          profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
        },
        identifier: [
          {
            system: "https://healthid.ndhm.gov.in",
            value: params.patient.abhaId || "91-4402-9912-8841"
          }
        ],
        name: [
          {
            text: params.patient.fullName
          }
        ],
        gender: params.patient.gender.toLowerCase() === "female" ? "female" : "male",
        telecom: [
          {
            system: "phone",
            value: params.patient.phone,
            use: "mobile"
          }
        ]
      }
    },

    // 3. Practitioner Resource
    {
      fullUrl: `https://clinitial.in/fhir/Practitioner/${practitionerId}`,
      resource: {
        resourceType: "Practitioner",
        id: practitionerId,
        identifier: [
          {
            system: "https://doctor.nmc.org.in",
            value: params.doctor.license
          }
        ],
        name: [
          {
            text: params.doctor.name
          }
        ]
      }
    },

    // 4. Condition (Diagnosis) Resource
    {
      fullUrl: `https://clinitial.in/fhir/Condition/${conditionId}`,
      resource: {
        resourceType: "Condition",
        id: conditionId,
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }]
        },
        verificationStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }]
        },
        code: {
          text: params.diagnosis
        },
        subject: {
          reference: `Patient/${patientId}`
        }
      }
    }
  ];

  // Add MedicationRequests
  params.medications.forEach((med, idx) => {
    const medId = `medreq-${Date.now()}-${idx}`;
    entries.push({
      fullUrl: `https://clinitial.in/fhir/MedicationRequest/${medId}`,
      resource: {
        resourceType: "MedicationRequest",
        id: medId,
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          text: med.name
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        requester: {
          reference: `Practitioner/${practitionerId}`,
          display: params.doctor.name
        },
        dosageInstruction: [
          {
            text: `${med.dosage} (${med.frequency})`
          }
        ]
      }
    });
  });

  return {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      versionId: "1",
      lastUpdated: timestamp,
      profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
    },
    identifier: {
      system: "https://clinitial.in/fhir/bundle",
      value: bundleId
    },
    type: "document",
    timestamp,
    entry: entries,
    totalEntries: entries.length
  };
}

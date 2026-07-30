import { Patient } from "../../src/types"; // Wait, is types defined? We can declare types inline or keep them loose/flexible

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export class FHIRService {
  private baseUrn = "https://cura.in/fhir";
  private abdmIgUrl = "https://nrces.in/ndhm/fhir/r4";

  /**
   * Generate FHIR Patient Resource from CURA Patient
   */
  public generatePatientResource(patient: any): FHIRResource {
    const names = (patient.fullName || patient.patientName || "Unknown Patient").trim().split(/\s+/);
    const family = names.length > 1 ? names[names.length - 1] : names[0];
    const given = names.length > 1 ? names.slice(0, -1) : [names[0]];

    const fhirPatient: FHIRResource = {
      resourceType: "Patient",
      id: patient.id || `patient-${Math.floor(100 + Math.random() * 900)}`,
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/Patient`]
      },
      identifier: [
        {
          system: `${this.baseUrn}/patient`,
          value: patient.patientCode || patient.id
        }
      ],
      name: [
        {
          use: "official",
          text: patient.fullName || patient.patientName || "Unknown Patient",
          family: family,
          given: given
        }
      ],
      telecom: [],
      active: true
    };

    if (patient.phone) {
      fhirPatient.telecom.push({
        system: "phone",
        value: patient.phone,
        use: "mobile"
      });
    }

    if (patient.email) {
      fhirPatient.telecom.push({
        system: "email",
        value: patient.email,
        use: "home"
      });
    }

    if (patient.gender) {
      const lowerGender = patient.gender.toLowerCase();
      fhirPatient.gender = ["male", "female", "other", "unknown"].includes(lowerGender) 
        ? lowerGender 
        : "unknown";
    } else {
      fhirPatient.gender = "unknown";
    }

    if (patient.dateOfBirth) {
      fhirPatient.birthDate = patient.dateOfBirth;
    }

    if (patient.address) {
      fhirPatient.address = [
        {
          use: "home",
          text: patient.address,
          line: [patient.address],
          city: patient.city || undefined,
          state: patient.state || undefined,
          postalCode: patient.pincode || undefined,
          country: "IN"
        }
      ];
    }

    return fhirPatient;
  }

  /**
   * Generate FHIR Encounter Resource from CURA Admission or Appointment
   */
  public generateEncounterResource(admissionOrAppt: any): FHIRResource {
    const fhirEncounter: FHIRResource = {
      resourceType: "Encounter",
      id: admissionOrAppt.id || `encounter-${Math.floor(100 + Math.random() * 900)}`,
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/Encounter`]
      },
      status: admissionOrAppt.status === "discharged" || admissionOrAppt.status === "completed" ? "finished" : "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: admissionOrAppt.admissionNumber ? "IMP" : "AMB",
        display: admissionOrAppt.admissionNumber ? "inpatient encounter" : "ambulatory"
      },
      subject: {
        reference: `Patient/${admissionOrAppt.patientId}`,
        display: admissionOrAppt.patientName
      },
      period: {
        start: admissionOrAppt.admissionDate || admissionOrAppt.scheduledAt || new Date().toISOString()
      }
    };

    if (admissionOrAppt.dischargeDate) {
      fhirEncounter.period.end = admissionOrAppt.dischargeDate;
    }

    if (admissionOrAppt.doctorName) {
      fhirEncounter.participant = [
        {
          individual: {
            display: admissionOrAppt.doctorName
          }
        }
      ];
    }

    if (admissionOrAppt.diagnosis) {
      fhirEncounter.reasonCode = [
        {
          text: admissionOrAppt.diagnosis
        }
      ];
    }

    return fhirEncounter;
  }

  /**
   * Generate FHIR Observation from clinical vitals/metrics
   */
  public generateObservationResource(patient: any, vitalType: string, value: any, unit: string, code: string): FHIRResource {
    return {
      resourceType: "Observation",
      id: `obs-${vitalType}-${Math.floor(100 + Math.random() * 900)}`,
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/Observation`]
      },
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: code,
            display: vitalType
          }
        ],
        text: vitalType
      },
      subject: {
        reference: `Patient/${patient.id}`,
        display: patient.fullName || patient.patientName
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: Number(value),
        unit: unit,
        system: "http://unitsofmeasure.org",
        code: unit === "bpm" ? "/min" : unit === "mmHg" ? "mm[Hg]" : unit === "%" ? "%" : undefined
      }
    };
  }

  /**
   * Generate FHIR Document Bundle for Prescription
   */
  public generatePrescriptionBundle(patient: any, historyRecord: any): FHIRResource {
    const rxId = `rx-${Math.floor(1000 + Math.random() * 9000)}`;
    const patientResource = this.generatePatientResource(patient);

    const medicationRequests = (historyRecord.prescriptions || []).map((medStr: string, idx: number) => {
      // e.g., "Amlodipine 5mg (Tab, 1-0-0, after meals, 30 days)"
      // Let's parse out name, dosage etc. roughly for rich representation
      const nameMatch = medStr.match(/^([^(]+)/);
      const medName = nameMatch ? nameMatch[1].trim() : medStr;
      
      return {
        resourceType: "MedicationRequest",
        id: `medreq-${rxId}-${idx}`,
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          coding: [
            {
              system: "http://www.nlm.nih.gov/research/umls/rxnorm",
              display: medName
            }
          ],
          text: medStr
        },
        subject: {
          reference: `Patient/${patient.id}`
        },
        requester: {
          display: historyRecord.doctor || "Consulting Physician"
        }
      };
    });

    const composition = {
      resourceType: "Composition",
      id: `composition-${rxId}`,
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/PrescriptionRecordComposition`]
      },
      status: "final",
      type: {
        coding: [
          {
            system: "http://loinc.org",
            code: "57833-6",
            display: "Prescription"
          }
        ]
      },
      subject: {
        reference: `Patient/${patient.id}`
      },
      date: new Date().toISOString(),
      author: [
        {
          display: historyRecord.doctor || "Consulting Physician"
        }
      ],
      title: `Prescription Record for ${patientResource.name[0].text}`,
      section: [
        {
          title: "Prescribed Medication",
          entry: medicationRequests.map((med: any) => ({ reference: `MedicationRequest/${med.id}` }))
        },
        {
          title: "Diagnosis / Symptoms",
          text: {
            div: `<div>Diagnosis: ${historyRecord.diagnosis || "N/A"}. Symptoms: ${historyRecord.symptoms || "N/A"}</div>`
          }
        }
      ]
    };

    const bundle: FHIRResource = {
      resourceType: "Bundle",
      id: `bundle-${rxId}`,
      type: "document",
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/DocumentBundle`]
      },
      entry: [
        {
          fullUrl: `${this.baseUrn}/Composition/composition-${rxId}`,
          resource: composition
        },
        {
          fullUrl: `${this.baseUrn}/Patient/${patient.id}`,
          resource: patientResource
        },
        ...medicationRequests.map((med: any) => ({
          fullUrl: `${this.baseUrn}/MedicationRequest/${med.id}`,
          resource: med
        }))
      ]
    };

    return bundle;
  }

  /**
   * Generate FHIR Bundle for Discharge Summary from Admission
   */
  public generateDischargeSummaryBundle(admission: any, patient: any): FHIRResource {
    const bundleId = `discharge-${admission.id}`;
    const patientResource = this.generatePatientResource(patient);
    const encounterResource = this.generateEncounterResource(admission);

    const composition = {
      resourceType: "Composition",
      id: `composition-${admission.id}`,
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/DischargeSummaryRecordComposition`]
      },
      status: "final",
      type: {
        coding: [
          {
            system: "http://loinc.org",
            code: "18842-5",
            display: "Discharge summary"
          }
        ]
      },
      subject: {
        reference: `Patient/${patient.id}`
      },
      encounter: {
        reference: `Encounter/${encounterResource.id}`
      },
      date: admission.dischargeDate || new Date().toISOString(),
      author: [
        {
          display: admission.doctorName || "Treating Doctor"
        }
      ],
      title: `Discharge Summary Record - Admission ${admission.admissionNumber || admission.id}`,
      section: [
        {
          title: "Admission Context",
          text: {
            div: `<div>Admitted on ${admission.admissionDate}. Diagnosis: ${admission.diagnosis || "Under evaluation"}. Status: ${admission.status}.</div>`
          }
        },
        {
          title: "Clinical Notes / Plan",
          text: {
            div: `<div>Notes: ${admission.notes || "No special instructions."}</div>`
          }
        }
      ]
    };

    const bundle: FHIRResource = {
      resourceType: "Bundle",
      id: `bundle-${bundleId}`,
      type: "document",
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/DocumentBundle`]
      },
      entry: [
        {
          fullUrl: `${this.baseUrn}/Composition/composition-${admission.id}`,
          resource: composition
        },
        {
          fullUrl: `${this.baseUrn}/Patient/${patient.id}`,
          resource: patientResource
        },
        {
          fullUrl: `${this.baseUrn}/Encounter/${encounterResource.id}`,
          resource: encounterResource
        }
      ]
    };

    return bundle;
  }

  // ============================================================
  // HL7 v2 PARSER & ADT TO FHIR CONVERTER
  // ============================================================

  /**
   * Parse legacy HL7 v2 message raw string into segments
   */
  public parseHl7V2Message(hl7Message: string): any {
    const segments = hl7Message.trim().split(/[\r\n]+/);
    const parsed: any = {};

    for (const segment of segments) {
      if (!segment) continue;
      const fields = segment.split('|');
      const segmentType = fields[0];
      parsed[segmentType] = fields;
    }

    return parsed;
  }

  /**
   * Convert HL7 v2 ADT (Admit Discharge Transfer) to FHIR Patient & Encounter
   */
  public convertAdtToFhir(parsedHl7: any): { patient: FHIRResource; encounter?: FHIRResource } {
    const pid = parsedHl7.PID || [];
    const msh = parsedHl7.MSH || [];
    const pv1 = parsedHl7.PV1 || [];

    const patientId = pid[3] || `HL7-PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const patientNameRaw = pid[5] || "HL7 Patient";
    const patientNames = patientNameRaw.split('^').filter(Boolean);
    const fullName = patientNames.join(' ');
    const family = patientNames[0] || "Patient";
    const given = patientNames.slice(1);

    const fhirPatient: FHIRResource = {
      resourceType: "Patient",
      id: patientId,
      meta: {
        profile: [`${this.abdmIgUrl}/StructureDefinition/Patient`]
      },
      identifier: [
        {
          system: `${this.baseUrn}/patient-legacy`,
          value: patientId
        }
      ],
      name: [
        {
          use: "official",
          text: fullName,
          family: family,
          given: given
        }
      ],
      active: true
    };

    // Parse gender (PID-8)
    const hl7Gender = (pid[8] || "").toUpperCase();
    if (hl7Gender === "M") fhirPatient.gender = "male";
    else if (hl7Gender === "F") fhirPatient.gender = "female";
    else if (hl7Gender === "O") fhirPatient.gender = "other";
    else fhirPatient.gender = "unknown";

    // Parse DOB (PID-7) format YYYYMMDD
    const hl7Dob = pid[7] || "";
    if (hl7Dob.length >= 8) {
      fhirPatient.birthDate = `${hl7Dob.substring(0, 4)}-${hl7Dob.substring(4, 6)}-${hl7Dob.substring(6, 8)}`;
    }

    // Encounter (PV1)
    let fhirEncounter: FHIRResource | undefined = undefined;
    if (pv1.length > 0) {
      const encId = pv1[19] || `HL7-ENC-${Math.floor(1000 + Math.random() * 9000)}`;
      fhirEncounter = {
        resourceType: "Encounter",
        id: encId,
        meta: {
          profile: [`${this.abdmIgUrl}/StructureDefinition/Encounter`]
        },
        status: "finished",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "IMP",
          display: "inpatient encounter"
        },
        subject: {
          reference: `Patient/${patientId}`,
          display: fullName
        }
      };
    }

    return { patient: fhirPatient, encounter: fhirEncounter };
  }
}

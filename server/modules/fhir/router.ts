import { Router, Request, Response } from "express";
import { db } from "../../infrastructure/database";

export const fhirRouter = Router();

// FHIR R4 Patient Resource
fhirRouter.get("/Patient/:id", (req: Request, res: Response) => {
  const patient = db.tables.patients.get(req.params.id);

  if (!patient) {
    res.status(404).json({
      resourceType: "OperationOutcome",
      issue: [{ severity: "error", code: "not-found", diagnostics: `Patient ${req.params.id} not found.` }]
    });
    return;
  }

  res.json({
    resourceType: "Patient",
    id: patient.id,
    identifier: [
      { system: "https://cura.health/mrn", value: patient.mrn },
      ...(patient.abhaId ? [{ system: "https://abdm.gov.in/abha", value: patient.abhaId }] : [])
    ],
    name: [{ use: "official", text: patient.fullName }],
    telecom: [{ system: "phone", value: patient.phone }],
    gender: patient.gender.toLowerCase(),
    birthDate: patient.dateOfBirth
  });
});

// FHIR R4 CapabilityStatement
fhirRouter.get("/metadata", (req: Request, res: Response) => {
  res.json({
    resourceType: "CapabilityStatement",
    status: "active",
    date: new Date().toISOString(),
    publisher: "CURA Healthcare Platform",
    kind: "instance",
    software: { name: "CURA FHIR Server", version: "2.0.0" },
    fhirVersion: "4.0.1",
    format: ["application/fhir+json"]
  });
});

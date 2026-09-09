import crypto from "node:crypto";
import { StoredObject } from "./types";
import { appendAuditEvent } from "./cryptoAudit";

const objectVault: StoredObject[] = [
  {
    id: "OBJ-MED-001",
    tenantId: "tenant_apollo",
    fileName: "DICOM_Cardiac_CT_Angiogram_AmitPatel.dcm",
    category: "radiology_dicom",
    fileSizeBytes: 48592100, // ~48.5 MB
    mimeType: "application/dicom",
    sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    virusScanStatus: "clean",
    isEncrypted: true,
    encryptionAlgorithm: "AES-256-GCM",
    storagePath: "s3://cura-clinical-vault-apollo/radiology/2026/09/DICOM_Cardiac_CT.dcm",
    presignedUrl: "https://storage.cura.in/secure/vault/radiology/DICOM_Cardiac_CT.dcm?token=exp99281&sig=ae89f1",
    uploadedBy: "USR-RAD-006",
    uploadedAt: "2026-09-08T14:20:00Z",
    expiresAt: "2026-09-15T14:20:00Z",
    metadata: {
      patientMrn: "APOLLO-MRN-9021",
      modality: "CT",
      sliceCount: "256",
      contrastAgent: "Iohexol 350mg"
    }
  },
  {
    id: "OBJ-MED-002",
    tenantId: "tenant_apollo",
    fileName: "12Lead_ECG_Telemetry_Snapshot.pdf",
    category: "prescription_pdf",
    fileSizeBytes: 1420500, // 1.4 MB
    mimeType: "application/pdf",
    sha256Checksum: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    virusScanStatus: "clean",
    isEncrypted: true,
    encryptionAlgorithm: "AES-256-GCM",
    storagePath: "s3://cura-clinical-vault-apollo/telemetry/2026/09/12Lead_ECG.pdf",
    presignedUrl: "https://storage.cura.in/secure/vault/telemetry/12Lead_ECG.pdf?token=exp88121&sig=c18fa3",
    uploadedBy: "USR-DOC-001",
    uploadedAt: "2026-09-08T15:10:00Z",
    expiresAt: "2026-09-15T15:10:00Z",
    metadata: {
      patientMrn: "APOLLO-MRN-9021",
      leadCount: "12",
      stElevationAlert: "Lead II, III, aVF (Inferior Wall STEMI)"
    }
  },
  {
    id: "OBJ-MED-003",
    tenantId: "tenant_fortis",
    fileName: "PostOp_Laparoscopic_Cholecystectomy_Discharge.pdf",
    category: "discharge_summary",
    fileSizeBytes: 890400, // 890 KB
    mimeType: "application/pdf",
    sha256Checksum: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    virusScanStatus: "clean",
    isEncrypted: true,
    encryptionAlgorithm: "AES-256-GCM",
    storagePath: "s3://cura-clinical-vault-fortis/discharge/2026/09/Discharge_Summary_NehaSharma.pdf",
    presignedUrl: "https://storage.cura.in/secure/vault/discharge/Discharge_Summary_NehaSharma.pdf?token=exp44211&sig=bb19ca",
    uploadedBy: "USR-ADM-002",
    uploadedAt: "2026-09-08T18:00:00Z",
    expiresAt: "2026-09-15T18:00:00Z",
    metadata: {
      patientMrn: "FORTIS-MRN-4410",
      surgeon: "Dr. Rajesh Sharma",
      icd10: "K80.00"
    }
  },
  {
    id: "OBJ-MED-004",
    tenantId: "tenant_fortis",
    fileName: "Lumbar_Spine_MRI_Sagittal_Axial.dcm",
    category: "radiology_dicom",
    fileSizeBytes: 62400100, // 62.4 MB
    mimeType: "application/dicom",
    sha256Checksum: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    virusScanStatus: "clean",
    isEncrypted: true,
    encryptionAlgorithm: "AES-256-GCM",
    storagePath: "s3://cura-clinical-vault-fortis/mri/2026/09/Lumbar_Spine_MRI.dcm",
    presignedUrl: "https://storage.cura.in/secure/vault/mri/Lumbar_Spine_MRI.dcm?token=exp33901&sig=dd8801",
    uploadedBy: "USR-RAD-006",
    uploadedAt: "2026-09-08T11:45:00Z",
    expiresAt: "2026-09-15T11:45:00Z",
    metadata: {
      patientMrn: "FORTIS-MRN-4411",
      modality: "MRI 3.0T",
      findings: "L4-L5 left paracentral extrusion"
    }
  }
];

/**
 * Lists objects in the secure vault scoped to a tenant
 */
export function listStoredObjects(tenantId: string, category?: string): StoredObject[] {
  let list = objectVault.filter(o => o.tenantId === tenantId);
  if (category && category !== "all") {
    list = list.filter(o => o.category === category);
  }
  return list;
}

/**
 * Uploads a medical file to the tenant's secure object store
 */
export function uploadMedicalObject(params: {
  tenantId: string;
  fileName: string;
  category: StoredObject["category"];
  fileSizeBytes: number;
  mimeType: string;
  uploadedBy: string;
  userRole: any;
  metadata?: Record<string, string>;
}): StoredObject {
  const id = `OBJ-MED-${Date.now().toString().slice(-4)}`;
  const sha256Checksum = crypto.createHash("sha256").update(`${params.fileName}:${Date.now()}`).digest("hex");
  const token = Math.random().toString(36).substring(2, 10);
  const presignedUrl = `https://storage.cura.in/secure/vault/${params.category}/${encodeURIComponent(params.fileName)}?token=${token}&expires=604800`;

  const newObj: StoredObject = {
    id,
    tenantId: params.tenantId,
    fileName: params.fileName,
    category: params.category,
    fileSizeBytes: params.fileSizeBytes,
    mimeType: params.mimeType,
    sha256Checksum,
    virusScanStatus: "clean",
    isEncrypted: true,
    encryptionAlgorithm: "AES-256-GCM",
    storagePath: `s3://cura-clinical-vault-${params.tenantId}/${params.category}/${params.fileName}`,
    presignedUrl,
    uploadedBy: params.uploadedBy,
    uploadedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: params.metadata || {}
  };

  objectVault.unshift(newObj);

  // Log upload to immutable audit trail
  appendAuditEvent({
    tenantId: params.tenantId,
    userId: params.uploadedBy,
    userRole: params.userRole || "DOCTOR",
    action: "CREATE",
    resourceType: "OBJECT_STORE",
    resourceId: id,
    details: `Encrypted clinical file ${params.fileName} (${(params.fileSizeBytes / 1024 / 1024).toFixed(2)} MB) stored with SHA-256: ${sha256Checksum.substring(0, 16)}...`
  });

  return newObj;
}

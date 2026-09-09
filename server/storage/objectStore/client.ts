import crypto from "crypto";

export interface StoredObject {
  id: string;
  bucket: string;
  tenantId: string;
  objectKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256Checksum: string;
  isEncrypted: boolean;
  encryptionAlgorithm: string;
  presignedUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt: string;
  metadata?: Record<string, string>;
}

export interface ObjectStoreClient {
  putObject(params: {
    bucket: string;
    tenantId: string;
    fileName: string;
    mimeType: string;
    content: Buffer | string;
    uploadedBy: string;
    metadata?: Record<string, string>;
  }): Promise<StoredObject>;
  
  getObject(bucket: string, objectKey: string): Promise<StoredObject | null>;
  listObjects(tenantId: string, bucket?: string): Promise<StoredObject[]>;
  generatePresignedUrl(bucket: string, objectKey: string, expiryMinutes?: number): Promise<string>;
  getHealth(): Promise<{ status: "connected" | "degraded"; totalFiles: number; storageUsedMb: number }>;
}

class InMemoryObjectStore implements ObjectStoreClient {
  private objects: Map<string, StoredObject> = new Map();

  constructor() {
    this.seedInitialObjects();
  }

  private seedInitialObjects() {
    const initialFiles: StoredObject[] = [
      {
        id: "obj_ecg_991",
        bucket: "clinical-vault",
        tenantId: "tenant_apollo",
        objectKey: "tenant_apollo/2026/09/ecg_lead12_amit_patel.pdf",
        fileName: "ecg_lead12_amit_patel.pdf",
        mimeType: "application/pdf",
        sizeBytes: 842010,
        sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        isEncrypted: true,
        encryptionAlgorithm: "AES-256-GCM",
        presignedUrl: "https://vault.cura.in/s3/presigned/ecg_lead12_amit_patel.pdf?token=sec_9918",
        uploadedBy: "Dr. K. S. Murthy",
        uploadedAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        metadata: { patientId: "pat_1", clinicalModality: "Cardiology ECG" }
      },
      {
        id: "obj_rx_992",
        bucket: "prescriptions",
        tenantId: "tenant_apollo",
        objectKey: "tenant_apollo/2026/09/rx_digitally_signed_sunita.pdf",
        fileName: "rx_digitally_signed_sunita.pdf",
        mimeType: "application/pdf",
        sizeBytes: 312450,
        sha256Checksum: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        isEncrypted: true,
        encryptionAlgorithm: "AES-256-GCM",
        presignedUrl: "https://vault.cura.in/s3/presigned/rx_digitally_signed_sunita.pdf?token=sec_1024",
        uploadedBy: "Dr. R. K. Sharma",
        uploadedAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        metadata: { patientId: "pat_2", digitalSignatureStatus: "DSC_VERIFIED" }
      }
    ];

    initialFiles.forEach(f => this.objects.set(f.id, f));
  }

  public async putObject(params: {
    bucket: string;
    tenantId: string;
    fileName: string;
    mimeType: string;
    content: Buffer | string;
    uploadedBy: string;
    metadata?: Record<string, string>;
  }): Promise<StoredObject> {
    const id = `obj_${crypto.randomBytes(6).toString("hex")}`;
    const objectKey = `${params.tenantId}/${new Date().toISOString().slice(0, 10)}/${params.fileName}`;
    const sha256 = crypto.createHash("sha256").update(params.content).digest("hex");
    const sizeBytes = Buffer.isBuffer(params.content) ? params.content.length : Buffer.byteLength(params.content);

    const stored: StoredObject = {
      id,
      bucket: params.bucket,
      tenantId: params.tenantId,
      objectKey,
      fileName: params.fileName,
      mimeType: params.mimeType,
      sizeBytes,
      sha256Checksum: sha256,
      isEncrypted: true,
      encryptionAlgorithm: "AES-256-GCM",
      presignedUrl: `https://vault.cura.in/s3/presigned/${params.fileName}?sig=${crypto.randomBytes(8).toString("hex")}`,
      uploadedBy: params.uploadedBy,
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      metadata: params.metadata
    };

    this.objects.set(id, stored);
    return stored;
  }

  public async getObject(bucket: string, objectKey: string): Promise<StoredObject | null> {
    for (const obj of this.objects.values()) {
      if (obj.bucket === bucket && obj.objectKey === objectKey) {
        return obj;
      }
    }
    return null;
  }

  public async listObjects(tenantId: string, bucket?: string): Promise<StoredObject[]> {
    const results: StoredObject[] = [];
    for (const obj of this.objects.values()) {
      if (obj.tenantId === tenantId) {
        if (!bucket || obj.bucket === bucket) {
          results.push(obj);
        }
      }
    }
    return results.reverse();
  }

  public async generatePresignedUrl(bucket: string, objectKey: string, expiryMinutes = 60): Promise<string> {
    const token = crypto.randomBytes(16).toString("hex");
    return `https://vault.cura.in/s3/presigned/${objectKey}?token=${token}&expiresIn=${expiryMinutes}m`;
  }

  public async getHealth() {
    const totalBytes = Array.from(this.objects.values()).reduce((sum, o) => sum + o.sizeBytes, 0);
    return {
      status: "connected" as const,
      totalFiles: this.objects.size,
      storageUsedMb: Number((totalBytes / (1024 * 1024)).toFixed(2))
    };
  }
}

export const objectStore: ObjectStoreClient = new InMemoryObjectStore();

import crypto from "crypto";
import { storageConfig } from "../../config/storage";
import { ValidationError, NotFoundError } from "../../shared/errors";

export interface StoredDocument {
  id: string;
  tenantId: string;
  patientId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  hashSha256: string;
  uploadedByUserId: string;
  createdAt: string;
}

// In-memory document registry for private storage metadata
const documentRegistry = new Map<string, StoredDocument>();

export class SecureDocumentStorageService {
  // Validate and store uploaded document metadata
  static async registerUpload(params: {
    tenantId: string;
    patientId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    uploadedByUserId: string;
  }): Promise<StoredDocument> {
    if (!storageConfig.allowedMimeTypes.includes(params.mimeType)) {
      throw new ValidationError(`MIME type '${params.mimeType}' is not permitted for medical records.`);
    }

    if (params.buffer.length > storageConfig.maxFileSizeBytes) {
      throw new ValidationError(`File size exceeds the maximum limit of ${storageConfig.maxFileSizeBytes / (1024 * 1024)}MB.`);
    }

    const hash = crypto.createHash("sha256").update(params.buffer).digest("hex");
    const docId = `doc_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const docRecord: StoredDocument = {
      id: docId,
      tenantId: params.tenantId,
      patientId: params.patientId,
      fileName: params.fileName,
      mimeType: params.mimeType,
      sizeBytes: params.buffer.length,
      hashSha256: hash,
      uploadedByUserId: params.uploadedByUserId,
      createdAt: new Date().toISOString()
    };

    documentRegistry.set(docId, docRecord);
    return docRecord;
  }

  // Generate temporary expiring signed URL (15 minutes)
  static generateSignedDownloadUrl(docId: string, tenantId: string): string {
    const doc = documentRegistry.get(docId);
    if (!doc || doc.tenantId !== tenantId) {
      throw new NotFoundError("Document", docId);
    }

    const expiresAt = Date.now() + storageConfig.signedUrlExpirySeconds * 1000;
    const signature = crypto
      .createHmac("sha256", process.env.SESSION_SECRET || "cura_secret")
      .update(`${docId}:${expiresAt}:${tenantId}`)
      .digest("hex");

    return `/api/v1/documents/${docId}/download?expires=${expiresAt}&sig=${signature}`;
  }

  static verifySignedDownloadUrl(docId: string, tenantId: string, expires: number, sig: string): boolean {
    if (Date.now() > expires) return false;
    const expectedSig = crypto
      .createHmac("sha256", process.env.SESSION_SECRET || "cura_secret")
      .update(`${docId}:${expires}:${tenantId}`)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
    } catch {
      return false;
    }
  }

  static getDocument(docId: string): StoredDocument | undefined {
    return documentRegistry.get(docId);
  }
}

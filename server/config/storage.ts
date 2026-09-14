import { getEnv } from "./env";

export const storageConfig = {
  bucket: getEnv().STORAGE_BUCKET,
  maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB max
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/webm",
    "audio/wav",
    "audio/mp3",
    "audio/mpeg",
    "application/dicom"
  ],
  signedUrlExpirySeconds: 900 // 15 minutes temporary access
};

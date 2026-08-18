import { getSupabaseClient } from './client';
import type { UploadOptions, StorageResult } from '../../types/supabase';

export type { UploadOptions, StorageResult };

// ============== File Upload with Progress ==============
export const uploadFileWithProgress = async (
  options: UploadOptions,
  _onProgress?: (progress: number) => void
): Promise<StorageResult> => {
  try {
    const client = getSupabaseClient();
    const { bucket, path, file, cacheControl = '3600', contentType, upsert = false } = options;

    // Upload file
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl,
        contentType: contentType || (file instanceof File ? file.type : undefined),
        upsert,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);

    if (_onProgress) {
      _onProgress(100);
    }

    return {
      data: {
        path: data?.path || path,
        publicUrl: urlData?.publicUrl,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Upload failed'),
    };
  }
};

// ============== Multiple File Upload ==============
export const uploadMultipleFiles = async (
  bucket: string,
  files: { path: string; file: File }[],
  onProgress?: (fileName: string, progress: number) => void
): Promise<StorageResult[]> => {
  const results: StorageResult[] = [];

  for (const { path, file } of files) {
    const result = await uploadFileWithProgress(
      { bucket, path, file },
      (progress) => {
        if (onProgress) onProgress(file.name, progress);
      }
    );
    results.push(result);
  }

  return results;
};

// ============== File Management ==============
export const deleteFile = async (bucket: string, paths: string[]): Promise<{ error: Error | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.storage.from(bucket).remove(paths);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Delete failed'),
    };
  }
};

export const listFiles = async (
  bucket: string,
  path?: string,
  options?: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' } }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any[] | null; error: Error | null }> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.storage.from(bucket).list(path || '', {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('List failed'),
    };
  }
};

export const moveFile = async (
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.storage.from(bucket).move(fromPath, toPath);
    if (error) throw error;
    return { data: { path: data?.message || toPath }, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Move failed'),
    };
  }
};

// ============== Image Optimization Helpers ==============
export const getOptimizedImageUrl = (
  bucket: string,
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  }
): string => {
  const client = getSupabaseClient();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  let url = data.publicUrl;

  if (options) {
    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    if (options.fit) params.append('fit', options.fit);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
};

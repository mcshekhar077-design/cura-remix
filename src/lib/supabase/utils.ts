import { getSupabaseClient } from './client';
import type { QueryResult } from '../../types/supabase';

// ============== Database Helpers ==============

/**
 * Generic function to fetch a single record
 */
export const fetchOne = async <T>(
  table: string,
  id: string | number,
  selectQuery: string = '*'
): Promise<QueryResult<T>> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      .select(selectQuery)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch record'),
    };
  }
};

/**
 * Generic function to fetch multiple records with optional filters, ordering, and pagination
 */
export const fetchMany = async <T>(
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>,
  options?: {
    selectQuery?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
): Promise<QueryResult<T[]>> => {
  try {
    const client = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = client.from(table).select(options?.selectQuery || '*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value !== null) {
          // Handle operator objects
          Object.entries(value).forEach(([operator, val]) => {
            switch (operator) {
              case 'gt':
                query = query.gt(key, val);
                break;
              case 'gte':
                query = query.gte(key, val);
                break;
              case 'lt':
                query = query.lt(key, val);
                break;
              case 'lte':
                query = query.lte(key, val);
                break;
              case 'neq':
                query = query.neq(key, val);
                break;
              case 'like':
                query = query.like(key, `%${val}%`);
                break;
              default:
                query = query.eq(key, val);
            }
          });
        } else {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []) as T[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch records'),
    };
  }
};

/**
 * Generic function to insert a record
 */
export const insertOne = async <T>(
  table: string,
  record: Partial<T>
): Promise<QueryResult<T>> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(record as any)
      .select()
      .single();

    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to insert record'),
    };
  }
};

/**
 * Generic function to update a record
 */
export const updateOne = async <T>(
  table: string,
  id: string | number,
  updates: Partial<T>
): Promise<QueryResult<T>> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update record'),
    };
  }
};

/**
 * Generic function to delete a record
 */
export const deleteOne = async (
  table: string,
  id: string | number
): Promise<{ error: Error | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Failed to delete record'),
    };
  }
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to upload file'),
    };
  }
};

/**
 * Get a public URL for a file in Supabase Storage
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const client = getSupabaseClient();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

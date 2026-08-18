import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from './useSupabase';
import { QueryBuilder, paginate } from '../lib/supabase/advanced';
import { functions } from '../lib/supabase/functions';
import { createTriggerHandler } from '../lib/supabase/triggers';
import { uploadMultipleFiles } from '../lib/supabase/storage';

// ============== Advanced Query Hook ==============
export const useAdvancedQuery = <T>(
  table: string,
  queryBuilder: (builder: QueryBuilder<T>) => QueryBuilder<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: any[] = [],
  options?: { enabled?: boolean; autoRefresh?: boolean; refreshInterval?: number }
) => {
  const { isReady } = useSupabase();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!isReady || options?.enabled === false) return;

    setLoading(true);
    setError(null);

    try {
      const builder = new QueryBuilder<T>(table);
      const result = await queryBuilder(builder).execute();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
        setCount(result.count || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Query failed'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, table, options?.enabled, ...dependencies]);

  useEffect(() => {
    fetchData();

    if (options?.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options?.autoRefresh, options?.refreshInterval]);

  return {
    data,
    loading,
    error,
    count,
    refetch: fetchData,
    isEmpty: data.length === 0,
  };
};

// ============== Paginated Query Hook ==============
export const usePaginatedQuery = <T>(
  table: string,
  initialPage: number = 1,
  pageSize: number = 10,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean }
) => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const filtersKey = JSON.stringify(filters);
  const orderByKey = JSON.stringify(orderBy);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await paginate<T>(table, page, pageSize, filters, orderBy);

    if (result.error) {
      setError(result.error);
    } else {
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.count);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, page, pageSize, filtersKey, orderByKey]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    setPage,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: setPage,
    refetch: fetchPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    isFirst: page === 1,
    isLast: page === totalPages,
  };
};

// ============== File Upload Hook ==============
export const useFileUpload = (bucket: string) => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);

  const upload = useCallback(async (files: File[], pathPrefix: string = '') => {
    setUploading(true);
    setError(null);
    setResults([]);

    try {
      const uploads = files.map((file) => ({
        path: `${pathPrefix ? pathPrefix + '/' : ''}${Date.now()}-${file.name}`,
        file,
      }));

      const uploadResults = await uploadMultipleFiles(
        bucket,
        uploads,
        (fileName, prog) => {
          setProgress((prev) => ({ ...prev, [fileName]: prog }));
        }
      );

      const successful = uploadResults.filter((r) => !r.error);
      setResults(successful.map((r) => r.data));

      if (uploadResults.some((r) => r.error)) {
        const errors = uploadResults.filter((r) => r.error).map((r) => r.error?.message).filter(Boolean);
        setError(new Error(`Some uploads failed: ${errors.join(', ')}`));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
    } finally {
      setUploading(false);
    }
  }, [bucket]);

  return {
    upload,
    progress,
    uploading,
    error,
    results,
    isUploading: uploading,
    hasError: error !== null,
  };
};

// ============== Edge Function Hook ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFunction = <T = any>(functionName: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoke = useCallback(async (payload?: any) => {
    setLoading(true);
    setError(null);

    const result = await functions.invokeFunction<T>(functionName, payload);

    if (result.error) {
      setError(result.error);
    } else {
      setData(result.data);
    }
    setLoading(false);
    return result;
  }, [functionName]);

  return {
    data,
    loading,
    error,
    invoke,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    },
  };
};

// ============== Database Trigger Hook ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTrigger = <T = any>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  handler: (payload: T) => void,
  enabled: boolean = true
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsSubscribed(false);
      return;
    }

    const unsubscribe = createTriggerHandler<T>(table, event, (eventPayload) => {
      handler(eventPayload.new);
    });
    setIsSubscribed(true);

    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [table, event, handler, enabled]);

  return { isSubscribed };
};

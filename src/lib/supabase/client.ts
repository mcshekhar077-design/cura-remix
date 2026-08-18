import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

// ============== Type Definitions ==============
export interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_APP_ENV?: 'development' | 'production' | 'test';
}

// ============== Configuration ==============
const DEFAULT_OPTIONS: SupabaseClientOptions<'public'> = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'ai-studio-app',
      'x-application-version': '1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// ============== Environment Validation ==============
const getEnvVar = (key: keyof ImportMetaEnv): string => {
  const env = (import.meta as unknown as { env?: Partial<ImportMetaEnv> })?.env;
  const value = env?.[key];
  if (!value) {
    return '';
  }
  return value;
};

// ============== Client Initialization ==============
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Main client with proper typing
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, DEFAULT_OPTIONS)
  : null;

// Service role client (for server-side/admin operations)
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        ...DEFAULT_OPTIONS,
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// ============== Helper Functions ==============
/**
 * Get the Supabase client with safety checks
 * @throws {Error} If client is not configured
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const missingVars: string[] = [];
    if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

    throw new Error(
      `🔴 Supabase client not initialized. Missing variables: ${missingVars.join(', ')}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }
  return supabase;
};

/**
 * Get admin client with safety checks
 * @throws {Error} If admin client is not configured
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdmin) {
    throw new Error(
      '🔴 Supabase admin client not initialized. Missing VITE_SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  return supabaseAdmin;
};

/**
 * Check if Supabase is ready for use
 */
export const isSupabaseReady = (): boolean => {
  return isSupabaseConfigured && supabase !== null;
};

/**
 * Check if admin client is ready
 */
export const isAdminReady = (): boolean => {
  return Boolean(supabaseUrl && supabaseServiceKey && supabaseAdmin);
};

// ============== Connection Testing ==============
/**
 * Test database connection
 * @returns {Promise<{ success: boolean; error?: string; timestamp?: string }>}
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
  timestamp?: string;
}> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('_health').select('*').limit(1);

    if (error) {
      // Table might not exist, try checking authentication session instead
      const { error: authError } = await client.auth.getSession();
      if (authError) {
        return {
          success: false,
          error: `Connection failed: ${authError.message}`,
        };
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error',
    };
  }
};

// ============== Realtime Helpers ==============
/**
 * Subscribe to realtime changes with automatic cleanup
 */
export const subscribeToRealtime = <T = unknown>(
  table: string,
  callback: (payload: T) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) => {
  const client = getSupabaseClient();

  const channel = client
    .channel(`${table}-changes-${Math.random().toString(36).slice(2, 7)}`)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
      },
      (payload: unknown) => callback(payload as T)
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

// ============== Error Handling Helpers ==============
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Safe wrapper for Supabase queries with error handling
 */
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: { message?: string; code?: string } | null }>
): Promise<{ data: T | null; error: SupabaseError | null }> => {
  try {
    const { data, error } = await queryFn();
    if (error) {
      return {
        data: null,
        error: new SupabaseError(
          error.message || 'Database query failed',
          error.code,
          error
        ),
      };
    }
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: new SupabaseError(
        error instanceof Error ? error.message : 'Unexpected error',
        undefined,
        error
      ),
    };
  }
};

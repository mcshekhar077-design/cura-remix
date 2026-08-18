// ============== Database Types ==============
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add more tables as needed
    };
    Views: {
      // Add views here
    };
    Functions: {
      // Add functions here
    };
  };
}

// ============== Auth Types ==============
export type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
    bio?: string;
    website?: string;
    phone?: string;
  };
  app_metadata: {
    provider?: string;
    roles?: string[];
  };
};

// ============== Query Types ==============
export type QueryResult<T> = {
  data: T | null;
  error: Error | null;
  count?: number;
};

export type PaginatedQuery<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: Error | null;
};

// ============== Realtime Types ==============
export type RealtimePayload<T> = {
  table: string;
  schema: string;
  new: T;
  old: T | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

// ============== Trigger Types ==============
export interface TriggerEvent<T = unknown> {
  table: string;
  schema: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T | null;
  timestamp: string;
}

// ============== Function Types ==============
export interface FunctionResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

// ============== Storage Types ==============
export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Blob;
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface StorageResult {
  data: { path: string; publicUrl?: string } | null;
  error: Error | null;
}

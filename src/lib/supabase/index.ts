// ============== Main Export File ==============
export * from './client';
export * from './utils';
export * from './advanced';
export * from './storage';
export * from './auth';
export * from './functions';
export * from './triggers';

// Re-export default client
export { supabase as default } from './client';

// Type exports
export type {
  Database,
  AuthUser,
  QueryResult,
  PaginatedQuery,
  RealtimePayload,
  TriggerEvent,
  FunctionResponse,
  StorageResult,
  UploadOptions,
} from '../../types/supabase';

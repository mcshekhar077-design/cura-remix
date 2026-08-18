import { getSupabaseClient } from './client';
import type { TriggerEvent } from '../../types/supabase';

export type { TriggerEvent };

// ============== Real-time Trigger Handler ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTriggerHandler = <T = any>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  handler: (payload: TriggerEvent<T>) => Promise<void> | void
): (() => void) => {
  const client = getSupabaseClient();

  const channel = client
    .channel(`trigger-${table}-${event}-${Math.random().toString(36).slice(2, 7)}`)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (payload: any) => {
        try {
          await handler({
            table: payload.table,
            schema: payload.schema,
            event: payload.eventType,
            new: payload.new as T,
            old: payload.old as T | null,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Trigger handler error for ${table}:`, error);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

// ============== Audit Log Trigger ==============
export const auditLogHandler = (table: string) => {
  return createTriggerHandler(table, '*', async (payload) => {
    const client = getSupabaseClient();
    await client.from('audit_logs').insert({
      table_name: payload.table,
      event_type: payload.event,
      old_data: payload.old,
      new_data: payload.new,
      timestamp: payload.timestamp,
      user_id: (await client.auth.getUser()).data.user?.id,
    });
  });
};

// ============== Cache Invalidation Trigger ==============
export const cacheInvalidator = (table: string, cacheKey: string) => {
  return createTriggerHandler(table, '*', async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache-${cacheKey}`);
      window.dispatchEvent(
        new CustomEvent('cache-invalidate', {
          detail: { key: cacheKey, table },
        })
      );
    }
  });
};

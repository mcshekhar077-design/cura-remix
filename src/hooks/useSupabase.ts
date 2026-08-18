import { useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  getSupabaseClient,
  isSupabaseReady,
  isSupabaseConfigured,
  subscribeToRealtime,
  safeQuery,
  SupabaseError,
} from '../lib/supabase/client';
import type { RealtimePayload } from '../types/supabase';

// ============== Main Hook ==============
export const useSupabase = () => {
  const [isReady, setIsReady] = useState<boolean>(() => isSupabaseReady());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');

  useEffect(() => {
    const ready = isSupabaseReady();
    setIsReady(ready);
    setConnectionStatus(ready ? 'connected' : 'disconnected');
  }, []);

  return {
    supabase,
    client: getSupabaseClient,
    isReady,
    connectionStatus,
    isConfigured: isSupabaseConfigured,
  };
};

// ============== Realtime Subscription Hook ==============
export const useRealtimeSubscription = <T = unknown>(
  table: string,
  onEvent: (payload: RealtimePayload<T>) => void,
  events: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  enabled = true
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const callbackRef = useRef(onEvent);

  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !isSupabaseReady()) {
      setIsSubscribed(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    try {
      unsubscribe = subscribeToRealtime(
        table,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (mounted) {
            callbackRef.current(payload as RealtimePayload<T>);
          }
        },
        events
      );

      if (mounted) {
        setIsSubscribed(true);
        setError(null);
      }
    } catch (err) {
      if (mounted) {
        setError(err instanceof Error ? err : new Error('Subscription failed'));
        setIsSubscribed(false);
      }
    }

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
        setIsSubscribed(false);
      }
    };
  }, [table, events, enabled]);

  return { isSubscribed, error };
};

// ============== Query Hook ==============
export const useSupabaseQuery = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: (client: any) => Promise<{ data: T | null; error: any }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: any[] = [],
  options: { enabled?: boolean; onError?: (error: SupabaseError) => void } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetched, setIsFetched] = useState(false);

  const { enabled = true, onError } = options;

  const refetch = useCallback(async () => {
    if (!isSupabaseReady()) {
      setError(new SupabaseError('Supabase not ready'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const client = getSupabaseClient();
    const result = await safeQuery<T>(() => queryFn(client));

    if (result.error) {
      setError(result.error);
      if (onError) onError(result.error);
    } else {
      setData(result.data);
    }

    setLoading(false);
    setIsFetched(true);
  }, [queryFn, onError]);

  useEffect(() => {
    if (enabled) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  return {
    data,
    error,
    loading,
    isFetched,
    refetch,
  };
};

// ============== Auth Hook ==============
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseReady()) {
      setLoading(false);
      return;
    }

    try {
      const client = getSupabaseClient();

      // Get initial session
      client.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    return { error };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signUp = async (email: string, password: string, metadata?: any) => {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };
};

import { getSupabaseClient } from './client';
import type { FunctionResponse } from '../../types/supabase';

// ============== Invoke Edge Function ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const invokeFunction = async <T = any>(
  functionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any,
  options?: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; headers?: Record<string, string> }
): Promise<FunctionResponse<T>> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.functions.invoke(functionName, {
      body: payload,
      method: options?.method || 'POST',
      headers: options?.headers,
    });

    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Function invocation failed'),
    };
  }
};

// ============== Function Wrappers ==============
export const functions = {
  invokeFunction,

  // AI Studio specific functions
  ai: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generate: async (prompt: string, context?: any) => {
      return invokeFunction('ai-generate', { prompt, context });
    },
    analyze: async (content: string, type: 'sentiment' | 'entities' | 'summary') => {
      return invokeFunction('ai-analyze', { content, type });
    },
  },

  // Email functions
  email: {
    send: async (to: string, subject: string, body: string, html?: string) => {
      return invokeFunction('send-email', { to, subject, body, html });
    },
    bulkSend: async (recipients: string[], subject: string, body: string) => {
      return invokeFunction('bulk-send-email', { recipients, subject, body });
    },
  },

  // Webhook functions
  webhooks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trigger: async (event: string, data: any) => {
      return invokeFunction('trigger-webhook', { event, data });
    },
  },

  // Notification functions
  notifications: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send: async (userId: string, type: string, data: any) => {
      return invokeFunction('send-notification', { userId, type, data });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    broadcast: async (type: string, data: any, target: 'all' | 'admins' | 'users') => {
      return invokeFunction('broadcast-notification', { type, data, target });
    },
  },
};

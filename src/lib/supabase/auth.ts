import { getSupabaseClient } from './client';
import type { AuthUser } from '../../types/supabase';

// ============== Auth Error Types ==============
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ============== Password Management ==============
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
    });
    if (error) throw new AuthError(error.message, error.code, error.status);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error };
    return { error: new AuthError(error instanceof Error ? error.message : 'Password reset failed') };
  }
};

export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new AuthError(error.message, error.code, error.status);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error };
    return { error: new AuthError(error instanceof Error ? error.message : 'Password update failed') };
  }
};

// ============== Profile Management ==============
export const updateProfile = async (
  updates: {
    email?: string;
    username?: string;
    avatar_url?: string;
    full_name?: string;
    bio?: string;
    website?: string;
    phone?: string;
  }
): Promise<{ data: AuthUser | null; error: AuthError | null }> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.updateUser({
      email: updates.email,
      data: {
        username: updates.username,
        avatar_url: updates.avatar_url,
        full_name: updates.full_name,
        bio: updates.bio,
        website: updates.website,
        phone: updates.phone,
      },
    });
    if (error) throw new AuthError(error.message, error.code, error.status);
    return { data: data.user as AuthUser, error: null };
  } catch (error) {
    if (error instanceof AuthError) return { data: null, error };
    return { data: null, error: new AuthError(error instanceof Error ? error.message : 'Profile update failed') };
  }
};

// ============== Social Login ==============
export const socialLogin = async (
  provider: 'google' | 'github' | 'facebook' | 'apple' | 'azure',
  options?: { redirectTo?: string; scopes?: string }
): Promise<{ error: AuthError | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options?.redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined),
        scopes: options?.scopes,
      },
    });
    if (error) throw new AuthError(error.message, error.code, error.status);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error };
    return { error: new AuthError(error instanceof Error ? error.message : 'Social login failed') };
  }
};

// ============== Magic Link / OTP ==============
export const sendMagicLink = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) throw new AuthError(error.message, error.code, error.status);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error };
    return { error: new AuthError(error instanceof Error ? error.message : 'Magic link failed') };
  }
};

// ============== Two-Factor Authentication ==============
export const enableTwoFactor = async (): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { qrCode: string; secret: string } | null;
  error: AuthError | null;
}> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.functions.invoke('generate-2fa');
    if (error) throw new AuthError(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: data as any, error: null };
  } catch (error) {
    if (error instanceof AuthError) return { data: null, error };
    return { data: null, error: new AuthError(error instanceof Error ? error.message : '2FA setup failed') };
  }
};

// ============== User Session Management ==============
export const refreshSession = async (): Promise<{ error: AuthError | null }> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.refreshSession();
    if (error) throw new AuthError(error.message, error.code, error.status);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error };
    return { error: new AuthError(error instanceof Error ? error.message : 'Session refresh failed') };
  }
};

// ============== Session Monitoring ==============
export const monitorSession = (
  onSessionExpired: () => void,
  onSessionRefreshed: () => void,
  intervalMinutes: number = 5
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const checkSession = async () => {
    try {
      const client = getSupabaseClient();
      const { data } = await client.auth.getSession();

      if (!data.session) {
        onSessionExpired();
        return;
      }

      const expiresAt = data.session.expires_at;
      if (expiresAt) {
        const timeToExpiry = expiresAt * 1000 - Date.now();
        if (timeToExpiry < 5 * 60 * 1000) {
          const { error } = await refreshSession();
          if (!error) {
            onSessionRefreshed();
          } else {
            onSessionExpired();
          }
        }
      }
    } catch (error) {
      console.error('Session monitoring error:', error);
    }
  };

  checkSession();
  const interval = setInterval(checkSession, intervalMinutes * 60 * 1000);

  return () => clearInterval(interval);
};

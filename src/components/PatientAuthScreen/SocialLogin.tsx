import React, { useState, useCallback } from "react";
import {
  Globe,
  Apple,
  Mail,
  Fingerprint,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface SocialLoginProps {
  onSuccess: (provider: string, data: { id: string; provider: string; email: string; name: string; providerId: string }) => void;
  onError: (error: string) => void;
  providers?: ('google' | 'apple' | 'abha' | 'email')[];
}

interface OAuthConfig {
  provider: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  hoverBg: string;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onSuccess,
  onError,
  providers = ['google', 'apple', 'abha', 'email']
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providerConfigs: Record<string, OAuthConfig> = {
    google: {
      provider: 'google',
      label: 'Google Health',
      icon: Globe,
      color: 'text-white',
      bgColor: 'bg-slate-900 border border-slate-800',
      hoverBg: 'hover:border-emerald-500/50 hover:bg-slate-850'
    },
    apple: {
      provider: 'apple',
      label: 'Apple Health',
      icon: Apple,
      color: 'text-white',
      bgColor: 'bg-slate-900 border border-slate-800',
      hoverBg: 'hover:border-emerald-500/50 hover:bg-slate-850'
    },
    abha: {
      provider: 'abha',
      label: 'ABHA / ABDM Gateway',
      icon: Globe,
      color: 'text-white',
      bgColor: 'bg-slate-900 border border-slate-800',
      hoverBg: 'hover:border-emerald-500/50 hover:bg-slate-850'
    },
    email: {
      provider: 'email',
      label: 'Magic Link Email',
      icon: Mail,
      color: 'text-white',
      bgColor: 'bg-slate-900 border border-slate-800',
      hoverBg: 'hover:border-emerald-500/50 hover:bg-slate-850'
    }
  };

  const handleProviderLogin = useCallback(async (provider: string) => {
    setLoading(provider);
    setError(null);

    try {
      // Simulate quick auth handshake
      await new Promise(resolve => setTimeout(resolve, 800));

      const names: Record<string, string> = {
        google: "Aarav Sharma (Google Health)",
        apple: "Dr. Ananya Iyer (Apple Health)",
        abha: "Rajesh Kumar (ABHA 14-Digit)",
        email: "Deepak Patel (Magic Link)"
      };

      const userData = {
        id: `PAT-OAUTH-${provider.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        provider,
        email: `patient.${provider}@cura-health.in`,
        name: names[provider] || `${provider.toUpperCase()} Verified Patient`,
        providerId: `oauth_${provider}_${Math.random().toString(36).substring(2, 9)}`
      };

      onSuccess(provider, userData);
    } catch (err) {
      const errorMsg = `Failed to authenticate via ${provider}.`;
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(null);
    }
  }, [onSuccess, onError]);

  const availableProviders = providers
    .filter(p => p in providerConfigs)
    .map(p => providerConfigs[p]);

  return (
    <div id="social-oauth-container" className="space-y-3 pt-2">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="px-3 bg-slate-950 text-slate-500">Or fast sign-in with</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Provider Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {availableProviders.map((config) => {
          const Icon = config.icon;
          const isLoading = loading === config.provider;
          
          return (
            <button
              id={`btn-oauth-${config.provider}`}
              key={config.provider}
              type="button"
              onClick={() => handleProviderLogin(config.provider)}
              disabled={!!loading}
              className={`
                py-2.5 px-3 rounded-xl text-xs font-bold transition-all
                ${config.bgColor} ${config.hoverBg}
                text-slate-300 hover:text-white flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              `}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              ) : (
                <Icon className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className="text-[11px] truncate">
                {isLoading ? 'Connecting...' : config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

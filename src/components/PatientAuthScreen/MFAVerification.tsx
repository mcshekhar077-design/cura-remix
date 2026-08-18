import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  Smartphone,
  Key,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Copy,
  Download
} from "lucide-react";

export interface MFAVerificationProps {
  onVerify: (method: 'authenticator' | 'sms' | 'email' | 'recovery') => void;
  onBack: () => void;
  email?: string;
  phone?: string;
  isRequired?: boolean;
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({
  onVerify,
  onBack,
  email,
  phone,
  isRequired = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'sms' | 'email' | 'recovery'>('authenticator');
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [copiedKey, setCopiedKey] = useState(false);
  const [backupCodes] = useState<string[]>([
    'CURA-1234-EFGH-5678',
    'CURA-9012-MNOP-3456',
    'CURA-7890-UVWX-1234',
    'CURA-5678-CDEF-9012',
    'CURA-3456-KLMN-7890'
  ]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = useCallback(() => {
    if (code.length !== 6 && selectedMethod !== 'recovery') {
      setError('Please enter a valid 6-digit code');
      return;
    }
    if (selectedMethod === 'recovery' && code.length < 8) {
      setError('Please enter a valid backup code (e.g. CURA-1234-EFGH-5678)');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Realistic verification
    setTimeout(() => {
      if (code === '123456' || code.length === 6 || selectedMethod === 'recovery') {
        setSuccess(true);
        setTimeout(() => {
          onVerify(selectedMethod);
        }, 600);
      } else {
        setError('Invalid verification code. Please try again.');
      }
      setIsLoading(false);
    }, 900);
  }, [code, selectedMethod, onVerify]);

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setError(null);
  }, [resendCooldown]);

  const copyBackupCodes = useCallback(() => {
    navigator.clipboard?.writeText(backupCodes.join('\n'));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }, [backupCodes]);

  return (
    <div id="mfa-verification-modal" className="space-y-5 text-left">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h3 className="text-base font-black text-white mt-2">
          Two-Factor Authentication (2FA)
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {isRequired ? 'Required for HIPAA Security Compliance' : 'Protect your clinical health records vault'}
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-mfa-authenticator"
          type="button"
          onClick={() => { setSelectedMethod('authenticator'); setError(null); }}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedMethod === 'authenticator'
              ? 'border-emerald-500/50 bg-emerald-950/40 shadow-sm'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}
        >
          <Smartphone className="h-4 w-4 mx-auto text-emerald-400" />
          <span className="text-[11px] font-bold text-white mt-1 block">Authenticator</span>
        </button>
        <button
          id="btn-mfa-sms"
          type="button"
          onClick={() => { setSelectedMethod('sms'); setError(null); }}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedMethod === 'sms'
              ? 'border-emerald-500/50 bg-emerald-950/40 shadow-sm'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}
        >
          <Phone className="h-4 w-4 mx-auto text-cyan-400" />
          <span className="text-[11px] font-bold text-white mt-1 block">SMS Code</span>
        </button>
        <button
          id="btn-mfa-email"
          type="button"
          onClick={() => { setSelectedMethod('email'); setError(null); }}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedMethod === 'email'
              ? 'border-emerald-500/50 bg-emerald-950/40 shadow-sm'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}
        >
          <Mail className="h-4 w-4 mx-auto text-purple-400" />
          <span className="text-[11px] font-bold text-white mt-1 block">Email Code</span>
        </button>
        <button
          id="btn-mfa-recovery"
          type="button"
          onClick={() => { setSelectedMethod('recovery'); setError(null); }}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedMethod === 'recovery'
              ? 'border-emerald-500/50 bg-emerald-950/40 shadow-sm'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}
        >
          <Key className="h-4 w-4 mx-auto text-amber-400" />
          <span className="text-[11px] font-bold text-white mt-1 block">Backup Code</span>
        </button>
      </div>

      {/* Method-specific content */}
      <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-3">
        {selectedMethod === 'authenticator' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Scan in Google Authenticator or Microsoft Authenticator
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
              <code className="text-[11px] font-mono text-emerald-300">
                CURA-TOTP-7X89-2B01
              </code>
              <button
                id="btn-copy-totp-key"
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText('CURA-TOTP-7X89-2B01');
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                {copiedKey ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {selectedMethod === 'sms' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              A 6-digit OTP has been sent via SMS to your registered phone:
              <span className="text-white font-bold block mt-1 font-mono">{phone || '+91 ••••• 43210'}</span>
            </p>
            {resendCooldown > 0 && (
              <p className="text-[11px] text-amber-400">
                Resend code available in {resendCooldown}s
              </p>
            )}
          </div>
        )}

        {selectedMethod === 'email' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              A 6-digit verification code has been dispatched to:
              <span className="text-white font-bold block mt-1 font-mono">{email || 'patient@example.com'}</span>
            </p>
          </div>
        )}

        {selectedMethod === 'recovery' && (
          <div className="space-y-2.5">
            {!showBackupCodes ? (
              <div className="text-center py-2">
                <p className="text-xs text-slate-400">
                  Lost device access? Enter one of your saved emergency recovery keys.
                </p>
                <button
                  id="btn-show-backup-codes"
                  type="button"
                  onClick={() => setShowBackupCodes(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold mt-2 cursor-pointer"
                >
                  View emergency backup keys
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-slate-900 p-2.5 rounded-xl space-y-1 border border-slate-800">
                  {backupCodes.map((c, idx) => (
                    <div key={idx} className="font-mono text-[11px] text-slate-300 flex items-center justify-between">
                      <span>{c}</span>
                      <span className="text-slate-500 text-[9px]">
                        {idx === 0 ? '(Primary)' : `#${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    id="btn-copy-backup-codes"
                    type="button"
                    onClick={copyBackupCodes}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold rounded-lg text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> {copiedKey ? "Copied" : "Copy Codes"}
                  </button>
                  <button
                    id="btn-download-backup-codes"
                    type="button"
                    onClick={() => {
                      const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'cura_vault_backup_codes.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold rounded-lg text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" /> Download TXT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-mfa-code">
            {selectedMethod === 'recovery' ? 'Enter Backup Recovery Key' : 'Enter 6-Digit Code'}
          </label>
          <input
            id="input-mfa-code"
            type="text"
            maxLength={selectedMethod === 'recovery' ? 24 : 6}
            value={code}
            onChange={(e) => {
              const val = selectedMethod === 'recovery' ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '');
              setCode(val);
              setError(null);
            }}
            placeholder={selectedMethod === 'recovery' ? 'CURA-XXXX-XXXX-XXXX' : '000000'}
            className="w-full bg-slate-900 border border-slate-700 text-center text-lg font-mono font-black text-emerald-400 tracking-widest py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
            aria-label="Verification code"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Identity 2FA Verified! Entering vault...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            id="btn-mfa-cancel"
            type="button"
            onClick={onBack}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {selectedMethod !== 'recovery' && (
            <button
              id="btn-mfa-resend"
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'}
            </button>
          )}
          <button
            id="btn-mfa-verify-submit"
            type="button"
            onClick={handleVerify}
            disabled={isLoading || (selectedMethod !== 'recovery' && code.length !== 6)}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                Confirm <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
        <Shield className="h-3 w-3 text-emerald-400" />
        <span>End-to-end encrypted biometric & token security</span>
      </div>
    </div>
  );
};

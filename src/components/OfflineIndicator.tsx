import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] flex items-center gap-2.5 rounded-xl bg-amber-500/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-xl border border-amber-400/40 animate-in slide-in-from-bottom duration-300">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached clinical records available.</span>
    </div>
  );
};

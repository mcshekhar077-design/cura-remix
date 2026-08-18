import React, { useState } from "react";
import { Mic, Sparkles } from "lucide-react";
import VoiceCommandOverlay from "../VoiceCommandOverlay";

interface VoiceCommandButtonProps {
  onNavigateTab?: (tab: string) => void;
  onAddVitalsClick?: () => void;
  onBookAppointmentClick?: () => void;
  onOpenRefillModal?: () => void;
  onJoinCallClick?: () => void;
  onViewRouteClick?: () => void;
  onOpenScanner?: () => void;
  onOpenProfile?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

export default function VoiceCommandButton({
  onNavigateTab,
  onAddVitalsClick,
  onBookAppointmentClick,
  onOpenRefillModal,
  onJoinCallClick,
  onViewRouteClick,
  onOpenScanner,
  onOpenProfile,
  onViewHistory,
  className = ""
}: VoiceCommandButtonProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const toggleOverlay = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <button
          id="btn-floating-voice-command"
          type="button"
          onClick={toggleOverlay}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative group flex items-center justify-center
            w-14 h-14 rounded-full
            bg-gradient-to-r from-emerald-500 to-teal-500
            hover:from-emerald-400 hover:to-teal-400
            text-white shadow-2xl shadow-emerald-500/30
            transition-all duration-300
            hover:scale-110 active:scale-95
            ${isHovered ? 'scale-105' : ''}
            border-2 border-white/10 cursor-pointer
          `}
          aria-label="Open Voice Command"
        >
          <Mic className="h-6 w-6" />
          
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-30 border-2 border-emerald-400" />
          
          {/* Tooltip */}
          <span className={`
            absolute bottom-full mb-3 left-1/2 -translate-x-1/2
            px-3 py-1.5 rounded-xl
            bg-slate-900 border border-slate-800
            text-white text-xs font-bold whitespace-nowrap
            transition-all duration-200 pointer-events-none
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}>
            <Sparkles className="inline h-3 w-3 mr-1 text-emerald-400" />
            Voice Commands
          </span>
        </button>

        {/* Keyboard shortcut hint */}
        <div className="absolute -top-2 -right-2 bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-0.5 text-[8px] font-mono text-slate-400">
          ⌘V
        </div>
      </div>

      {/* Voice Command Overlay */}
      <VoiceCommandOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigateTab={onNavigateTab}
        onAddVitalsClick={onAddVitalsClick}
        onBookAppointmentClick={onBookAppointmentClick}
        onOpenRefillModal={onOpenRefillModal}
        onJoinCallClick={onJoinCallClick}
        onViewRouteClick={onViewRouteClick}
        onOpenScanner={onOpenScanner}
        onOpenProfile={onOpenProfile}
        onViewHistory={onViewHistory}
      />

      {/* Keyboard shortcut listener */}
      <KeyboardShortcutListener 
        onActivate={toggleOverlay}
        shortcut="v"
      />
    </>
  );
}

// Keyboard shortcut component
const KeyboardShortcutListener: React.FC<{
  onActivate: () => void;
  shortcut: string;
}> = ({ onActivate, shortcut }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+V or Ctrl+V
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut) {
        e.preventDefault();
        onActivate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onActivate, shortcut]);

  return null;
};

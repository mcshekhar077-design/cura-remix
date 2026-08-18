import { useCallback, useEffect, useState } from 'react';

export interface VoiceCommandConfig {
  onNavigateTab?: (tab: string) => void;
  onAddVitalsClick?: () => void;
  onBookAppointmentClick?: () => void;
  onOpenRefillModal?: () => void;
  onJoinCallClick?: () => void;
  onViewRouteClick?: () => void;
  onOpenScanner?: () => void;
  onOpenProfile?: () => void;
  onViewHistory?: () => void;
}

export interface VoiceCommandState {
  isOpen: boolean;
  isSupported: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useVoiceCommand = (_config?: VoiceCommandConfig): VoiceCommandState => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  const toggle = useCallback((): void => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return {
    isOpen,
    isSupported,
    toggle,
    open,
    close
  };
};

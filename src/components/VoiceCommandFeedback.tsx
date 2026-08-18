import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Mic, 
  Sparkles,
  Volume2
} from "lucide-react";

interface VoiceCommandFeedbackProps {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  matchedCommand?: string;
  error?: string;
  onClose?: () => void;
  autoClose?: number;
}

export default function VoiceCommandFeedback({
  isListening,
  isProcessing,
  transcript,
  matchedCommand,
  error,
  onClose,
  autoClose = 3000
}: VoiceCommandFeedbackProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isListening || isProcessing || transcript || error) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isListening, isProcessing, transcript, error]);

  useEffect(() => {
    if (matchedCommand) {
      const timeout = setTimeout(() => {
        if (autoClose && onClose) {
          setTimeout(onClose, 500);
        }
      }, autoClose);
      return () => clearTimeout(timeout);
    }
  }, [matchedCommand, autoClose, onClose]);

  if (!isVisible && !matchedCommand) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4"
      >
        <div className={`
          bg-slate-900 border rounded-2xl p-4 shadow-2xl
          ${error ? 'border-rose-500/40' : 
            matchedCommand ? 'border-emerald-500/40' : 
            'border-slate-800'}
        `}>
          {/* Status Icon */}
          <div className="flex items-start gap-3">
            <div className={`
              p-2 rounded-xl shrink-0
              ${error ? 'bg-rose-500/20 text-rose-400' :
                matchedCommand ? 'bg-emerald-500/20 text-emerald-400' :
                isProcessing ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'}
            `}>
              {error ? (
                <XCircle className="h-5 w-5" />
              ) : matchedCommand ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isListening ? (
                <Mic className="h-5 w-5 animate-pulse" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {error ? 'Error' :
                   matchedCommand ? 'Command Executed' :
                   isProcessing ? 'Processing...' :
                   isListening ? 'Listening...' : 'Ready'}
                </span>
                {isListening && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <p className="text-xs text-slate-300 mt-1 truncate">
                  "{transcript}"
                </p>
              )}

              {/* Error message */}
              {error && (
                <p className="text-xs text-rose-300 mt-1">{error}</p>
              )}

              {/* Matched command */}
              {matchedCommand && (
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    {matchedCommand}
                  </span>
                </div>
              )}
            </div>

            {/* Close button */}
            {onClose && (error || matchedCommand) && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close feedback"
              >
                ✕
              </button>
            )}
          </div>

          {/* Progress bar for success */}
          {matchedCommand && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoClose / 1000, ease: 'linear' }}
              className="h-0.5 bg-emerald-500/50 rounded-full mt-3"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

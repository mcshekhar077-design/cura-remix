import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Mic,
  CheckCircle2,
  Volume2,
  Sparkles,
  Trophy,
  ArrowRight,
  Loader2,
  Pill,
  Activity,
  Calendar,
  Bot
} from "lucide-react";

interface TrainingStep {
  id: string;
  command: string;
  description: string;
  icon: React.ReactNode;
  successMessage: string;
}

const TRAINING_STEPS: TrainingStep[] = [
  {
    id: "step1",
    command: "Open my prescriptions",
    description: "Say this to view your medication list",
    icon: <Pill className="h-5 w-5" />,
    successMessage: "✓ Prescriptions opened!"
  },
  {
    id: "step2",
    command: "Record vitals",
    description: "Say this to log your health metrics",
    icon: <Activity className="h-5 w-5" />,
    successMessage: "✓ Vitals recorder opened!"
  },
  {
    id: "step3",
    command: "Book an appointment",
    description: "Say this to schedule a doctor visit",
    icon: <Calendar className="h-5 w-5" />,
    successMessage: "✓ Appointment booking opened!"
  },
  {
    id: "step4",
    command: "Open AI companion",
    description: "Say this to chat with your health AI",
    icon: <Bot className="h-5 w-5" />,
    successMessage: "✓ AI companion opened!"
  }
];

interface VoiceCommandTrainingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function VoiceCommandTraining({
  onComplete,
  onSkip
}: VoiceCommandTrainingProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedCommand, setRecognizedCommand] = useState<string>("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const completeStep = (stepIndex: number): void => {
    const stepId = TRAINING_STEPS[stepIndex].id;
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    if (stepIndex < TRAINING_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 1000);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    }
  };

  const startListening = (): void => {
    if (typeof window === "undefined") return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setRecognizedCommand(transcript);
      
      // Check if matches current step
      const currentCommand = TRAINING_STEPS[currentStep].command.toLowerCase();
      if (transcript.includes(currentCommand) || currentCommand.includes(transcript)) {
        completeStep(currentStep);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const skipTraining = (): void => {
    if (onSkip) onSkip();
  };

  return (
    <div 
      id="voice-training-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        id="voice-training-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Voice Command Training
                <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-normal">
                  Interactive
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Step {currentStep + 1} of {TRAINING_STEPS.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress */}
          <div className="flex gap-1">
            {TRAINING_STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all ${
                  completedSteps.has(step.id)
                    ? 'bg-emerald-500'
                    : idx === currentStep
                    ? 'bg-purple-500'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          {!isComplete ? (
            <>
              {/* Current Step */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{TRAINING_STEPS[currentStep].icon}</span>
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Say this command:</p>
                    <p className="text-xl font-black text-white font-mono">
                      "{TRAINING_STEPS[currentStep].command}"
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-400">
                  {TRAINING_STEPS[currentStep].description}
                </p>

                {/* Recognized text */}
                {recognizedCommand && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-sm font-semibold ${
                      completedSteps.has(TRAINING_STEPS[currentStep].id)
                        ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                    }`}
                  >
                    {completedSteps.has(TRAINING_STEPS[currentStep].id) ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {TRAINING_STEPS[currentStep].successMessage}
                      </span>
                    ) : (
                      `You said: "${recognizedCommand}"`
                    )}
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  id="btn-training-listen"
                  type="button"
                  onClick={startListening}
                  disabled={isListening}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isListening
                      ? 'bg-purple-600 text-white cursor-wait'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Say the Command
                    </>
                  )}
                </button>

                <button
                  id="btn-training-skip"
                  type="button"
                  onClick={() => {
                    if (currentStep < TRAINING_STEPS.length - 1) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      setIsComplete(true);
                      setTimeout(() => {
                        if (onComplete) onComplete();
                      }, 1500);
                    }
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Skip <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Manual input fallback */}
              <div className="pt-2 border-t border-slate-800/50">
                <p className="text-[10px] text-slate-500 text-center">
                  Or test with click: 
                  <button
                    id="btn-training-direct-complete"
                    type="button"
                    onClick={() => completeStep(currentStep)}
                    className="ml-1 text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                  >
                    {TRAINING_STEPS[currentStep].command}
                  </button>
                </p>
              </div>
            </>
          ) : (
            /* Completion screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="flex items-center justify-center">
                <div className="p-4 bg-emerald-500/20 rounded-full border-2 border-emerald-500/40">
                  <Trophy className="h-16 w-16 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white">Training Complete! 🎉</h3>
              <p className="text-slate-400 text-sm">
                You've learned all the essential voice commands.
                <br />
                Try them out with the microphone button!
              </p>
              <div className="flex items-center gap-3 pt-4">
                <button
                  id="btn-training-finish"
                  type="button"
                  onClick={skipTraining}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  id="btn-training-restart"
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setCompletedSteps(new Set());
                    setRecognizedCommand("");
                    setIsComplete(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Restart Training
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer hint */}
        {!isComplete && (
          <div className="bg-slate-950/80 p-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Volume2 className="h-3 w-3" />
              Speak clearly and naturally
            </span>
            <span>
              {completedSteps.size} / {TRAINING_STEPS.length} completed
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

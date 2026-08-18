import React, { useState } from "react";
import { 
  Mic, 
  Volume2, 
  Globe, 
  Settings, 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

export interface VoiceSettingsData {
  language: string;
  continuousListening: boolean;
  autoStart: boolean;
  confidenceThreshold: number;
  showFeedback: boolean;
  voiceFeedbackEnabled: boolean;
  wakeWord: string;
}

interface VoiceSettingsProps {
  onClose?: () => void;
  onSave?: (settings: VoiceSettingsData) => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' }
];

const WAKE_WORDS = [
  'Hey CURA',
  'Okay CURA',
  'Hello CURA',
  'CURA',
  'Hey Assistant'
];

export default function VoiceSettings({ onClose, onSave }: VoiceSettingsProps): React.ReactElement {
  // Load settings from localStorage
  const loadSettings = (): VoiceSettingsData => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('voice_settings');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // Ignore
    }
    return {
      language: 'en-US',
      continuousListening: true,
      autoStart: true,
      confidenceThreshold: 30,
      showFeedback: true,
      voiceFeedbackEnabled: true,
      wakeWord: 'Hey CURA'
    };
  };

  const [settings, setSettings] = useState<VoiceSettingsData>(loadSettings);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = (): void => {
    setIsSaving(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('voice_settings', JSON.stringify(settings));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSave) onSave(settings);
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMicrophone = async (): Promise<void> => {
    setTestStatus('testing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const updateSetting = <K extends keyof VoiceSettingsData>(
    key: K,
    value: VoiceSettingsData[K]
  ): void => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div 
      id="voice-settings-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div 
        id="voice-settings-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Voice Command Settings</h3>
              <p className="text-[10px] text-slate-400">Configure your voice assistant preferences</p>
            </div>
          </div>
          <button
            id="btn-close-voice-settings"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close voice settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Microphone Test */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mic className="h-4 w-4 text-emerald-400" />
                  Microphone Test
                </h4>
                <p className="text-xs text-slate-400">Check if your microphone is working properly</p>
              </div>
              <button
                id="btn-test-mic"
                type="button"
                onClick={handleTestMicrophone}
                disabled={testStatus === 'testing'}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {testStatus === 'testing' ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Testing...
                  </>
                ) : testStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Working!
                  </>
                ) : testStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    Failed
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    Test Mic
                  </>
                )}
              </button>
            </div>
            {testStatus === 'error' && (
              <p className="text-xs text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
                ⚠️ Could not access microphone. Please check permissions and try again.
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label htmlFor="select-voice-language" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              Language
            </label>
            <select
              id="select-voice-language"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              {AVAILABLE_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* Wake Word */}
          <div className="space-y-1.5">
            <label htmlFor="select-wake-word" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Mic className="h-3.5 w-3.5" />
              Wake Word
            </label>
            <select
              id="select-wake-word"
              value={settings.wakeWord}
              onChange={(e) => updateSetting('wakeWord', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              {WAKE_WORDS.map(word => (
                <option key={word} value={word}>{word}</option>
              ))}
            </select>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="range-confidence-threshold" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Confidence Threshold
              </label>
              <span className="text-sm font-bold text-emerald-400">
                {settings.confidenceThreshold}%
              </span>
            </div>
            <input
              id="range-confidence-threshold"
              type="range"
              min="10"
              max="80"
              step="5"
              value={settings.confidenceThreshold}
              onChange={(e) => updateSetting('confidenceThreshold', parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Lower = more commands recognized, Higher = fewer false positives
            </p>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Continuous Listening</p>
                <p className="text-xs text-slate-400">Keep microphone active after each command</p>
              </div>
              <button
                id="btn-toggle-continuous"
                type="button"
                onClick={() => updateSetting('continuousListening', !settings.continuousListening)}
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${
                  settings.continuousListening ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Continuous Listening"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.continuousListening ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Auto-Start on App Open</p>
                <p className="text-xs text-slate-400">Begin listening when the app launches</p>
              </div>
              <button
                id="btn-toggle-autostart"
                type="button"
                onClick={() => updateSetting('autoStart', !settings.autoStart)}
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${
                  settings.autoStart ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Auto-Start"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.autoStart ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Show Visual Feedback</p>
                <p className="text-xs text-slate-400">Display popup when voice commands are processed</p>
              </div>
              <button
                id="btn-toggle-show-feedback"
                type="button"
                onClick={() => updateSetting('showFeedback', !settings.showFeedback)}
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${
                  settings.showFeedback ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Visual Feedback"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.showFeedback ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Voice Feedback</p>
                <p className="text-xs text-slate-400">Speak confirmation when commands are recognized</p>
              </div>
              <button
                id="btn-toggle-voice-feedback"
                type="button"
                onClick={() => updateSetting('voiceFeedbackEnabled', !settings.voiceFeedbackEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${
                  settings.voiceFeedbackEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Voice Confirmation"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.voiceFeedbackEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Save Success */}
          {saveSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-bold">Settings saved successfully!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            id="btn-reset-voice-defaults"
            type="button"
            onClick={() => {
              const defaults: VoiceSettingsData = {
                language: 'en-US',
                continuousListening: true,
                autoStart: true,
                confidenceThreshold: 30,
                showFeedback: true,
                voiceFeedbackEnabled: true,
                wakeWord: 'Hey CURA'
              };
              setSettings(defaults);
              if (typeof window !== 'undefined') {
                localStorage.setItem('voice_settings', JSON.stringify(defaults));
              }
            }}
            className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              id="btn-cancel-voice-settings"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-voice-settings"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

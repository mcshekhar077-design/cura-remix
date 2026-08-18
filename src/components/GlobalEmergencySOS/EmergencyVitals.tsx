import React, { useState, useCallback } from "react";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from "lucide-react";

export interface VitalRecord {
  id: string;
  timestamp: string;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
  notes?: string;
}

export interface EmergencyVitalsProps {
  vitals: VitalRecord[];
  onAddVital: (vital: Omit<VitalRecord, 'id' | 'timestamp'>) => void;
  onAlert?: (message: string) => void;
}

export const EmergencyVitals: React.FC<EmergencyVitalsProps> = ({
  vitals,
  onAddVital,
  onAlert
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    heartRate: 88,
    bpSystolic: 128,
    bpDiastolic: 82,
    spo2: 98,
    temperature: 37.0,
    respiratoryRate: 16,
    notes: ''
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate vitals and trigger thresholds
    const alerts: string[] = [];
    if (formData.heartRate > 120) alerts.push('Tachycardia: High heart rate (>120 bpm)');
    if (formData.heartRate < 50) alerts.push('Bradycardia: Low heart rate (<50 bpm)');
    if (formData.bpSystolic > 160) alerts.push('Hypertensive: High systolic BP (>160 mmHg)');
    if (formData.bpSystolic < 90) alerts.push('Hypotension: Low systolic BP (<90 mmHg)');
    if (formData.spo2 < 92) alerts.push('Hypoxia: Low SpO₂ (<92%)');
    if (formData.temperature > 38.5) alerts.push('Hyperthermia: High temperature (>38.5°C)');

    if (alerts.length > 0) {
      const msg = alerts.join(' • ');
      setAlertBanner(msg);
      if (onAlert) onAlert(msg);
    } else {
      setAlertBanner(null);
    }

    onAddVital(formData);
    setIsLoading(false);
    setShowAddForm(false);
  }, [formData, onAddVital, onAlert]);

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case 'heartRate':
        if (value > 100 || value < 55) return 'warning';
        return 'normal';
      case 'bpSystolic':
        if (value > 140 || value < 90) return 'warning';
        return 'normal';
      case 'spo2':
        if (value < 94) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 38 || value < 36) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const latestVital = vitals[vitals.length - 1];

  return (
    <div id="emergency-vitals-module" className="space-y-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Emergency Telemetry Vitals
          </h4>
          <p className="text-[11px] text-slate-400">
            {vitals.length} recorded frames • Updated: {latestVital ? new Date(latestVital.timestamp).toLocaleTimeString() : 'Live'}
          </p>
        </div>
        <button
          id="btn-add-vital-toggle"
          type="button"
          onClick={() => setShowAddForm(true)}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          Log Vitals
        </button>
      </div>

      {alertBanner && (
        <div className="p-2 bg-rose-950/50 border border-rose-500/40 rounded-xl text-[11px] text-rose-300 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* Current Vitals Grid */}
      {latestVital && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1">
              <Heart className={`h-3 w-3 ${
                getVitalStatus('heartRate', latestVital.heartRate) === 'warning'
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`} />
              <span className="text-[8px] text-slate-400 font-bold uppercase">HR</span>
            </div>
            <p className="text-xs font-black text-white font-mono mt-0.5">{latestVital.heartRate}</p>
            <span className="text-[8px] text-slate-500">BPM</span>
          </div>

          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1">
              <Gauge className={`h-3 w-3 ${
                getVitalStatus('bpSystolic', latestVital.bpSystolic) === 'warning'
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`} />
              <span className="text-[8px] text-slate-400 font-bold uppercase">BP</span>
            </div>
            <p className="text-xs font-black text-white font-mono mt-0.5">{latestVital.bpSystolic}/{latestVital.bpDiastolic}</p>
            <span className="text-[8px] text-slate-500">mmHg</span>
          </div>

          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1">
              <Droplets className={`h-3 w-3 ${
                getVitalStatus('spo2', latestVital.spo2) === 'warning'
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`} />
              <span className="text-[8px] text-slate-400 font-bold uppercase">SpO₂</span>
            </div>
            <p className="text-xs font-black text-white font-mono mt-0.5">{latestVital.spo2}%</p>
            <span className="text-[8px] text-slate-500">Oxygen</span>
          </div>

          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1">
              <Thermometer className={`h-3 w-3 ${
                getVitalStatus('temperature', latestVital.temperature) === 'warning'
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`} />
              <span className="text-[8px] text-slate-400 font-bold uppercase">Temp</span>
            </div>
            <p className="text-xs font-black text-white font-mono mt-0.5">{latestVital.temperature}°C</p>
            <span className="text-[8px] text-slate-500">Body</span>
          </div>

          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1">
              <Wind className={`h-3 w-3 ${
                latestVital.respiratoryRate > 20 || latestVital.respiratoryRate < 12
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`} />
              <span className="text-[8px] text-slate-400 font-bold uppercase">Resp</span>
            </div>
            <p className="text-xs font-black text-white font-mono mt-0.5">{latestVital.respiratoryRate}</p>
            <span className="text-[8px] text-slate-500">/min</span>
          </div>

          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-[8px] text-slate-400 font-bold uppercase">Time</span>
            </div>
            <p className="text-xs font-black text-emerald-400 font-mono mt-0.5">
              {new Date(latestVital.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span className="text-[8px] text-slate-500">Sync</span>
          </div>
        </div>
      )}

      {/* Add Vitals Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h5 className="text-[11px] font-bold text-white">Record Emergency Vitals</h5>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-hr">
                Heart Rate (BPM)
              </label>
              <input
                id="input-v-hr"
                type="number"
                value={formData.heartRate}
                onChange={(e) => setFormData(prev => ({ ...prev, heartRate: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-center text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                min="30"
                max="220"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-bpsys">
                Systolic BP
              </label>
              <input
                id="input-v-bpsys"
                type="number"
                value={formData.bpSystolic}
                onChange={(e) => setFormData(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-center text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                min="60"
                max="240"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-bpdia">
                Diastolic BP
              </label>
              <input
                id="input-v-bpdia"
                type="number"
                value={formData.bpDiastolic}
                onChange={(e) => setFormData(prev => ({ ...prev, bpDiastolic: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-center text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                min="40"
                max="140"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-spo2">
                SpO₂ (%)
              </label>
              <input
                id="input-v-spo2"
                type="number"
                value={formData.spo2}
                onChange={(e) => setFormData(prev => ({ ...prev, spo2: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-center text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                min="60"
                max="100"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-temp">
                Temp (°C)
              </label>
              <input
                id="input-v-temp"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-center text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                min="32"
                max="43"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-rr">
                Resp Rate
              </label>
              <input
                id="input-v-rr"
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-center text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                min="5"
                max="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-v-notes">
              Observation Notes
            </label>
            <input
              id="input-v-notes"
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Patient conscious, mild cold sweats"
              className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              id="btn-save-vitals-submit"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Save Vitals Frame
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Vitals History */}
      {vitals.length > 1 && (
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Historical Trend</span>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-0.5">
            {[...vitals].reverse().slice(0, 6).map((vital) => (
              <div key={vital.id} className="flex items-center justify-between text-[11px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(vital.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-slate-300">
                    HR: <strong className="text-white font-mono">{vital.heartRate}</strong>
                  </span>
                  <span className="text-slate-300">
                    BP: <strong className="text-white font-mono">{vital.bpSystolic}/{vital.bpDiastolic}</strong>
                  </span>
                  <span className="text-slate-300">
                    SpO₂: <strong className="text-white font-mono">{vital.spo2}%</strong>
                  </span>
                </div>
                {vital.notes && (
                  <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
                    {vital.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

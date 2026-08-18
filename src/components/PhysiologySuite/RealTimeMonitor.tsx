import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  Activity,
  Gauge,
  Droplets,
  Wind,
  AlertCircle,
  Play,
  Pause,
  Bluetooth,
  Wifi,
  WifiOff
} from "lucide-react";

interface VitalStream {
  heartRate: number;
  spo2: number;
  bloodPressure: { systolic: number; diastolic: number };
  respirationRate: number;
  temperature: number;
  ecgLead: number[];
  timestamp: string;
}

export interface RealTimeMonitorProps {
  patientId: string;
  onAlert?: (alert: { type: "warning" | "critical"; message: string }) => void;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ 
  patientId, 
  onAlert 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [vitals, setVitals] = useState<VitalStream | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<number>(100);
  const [alerts, setAlerts] = useState<{ id: string; type: "warning" | "critical"; message: string; timestamp: string }[]>([]);
  const [signalStrength, setSignalStrength] = useState<"excellent" | "good" | "fair" | "poor">("good");
  
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulate WebSocket connection & streaming vitals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        const newVitals: VitalStream = {
          heartRate: 60 + Math.random() * 30,
          spo2: 97 + Math.random() * 2,
          bloodPressure: {
            systolic: 115 + Math.random() * 20,
            diastolic: 75 + Math.random() * 10
          },
          respirationRate: 12 + Math.random() * 6,
          temperature: 36.5 + Math.random() * 0.8,
          ecgLead: Array.from({ length: 50 }, () => Math.sin(Math.random() * 2 * Math.PI) * 10 + Math.random() * 5),
          timestamp: new Date().toISOString()
        };
        
        setVitals(newVitals);
        
        if (newVitals.heartRate > 130 || newVitals.heartRate < 40) {
          const alert = {
            id: `alert-${Date.now()}`,
            type: "critical" as const,
            message: `Abnormal heart rate: ${Math.round(newVitals.heartRate)} bpm`,
            timestamp: new Date().toISOString()
          };
          setAlerts(prev => [alert, ...prev].slice(0, 10));
          onAlert?.(alert);
        }
        
        if (newVitals.spo2 < 92) {
          const alert = {
            id: `alert-${Date.now()}`,
            type: "warning" as const,
            message: `Low SpO2: ${newVitals.spo2.toFixed(1)}%`,
            timestamp: new Date().toISOString()
          };
          setAlerts(prev => [alert, ...prev].slice(0, 10));
          onAlert?.(alert);
        }
        
        const quality = 85 + Math.random() * 15;
        setConnectionQuality(quality);
        if (quality > 90) setSignalStrength("excellent");
        else if (quality > 75) setSignalStrength("good");
        else if (quality > 60) setSignalStrength("fair");
        else setSignalStrength("poor");
        
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, onAlert]);

  // Draw ECG waveform
  useEffect(() => {
    if (!ecgCanvasRef.current || !vitals) return;
    
    const canvas = ecgCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw ECG signal
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const data = vitals.ecgLead;
    const step = width / data.length;
    
    data.forEach((value, index) => {
      const x = index * step;
      const y = height / 2 + (value / 20) * (height / 3);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Highlight peaks
    ctx.fillStyle = "#f87171";
    data.forEach((value, index) => {
      if (value > 8) {
        const x = index * step;
        const y = height / 2 + (value / 20) * (height / 3);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [vitals]);

  const toggleConnection = useCallback(() => {
    setIsConnected(prev => !prev);
    if (!isConnected) {
      setTimeout(() => {
        setConnectionQuality(90);
        setSignalStrength("good");
      }, 1000);
    }
  }, [isConnected]);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getConnectionColor = () => {
    switch (signalStrength) {
      case "excellent": return "text-emerald-400";
      case "good": return "text-green-400";
      case "fair": return "text-yellow-400";
      case "poor": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const ConnectionIcon = isConnected ? Wifi : WifiOff;

  return (
    <div id="real-time-monitor-card" className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Real-Time Patient Monitor</h3>
            <p className="text-xs text-slate-400">Live vital signs streaming • Patient: {patientId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
            <ConnectionIcon className={`h-4 w-4 ${getConnectionColor()}`} />
            <span className={`text-xs font-bold ${getConnectionColor()}`}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            {isConnected && (
              <span className="text-[10px] text-slate-500">
                {Math.round(connectionQuality)}%
              </span>
            )}
          </div>
          
          <button
            id="btn-toggle-monitor-connection"
            type="button"
            onClick={toggleConnection}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isConnected
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>

      {/* ECG Waveform */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">ECG Lead II</span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-500">25mm/s</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">10mm/mV</span>
            {isConnected && (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <canvas
            ref={ecgCanvasRef}
            width={600}
            height={150}
            className="w-full rounded-lg bg-slate-950"
          />
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-lg">
              <p className="text-sm text-slate-400">Connect to start real-time monitoring</p>
            </div>
          )}
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <Heart className="h-4 w-4 text-rose-400" />
            <span className="text-[10px] text-slate-500 font-mono">bpm</span>
          </div>
          <p className="text-xl font-black text-white mt-1">
            {vitals ? Math.round(vitals.heartRate) : "--"}
          </p>
          <span className="text-[10px] text-slate-400">Heart Rate</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] text-slate-500 font-mono">%</span>
          </div>
          <p className="text-xl font-black text-white mt-1">
            {vitals ? vitals.spo2.toFixed(1) : "--"}
          </p>
          <span className="text-[10px] text-slate-400">SpO2</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <Gauge className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
          </div>
          <p className="text-xl font-black text-white mt-1">
            {vitals ? `${Math.round(vitals.bloodPressure.systolic)}/${Math.round(vitals.bloodPressure.diastolic)}` : "--"}
          </p>
          <span className="text-[10px] text-slate-400">BP</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <Wind className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] text-slate-500 font-mono">/min</span>
          </div>
          <p className="text-xl font-black text-white mt-1">
            {vitals ? Math.round(vitals.respirationRate) : "--"}
          </p>
          <span className="text-[10px] text-slate-400">Respiration</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              Active Alerts ({alerts.length})
            </span>
            <button
              id="btn-clear-monitor-alerts"
              type="button"
              onClick={clearAlerts}
              className="text-[10px] text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
                  alert.type === "critical"
                    ? "bg-rose-950/50 border border-rose-500/30 text-rose-200"
                    : "bg-amber-950/50 border border-amber-500/30 text-amber-200"
                }`}
              >
                <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${alert.type === "critical" ? "text-rose-400" : "text-amber-400"}`} />
                <span>{alert.message}</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
        <button
          id="btn-toggle-recording"
          type="button"
          onClick={toggleRecording}
          disabled={!isConnected}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            isRecording
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : isConnected
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isRecording ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Start Recording
            </>
          )}
        </button>

        <div className="flex items-center gap-2 ml-auto text-[10px] text-slate-500">
          <Bluetooth className="h-3.5 w-3.5" />
          <span>BLE 5.0</span>
          <span className="text-slate-700">|</span>
          <span>Signal: {signalStrength}</span>
          <span className="text-slate-700">|</span>
          <span>Battery: 87%</span>
        </div>
      </div>
    </div>
  );
};

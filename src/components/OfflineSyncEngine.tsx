import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  RotateCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  CloudUpload, 
  Trash2, 
  Plus, 
  FileText, 
  X,
  Layers,
  HardDrive
} from "lucide-react";

export interface OfflineQueueItem {
  id: string;
  type: "create_patient" | "prescription" | "clinical_note" | "vital_reading" | "billing_record" | "generic_log";
  title: string;
  payload: any;
  createdAt: string;
  retries: number;
}

const STORAGE_KEY = "cura_offline_sink_queue";
const LOG_KEY = "cura_offline_sync_logs";

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to persist offline sink queue", e);
  }
}

export function pushToOfflineQueue(item: Omit<OfflineQueueItem, "id" | "createdAt" | "retries">): OfflineQueueItem {
  const queue = getOfflineQueue();
  const newItem: OfflineQueueItem = {
    ...item,
    id: `sink_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    retries: 0
  };
  const updated = [newItem, ...queue];
  saveOfflineQueue(updated);
  return newItem;
}

interface OfflineSyncEngineProps {
  onSyncCompleted?: (syncedItems: any[]) => void;
}

export default function OfflineSyncEngine({ onSyncCompleted }: OfflineSyncEngineProps) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");
  const [syncErrorMsg, setSyncErrorMsg] = useState("");

  // Test form input state for adding dummy offline items
  const [newLogTitle, setNewLogTitle] = useState("");
  const [newLogType, setNewLogType] = useState<OfflineQueueItem["type"]>("clinical_note");
  const [newLogDetails, setNewLogDetails] = useState("");

  const effectiveOnline = isOnline && !simulatedOffline;

  // Sync state with local storage
  const refreshQueue = () => {
    setQueue(getOfflineQueue());
    try {
      const rawLogs = localStorage.getItem(LOG_KEY);
      setSyncLogs(rawLogs ? JSON.parse(rawLogs) : []);
    } catch {
      setSyncLogs([]);
    }
  };

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (effectiveOnline && queue.length > 0 && !isSyncing) {
      triggerSync();
    }
  }, [effectiveOnline]);

  const triggerSync = async () => {
    const currentQueue = getOfflineQueue();
    if (currentQueue.length === 0) return;

    setIsSyncing(true);
    setSyncSuccessMsg("");
    setSyncErrorMsg("");

    try {
      const response = await fetch("/api/v1/offline-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: `BROWSER_SINK_${navigator.userAgent.slice(0, 25)}`,
          offlineSince: new Date().toISOString(),
          items: currentQueue
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Log sync history
        const newLog = {
          timestamp: new Date().toLocaleString(),
          syncedCount: data.syncedCount,
          conflictCount: data.conflictCount,
          items: data.items
        };

        const updatedLogs = [newLog, ...syncLogs].slice(0, 20);
        setSyncLogs(updatedLogs);
        localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));

        // Clear queue
        saveOfflineQueue([]);
        setQueue([]);

        setSyncSuccessMsg(`Successfully synchronized ${data.syncedCount} offline record(s) to cloud database!`);
        if (onSyncCompleted) {
          onSyncCompleted(data.items);
        }
        setTimeout(() => setSyncSuccessMsg(""), 5000);
      } else {
        setSyncErrorMsg("Server returned an error processing offline queue batch.");
      }
    } catch (err: any) {
      setSyncErrorMsg(`Network error during sync: ${err?.message || "Cloud server unreachable"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSampleOfflineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle) return;

    pushToOfflineQueue({
      type: newLogType,
      title: newLogTitle,
      payload: {
        title: newLogTitle,
        details: newLogDetails || "Locally cached clinical record created while offline",
        timestamp: new Date().toISOString()
      }
    });

    setNewLogTitle("");
    setNewLogDetails("");
    refreshQueue();
  };

  const removeItemFromQueue = (id: string) => {
    const updated = queue.filter(i => i.id !== id);
    saveOfflineQueue(updated);
    setQueue(updated);
  };

  const clearAllQueue = () => {
    saveOfflineQueue([]);
    setQueue([]);
  };

  return (
    <>
      {/* FLOATING STATUS BAR & SYNC TRIGGER (Always Visible) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-900/95 text-slate-100 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl transition-all max-w-sm sm:max-w-md">
        <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
          effectiveOnline 
            ? queue.length > 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
        }`}>
          {effectiveOnline ? (
            queue.length > 0 ? <CloudUpload className="h-4 w-4 animate-bounce" /> : <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black uppercase tracking-wider ${
              effectiveOnline ? "text-emerald-400" : "text-rose-400"
            }`}>
              {effectiveOnline ? "Online" : "Offline Sink Active"}
            </span>
            {queue.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-mono font-black text-[9.5px] px-1.5 py-0.2 rounded-full">
                {queue.length} Pending
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {queue.length > 0 
              ? `${queue.length} record(s) queued locally` 
              : effectiveOnline ? "All local data synced with cloud" : "Changes saving to local IndexedDB sink"}
          </p>
        </div>

        {queue.length > 0 && effectiveOnline && (
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer shrink-0 border border-slate-700/60"
          title="Manage Offline Storage Sink"
        >
          <Database className="h-4 w-4" />
        </button>
      </div>

      {/* DETAILED OFFLINE SINK MANAGER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Offline Sink & Sync Engine
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono px-2 py-0.5 rounded-full uppercase">
                      Local Persistence
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Guarantees continuous clinical recording during hospital internet outages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
              
              {/* STATUS & SIMULATOR CONTROLS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${
                    effectiveOnline 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {effectiveOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Network Connectivity Status: <span className={effectiveOnline ? "text-emerald-400" : "text-rose-400"}>{effectiveOnline ? "ONLINE" : "OFFLINE"}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {effectiveOnline 
                        ? "Real-time socket link connected to cloud server" 
                        : "All new consultations and prescriptions are safely queued in local memory sink"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSimulatedOffline(!simulatedOffline)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 shrink-0 ${
                    simulatedOffline 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400" 
                      : "bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800"
                  }`}
                >
                  {simulatedOffline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  <span>{simulatedOffline ? "Restore Real Network" : "Simulate Network Outage"}</span>
                </button>
              </div>

              {/* SUCCESS / ERROR ALERTS */}
              {syncSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}
              {syncErrorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{syncErrorMsg}</span>
                </div>
              )}

              {/* QUEUED ITEMS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    Local Sink Queue ({queue.length} Pending Records)
                  </h4>
                  {queue.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={triggerSync}
                        disabled={isSyncing || !effectiveOnline}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>Sync Now</span>
                      </button>
                      <button
                        onClick={clearAllQueue}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl transition-all border border-slate-700/60 flex items-center gap-1 cursor-pointer"
                        title="Clear local queue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {queue.length === 0 ? (
                  <div className="p-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-center text-slate-500 space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Offline Sink is Empty</p>
                    <p className="text-[11px]">Any data created while offline will automatically queue here until connection returns.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {queue.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white truncate">{item.title}</span>
                              <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded uppercase">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              Queued at: {new Date(item.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItemFromQueue(item.id)}
                          className="p-1.5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Discard offline record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TEST OFFLINE RECORD GENERATOR */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  Test Offline Entry Generator
                </h4>
                <form onSubmit={handleAddSampleOfflineItem} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Record Type</label>
                      <select
                        value={newLogType}
                        onChange={(e) => setNewLogType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="clinical_note">Clinical Note</option>
                        <option value="create_patient">New Patient Registration</option>
                        <option value="prescription">Rx Prescription</option>
                        <option value="vital_reading">Vitals & Telemetry</option>
                        <option value="billing_record">Billing Transaction</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Record Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Offline Consultation for Patient #102"
                        value={newLogTitle}
                        onChange={(e) => setNewLogTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Details / Diagnosis Payload</label>
                    <input
                      type="text"
                      placeholder="e.g. Acute Gastritis, Tab Pantoprazole 40mg prescribed offline"
                      value={newLogDetails}
                      onChange={(e) => setNewLogDetails(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-purple-900 text-purple-200 hover:text-white text-xs font-bold rounded-xl transition-all border border-purple-700/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Push to Local Storage Sink Queue</span>
                  </button>
                </form>
              </div>

              {/* RECENT SYNC HISTORY AUDIT LOGS */}
              {syncLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Recent Sync Execution Audit Logs
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {syncLogs.map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] flex items-center justify-between text-slate-400">
                        <span className="font-mono text-purple-300">{log.timestamp}</span>
                        <span className="text-emerald-400 font-bold">{log.syncedCount} synced</span>
                        <span className="text-slate-500">{log.conflictCount || 0} conflicts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

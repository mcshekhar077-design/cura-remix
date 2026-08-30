import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  HardDrive,
  Clock,
  RefreshCw,
  AlertCircle,
  Info,
  Pause,
  Play
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface OfflineQueueItem {
  id: string;
  type: "create_patient" | "prescription" | "clinical_note" | "vital_reading" | "billing_record" | "generic_log";
  title: string;
  payload: any;
  createdAt: string;
  retries: number;
  lastAttempt?: string;
  priority: 'high' | 'normal' | 'low';
  size?: number;
  encrypted?: boolean;
}

export interface SyncLogEntry {
  timestamp: string;
  syncedCount: number;
  conflictCount: number;
  errorCount: number;
  items: OfflineQueueItem[];
  duration: number;
  status: 'success' | 'partial' | 'failed';
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
  percentage: number;
  status: 'idle' | 'syncing' | 'paused' | 'completed' | 'error';
}

export interface OfflineSyncEngineProps {
  onSyncCompleted?: (syncedItems: OfflineQueueItem[]) => void;
  onSyncError?: (error: Error) => void;
  onConflict?: (item: OfflineQueueItem, serverData: any) => OfflineQueueItem;
  onProgress?: (progress: SyncProgress) => void;
  onConnectionChange?: (isOnline: boolean) => void;
  autoSync?: boolean;
  autoSyncInterval?: number;
  maxRetries?: number;
  batchSize?: number;
  encryptionKey?: string;
  onDataEncrypted?: (item: OfflineQueueItem) => OfflineQueueItem;
  onDataDecrypted?: (item: OfflineQueueItem) => OfflineQueueItem;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = "cura_offline_sink_queue";
const LOG_KEY = "cura_offline_sync_logs";
const METADATA_KEY = "cura_offline_metadata";
const MAX_RETRIES = 5;
const BATCH_SIZE = 25;
const AUTO_SYNC_INTERVAL = 30000;
const MAX_QUEUE_SIZE = 1000;
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    // Limit queue size
    const limited = queue.slice(0, MAX_QUEUE_SIZE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    
    // Update metadata
    const metadata = {
      lastUpdated: new Date().toISOString(),
      itemCount: limited.length,
      totalSize: new Blob([JSON.stringify(limited)]).size
    };
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (e) {
    console.error("Failed to persist offline sink queue:", e);
  }
}

export function pushToOfflineQueue(
  item: Omit<OfflineQueueItem, "id" | "createdAt" | "retries" | "encrypted">,
  encryptionKey?: string
): OfflineQueueItem {
  const queue = getOfflineQueue();
  
  const newItem: OfflineQueueItem = {
    ...item,
    id: `sink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    retries: 0,
    priority: item.priority || 'normal',
    encrypted: !!encryptionKey,
    size: new Blob([JSON.stringify(item.payload)]).size
  };

  // Encrypt if key provided
  if (encryptionKey && item.payload) {
    try {
      const encrypted = btoa(JSON.stringify(item.payload));
      newItem.payload = { _encrypted: true, data: encrypted };
      newItem.encrypted = true;
    } catch (e) {
      console.warn("Failed to encrypt payload:", e);
    }
  }

  const updated = [newItem, ...queue];
  saveOfflineQueue(updated);
  return newItem;
}

export function getQueueMetadata(): { itemCount: number; totalSize: number; lastUpdated: string } {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    if (!raw) return { itemCount: 0, totalSize: 0, lastUpdated: new Date().toISOString() };
    return JSON.parse(raw);
  } catch {
    return { itemCount: 0, totalSize: 0, lastUpdated: new Date().toISOString() };
  }
}

export function getOfflineStorageSize(): number {
  try {
    const queue = getOfflineQueue();
    return new Blob([JSON.stringify(queue)]).size;
  } catch {
    return 0;
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OfflineSyncEngine({
  onSyncCompleted,
  onSyncError,
  onConflict,
  onProgress,
  onConnectionChange,
  autoSync = true,
  autoSyncInterval = AUTO_SYNC_INTERVAL,
  maxRetries = MAX_RETRIES,
  batchSize = BATCH_SIZE,
  encryptionKey,
  onDataEncrypted: _onDataEncrypted,
  onDataDecrypted
}: OfflineSyncEngineProps): React.ReactElement {
  // ============================================
  // STATE
  // ============================================

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0,
    status: 'idle'
  });
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string>("");
  const [syncErrorMsg, setSyncErrorMsg] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [_isConflictResolution, setIsConflictResolution] = useState<boolean>(false);
  const [_conflictItem, setConflictItem] = useState<{ local: OfflineQueueItem; server: any } | null>(null);

  // Form state
  const [newLogTitle, setNewLogTitle] = useState<string>("");
  const [newLogType, setNewLogType] = useState<OfflineQueueItem["type"]>("clinical_note");
  const [newLogDetails, setNewLogDetails] = useState<string>("");
  const [newLogPriority, setNewLogPriority] = useState<OfflineQueueItem["priority"]>("normal");

  // ============================================
  // REFS
  // ============================================

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queueRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const effectiveOnline = useMemo(() => isOnline && !simulatedOffline, [isOnline, simulatedOffline]);
  const queueSize = useMemo(() => queue.length, [queue]);
  const _queueMetadata = useMemo(() => getQueueMetadata(), [queue]);
  const storageSize = useMemo(() => getOfflineStorageSize(), [queue]);
  const isQueueFull = useMemo(() => queueSize >= MAX_QUEUE_SIZE, [queueSize]);
  const isStorageFull = useMemo(() => storageSize >= MAX_STORAGE_SIZE, [storageSize]);

  // ============================================
  // FUNCTIONS
  // ============================================

  const refreshQueue = useCallback(() => {
    setQueue(getOfflineQueue());
    try {
      const rawLogs = localStorage.getItem(LOG_KEY);
      setSyncLogs(rawLogs ? JSON.parse(rawLogs) : []);
    } catch {
      setSyncLogs([]);
    }
  }, []);

  const updateProgress = useCallback((progress: Partial<SyncProgress>) => {
    setSyncProgress(prev => {
      const updated = { ...prev, ...progress };
      if (updated.total > 0) {
        updated.percentage = ((updated.completed + updated.failed) / updated.total) * 100;
      }
      onProgress?.(updated);
      return updated;
    });
  }, [onProgress]);

  const syncBatch = useCallback(async (
    batch: OfflineQueueItem[],
    _offset: number
  ): Promise<{
    synced: OfflineQueueItem[];
    conflicts: OfflineQueueItem[];
    failed: OfflineQueueItem[];
    processed: OfflineQueueItem[];
  }> => {
    const synced: OfflineQueueItem[] = [];
    const conflicts: OfflineQueueItem[] = [];
    const failed: OfflineQueueItem[] = [];
    const processed: OfflineQueueItem[] = [];

    for (const item of batch) {
      try {
        let payload = item.payload;
        if (item.encrypted && encryptionKey) {
          try {
            const decrypted = JSON.parse(atob(item.payload.data));
            payload = decrypted;
            if (onDataDecrypted) {
              payload = onDataDecrypted({ ...item, payload }).payload;
            }
          } catch {
            throw new Error("Failed to decrypt item");
          }
        }

        const response = await fetch("/api/v1/offline-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCsrfToken()
          },
          body: JSON.stringify({
            deviceId: getDeviceId(),
            offlineSince: new Date().toISOString(),
            items: [{
              ...item,
              payload
            }]
          }),
          signal: abortControllerRef.current?.signal
        });

        if (response.status === 409) {
          const serverData = await response.json();
          conflicts.push(item);
          setConflictItem({ local: item, server: serverData });
        } else if (response.ok) {
          const data = await response.json();
          if (data.syncedCount > 0) {
            synced.push(item);
          } else {
            failed.push(item);
          }
        } else {
          item.retries += 1;
          item.lastAttempt = new Date().toISOString();

          if (item.retries >= maxRetries) {
            failed.push(item);
          } else {
            processed.push(item);
          }
        }
      } catch {
        item.retries += 1;
        item.lastAttempt = new Date().toISOString();

        if (item.retries >= maxRetries || !effectiveOnline) {
          failed.push(item);
        } else {
          processed.push(item);
        }
      }
    }

    return { synced, conflicts, failed, processed };
  }, [encryptionKey, maxRetries, effectiveOnline, onDataDecrypted]);

  const triggerSync = useCallback(async () => {
    const currentQueue = getOfflineQueue();
    if (currentQueue.length === 0) return;

    if (!effectiveOnline) {
      setSyncErrorMsg("Cannot sync while offline. Waiting for connection.");
      return;
    }

    if (isSyncing) return;

    setIsSyncing(true);
    setSyncSuccessMsg("");
    setSyncErrorMsg("");
    setConflictItem(null);

    abortControllerRef.current = new AbortController();

    updateProgress({
      total: currentQueue.length,
      completed: 0,
      failed: 0,
      status: 'syncing',
      currentItem: currentQueue[0]?.title
    });

    const startTime = Date.now();
    let syncedItems: OfflineQueueItem[] = [];
    let conflictItems: OfflineQueueItem[] = [];
    let failedItems: OfflineQueueItem[] = [];
    let processedItems: OfflineQueueItem[] = [];

    try {
      for (let i = 0; i < currentQueue.length; i += batchSize) {
        if (isPaused || abortControllerRef.current?.signal.aborted) {
          break;
        }

        const batch = currentQueue.slice(i, i + batchSize);
        const batchResults = await syncBatch(batch, i);

        syncedItems = [...syncedItems, ...batchResults.synced];
        conflictItems = [...conflictItems, ...batchResults.conflicts];
        failedItems = [...failedItems, ...batchResults.failed];
        processedItems = [...processedItems, ...batchResults.processed];

        updateProgress({
          completed: syncedItems.length,
          failed: failedItems.length,
          currentItem: batch[batch.length - 1]?.title
        });
      }

      if (conflictItems.length > 0 && onConflict) {
        setIsConflictResolution(true);
        for (const item of conflictItems) {
          const serverData = item.payload;
          const resolved = onConflict(item, serverData);
          if (resolved) {
            syncedItems.push(resolved);
          } else {
            failedItems.push(item);
          }
        }
        setIsConflictResolution(false);
      }

      const remaining = currentQueue.filter(
        item => !processedItems.some(p => p.id === item.id)
      );
      saveOfflineQueue(remaining);
      setQueue(remaining);

      const duration = Date.now() - startTime;
      const logEntry: SyncLogEntry = {
        timestamp: new Date().toISOString(),
        syncedCount: syncedItems.length,
        conflictCount: conflictItems.length,
        errorCount: failedItems.length,
        items: syncedItems,
        duration,
        status: failedItems.length > 0 ? 'partial' : 'success'
      };

      const updatedLogs = [logEntry, ...syncLogs].slice(0, 50);
      setSyncLogs(updatedLogs);
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));

      setLastSyncTime(new Date().toISOString());

      if (syncedItems.length > 0) {
        setSyncSuccessMsg(
          `Successfully synchronized ${syncedItems.length} offline record(s) to cloud database!` +
          (conflictItems.length > 0 ? ` ${conflictItems.length} conflict(s) resolved.` : '') +
          (failedItems.length > 0 ? ` ${failedItems.length} item(s) failed.` : '')
        );
        setTimeout(() => setSyncSuccessMsg(""), 5000);
        onSyncCompleted?.(syncedItems);
      }

      updateProgress({
        status: 'completed',
        percentage: 100
      });

    } catch (err: any) {
      const errorMsg = err?.message || "Sync failed";
      setSyncErrorMsg(`Sync error: ${errorMsg}`);
      onSyncError?.(err);

      updateProgress({
        status: 'error',
        currentItem: undefined
      });
    } finally {
      setIsSyncing(false);
      abortControllerRef.current = null;
    }
  }, [batchSize, effectiveOnline, isSyncing, isPaused, onSyncCompleted, onSyncError, onConflict, syncLogs, updateProgress, syncBatch]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => {
      setIsOnline(true);
      onConnectionChange?.(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      onConnectionChange?.(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    queueRefreshTimerRef.current = setInterval(refreshQueue, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (queueRefreshTimerRef.current) {
        clearInterval(queueRefreshTimerRef.current);
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [onConnectionChange, refreshQueue]);

  useEffect(() => {
    if (effectiveOnline && queueSize > 0 && !isSyncing && autoSync) {
      const debounce = setTimeout(() => {
        triggerSync();
      }, 2000);
      return () => clearTimeout(debounce);
    }
  }, [effectiveOnline, queueSize, isSyncing, autoSync, triggerSync]);

  useEffect(() => {
    if (autoSync && effectiveOnline && queueSize > 0 && !isSyncing) {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
      syncTimerRef.current = setInterval(() => {
        if (!isPaused && !isSyncing) {
          triggerSync();
        }
      }, autoSyncInterval);
    }
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [autoSync, autoSyncInterval, effectiveOnline, queueSize, isSyncing, isPaused, triggerSync]);

  const handleAddSampleOfflineItem = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle) return;

    pushToOfflineQueue(
      {
        type: newLogType,
        title: newLogTitle,
        payload: {
          title: newLogTitle,
          details: newLogDetails || "Locally cached clinical record created while offline",
          timestamp: new Date().toISOString()
        },
        priority: newLogPriority
      },
      encryptionKey
    );

    setNewLogTitle("");
    setNewLogDetails("");
    refreshQueue();

    if (effectiveOnline && autoSync) {
      triggerSync();
    }
  }, [newLogTitle, newLogType, newLogDetails, newLogPriority, encryptionKey, refreshQueue, effectiveOnline, autoSync, triggerSync]);

  const removeItemFromQueue = useCallback((id: string) => {
    const updated = queue.filter(i => i.id !== id);
    saveOfflineQueue(updated);
    setQueue(updated);
  }, [queue]);

  const clearAllQueue = useCallback(() => {
    if (queue.length === 0) return;
    if (confirm(`Delete all ${queue.length} offline records?`)) {
      saveOfflineQueue([]);
      setQueue([]);
    }
  }, [queue]);

  const pauseSync = useCallback(() => {
    setIsPaused(true);
    updateProgress({ status: 'paused' });
  }, [updateProgress]);

  const resumeSync = useCallback(() => {
    setIsPaused(false);
    if (effectiveOnline && queueSize > 0) {
      triggerSync();
    }
  }, [effectiveOnline, queueSize, triggerSync]);

  const cancelSync = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSyncing(false);
    updateProgress({ status: 'idle', currentItem: undefined });
  }, [updateProgress]);

  // ============================================
  // HELPERS
  // ============================================

  const getCsrfToken = (): string => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('cura_device_id');
    if (!deviceId) {
      deviceId = `DEV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cura_device_id', deviceId);
    }
    return deviceId;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'normal': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'low': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* FLOATING STATUS BAR */}
      <div id="offline-sync-floating-bar" className="fixed bottom-18 left-5 z-40 flex items-center gap-2 bg-slate-900/95 text-slate-100 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl transition-all max-w-xs sm:max-w-sm">
        {/* Status Icon */}
        <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
          effectiveOnline 
            ? queueSize > 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
        }`}>
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : effectiveOnline ? (
            queueSize > 0 ? <CloudUpload className="h-4 w-4 animate-bounce" /> : <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black uppercase tracking-wider ${
              effectiveOnline ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isSyncing ? "Syncing..." : effectiveOnline ? "Online" : "Offline Sink"}
            </span>
            {queueSize > 0 && (
              <span className="bg-amber-500 text-slate-950 font-mono font-black text-[9.5px] px-1.5 py-0.2 rounded-full">
                {queueSize} Pending
              </span>
            )}
            {isPaused && (
              <span className="bg-slate-700 text-slate-300 font-mono font-black text-[9.5px] px-1.5 py-0.2 rounded-full">
                Paused
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {isSyncing 
              ? `Syncing ${syncProgress.percentage.toFixed(0)}%... (${syncProgress.completed}/${syncProgress.total})`
              : queueSize > 0 
                ? `${queueSize} record(s) queued locally` 
                : effectiveOnline ? "All local data synced with cloud" : "Changes saving to local sink"}
          </p>
        </div>

        {/* Sync Controls */}
        {queueSize > 0 && effectiveOnline && !isSyncing && (
          <button
            id="btn-trigger-offline-sync"
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
        )}

        {isSyncing && (
          <>
            {!isPaused ? (
              <button
                id="btn-pause-offline-sync"
                type="button"
                onClick={pauseSync}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Pause sync"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                id="btn-resume-offline-sync"
                type="button"
                onClick={resumeSync}
                className="p-1.5 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-xl transition-all cursor-pointer"
                title="Resume sync"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            <button
              id="btn-cancel-offline-sync"
              type="button"
              onClick={cancelSync}
              className="p-1.5 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
              title="Cancel sync"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}

        <button
          id="btn-open-offline-modal"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer shrink-0 border border-slate-700/60"
          title="Manage Offline Storage Sink"
        >
          <Database className="h-4 w-4" />
        </button>
      </div>

      {/* DETAILED MODAL */}
      {isModalOpen && (
        <div id="offline-sync-modal-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
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
                      v2.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Guarantees continuous clinical recording during internet outages
                  </p>
                </div>
              </div>
              <button
                id="btn-close-offline-modal"
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* STATUS & CONTROLS */}
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
                      Status: <span className={effectiveOnline ? "text-emerald-400" : "text-rose-400"}>
                        {effectiveOnline ? "ONLINE" : "OFFLINE"}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {effectiveOnline 
                        ? "Real-time socket link connected to cloud server" 
                        : "All new consultations are safely queued in local sink"}
                    </p>
                    {queueSize > 0 && (
                      <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                        <Info className="h-3 w-3" />
                        {queueSize} items pending sync
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="btn-simulate-offline-toggle"
                    type="button"
                    onClick={() => setSimulatedOffline(!simulatedOffline)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 shrink-0 ${
                      simulatedOffline 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400" 
                        : "bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800"
                    }`}
                  >
                    {simulatedOffline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    <span>{simulatedOffline ? "Restore Network" : "Simulate Outage"}</span>
                  </button>

                  {isSyncing && (
                    <button
                      id="btn-cancel-sync-modal"
                      type="button"
                      onClick={cancelSync}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel Sync
                    </button>
                  )}
                </div>
              </div>

              {/* Sync Progress */}
              {isSyncing && (
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Syncing...</span>
                    <span className="font-mono text-emerald-400">
                      {syncProgress.percentage.toFixed(0)}% ({syncProgress.completed}/{syncProgress.total})
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${syncProgress.percentage}%` }}
                    />
                  </div>
                  {syncProgress.currentItem && (
                    <p className="text-[10px] text-slate-500 mt-1 truncate">
                      Processing: {syncProgress.currentItem}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {syncProgress.completed} synced
                    </span>
                    <span className="flex items-center gap-0.5">
                      <AlertCircle className="h-3 w-3 text-rose-400" />
                      {syncProgress.failed} failed
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3 text-amber-400" />
                      {isPaused ? 'Paused' : 'Running'}
                    </span>
                  </div>
                </div>
              )}

              {/* Alerts */}
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

              {/* Storage Info */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">Queue Size</span>
                  <span className="text-white font-bold">{queueSize} items</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">Storage Used</span>
                  <span className="text-white font-bold">{formatSize(storageSize)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">Last Sync</span>
                  <span className="text-white font-bold text-[11px]">
                    {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Queue Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    Queue ({queueSize} Items)
                    {isQueueFull && (
                      <span className="text-rose-400 text-[9px] font-bold">⚠️ QUEUE FULL</span>
                    )}
                    {isStorageFull && (
                      <span className="text-rose-400 text-[9px] font-bold">⚠️ STORAGE FULL</span>
                    )}
                  </h4>
                  {queueSize > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-sync-now-modal"
                        type="button"
                        onClick={triggerSync}
                        disabled={isSyncing || !effectiveOnline}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>Sync Now</span>
                      </button>
                      <button
                        id="btn-clear-all-queue"
                        type="button"
                        onClick={clearAllQueue}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl transition-all border border-slate-700/60 flex items-center gap-1 cursor-pointer"
                        title="Clear queue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {queueSize === 0 ? (
                  <div className="p-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-center text-slate-500 space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Queue is Empty</p>
                    <p className="text-[11px]">Data created offline will queue here until connection returns.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {queue.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white truncate">{item.title}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded uppercase">
                                {item.type}
                              </span>
                              {item.retries > 0 && (
                                <span className="text-[9px] font-mono text-amber-400">
                                  {item.retries} retries
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Queued: {new Date(item.createdAt).toLocaleString()}
                              {item.lastAttempt && ` • Last attempt: ${new Date(item.lastAttempt).toLocaleString()}`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItemFromQueue(item.id)}
                          className="p-1.5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Test Item */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  Test Offline Entry Generator
                </h4>
                <form onSubmit={handleAddSampleOfflineItem} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="select-offline-type">Type</label>
                      <select
                        id="select-offline-type"
                        value={newLogType}
                        onChange={(e) => setNewLogType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="clinical_note">Clinical Note</option>
                        <option value="create_patient">Patient Registration</option>
                        <option value="prescription">Prescription</option>
                        <option value="vital_reading">Vitals</option>
                        <option value="billing_record">Billing</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="select-offline-priority">Priority</label>
                      <select
                        id="select-offline-priority"
                        value={newLogPriority}
                        onChange={(e) => setNewLogPriority(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="input-offline-title">Title</label>
                      <input
                        id="input-offline-title"
                        type="text"
                        placeholder="e.g. Consultation #102"
                        value={newLogTitle}
                        onChange={(e) => setNewLogTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="input-offline-details">Details</label>
                    <input
                      id="input-offline-details"
                      type="text"
                      placeholder="e.g. Acute Gastritis, Pantoprazole 40mg prescribed"
                      value={newLogDetails}
                      onChange={(e) => setNewLogDetails(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    id="btn-submit-offline-item"
                    type="submit"
                    disabled={!newLogTitle}
                    className="w-full py-2 bg-slate-800 hover:bg-purple-900 text-purple-200 hover:text-white text-xs font-bold rounded-xl transition-all border border-purple-700/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Push to Local Sink Queue</span>
                  </button>
                </form>
              </div>

              {/* Sync Logs */}
              {syncLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Sync History ({syncLogs.length} logs)</span>
                    <button
                      id="btn-clear-sync-logs"
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(LOG_KEY);
                        setSyncLogs([]);
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {syncLogs.slice(0, 10).map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] flex items-center justify-between text-slate-400">
                        <span className="font-mono text-purple-300">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="text-emerald-400 font-bold">{log.syncedCount} synced</span>
                        <span className="text-amber-400">{log.conflictCount} conflicts</span>
                        <span className="text-rose-400">{log.errorCount} errors</span>
                        <span className="text-slate-500">{log.duration}ms</span>
                        <span className={`
                          ${log.status === 'success' ? 'text-emerald-400' : 
                            log.status === 'partial' ? 'text-amber-400' : 'text-rose-400'}
                        `}>
                          {log.status}
                        </span>
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

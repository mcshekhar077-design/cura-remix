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
  Play,
  Microscope,
  Activity,
  Eye,
  EyeOff,
  Send,
  FileCheck
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface DiagnosticReportPayload {
  patientId?: string;
  patientName?: string;
  title: string;
  date?: string;
  category?: string;
  fileName?: string;
  fileSize?: string;
  extractedText?: string;
  aiSummary?: string;
  keyFindings?: string[];
  riskLevel?: "low" | "medium" | "moderate" | "high" | "emergency" | "critical" | string;
  abnormalValues?: Array<{ test: string; value: string; normalRange: string; severity?: string }>;
  possibleConditions?: string[];
  suggestedSpecialist?: string;
  suggestedDoctorName?: string;
  followUpRecommendation?: string;
  extractedPatientName?: string;
  medications?: any[];
  diagnosis?: string;
  labResults?: Array<{ test: string; value: string; normalRange: string; status?: string }>;
  summaryForDoctor?: string;
  suggestedIcdCode?: string;
  action?: string;
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  uploadError?: string;
  queuedReason?: string;
  queuedAt?: string;
  [key: string]: any;
}

export interface OfflineQueueItem {
  id: string;
  type: "diagnostic_report" | "create_patient" | "prescription" | "clinical_note" | "vital_reading" | "billing_record" | "generic_log";
  title: string;
  payload: any;
  createdAt: string;
  retries: number;
  lastAttempt?: string;
  lastError?: string;
  nextRetryAt?: number;
  priority: 'high' | 'normal' | 'low';
  size?: number;
  encrypted?: boolean;
  targetEndpoint?: string;
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
// UTILITY & HELPER FUNCTIONS
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
    const limited = queue.slice(0, MAX_QUEUE_SIZE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("clinitial_offline_item_queued", { detail: newItem }));
  }

  return newItem;
}

/**
 * Specifically queues a failed diagnostic report upload so it can be retried automatically
 * as soon as internet connection is restored.
 */
export function queueFailedDiagnosticReport(
  report: DiagnosticReportPayload,
  priority?: 'high' | 'normal' | 'low'
): OfflineQueueItem {
  const isElevated = 
    report.riskLevel === "high" || 
    report.riskLevel === "emergency" || 
    report.riskLevel === "critical" ||
    (Array.isArray(report.abnormalValues) && report.abnormalValues.length > 0);

  const determinedPriority: 'high' | 'normal' | 'low' = 
    priority || (isElevated ? 'high' : 'normal');

  const formattedTitle = report.title 
    ? (report.patientName ? `${report.title} (${report.patientName})` : report.title)
    : `Diagnostic Report: ${report.category || 'Pathology'} (${report.patientName || report.patientId || 'Patient'})`;

  const targetEndpoint = report.endpoint || (report.patientId ? `/api/v1/patients/${report.patientId}/scanned-reports` : undefined);

  const item: OfflineQueueItem = {
    id: `diag_sink_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    type: "diagnostic_report",
    title: formattedTitle,
    payload: {
      ...report,
      queuedReason: report.uploadError || "Offline network drop or failed upload",
      queuedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    retries: 0,
    priority: determinedPriority,
    size: new Blob([JSON.stringify(report)]).size,
    targetEndpoint,
    lastError: report.uploadError || "Network connection unreachable. Queued for auto-retry when internet connection is restored."
  };

  const queue = getOfflineQueue();
  // Avoid duplicate report with exact same title and patient ID within last 10 seconds
  const isDuplicate = queue.some(q => 
    q.type === "diagnostic_report" && 
    q.title === item.title && 
    Math.abs(new Date(q.createdAt).getTime() - new Date(item.createdAt).getTime()) < 10000
  );

  if (!isDuplicate) {
    const updated = [item, ...queue];
    saveOfflineQueue(updated);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("clinitial_offline_item_queued", { detail: item }));
    window.dispatchEvent(new CustomEvent("clinitial_diagnostic_report_queued", { detail: item }));
  }

  return item;
}

export function getQueuedDiagnosticReports(): OfflineQueueItem[] {
  return getOfflineQueue().filter(item => item.type === "diagnostic_report");
}

export function triggerGlobalOfflineSync(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("clinitial_trigger_offline_sync"));
  }
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

  // Tab and Inspector state
  const [activeQueueTab, setActiveQueueTab] = useState<"all" | "diagnostic_report" | "clinical" | "failed">("all");
  const [inspectedItemId, setInspectedItemId] = useState<string | null>(null);

  // Test Generator state
  const [newLogTitle, setNewLogTitle] = useState<string>("");
  const [newLogType, setNewLogType] = useState<OfflineQueueItem["type"]>("diagnostic_report");
  const [newLogDetails, setNewLogDetails] = useState<string>("");
  const [newLogPriority, setNewLogPriority] = useState<OfflineQueueItem["priority"]>("high");
  const [diagPatientId, setDiagPatientId] = useState<string>("pat_101");
  const [diagPatientName, setDiagPatientName] = useState<string>("Ramesh Kumar");
  const [diagCategory, setDiagCategory] = useState<string>("Pathology & Blood Chemistry");
  const [diagRiskLevel, setDiagRiskLevel] = useState<string>("high");
  const [diagFindings, setDiagFindings] = useState<string>("HbA1c 9.4% (Elevated), Fasting Glucose 198 mg/dL, Serum Creatinine 1.6 mg/dL");

  // ============================================
  // REFS & STABILIZED CALLBACKS
  // ============================================

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queueRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const onConnectionChangeRef = useRef(onConnectionChange);
  onConnectionChangeRef.current = onConnectionChange;

  const onSyncCompletedRef = useRef(onSyncCompleted);
  onSyncCompletedRef.current = onSyncCompleted;

  const onSyncErrorRef = useRef(onSyncError);
  onSyncErrorRef.current = onSyncError;

  const onConflictRef = useRef(onConflict);
  onConflictRef.current = onConflict;

  const onDataDecryptedRef = useRef(onDataDecrypted);
  onDataDecryptedRef.current = onDataDecrypted;

  const isSyncingRef = useRef(isSyncing);
  isSyncingRef.current = isSyncing;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const batchSizeRef = useRef(batchSize);
  batchSizeRef.current = batchSize;

  const triggerSyncRef = useRef<() => Promise<void>>(async () => {});

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const effectiveOnline = useMemo(() => isOnline && !simulatedOffline, [isOnline, simulatedOffline]);
  const effectiveOnlineRef = useRef(effectiveOnline);
  effectiveOnlineRef.current = effectiveOnline;

  const queueSize = useMemo(() => queue.length, [queue]);
  const storageSize = useMemo(() => getOfflineStorageSize(), [queue]);
  const isQueueFull = useMemo(() => queueSize >= MAX_QUEUE_SIZE, [queueSize]);
  const isStorageFull = useMemo(() => storageSize >= MAX_STORAGE_SIZE, [storageSize]);

  const diagnosticReportsInQueue = useMemo(() => {
    return queue.filter(item => item.type === "diagnostic_report");
  }, [queue]);

  const failedItemsInQueue = useMemo(() => {
    return queue.filter(item => item.retries > 0);
  }, [queue]);

  const clinicalItemsInQueue = useMemo(() => {
    return queue.filter(item => item.type !== "diagnostic_report");
  }, [queue]);

  const filteredQueueItems = useMemo(() => {
    if (activeQueueTab === "diagnostic_report") return diagnosticReportsInQueue;
    if (activeQueueTab === "failed") return failedItemsInQueue;
    if (activeQueueTab === "clinical") return clinicalItemsInQueue;
    return queue;
  }, [activeQueueTab, diagnosticReportsInQueue, failedItemsInQueue, clinicalItemsInQueue, queue]);

  // ============================================
  // FUNCTIONS & EVENT HANDLERS
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

  const updateProgress = useCallback((patch: Partial<SyncProgress>) => {
    setSyncProgress(prev => {
      const updated = { ...prev, ...patch };
      if (updated.total > 0) {
        updated.percentage = ((updated.completed + updated.failed) / updated.total) * 100;
      }
      return updated;
    });
  }, []);

  // Dispatch progress changes safely outside state updates
  useEffect(() => {
    onProgressRef.current?.(syncProgress);
  }, [syncProgress]);

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
            if (onDataDecryptedRef.current) {
              payload = onDataDecryptedRef.current({ ...item, payload }).payload;
            }
          } catch {
            throw new Error("Failed to decrypt item");
          }
        }

        // Specialized handler for diagnostic reports: try direct targeted endpoint first
        let reportDirectSuccess = false;
        if (item.type === "diagnostic_report") {
          const directEndpoint = item.targetEndpoint || payload.endpoint || (payload.patientId ? `/api/v1/patients/${payload.patientId}/scanned-reports` : null);
          if (directEndpoint) {
            try {
              const directRes = await fetch(directEndpoint, {
                method: payload.method || "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": getCsrfToken(),
                  ...(payload.headers || {})
                },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current?.signal
              });

              if (directRes.ok) {
                synced.push(item);
                reportDirectSuccess = true;
                continue;
              }
            } catch (directErr: any) {
              // Direct endpoint unreachable, fall back to batch offline-sync
            }
          }
        }

        if (reportDirectSuccess) continue;

        // General / fallback offline-sync endpoint
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
            // Server received but could not process item
            item.retries += 1;
            item.lastAttempt = new Date().toISOString();
            item.lastError = data.errors?.[0]?.error || "Server processing failed";
            if (item.retries >= maxRetries) {
              failed.push(item);
            } else {
              processed.push(item);
            }
          }
        } else {
          item.retries += 1;
          item.lastAttempt = new Date().toISOString();
          item.lastError = `Server returned HTTP ${response.status}`;

          if (item.retries >= maxRetries) {
            failed.push(item);
          } else {
            processed.push(item);
          }
        }
      } catch (networkErr: any) {
        item.retries += 1;
        item.lastAttempt = new Date().toISOString();
        item.lastError = networkErr?.message || "Network unreachable. Waiting for connection restoration.";
        
        // Exponential backoff
        const backoffMs = Math.min(60000, Math.pow(2, item.retries) * 1000);
        item.nextRetryAt = Date.now() + backoffMs;

        if (item.retries >= maxRetries) {
          failed.push(item);
        } else {
          processed.push(item);
        }
      }
    }

    return { synced, conflicts, failed, processed };
  }, [encryptionKey, maxRetries]);

  const triggerSync = useCallback(async () => {
    const currentQueue = getOfflineQueue();
    if (currentQueue.length === 0) return;

    if (!effectiveOnlineRef.current) {
      setSyncErrorMsg("Cannot sync while offline. System will automatically retry all queued reports and records once internet connection is restored.");
      return;
    }

    if (isSyncingRef.current) return;

    setIsSyncing(true);
    isSyncingRef.current = true;
    setSyncSuccessMsg("");
    setSyncErrorMsg("");
    setConflictItem(null);

    abortControllerRef.current = new AbortController();

    // Sort queue by priority: high priority first (e.g. urgent diagnostic reports), then retryable
    const prioritizedQueue = [...currentQueue].sort((a, b) => {
      const priorityWeights = { high: 3, normal: 2, low: 1 };
      const weightA = priorityWeights[a.priority || 'normal'] || 2;
      const weightB = priorityWeights[b.priority || 'normal'] || 2;
      return weightB - weightA;
    });

    updateProgress({
      total: prioritizedQueue.length,
      completed: 0,
      failed: 0,
      status: 'syncing',
      currentItem: prioritizedQueue[0]?.title
    });

    const startTime = Date.now();
    let syncedItems: OfflineQueueItem[] = [];
    let conflictItems: OfflineQueueItem[] = [];
    let failedItems: OfflineQueueItem[] = [];
    let processedItems: OfflineQueueItem[] = [];

    try {
      const currentBatchSize = batchSizeRef.current;
      for (let i = 0; i < prioritizedQueue.length; i += currentBatchSize) {
        if (isPausedRef.current || abortControllerRef.current?.signal.aborted) {
          break;
        }

        const batch = prioritizedQueue.slice(i, i + currentBatchSize);
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

      if (conflictItems.length > 0 && onConflictRef.current) {
        setIsConflictResolution(true);
        for (const item of conflictItems) {
          const serverData = item.payload;
          const resolved = onConflictRef.current(item, serverData);
          if (resolved) {
            syncedItems.push(resolved);
          } else {
            failedItems.push(item);
          }
        }
        setIsConflictResolution(false);
      }

      // Keep items that are retrying (with updated retry count and last error)
      const remaining = currentQueue
        .filter(item => !syncedItems.some(s => s.id === item.id))
        .map(item => {
          const updatedAttempt = processedItems.find(p => p.id === item.id);
          return updatedAttempt || item;
        });

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

      setSyncLogs(prev => {
        const nextLogs = [logEntry, ...prev].slice(0, 50);
        try {
          localStorage.setItem(LOG_KEY, JSON.stringify(nextLogs));
        } catch {
          // ignore
        }
        return nextLogs;
      });

      setLastSyncTime(new Date().toISOString());

      if (syncedItems.length > 0) {
        const diagCount = syncedItems.filter(i => i.type === "diagnostic_report").length;
        const diagMsg = diagCount > 0 ? ` (including ${diagCount} diagnostic report upload${diagCount > 1 ? 's' : ''})` : "";

        setSyncSuccessMsg(
          `Successfully synchronized ${syncedItems.length} offline record(s)${diagMsg} to cloud EHR!` +
          (conflictItems.length > 0 ? ` ${conflictItems.length} conflict(s) resolved.` : '') +
          (failedItems.length > 0 ? ` ${failedItems.length} item(s) scheduled for next retry.` : '')
        );
        setTimeout(() => setSyncSuccessMsg(""), 6000);
        onSyncCompletedRef.current?.(syncedItems);

        // Notify other components (e.g. DoctorDocumentScanner, PatientMobileApp) that sync succeeded
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("clinitial_offline_sync_completed", { detail: syncedItems }));
        }
      }

      updateProgress({
        status: 'completed',
        completed: syncedItems.length,
        failed: failedItems.length,
        currentItem: undefined
      });
    } catch (err: any) {
      setSyncErrorMsg(`Synchronization interrupted: ${err?.message || "Network error"}`);
      onSyncErrorRef.current?.(err);
      updateProgress({
        status: 'error',
        currentItem: undefined
      });
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [syncBatch, updateProgress]);

  // Keep triggerSyncRef always updated
  useEffect(() => {
    triggerSyncRef.current = triggerSync;
  }, [triggerSync]);

  // Sync a single specific item immediately
  const syncSingleItem = useCallback(async (itemId: string) => {
    if (!effectiveOnlineRef.current) {
      setSyncErrorMsg("Cannot retry upload while offline. Internet connection must be active.");
      return;
    }
    const currentQueue = getOfflineQueue();
    const target = currentQueue.find(i => i.id === itemId);
    if (!target) return;

    setSyncSuccessMsg(`Retrying upload for "${target.title}"...`);
    const results = await syncBatch([target], 0);

    if (results.synced.length > 0) {
      const remaining = currentQueue.filter(i => i.id !== itemId);
      saveOfflineQueue(remaining);
      setQueue(remaining);
      setSyncSuccessMsg(`"${target.title}" uploaded successfully to EHR!`);
      setTimeout(() => setSyncSuccessMsg(""), 5000);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("clinitial_offline_sync_completed", { detail: results.synced }));
      }
    } else {
      const updatedQueue = currentQueue.map(i => {
        if (i.id === itemId) {
          return results.processed[0] || results.failed[0] || i;
        }
        return i;
      });
      saveOfflineQueue(updatedQueue);
      setQueue(updatedQueue);
      setSyncErrorMsg(`Retry for "${target.title}" failed. Scheduled for automatic retry when network stabilizes.`);
      setTimeout(() => setSyncErrorMsg(""), 5000);
    }
  }, [syncBatch]);

  // ============================================
  // EFFECTS: AUTOMATIC RECONNECT & RETRY LISTENER
  // ============================================

  useEffect(() => {
    refreshQueue();

    // AUTOMATIC RETRY TRIGGER WHEN INTERNET CONNECTION RESTORED
    const handleOnline = () => {
      setIsOnline(true);
      setSimulatedOffline(false);
      onConnectionChangeRef.current?.(true);

      const currentQueue = getOfflineQueue();
      if (currentQueue.length > 0) {
        const diagCount = currentQueue.filter(i => i.type === "diagnostic_report").length;
        setSyncSuccessMsg(
          `🌐 Internet connection restored! Automatically retrying ${currentQueue.length} queued upload${currentQueue.length > 1 ? 's' : ''}${diagCount > 0 ? ` (${diagCount} diagnostic report${diagCount > 1 ? 's' : ''})` : ''}...`
        );
        // Debounce trigger to allow network socket stabilization
        setTimeout(() => {
          triggerSyncRef.current();
        }, 1200);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      onConnectionChangeRef.current?.(false);
      setSyncErrorMsg("⚠️ Network disconnected. All diagnostic uploads and clinical entries will be queued locally in Offline Sink.");
    };

    const handleCustomTrigger = () => {
      triggerSyncRef.current();
    };

    const handleItemQueued = () => {
      refreshQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("clinitial_trigger_offline_sync", handleCustomTrigger);
    window.addEventListener("clinitial_offline_item_queued", handleItemQueued);
    window.addEventListener("clinitial_diagnostic_report_queued", handleItemQueued);

    queueRefreshTimerRef.current = setInterval(refreshQueue, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("clinitial_trigger_offline_sync", handleCustomTrigger);
      window.removeEventListener("clinitial_offline_item_queued", handleItemQueued);
      window.removeEventListener("clinitial_diagnostic_report_queued", handleItemQueued);
      if (queueRefreshTimerRef.current) clearInterval(queueRefreshTimerRef.current);
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [refreshQueue]);

  // Auto-sync when effectiveOnline changes to true and queue has items
  useEffect(() => {
    if (effectiveOnline && queueSize > 0 && !isSyncing && autoSync) {
      const debounce = setTimeout(() => {
        triggerSyncRef.current();
      }, 2500);
      return () => clearTimeout(debounce);
    }
  }, [effectiveOnline, queueSize, isSyncing, autoSync]);

  // Periodic heartbeat sync
  useEffect(() => {
    if (autoSync && effectiveOnline && queueSize > 0 && !isSyncing) {
      const timer = setInterval(() => {
        if (!isPausedRef.current && !isSyncingRef.current) {
          triggerSyncRef.current();
        }
      }, autoSyncInterval);
      return () => clearInterval(timer);
    }
  }, [autoSync, autoSyncInterval, effectiveOnline, queueSize, isSyncing]);

  // Toggle simulated network outage
  const handleToggleSimulatedOutage = () => {
    if (!simulatedOffline) {
      setSimulatedOffline(true);
      setSyncErrorMsg("🔴 Simulated Network Outage Active. Live server requests will be blocked and pushed to offline sink queue.");
    } else {
      setSimulatedOffline(false);
      setIsOnline(true);
      setSyncSuccessMsg("🟢 Network Restored! Automatically retrying queued diagnostic reports and records...");
      setTimeout(() => {
        triggerSyncRef.current();
      }, 800);
    }
  };

  const handleAddSampleOfflineItem = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle) return;

    if (newLogType === "diagnostic_report") {
      queueFailedDiagnosticReport(
        {
          patientId: diagPatientId,
          patientName: diagPatientName,
          title: newLogTitle,
          date: new Date().toISOString().split("T")[0],
          category: diagCategory,
          fileName: `${newLogTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`,
          fileSize: "480 KB",
          aiSummary: newLogDetails || `AI Diagnostic Impression: Clinical findings suggest active follow-up.`,
          keyFindings: [diagFindings],
          riskLevel: diagRiskLevel,
          abnormalValues: [
            { test: "Biomarker / Analyte", value: "Elevated", normalRange: "Reference Range", severity: diagRiskLevel }
          ],
          suggestedSpecialist: "Internal Medicine / Diagnostics",
          suggestedDoctorName: "Dr. Rajesh Sharma",
          uploadError: "Simulated Network Drop (504 Gateway Timeout)"
        },
        newLogPriority
      );
    } else {
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
    }

    setNewLogTitle("");
    setNewLogDetails("");
    refreshQueue();

    if (effectiveOnline && autoSync) {
      setTimeout(() => triggerSync(), 600);
    }
  }, [
    newLogTitle, 
    newLogType, 
    newLogDetails, 
    newLogPriority, 
    diagPatientId, 
    diagPatientName, 
    diagCategory, 
    diagRiskLevel, 
    diagFindings, 
    encryptionKey, 
    refreshQueue, 
    effectiveOnline, 
    autoSync, 
    triggerSync
  ]);

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
      {/* FLOATING RESILIENT SYNC STATUS BAR */}
      <div 
        id="offline-sync-floating-bar" 
        className="fixed bottom-18 left-5 z-40 flex items-center gap-2.5 bg-slate-900/95 text-slate-100 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl transition-all max-w-xs sm:max-w-md"
      >
        {/* Status Indicator Icon */}
        <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
          effectiveOnline 
            ? queueSize > 0 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
        }`}>
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : effectiveOnline ? (
            queueSize > 0 ? (
              diagnosticReportsInQueue.length > 0 ? (
                <Microscope className="h-4 w-4 text-amber-400 animate-bounce" />
              ) : (
                <CloudUpload className="h-4 w-4 animate-bounce" />
              )
            ) : (
              <Wifi className="h-4 w-4" />
            )
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-black uppercase tracking-wider ${
              effectiveOnline ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isSyncing ? "Auto-Syncing..." : effectiveOnline ? "Online" : "Offline Sink"}
            </span>

            {diagnosticReportsInQueue.length > 0 && (
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Microscope className="h-2.5 w-2.5" />
                {diagnosticReportsInQueue.length} Diag {diagnosticReportsInQueue.length === 1 ? "Report" : "Reports"}
              </span>
            )}

            {queueSize > 0 && diagnosticReportsInQueue.length === 0 && (
              <span className="bg-amber-500 text-slate-950 font-mono font-black text-[9.5px] px-1.5 py-0.2 rounded-full">
                {queueSize} Queued
              </span>
            )}

            {isPaused && (
              <span className="bg-slate-700 text-slate-300 font-mono font-black text-[9.5px] px-1.5 py-0.2 rounded-full">
                Paused
              </span>
            )}
          </div>
          
          <p className="text-[10.5px] text-slate-400 truncate">
            {isSyncing 
              ? `Retrying ${syncProgress.percentage.toFixed(0)}% (${syncProgress.completed}/${syncProgress.total})...`
              : queueSize > 0 
                ? `${queueSize} item(s) cached • Auto-retries upon connection` 
                : effectiveOnline ? "All local data synchronized with cloud EHR" : "Changes cached in local sink"}
          </p>
        </div>

        {/* Action Controls */}
        {queueSize > 0 && effectiveOnline && !isSyncing && (
          <button
            id="btn-trigger-offline-sync"
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
            title="Retry syncing queued offline records now"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry</span>
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
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer shrink-0 border border-slate-700/60 relative"
          title="Open Offline Sink & Diagnostic Retry Console"
        >
          <Database className="h-4 w-4" />
          {diagnosticReportsInQueue.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>

      {/* DETAILED MODAL */}
      {isModalOpen && (
        <div id="offline-sync-modal-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Resilient Offline Sink & Auto-Retry Engine
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono px-2 py-0.5 rounded-full uppercase">
                      Diagnostic Ready
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automatically queues failed diagnostic reports and retries uploads seamlessly when internet is restored.
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
              
              {/* STATUS & NETWORK CONTROLS */}
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
                      Connection: <span className={effectiveOnline ? "text-emerald-400" : "text-rose-400"}>
                        {effectiveOnline ? "ONLINE (Active Gateway)" : "OFFLINE (Local Sink Active)"}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {effectiveOnline 
                        ? "Real-time socket link connected. Auto-retry worker is standing by." 
                        : "Internet connection is down. Failed diagnostic uploads will automatically be held in local sink."}
                    </p>
                    {diagnosticReportsInQueue.length > 0 && (
                      <p className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-semibold">
                        <Microscope className="h-3 w-3" />
                        {diagnosticReportsInQueue.length} Diagnostic Report(s) queued for automatic cloud upload on reconnect
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="btn-simulate-offline-toggle"
                    type="button"
                    onClick={handleToggleSimulatedOutage}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 shrink-0 ${
                      simulatedOffline 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/30" 
                        : "bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800"
                    }`}
                  >
                    {simulatedOffline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    <span>{simulatedOffline ? "Restore Network (Auto-Retry)" : "Simulate Outage"}</span>
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

              {/* Sync Progress Bar */}
              {isSyncing && (
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      Retrying Failed Diagnostic Reports & Queue...
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {syncProgress.percentage.toFixed(0)}% ({syncProgress.completed}/{syncProgress.total})
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${syncProgress.percentage}%` }}
                    />
                  </div>
                  {syncProgress.currentItem && (
                    <p className="text-[10.5px] text-slate-400 truncate">
                      Current: <span className="text-white font-mono">{syncProgress.currentItem}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {syncProgress.completed} uploaded
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <AlertCircle className="h-3 w-3" />
                      {syncProgress.failed} failed
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="h-3 w-3" />
                      {isPaused ? 'Paused' : 'Active Reconnection Sync'}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Banners */}
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

              {/* Storage & Queue Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Queue</span>
                  <span className="text-white font-black text-sm">{queueSize} items</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-cyan-900/40 text-center">
                  <span className="text-cyan-400 block text-[10px] uppercase font-bold">Diagnostic Reports</span>
                  <span className="text-cyan-300 font-black text-sm">{diagnosticReportsInQueue.length} queued</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Local Sink Size</span>
                  <span className="text-white font-bold">{formatSize(storageSize)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Last Successful Sync</span>
                  <span className="text-emerald-400 font-bold text-[11px]">
                    {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Pending connection'}
                  </span>
                </div>
              </div>

              {/* QUEUE FILTER TABS */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  {/* Tabs */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveQueueTab("all")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        activeQueueTab === "all" 
                          ? "bg-slate-800 text-white shadow-sm" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All ({queueSize})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQueueTab("diagnostic_report")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeQueueTab === "diagnostic_report" 
                          ? "bg-cyan-900 text-cyan-200 shadow-sm border border-cyan-700/50" 
                          : "text-cyan-400/80 hover:text-cyan-300"
                      }`}
                    >
                      <Microscope className="h-3 w-3" />
                      Diagnostic Reports ({diagnosticReportsInQueue.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQueueTab("failed")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        activeQueueTab === "failed" 
                          ? "bg-amber-900/60 text-amber-200 shadow-sm" 
                          : "text-amber-400/80 hover:text-amber-300"
                      }`}
                    >
                      Retrying ({failedItemsInQueue.length})
                    </button>
                  </div>

                  {/* Bulk Actions */}
                  {queueSize > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-sync-now-modal"
                        type="button"
                        onClick={triggerSync}
                        disabled={isSyncing || !effectiveOnline}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-sm"
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>Retry All Now</span>
                      </button>
                      <button
                        id="btn-clear-all-queue"
                        type="button"
                        onClick={clearAllQueue}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl transition-all border border-slate-700/60 flex items-center gap-1 cursor-pointer"
                        title="Clear entire queue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Queue Item List */}
                {filteredQueueItems.length === 0 ? (
                  <div className="p-8 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-center text-slate-500 space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">No items in this filter</p>
                    <p className="text-[11px] text-slate-500">
                      {activeQueueTab === "diagnostic_report" 
                        ? "All diagnostic reports have been uploaded to the patient record!" 
                        : "Offline sink queue is completely clear."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {filteredQueueItems.map((item) => {
                      const isDiag = item.type === "diagnostic_report";
                      const isInspected = inspectedItemId === item.id;
                      const payload = item.payload || {};

                      return (
                        <div 
                          key={item.id} 
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isDiag 
                              ? "bg-slate-950 border-cyan-900/40 hover:border-cyan-700/60" 
                              : "bg-slate-950 border-slate-800"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 text-xs">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                                isDiag 
                                  ? "bg-cyan-950 text-cyan-400 border-cyan-800" 
                                  : "bg-purple-950 text-purple-300 border-purple-800"
                              }`}>
                                {isDiag ? <Microscope className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-white text-xs truncate">
                                    {item.title}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${getPriorityColor(item.priority)}`}>
                                    {item.priority}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                    isDiag ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : "bg-slate-800 text-slate-300"
                                  }`}>
                                    {item.type.replace("_", " ")}
                                  </span>
                                  {payload.category && (
                                    <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                      {payload.category}
                                    </span>
                                  )}
                                  {payload.riskLevel && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                      payload.riskLevel === "high" || payload.riskLevel === "emergency"
                                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    }`}>
                                      {payload.riskLevel} Risk
                                    </span>
                                  )}
                                </div>

                                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2 flex-wrap">
                                  <span>Patient: <strong className="text-slate-200">{payload.patientName || payload.patientId || "pat_101"}</strong></span>
                                  <span>•</span>
                                  <span>Queued: {new Date(item.createdAt).toLocaleTimeString()}</span>
                                  {item.retries > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-400 font-bold">
                                        Retries: {item.retries}/5
                                      </span>
                                    </>
                                  )}
                                </div>

                                {item.lastError && (
                                  <p className="text-[10.5px] text-rose-300/90 mt-1.5 bg-rose-950/40 border border-rose-900/50 p-1.5 rounded-lg flex items-center gap-1.5">
                                    <AlertCircle className="h-3 w-3 shrink-0 text-rose-400" />
                                    <span className="truncate">{item.lastError}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setInspectedItemId(isInspected ? null : item.id)}
                                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                                  isInspected ? "bg-cyan-900 text-cyan-200" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                }`}
                                title={isInspected ? "Hide payload" : "Inspect payload"}
                              >
                                {isInspected ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>

                              {effectiveOnline && (
                                <button
                                  type="button"
                                  onClick={() => syncSingleItem(item.id)}
                                  disabled={isSyncing}
                                  className="px-2 py-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 border border-cyan-700/60 disabled:opacity-50"
                                  title="Retry uploading this item now"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Retry</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => removeItemFromQueue(item.id)}
                                className="p-1.5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                                title="Remove from queue"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Inspection Drawer */}
                          {isInspected && (
                            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] space-y-2 bg-slate-950/80 p-3 rounded-xl">
                              <div className="font-mono text-cyan-400 font-bold flex items-center justify-between">
                                <span>Payload Inspector: {item.title}</span>
                                <span className="text-[10px] text-slate-500">Size: {formatSize(item.size || 0)}</span>
                              </div>

                              {isDiag && (
                                <div className="space-y-1.5 text-slate-300">
                                  {payload.aiSummary && (
                                    <div>
                                      <span className="text-slate-500 font-bold block text-[10px] uppercase">AI Clinical Impression</span>
                                      <p className="bg-slate-900 p-2 rounded-lg text-slate-200">{payload.aiSummary}</p>
                                    </div>
                                  )}
                                  {payload.keyFindings && payload.keyFindings.length > 0 && (
                                    <div>
                                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Key Findings</span>
                                      <ul className="list-disc list-inside text-slate-300 pl-1">
                                        {payload.keyFindings.map((f: string, fi: number) => (
                                          <li key={fi}>{f}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {payload.fileName && (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                      <span>Attached File: <strong>{payload.fileName}</strong></span>
                                      {payload.fileSize && <span>({payload.fileSize})</span>}
                                      {payload.targetEndpoint && <span>• Target: <code>{payload.targetEndpoint}</code></span>}
                                    </div>
                                  )}
                                </div>
                              )}

                              {!isDiag && (
                                <pre className="p-2 bg-slate-900 rounded-lg overflow-x-auto text-[10px] text-slate-400 font-mono">
                                  {JSON.stringify(payload, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TEST OFFLINE ENTRY GENERATOR (INCLUDING DIAGNOSTIC REPORTS) */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-cyan-400" />
                  Test Offline Entry Generator
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded font-normal lowercase">
                    simulate network drops & auto-retry verification
                  </span>
                </h4>

                <form onSubmit={handleAddSampleOfflineItem} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="select-offline-type">Type</label>
                      <select
                        id="select-offline-type"
                        value={newLogType}
                        onChange={(e) => setNewLogType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="diagnostic_report">Diagnostic Report (Lab / Pathology)</option>
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="high">High (Urgent Diagnostic / Critical)</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="input-offline-title">Title / Test Name</label>
                      <input
                        id="input-offline-title"
                        type="text"
                        placeholder={newLogType === "diagnostic_report" ? "e.g. Comprehensive Metabolic Panel" : "e.g. Consultation #102"}
                        value={newLogTitle}
                        onChange={(e) => setNewLogTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {newLogType === "diagnostic_report" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-xl border border-cyan-900/30">
                      <div>
                        <label className="text-[10px] font-bold text-cyan-400 block mb-1" htmlFor="input-diag-patient">Patient Name & ID</label>
                        <input
                          id="input-diag-patient"
                          type="text"
                          value={diagPatientName}
                          onChange={(e) => setDiagPatientName(e.target.value)}
                          placeholder="Ramesh Kumar"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-cyan-400 block mb-1" htmlFor="input-diag-category">Category</label>
                        <input
                          id="input-diag-category"
                          type="text"
                          value={diagCategory}
                          onChange={(e) => setDiagCategory(e.target.value)}
                          placeholder="Pathology / Radiology"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-cyan-400 block mb-1" htmlFor="select-diag-risk">Risk Assessment</label>
                        <select
                          id="select-diag-risk"
                          value={diagRiskLevel}
                          onChange={(e) => setDiagRiskLevel(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="low">Low Risk</option>
                          <option value="moderate">Moderate Risk</option>
                          <option value="high">High Risk (Urgent)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1" htmlFor="input-offline-details">Clinical Findings / Notes</label>
                    <input
                      id="input-offline-details"
                      type="text"
                      placeholder={newLogType === "diagnostic_report" ? diagFindings : "Clinical details or impression"}
                      value={newLogDetails}
                      onChange={(e) => setNewLogDetails(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    id="btn-submit-offline-item"
                    type="submit"
                    disabled={!newLogTitle}
                    className="w-full py-2 bg-gradient-to-r from-cyan-900 to-blue-900 hover:from-cyan-800 hover:to-blue-800 text-cyan-100 hover:text-white text-xs font-bold rounded-xl transition-all border border-cyan-700/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Queue Failed Diagnostic Upload (Offline Sink)</span>
                  </button>
                </form>
              </div>

              {/* Sync Logs */}
              {syncLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Synchronization Audit History ({syncLogs.length} entries)</span>
                    <button
                      id="btn-clear-sync-logs"
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(LOG_KEY);
                        setSyncLogs([]);
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear Audit Logs
                    </button>
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {syncLogs.slice(0, 10).map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] flex items-center justify-between text-slate-400">
                        <span className="font-mono text-cyan-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-emerald-400 font-bold">{log.syncedCount} synced</span>
                        <span className="text-amber-400">{log.conflictCount} conflicts</span>
                        <span className="text-rose-400">{log.errorCount} retries</span>
                        <span className="text-slate-500">{log.duration}ms</span>
                        <span className={`font-semibold ${
                          log.status === 'success' ? 'text-emerald-400' : 
                          log.status === 'partial' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
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

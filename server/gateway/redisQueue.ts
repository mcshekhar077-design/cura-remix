import { RedisTaskJob, RedisCacheStats } from "./types";

const startTime = Date.now();
let cacheHitCount = 14250;
let cacheMissCount = 890;

// Cache map with TTL
const cacheStore = new Map<string, { value: any; expiresAt: number }>();

// Initial hot patient cache items
cacheStore.set("cache:patient:PAT-APOLLO-001", {
  value: { name: "Amit Patel", mrn: "APOLLO-MRN-9021", alerts: "STEMI Post-PTCA" },
  expiresAt: Date.now() + 3600000
});
cacheStore.set("cache:drug_interaction:ATORVASTATIN_CLOPIDOGREL", {
  value: { safe: true, severity: "none", monitoring: "Check lipid profile at 4 weeks" },
  expiresAt: Date.now() + 86400000
});

// Task queues
const taskJobs: RedisTaskJob[] = [
  {
    id: "JOB-REDIS-901",
    queue: "critical_clinical_tasks",
    taskName: "Broadcast Critical Troponin I Alert to On-Call Cardiologist",
    payload: { patientId: "PAT-APOLLO-001", troponinValue: "4.8 ng/mL", normalRange: "<0.04" },
    status: "completed",
    progress: 100,
    workerId: "worker-clinical-alpha-1",
    retryCount: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 3599000).toISOString(),
    completedAt: new Date(Date.now() - 3597000).toISOString(),
    executionTimeMs: 2100,
    result: { status: "Delivered via SMS & Pager to Dr. Murthy (ACKNOWLEDGED)" }
  },
  {
    id: "JOB-REDIS-902",
    queue: "abdm_health_exchange",
    taskName: "Push FHIR R4 Diagnostic Bundle to ABDM Health Information Provider Gateway",
    payload: { abhaId: "amit.patel@abdm", bundleType: "DiagnosticReport" },
    status: "completed",
    progress: 100,
    workerId: "worker-abdm-bridge-2",
    retryCount: 0,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    startedAt: new Date(Date.now() - 1798000).toISOString(),
    completedAt: new Date(Date.now() - 1794000).toISOString(),
    executionTimeMs: 4200,
    result: { abdmTxnId: "TXN-NDHM-990021-IN", status: "ACK_RECEIVED" }
  },
  {
    id: "JOB-REDIS-903",
    queue: "report_generation",
    taskName: "Compile & Sign High-Res PDF Discharge Summary with Digital Signature",
    payload: { patientId: "PAT-FORTIS-001", admissionId: "ADM-FORTIS-441" },
    status: "processing",
    progress: 75,
    workerId: "worker-pdf-renderer-3",
    retryCount: 0,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    startedAt: new Date(Date.now() - 45000).toISOString()
  },
  {
    id: "JOB-REDIS-904",
    queue: "telemetry_aggregation",
    taskName: "Aggregate 100Hz Wearable ECG Telemetry Stream to Minutely Averages",
    payload: { deviceId: "IOT-HOLTER-882", bufferPackets: 6000 },
    status: "queued",
    progress: 0,
    workerId: "worker-telemetry-ingest-4",
    retryCount: 0,
    createdAt: new Date(Date.now() - 15000).toISOString()
  }
];

export function getRedisStats(): RedisCacheStats {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000) + 72400;
  const total = cacheHitCount + cacheMissCount;
  const hitRatePct = total > 0 ? Math.round((cacheHitCount / total) * 1000) / 10 : 94.1;

  const pendingJobs = taskJobs.filter(j => j.status === "queued" || j.status === "processing").length;
  const completedJobs = taskJobs.filter(j => j.status === "completed").length;
  const failedJobs = taskJobs.filter(j => j.status === "failed").length;

  return {
    connected: true,
    uptimeSeconds,
    memoryUsedMb: 42.8,
    totalKeys: cacheStore.size + 1850,
    hitCount: cacheHitCount,
    missCount: cacheMissCount,
    hitRatePct,
    activeQueues: 5,
    pendingJobs,
    completedJobs,
    failedJobs
  };
}

export function listRedisJobs(limit = 20): RedisTaskJob[] {
  return [...taskJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
}

export function enqueueTaskJob(params: {
  queue: RedisTaskJob["queue"];
  taskName: string;
  payload: any;
}): RedisTaskJob {
  const id = `JOB-REDIS-${Math.floor(1000 + Math.random() * 9000)}`;
  const newJob: RedisTaskJob = {
    id,
    queue: params.queue,
    taskName: params.taskName,
    payload: params.payload,
    status: "queued",
    progress: 0,
    workerId: `worker-${params.queue}-pool`,
    retryCount: 0,
    createdAt: new Date().toISOString()
  };

  taskJobs.unshift(newJob);

  // Simulate background execution
  setTimeout(() => {
    newJob.status = "processing";
    newJob.progress = 40;
    newJob.startedAt = new Date().toISOString();
  }, 1000);

  setTimeout(() => {
    newJob.status = "completed";
    newJob.progress = 100;
    newJob.completedAt = new Date().toISOString();
    newJob.executionTimeMs = Math.floor(1200 + Math.random() * 2000);
    newJob.result = { status: "SUCCESS", processedAt: newJob.completedAt };
  }, 3000);

  return newJob;
}

export function simulateCacheLookup(key: string): { found: boolean; value: any; latencyMs: number } {
  const item = cacheStore.get(key);
  if (item && item.expiresAt > Date.now()) {
    cacheHitCount++;
    return { found: true, value: item.value, latencyMs: 0.8 };
  } else {
    cacheMissCount++;
    return { found: false, value: null, latencyMs: 1.2 };
  }
}

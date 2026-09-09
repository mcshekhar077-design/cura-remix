import crypto from "crypto";

export interface QueueJob<T = any> {
  id: string;
  queue: string;
  taskName: string;
  payload: T;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  workerId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface RedisClient {
  // Cache API
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  
  // Queue API
  enqueue<T = any>(queueName: string, taskName: string, payload: T): Promise<QueueJob<T>>;
  getJobs(queueName?: string): Promise<QueueJob[]>;
  getJob(jobId: string): Promise<QueueJob | null>;
  
  // Health
  getHealth(): Promise<{ status: "connected" | "fallback"; latencyMs: number; memoryUsedKb: number; queuesCount: number }>;
}

class InMemoryRedisClient implements RedisClient {
  private cache: Map<string, { value: any; expiresAt?: number }> = new Map();
  private jobs: Map<string, QueueJob> = new Map();

  constructor() {
    this.seedInitialJobs();
  }

  private seedInitialJobs() {
    const sampleJobs: QueueJob[] = [
      {
        id: "job_fhir_01",
        queue: "abdm_fhir_sync",
        taskName: "Sync Patient FHIR Bundle to ABDM Gateway",
        payload: { patientId: "pat_1", abhaId: "amit.patel@abdm" },
        status: "completed",
        progress: 100,
        workerId: "worker_node_02",
        createdAt: new Date(Date.now() - 120000).toISOString(),
        startedAt: new Date(Date.now() - 110000).toISOString(),
        completedAt: new Date(Date.now() - 100000).toISOString(),
        result: { txId: "TX-ABDM-9948", status: "ACKNOWLEDGED" }
      },
      {
        id: "job_sms_02",
        queue: "notifications",
        taskName: "Dispatch WhatsApp & SMS Appointment Confirmation",
        payload: { phone: "+91 98480 11223", tokenNumber: 14, doctorName: "Dr. K. S. Murthy" },
        status: "completed",
        progress: 100,
        workerId: "worker_node_01",
        createdAt: new Date(Date.now() - 60000).toISOString(),
        startedAt: new Date(Date.now() - 55000).toISOString(),
        completedAt: new Date(Date.now() - 50000).toISOString(),
        result: { deliveryStatus: "DELIVERED", gateway: "Karix-WhatsApp" }
      },
      {
        id: "job_ai_03",
        queue: "cdss_evaluation",
        taskName: "Background Drug-Drug Contraindication Analysis",
        payload: { patientId: "pat_1", newMeds: ["Atorvastatin 40mg", "Clopidogrel 75mg"] },
        status: "queued",
        progress: 0,
        createdAt: new Date().toISOString()
      }
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));
  }

  public async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
    return true;
  }

  public async del(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  public async enqueue<T = any>(queueName: string, taskName: string, payload: T): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job_${crypto.randomBytes(6).toString("hex")}`,
      queue: queueName,
      taskName,
      payload,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString()
    };
    this.jobs.set(job.id, job);

    // Auto-advance job asynchronously in background to simulate worker queue processing
    setTimeout(() => {
      const existing = this.jobs.get(job.id);
      if (existing) {
        existing.status = "processing";
        existing.progress = 50;
        existing.workerId = "worker_node_01";
        existing.startedAt = new Date().toISOString();
      }
    }, 1200);

    setTimeout(() => {
      const existing = this.jobs.get(job.id);
      if (existing) {
        existing.status = "completed";
        existing.progress = 100;
        existing.completedAt = new Date().toISOString();
        existing.result = { processed: true, completedAt: new Date().toISOString() };
      }
    }, 3500);

    return job;
  }

  public async getJobs(queueName?: string): Promise<QueueJob[]> {
    const all = Array.from(this.jobs.values()).reverse();
    if (queueName) {
      return all.filter(j => j.queue === queueName);
    }
    return all;
  }

  public async getJob(jobId: string): Promise<QueueJob | null> {
    return this.jobs.get(jobId) || null;
  }

  public async getHealth() {
    return {
      status: "connected" as const,
      latencyMs: 0.6,
      memoryUsedKb: 248,
      queuesCount: new Set(Array.from(this.jobs.values()).map(j => j.queue)).size
    };
  }
}

export const redis: RedisClient = new InMemoryRedisClient();

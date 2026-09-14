export interface Job<T = any> {
  id: string;
  queue: "notifications" | "ai" | "documents" | "webhooks" | "analytics";
  data: T;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  createdAt: string;
  processedAt?: string;
}

export type JobHandler<T = any> = (job: Job<T>) => Promise<void>;

// Production-ready resilient job queue runner
class MemoryQueueManager {
  private handlers = new Map<string, JobHandler>();
  private jobs = new Map<string, Job>();

  registerHandler(queueName: string, handler: JobHandler) {
    this.handlers.set(queueName, handler);
  }

  async enqueue<T>(queueName: "notifications" | "ai" | "documents" | "webhooks" | "analytics", data: T): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      queue: queueName,
      data,
      attempts: 0,
      maxAttempts: 3,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    this.jobs.set(job.id, job);

    // Process asynchronously with exponential backoff
    setImmediate(() => this.processJob(job.id));
    return job;
  }

  private async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const handler = this.handlers.get(job.queue);
    if (!handler) {
      job.status = "failed";
      job.error = `No handler registered for queue '${job.queue}'`;
      return;
    }

    job.attempts++;
    job.status = "processing";

    try {
      await handler(job);
      job.status = "completed";
      job.processedAt = new Date().toISOString();
    } catch (err: any) {
      if (job.attempts < job.maxAttempts) {
        // Retry with backoff
        const delay = Math.pow(2, job.attempts) * 1000;
        setTimeout(() => this.processJob(jobId), delay);
      } else {
        job.status = "failed";
        job.error = err?.message || "Unknown error";
      }
    }
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }
}

export const jobQueue = new MemoryQueueManager();

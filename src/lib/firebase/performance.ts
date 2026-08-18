import { trace, FirebasePerformance, PerformanceTrace } from 'firebase/performance';
import { getFirebasePerformance } from './config';

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private performance: FirebasePerformance | null = null;
  private traces: Map<string, PerformanceTrace> = new Map();

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  async initialize(): Promise<void> {
    try {
      const perf = await getFirebasePerformance();
      this.performance = perf || null;
    } catch (error) {
      console.debug('Performance monitoring not available:', error);
    }
  }

  startTrace(name: string): void {
    if (!this.performance) return;

    try {
      const traceInstance = trace(this.performance, name);
      traceInstance.start();
      this.traces.set(name, traceInstance);
    } catch (error) {
      console.debug('Failed to start trace:', error);
    }
  }

  stopTrace(name: string): void {
    const traceInstance = this.traces.get(name);
    if (traceInstance) {
      try {
        traceInstance.stop();
        this.traces.delete(name);
      } catch (error) {
        console.debug('Failed to stop trace:', error);
      }
    }
  }
}

export const measureAsyncOperation = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  const tracker = PerformanceTracker.getInstance();
  await tracker.initialize();
  tracker.startTrace(name);
  try {
    const result = await operation();
    tracker.stopTrace(name);
    return result;
  } catch (error) {
    tracker.stopTrace(name);
    throw error;
  }
};

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  onAuthStateChange, 
  getCurrentUser,
  getConnectionState,
  onConnectionStateChange,
  healthCheck,
  ConnectionState
} from './config';
import { trackError } from './analytics';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const current = getCurrentUser();
    if (current !== null) {
      setUser(current);
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  return { user, loading };
};

export const useFirebaseConnection = () => {
  const [state, setState] = useState<ConnectionState>(getConnectionState());
  const [isOnline, setIsOnline] = useState(state === 'online');

  useEffect(() => {
    const unsubscribe = onConnectionStateChange((newState) => {
      setState(newState);
      setIsOnline(newState === 'online');
    });

    return unsubscribe;
  }, []);

  return { state, isOnline };
};

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  lastCheck: Date | null;
  error: Error | null;
  checking: boolean;
}

export const useFirebaseHealth = (autoCheck: boolean = true, interval: number = 60000) => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'unknown',
    lastCheck: null,
    error: null,
    checking: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkHealth = useCallback(async () => {
    setHealth((prev) => ({ ...prev, checking: true }));
    try {
      const result = await healthCheck();
      setHealth({
        status: result.status,
        lastCheck: new Date(),
        error: null,
        checking: false,
      });
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error instanceof Error ? error : new Error('Health check failed'),
        checking: false,
      });
      trackError(error instanceof Error ? error : new Error('Health check failed'));
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkHealth();
      intervalRef.current = setInterval(checkHealth, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoCheck, interval, checkHealth]);

  return { ...health, checkHealth };
};

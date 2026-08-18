import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDocFromServer
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage
} from 'firebase/storage';
import { 
  getAnalytics, 
  Analytics, 
  isSupported as isAnalyticsSupported,
  logEvent
} from 'firebase/analytics';
import { 
  getPerformance, 
  FirebasePerformance 
} from 'firebase/performance';
import firebaseConfig from '../../../firebase-applet-config.json';

// ============================================
// TYPES
// ============================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
  measurementId?: string;
}

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  analytics?: Analytics;
  performance?: FirebasePerformance;
}

// ============================================
// INITIALIZATION
// ============================================

let services: FirebaseServices | null = null;
let initializationPromise: Promise<FirebaseServices> | null = null;

export const initializeFirebase = async (): Promise<FirebaseServices> => {
  if (services) return services;

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Initialize App
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

      // Initialize Auth with browser local persistence
      const auth = getAuth(app);
      if (typeof window !== 'undefined') {
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch {
          // Fallback persistence
        }
      }

      // Initialize Firestore
      const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

      // Initialize Storage
      const storage = getStorage(app);

      // Analytics (browser only)
      let analytics: Analytics | undefined;
      if (typeof window !== 'undefined') {
        try {
          const supported = await isAnalyticsSupported();
          if (supported) {
            analytics = getAnalytics(app);
          }
        } catch {
          // Analytics unavailable
        }
      }

      // Performance (browser only)
      let performance: FirebasePerformance | undefined;
      if (typeof window !== 'undefined') {
        try {
          performance = getPerformance(app);
        } catch {
          // Performance monitoring unavailable
        }
      }

      services = {
        app,
        auth,
        db,
        storage,
        analytics,
        performance,
      };

      // Set up auth state listener
      setupAuthListener(auth);

      return services;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

let currentUser: User | null = null;
let authStateListeners: ((user: User | null) => void)[] = [];

const setupAuthListener = (auth: Auth): void => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authStateListeners.forEach((listener) => listener(user));
  });
};

export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  authStateListeners.push(callback);
  if (currentUser !== null) {
    callback(currentUser);
  }
  return () => {
    authStateListeners = authStateListeners.filter((listener) => listener !== callback);
  };
};

export const getCurrentUser = (): User | null => currentUser;

// ============================================
// CONNECTION STATE MANAGEMENT
// ============================================

export type ConnectionState = 'online' | 'offline' | 'connecting' | 'unknown';
let connectionState: ConnectionState = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
let connectionListeners: ((state: ConnectionState) => void)[] = [];

export const getConnectionState = (): ConnectionState => connectionState;

export const onConnectionStateChange = (callback: (state: ConnectionState) => void): (() => void) => {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter((listener) => listener !== callback);
  };
};

if (typeof window !== 'undefined') {
  const updateConnectionState = (): void => {
    const newState: ConnectionState = navigator.onLine ? 'online' : 'offline';
    if (newState !== connectionState) {
      connectionState = newState;
      connectionListeners.forEach((listener) => listener(newState));
      if (services?.analytics) {
        logEvent(services.analytics, 'connection_state_change', { state: newState });
      }
    }
  };

  window.addEventListener('online', updateConnectionState);
  window.addEventListener('offline', updateConnectionState);
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: {
    auth: boolean;
    firestore: boolean;
    storage: boolean;
    analytics: boolean;
    performance: boolean;
  };
  errors: string[];
  timestamp: string;
}

export const healthCheck = async (): Promise<HealthCheckResult> => {
  const result: HealthCheckResult = {
    status: 'healthy',
    services: {
      auth: false,
      firestore: false,
      storage: false,
      analytics: false,
      performance: false,
    },
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    const { auth, db, storage, analytics, performance } = await initializeFirebase();

    // Check Auth
    result.services.auth = !!auth;

    // Check Firestore connection
    try {
      const testDoc = doc(db, '_connection_test', 'status');
      await getDocFromServer(testDoc).catch(() => {
        result.services.firestore = true;
      });
      result.services.firestore = true;
    } catch {
      result.services.firestore = false;
      result.errors.push('Firestore connection check failed');
    }

    // Check Storage
    result.services.storage = !!storage;
    result.services.analytics = !!analytics;
    result.services.performance = !!performance;

    if (result.services.auth && result.services.firestore) {
      result.status = 'healthy';
    } else if (result.services.auth || result.services.firestore) {
      result.status = 'degraded';
    } else {
      result.status = 'unhealthy';
    }
  } catch (error) {
    result.status = 'unhealthy';
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
};

// ============================================
// SERVICE GETTERS
// ============================================

export const getFirebaseServices = async (): Promise<FirebaseServices> => {
  if (services) return services;
  return initializeFirebase();
};

export const getFirebaseAuth = async (): Promise<Auth> => {
  const { auth } = await getFirebaseServices();
  return auth;
};

export const getFirebaseDb = async (): Promise<Firestore> => {
  const { db } = await getFirebaseServices();
  return db;
};

export const getFirebaseStorage = async (): Promise<FirebaseStorage> => {
  const { storage } = await getFirebaseServices();
  return storage;
};

export const getFirebaseAnalytics = async (): Promise<Analytics | undefined> => {
  const { analytics } = await getFirebaseServices();
  return analytics;
};

export const getFirebasePerformance = async (): Promise<FirebasePerformance | undefined> => {
  const { performance } = await getFirebaseServices();
  return performance;
};

export default {
  initialize: initializeFirebase,
  getServices: getFirebaseServices,
  getAuth: getFirebaseAuth,
  getDb: getFirebaseDb,
  getStorage: getFirebaseStorage,
  getAnalytics: getFirebaseAnalytics,
  getPerformance: getFirebasePerformance,
  onAuthStateChange,
  getCurrentUser,
  getConnectionState,
  onConnectionStateChange,
  healthCheck,
};

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './config';
import { EmergencySosAlert } from '../../types/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

async function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): Promise<never> {
  const auth = await getFirebaseAuth().catch(() => null);
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    }
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// CRUD OPERATIONS
// ============================================

export const createSosAlert = async (data: Omit<EmergencySosAlert, 'id'>): Promise<EmergencySosAlert> => {
  const path = 'emergencySosAlerts';
  try {
    const db = await getFirebaseDb();
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, path), {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: now
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getSosAlert = async (id: string): Promise<EmergencySosAlert | null> => {
  const path = `emergencySosAlerts/${id}`;
  try {
    const db = await getFirebaseDb();
    const docRef = doc(db, 'emergencySosAlerts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as EmergencySosAlert;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
};

export const updateSosAlert = async (id: string, data: Partial<EmergencySosAlert>): Promise<void> => {
  const path = `emergencySosAlerts/${id}`;
  try {
    const db = await getFirebaseDb();
    const docRef = doc(db, 'emergencySosAlerts', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteSosAlert = async (id: string): Promise<void> => {
  const path = `emergencySosAlerts/${id}`;
  try {
    const db = await getFirebaseDb();
    const docRef = doc(db, 'emergencySosAlerts', id);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// ============================================
// QUERY OPERATIONS
// ============================================

export const getActiveSosAlerts = async (): Promise<EmergencySosAlert[]> => {
  const path = 'emergencySosAlerts';
  try {
    const db = await getFirebaseDb();
    const q = query(
      collection(db, path),
      where('status', 'in', ['active', 'acknowledged', 'dispatched']),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as EmergencySosAlert));
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getPatientSosAlerts = async (patientId: string): Promise<EmergencySosAlert[]> => {
  const path = 'emergencySosAlerts';
  try {
    const db = await getFirebaseDb();
    const q = query(
      collection(db, path),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as EmergencySosAlert));
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getRecentSosAlerts = async (limitCount: number = 20): Promise<EmergencySosAlert[]> => {
  const path = 'emergencySosAlerts';
  try {
    const db = await getFirebaseDb();
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as EmergencySosAlert));
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
};

// ============================================
// STATUS MANAGEMENT
// ============================================

export const acknowledgeSosAlert = async (id: string, userId: string): Promise<void> => {
  const existing = await getSosAlert(id);
  const now = new Date().toISOString();
  const createdAtMs = existing?.createdAt ? new Date(existing.createdAt).getTime() : Date.now();
  const responseTime = Date.now() - createdAtMs;

  await updateSosAlert(id, {
    status: 'acknowledged',
    acknowledgedAt: now,
    responseTime: responseTime > 0 ? responseTime : 0,
    updatedBy: userId
  });
};

export const dispatchSosAlert = async (id: string, team: string, doctorId: string, doctorName?: string): Promise<void> => {
  await updateSosAlert(id, {
    status: 'dispatched',
    dispatchedAt: new Date().toISOString(),
    assignedTeam: team,
    assignedDoctor: { 
      id: doctorId, 
      name: doctorName || 'ER Duty Physician',
      assignedAt: new Date().toISOString() 
    }
  });
};

export const resolveSosAlert = async (id: string, userId: string): Promise<void> => {
  const alert = await getSosAlert(id);
  const createdAtMs = alert?.createdAt ? new Date(alert.createdAt).getTime() : Date.now();
  const resolutionTime = Date.now() - createdAtMs;

  await updateSosAlert(id, {
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    updatedBy: userId,
    resolutionTime: resolutionTime > 0 ? resolutionTime : 0
  });
};

export const cancelSosAlert = async (id: string, userId: string, reason: string): Promise<void> => {
  await updateSosAlert(id, {
    status: 'cancelled',
    updatedBy: userId,
    cancellationReason: reason
  });
};

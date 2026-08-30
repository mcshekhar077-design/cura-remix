// ============================================
// EMERGENCY SOS ALERT TYPES
// ============================================

export type SOSPriority = 'CRITICAL_RED' | 'HIGH_ORANGE' | 'MEDIUM_YELLOW' | 'LOW_GREEN';
export type SOSStatus = 'active' | 'acknowledged' | 'dispatched' | 'resolved' | 'cancelled';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: string;
}

export interface VitalSigns {
  heartRate?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  recordedAt?: string;
}

export interface EmergencyNote {
  id: string;
  text: string;
  author: string;
  authorId: string;
  timestamp: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  notifiedAt?: string;
}

export interface AssignedDoctor {
  id: string;
  name: string;
  specialty?: string;
  assignedAt?: string;
}

export interface EmergencySosAlert {
  id: string;
  ticketNumber: string;
  patientId?: string;
  patientName: string;
  phone: string;
  holdDurationMs?: number;
  triggerSource?: string;
  priority: SOSPriority;
  status: SOSStatus;
  location?: Location;
  vitals?: VitalSigns;
  notes?: EmergencyNote[];
  emergencyContacts?: EmergencyContact[];
  assignedDoctor?: AssignedDoctor;
  assignedTeam?: string;
  cancellationReason?: string;
  responseTime?: number;
  resolutionTime?: number;
  createdAt: string;
  acknowledgedAt?: string;
  dispatchedAt?: string;
  resolvedAt?: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// FIRESTORE QUERY TYPES
// ============================================

export type WhereFilterOp = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';

export interface FirestoreQueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface FirestoreQueryOrder {
  field: string;
  direction?: 'asc' | 'desc';
}

export interface FirestoreQuery {
  collection: string;
  where?: FirestoreQueryFilter[];
  orderBy?: FirestoreQueryOrder[];
  limit?: number;
  startAfter?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: any;
  hasMore: boolean;
  total: number;
}

export interface ClinicLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  clinicName: string;
  doctorCount: string;
  subdomain: string;
  createdAt: string;
  status: "pending" | "contacted" | "converted";
  referralCode?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  bloodGroup: string;
  allergies: string[];
  currentMedications: string[];
  history: Array<{
    date: string;
    doctor: string;
    diagnosis: string;
    symptoms: string;
    prescriptions: string[];
  }>;
  patientCode?: string;
  abhaId?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  address?: string;
  pincode?: string;
  city?: string;
  state?: string;
  createdAt?: string;
  scannedReports?: ScannedReport[];
}

export interface ScannedReport {
  id: string;
  title: string;
  date: string;
  category: string;
  fileName: string;
  fileSize?: string;
  extractedText?: string;
  aiSummary?: string;
  keyFindings?: string[];
  status: "scanned" | "analyzed";
  riskLevel?: "low" | "medium" | "high" | "emergency";
  abnormalValues?: Array<{ test: string; value: string; normalRange: string; severity: "mild" | "moderate" | "severe" }>;
  possibleConditions?: string[];
  suggestedSpecialist?: string;
  suggestedDoctorName?: string;
  followUpRecommendation?: string;
  extractedPatientName?: string;
  medications?: Array<{ name: string; dosage: string; frequency: string; duration?: string; reason?: string }>;
  diagnosis?: string;
  labResults?: Array<{ test: string; value: string; normalRange: string; status: "Normal" | "High" | "Low" }>;
  summaryForDoctor?: string;
  suggestedIcdCode?: string;
  action?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  phone: string;
  doctorName: string;
  scheduledAt: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  type: "in_person" | "video" | "voice";
  reason: string;
}

export interface AISuggestion {
  summary: string;
  diagnoses: string[];
  recommendedTests: string[];
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    reason: string;
  }>;
  drugInteractions: string[];
  additionalAdvice: string;
  apiNotice?: string;
  engineUsed?: string;
}

// Commercial SaaS Subscription Integration Models
export type TenantTier = "trial" | "solo-clinic" | "nursing-home" | "hospital-suite";
export type SubscriptionStatus = "active" | "expired" | "unpaid" | "past_due";
export type PaymentGatewayType = "stripe" | "razorpay" | "none";

export interface TenantConfig {
  tier: TenantTier;
  status: SubscriptionStatus;
  expiryDate: string;
  branding: {
    clinicName: string;
    logoUrl: string;
    primaryColor: string;
    customDomain: string;
  };
  whatsapp: {
    gateway: "simulated" | "custom";
    apiEndpoint: string;
    apiKey: string;
  };
  usage: {
    aiCalls: number;
    whatsappMessages: number;
    patients: number;
  };
}

export interface SubscriptionOrder {
  id: string; // ord_... or cs_...
  tenantId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  gateway: PaymentGatewayType;
  tier: TenantTier;
  createdAt: string;
  completedAt?: string;
  stripeSessionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface SubscriptionDetails {
  id: string; // sub_...
  tenantId: string;
  tier: TenantTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentGateway: PaymentGatewayType;
  priceId?: string;
  stripeSubscriptionId?: string;
  razorpaySubscriptionId?: string;
}

export interface MRProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  isActive: boolean;
  createdAt: string;
}

export interface Referral {
  id: string;
  mrId: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  clinicName: string;
  status: "pending" | "trial_active" | "converted" | "failed";
  commissionAmount: number;
  createdAt: string;
}

export type UserRole = "doctor" | "patient" | "pharmacist" | "admin" | "specialist" | "staff" | "ayush_practitioner" | "mr_representative";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  clinicName?: string;
  doctorCount?: string;
  specialty?: string;
  abhaId?: string;
  token?: string;
  subdomain?: string;
  createdAt?: string;
}



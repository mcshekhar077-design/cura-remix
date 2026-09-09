-- ==============================================================================
-- CURA Production PostgreSQL Relational Schema
-- Multi-tenant, HIPAA & NABH Compliant, ABDM-Ready Database Architecture
-- ==============================================================================

-- Extension setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TENANTS & HOSPITALS (Multi-Tenancy Foundation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    license_number VARCHAR(100),
    tier VARCHAR(50) DEFAULT 'enterprise',
    status VARCHAR(50) DEFAULT 'active',
    database_schema VARCHAR(100) DEFAULT 'public',
    encryption_key_arn VARCHAR(255),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. IDENTITY & RBAC
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'doctor', 'hospital_admin', 'nurse', 'pharmacist', 'patient', 'auditor'
    specialization VARCHAR(100),
    registration_council_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_user_email UNIQUE (tenant_id, email)
);

-- ------------------------------------------------------------------------------
-- 3. PATIENT DEMOGRAPHICS & PHR
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mrn VARCHAR(64) NOT NULL, -- Medical Record Number
    abha_id VARCHAR(100), -- Ayushman Bharat Health Account
    abha_address VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    age INT,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(50),
    address_line TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    current_medications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_patient_mrn UNIQUE (tenant_id, mrn)
);

-- Patient Consent & Privacy Ledger
CREATE TABLE IF NOT EXISTS patient_consents (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consent_artifact_id VARCHAR(100),
    purpose VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, REVOKED
    data_types JSONB NOT NULL, -- ['history', 'vitals', 'prescriptions', 'diagnostic_reports']
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    signature_hash VARCHAR(255)
);

-- ------------------------------------------------------------------------------
-- 4. CLINICAL ENCOUNTERS & CONSULTATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_encounters (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    encounter_type VARCHAR(50) NOT NULL, -- 'OPD', 'IPD', 'EMERGENCY', 'TELEMEDICINE'
    specialty VARCHAR(100) NOT NULL,
    chief_complaint TEXT NOT NULL,
    history_of_present_illness TEXT,
    systemic_examination TEXT,
    vitals JSONB NOT NULL, -- { bpSystolic: 120, bpDiastolic: 80, pulse: 72, spo2: 99, tempF: 98.6 }
    provisional_diagnosis TEXT,
    final_diagnosis TEXT,
    icd10_codes JSONB DEFAULT '[]'::jsonb,
    clinical_notes TEXT,
    doctor_signature VARCHAR(255),
    signed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions & Medications
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    encounter_id VARCHAR(64) REFERENCES clinical_encounters(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    medications JSONB NOT NULL, -- array of { drugName, genericName, dosage, frequency, route, durationDays, instructions }
    instructions TEXT,
    contraindications_checked BOOLEAN DEFAULT true,
    allergy_alerts JSONB DEFAULT '[]'::jsonb,
    dispense_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PARTIAL, DISPENSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. APPOINTMENTS & QUEUES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    token_number INT,
    queue_status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, CHECKED_IN, IN_CONSULT, COMPLETED, CANCELLED
    consultation_mode VARCHAR(50) DEFAULT 'IN_PERSON', -- IN_PERSON, VIDEO, AUDIO
    meeting_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. PHARMACY & INVENTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    composition VARCHAR(255),
    category VARCHAR(100),
    batch_number VARCHAR(100) NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 20,
    unit_price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    is_narcotic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. DIAGNOSTICS, LAB & RADIOLOGY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostic_orders (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    encounter_id VARCHAR(64) REFERENCES clinical_encounters(id),
    order_type VARCHAR(50) NOT NULL, -- 'PATHOLOGY', 'RADIOLOGY', 'CARDIOLOGY_ECG'
    test_code VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    urgency VARCHAR(20) DEFAULT 'ROUTINE', -- ROUTINE, URGENT, STAT
    status VARCHAR(50) DEFAULT 'ORDERED', -- ORDERED, SAMPLE_COLLECTED, PROCESSING, COMPLETED
    sample_id VARCHAR(100),
    results JSONB,
    findings TEXT,
    file_attachment_url TEXT,
    radiology_dicom_series_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------------------------------------------
-- 8. BILLING & INVOICING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS billing_invoices (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id VARCHAR(64) REFERENCES clinical_encounters(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID, REFUNDED
    payment_mode VARCHAR(50), -- UPI, CARD, CASH, INSURANCE_TPA
    line_items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. IMMUTABLE CRYPTOGRAPHIC AUDIT STORE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_blocks (
    index_no SERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    block_hash VARCHAR(64) UNIQUE NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    event_data JSONB NOT NULL,
    digital_signature VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id, full_name);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON clinical_encounters(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(tenant_id, doctor_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_blocks(tenant_id, timestamp);

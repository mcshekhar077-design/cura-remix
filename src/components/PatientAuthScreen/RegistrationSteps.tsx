import React, { useState, useCallback } from "react";
import {
  User,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Pill,
  Lock
} from "lucide-react";
import { Patient } from "../../types";

export interface RegistrationStepsProps {
  onComplete: (patient: Patient) => void;
  onBack?: () => void;
  initialStep?: number;
}

export const RegistrationSteps: React.FC<RegistrationStepsProps> = ({
  onComplete,
  onBack,
  initialStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '1996-05-15',
      gender: 'Male' as "Male" | "Female" | "Other",
      bloodGroup: 'O+'
    },
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      city: 'Mumbai',
      pincode: '400001'
    },
    healthInfo: {
      allergies: 'Penicillin, Dust',
      conditions: 'Mild Hypertension',
      medications: 'Telmisartan 20mg'
    },
    securityInfo: {
      password: '',
      confirmPassword: '',
      abhaId: '',
      acceptTerms: true,
      acceptPrivacy: true
    }
  });

  const steps = [
    {
      id: 'personal',
      icon: User,
      title: 'Personal',
      description: 'Patient identity & demographics'
    },
    {
      id: 'contact',
      icon: Phone,
      title: 'Contact',
      description: 'Communication & address'
    },
    {
      id: 'health',
      icon: Heart,
      title: 'Clinical',
      description: 'Allergies & past history'
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security',
      description: 'PIN & ABDM ABHA ID'
    },
    {
      id: 'complete',
      icon: Sparkles,
      title: 'Review',
      description: 'Verify EHR profile'
    }
  ];

  const updateFormData = useCallback((section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.personalInfo.fullName.trim();
      case 1:
        return !!formData.contactInfo.phone.trim() && formData.contactInfo.phone.length >= 8;
      case 2:
        return true; // Optional clinical summary
      case 3:
        return formData.securityInfo.password.length >= 4 &&
               formData.securityInfo.password === formData.securityInfo.confirmPassword &&
               formData.securityInfo.acceptTerms;
      default:
        return true;
    }
  }, [formData]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length && (step < currentStep || validateStep(currentStep))) {
      setCurrentStep(step);
      setError(null);
    }
  }, [currentStep, steps.length, validateStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) {
      setError('Please complete all required fields before proceeding.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const allergyList = formData.healthInfo.allergies
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const medicationList = formData.healthInfo.medications
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Compute age from DOB
      const birthYear = new Date(formData.personalInfo.dateOfBirth).getFullYear() || 1996;
      const computedAge = Math.max(1, new Date().getFullYear() - birthYear);

      const newPatient: Patient = {
        id: `PAT-${Date.now()}`,
        fullName: formData.personalInfo.fullName.trim(),
        patientCode: `CURA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        phone: formData.contactInfo.phone.trim(),
        email: formData.contactInfo.email.trim() || `${formData.personalInfo.fullName.toLowerCase().replace(/\s+/g, '.')}@cura-health.in`,
        age: computedAge,
        gender: formData.personalInfo.gender,
        bloodGroup: formData.personalInfo.bloodGroup,
        abhaId: formData.securityInfo.abhaId.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        address: formData.contactInfo.address.trim() || undefined,
        city: formData.contactInfo.city.trim() || undefined,
        pincode: formData.contactInfo.pincode.trim() || undefined,
        allergies: allergyList,
        currentMedications: medicationList,
        history: formData.healthInfo.conditions ? [{
          date: new Date().toISOString().split("T")[0],
          doctor: "Self Reported / Onboarding",
          diagnosis: formData.healthInfo.conditions,
          symptoms: "Initial medical profile intake",
          prescriptions: medicationList
        }] : [],
        createdAt: new Date().toISOString()
      };

      onComplete(newPatient);
    } catch (err) {
      setError('Failed to register patient profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, currentStep, validateStep, onComplete]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-name">
                Full Name *
              </label>
              <input
                id="input-reg-name"
                type="text"
                value={formData.personalInfo.fullName}
                onChange={(e) => updateFormData('personalInfo', { fullName: e.target.value })}
                placeholder="e.g. Dr. Aarav Verma"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-dob">
                  Date of Birth
                </label>
                <input
                  id="input-reg-dob"
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => updateFormData('personalInfo', { dateOfBirth: e.target.value })}
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-gender">
                  Gender *
                </label>
                <select
                  id="input-reg-gender"
                  value={formData.personalInfo.gender}
                  onChange={(e) => updateFormData('personalInfo', { gender: e.target.value })}
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-blood">
                Blood Group
              </label>
              <select
                id="input-reg-blood"
                value={formData.personalInfo.bloodGroup}
                onChange={(e) => updateFormData('personalInfo', { bloodGroup: e.target.value })}
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-phone">
                Mobile Number *
              </label>
              <input
                id="input-reg-phone"
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => updateFormData('contactInfo', { phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-email">
                Email Address
              </label>
              <input
                id="input-reg-email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => updateFormData('contactInfo', { email: e.target.value })}
                placeholder="aarav@example.com"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-city">
                  City
                </label>
                <input
                  id="input-reg-city"
                  type="text"
                  value={formData.contactInfo.city}
                  onChange={(e) => updateFormData('contactInfo', { city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-pin">
                  PIN Code
                </label>
                <input
                  id="input-reg-pin"
                  type="text"
                  value={formData.contactInfo.pincode}
                  onChange={(e) => updateFormData('contactInfo', { pincode: e.target.value })}
                  placeholder="400001"
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-allergies">
                Known Drug / Food Allergies
              </label>
              <input
                id="input-reg-allergies"
                type="text"
                value={formData.healthInfo.allergies}
                onChange={(e) => updateFormData('healthInfo', { allergies: e.target.value })}
                placeholder="Penicillin, Sulfa, Peanuts"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-conditions">
                Chronic Medical Conditions
              </label>
              <input
                id="input-reg-conditions"
                type="text"
                value={formData.healthInfo.conditions}
                onChange={(e) => updateFormData('healthInfo', { conditions: e.target.value })}
                placeholder="Hypertension, Type 2 Diabetes, Asthma"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-meds">
                Current Daily Medications
              </label>
              <input
                id="input-reg-meds"
                type="text"
                value={formData.healthInfo.medications}
                onChange={(e) => updateFormData('healthInfo', { medications: e.target.value })}
                placeholder="Telmisartan 20mg, Metformin 500mg"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-pass">
                  PIN / Password *
                </label>
                <input
                  id="input-reg-pass"
                  type="password"
                  value={formData.securityInfo.password}
                  onChange={(e) => updateFormData('securityInfo', { password: e.target.value })}
                  placeholder="4+ digits"
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-confirm">
                  Confirm PIN *
                </label>
                <input
                  id="input-reg-confirm"
                  type="password"
                  value={formData.securityInfo.confirmPassword}
                  onChange={(e) => updateFormData('securityInfo', { confirmPassword: e.target.value })}
                  placeholder="Re-enter PIN"
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1" htmlFor="input-reg-abha">
                ABHA 14-Digit Health ID (Optional)
              </label>
              <input
                id="input-reg-abha"
                type="text"
                value={formData.securityInfo.abhaId}
                onChange={(e) => updateFormData('securityInfo', { abhaId: e.target.value })}
                placeholder="Auto-generated ABDM ID if left blank"
                className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-start gap-2 text-[10px] text-slate-400 cursor-pointer">
                <input
                  id="checkbox-reg-terms"
                  type="checkbox"
                  checked={formData.securityInfo.acceptTerms}
                  onChange={(e) => updateFormData('securityInfo', { acceptTerms: e.target.checked })}
                  className="rounded accent-emerald-500 bg-slate-950 border-slate-800 h-3.5 w-3.5 mt-0.5"
                />
                <span>
                  I accept the <span className="text-emerald-400 font-bold">Terms of Service</span> & HIPAA Privacy Policy
                </span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-2.5 text-left">
            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <User className="h-3.5 w-3.5" />
                <span>Personal Profile</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">Name:</span>
                <span className="text-white font-bold">{formData.personalInfo.fullName}</span>
                <span className="text-slate-500">Gender / Blood:</span>
                <span className="text-white">{formData.personalInfo.gender} • {formData.personalInfo.bloodGroup}</span>
              </div>
            </div>

            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Phone className="h-3.5 w-3.5" />
                <span>Contact Details</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">Phone:</span>
                <span className="text-white font-mono">{formData.contactInfo.phone}</span>
                <span className="text-slate-500">City:</span>
                <span className="text-white">{formData.contactInfo.city}</span>
              </div>
            </div>

            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Heart className="h-3.5 w-3.5" />
                <span>Clinical Summary</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <p><span className="text-slate-500">Allergies:</span> {formData.healthInfo.allergies || 'None'}</p>
                <p><span className="text-slate-500">Meds:</span> {formData.healthInfo.medications || 'None'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="registration-steps-container" className="space-y-4 text-left">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center">
            <button
              id={`btn-reg-step-${idx}`}
              type="button"
              onClick={() => goToStep(idx)}
              className={`flex items-center gap-1 transition-all cursor-pointer ${
                idx <= currentStep ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <div className={`
                flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold
                ${idx < currentStep ? 'bg-emerald-500 text-slate-950' :
                  idx === currentStep ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400' :
                  'bg-slate-800 text-slate-400'}
              `}>
                {idx < currentStep ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="text-[9px] font-bold hidden sm:inline">{step.title}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`
                w-4 h-0.5 mx-1
                ${idx < currentStep ? 'bg-emerald-500' : 'bg-slate-800'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[220px]">
        <div className="mb-3">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            {steps[currentStep].title} Details
          </h3>
          <p className="text-[11px] text-slate-400">
            {steps[currentStep].description}
          </p>
        </div>

        {renderStepContent()}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <button
          id="btn-reg-prev"
          type="button"
          onClick={() => {
            if (currentStep > 0) {
              goToStep(currentStep - 1);
            } else if (onBack) {
              onBack();
            }
          }}
          className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>

        <button
          id="btn-reg-next"
          type="button"
          onClick={() => {
            if (currentStep === steps.length - 1) {
              handleSubmit();
            } else if (validateStep(currentStep)) {
              goToStep(currentStep + 1);
            } else {
              setError('Please complete the required fields.');
            }
          }}
          disabled={isLoading}
          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : currentStep === steps.length - 1 ? (
            <>
              Register EHR Vault <CheckCircle2 className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Next Step <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

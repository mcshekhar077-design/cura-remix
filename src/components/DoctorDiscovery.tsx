import React, { useState, useCallback, useMemo } from "react";
import {
  Search,
  Stethoscope,
  Star,
  StarHalf,
  Calendar,
  Video,
  MessageCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Building,
  Clock as ClockIcon,
  Star as StarIcon,
  BadgeCheck,
  MapPin as LocationIcon,
  ChevronDown,
  ChevronUp,
  Award,
  User as UserIcon,
  Bot,
  ArrowLeft
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  subSpecialties?: string[];
  qualifications: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hospital: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  distance?: number;
  consultationFee: number;
  availability: {
    days: string[];
    time: string;
    urgent?: boolean;
  };
  languages: string[];
  services: string[];
  emergencyAvailable: boolean;
  telemedicine: boolean;
  homeVisit: boolean;
  insuranceAccepted: string[];
  waitTime: string;
  image?: string;
  verified: boolean;
  awards?: string[];
  about?: string;
  affiliations?: string[];
  isFavorite?: boolean;
  isAvailable?: boolean;
  nextAvailable?: string;
  clinicPhotos?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface BookedAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: "in-person" | "telemedicine" | "home-visit";
  fee: number;
  status: "confirmed";
  createdAt: string;
}

export interface DoctorDiscoveryProps {
  patientId?: string;
  patientName?: string;
  patientConditions?: string[];
  onBookSuccess?: (appointment: BookedAppointment) => void;
  onBack?: () => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-1",
    name: "Dr. Ananya Sharma",
    specialty: "Cardiology",
    subSpecialties: ["Interventional Cardiology", "Heart Failure", "Hypertension"],
    qualifications: ["MBBS", "MD (Medicine)", "DM (Cardiology)", "FACC"],
    experience: 18,
    rating: 4.9,
    reviewCount: 342,
    hospital: "Max Super Speciality Hospital",
    address: "Saket, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110017",
    distance: 3.2,
    consultationFee: 1800,
    availability: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      time: "9:00 AM - 5:00 PM",
      urgent: true
    },
    languages: ["English", "Hindi", "Punjabi"],
    services: ["ECG", "Echocardiography", "Stress Test", "Holter Monitoring", "Cardiac CT"],
    emergencyAvailable: true,
    telemedicine: true,
    homeVisit: false,
    insuranceAccepted: ["Star Health", "HDFC Ergo", "Bajaj Allianz", "ICICI Lombard"],
    waitTime: "10-15 mins",
    verified: true,
    awards: ["Excellence in Cardiology 2023", "Best Cardiologist - Delhi NCR"],
    about: "Senior Interventional Cardiologist with 18+ years of experience. Specializes in complex coronary interventions, heart failure management, and preventive cardiology.",
    affiliations: ["Delhi Medical Association", "Cardiological Society of India"],
    isFavorite: false,
    isAvailable: true,
    nextAvailable: "Today, 10:30 AM"
  },
  {
    id: "doc-2",
    name: "Dr. Vikram Sethi",
    specialty: "Cardiology",
    subSpecialties: ["Electrophysiology", "Arrhythmia Management", "Device Therapy"],
    qualifications: ["MBBS", "MD (Medicine)", "DM (Cardiology)", "FESC"],
    experience: 22,
    rating: 4.8,
    reviewCount: 289,
    hospital: "Apollo Hospitals",
    address: "Connaught Place, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    distance: 5.7,
    consultationFee: 2000,
    availability: {
      days: ["Mon", "Wed", "Fri"],
      time: "11:00 AM - 7:00 PM"
    },
    languages: ["English", "Hindi"],
    services: ["EPS Studies", "Catheter Ablation", "Device Implantation", "Pacemaker"],
    emergencyAvailable: true,
    telemedicine: true,
    homeVisit: true,
    insuranceAccepted: ["Star Health", "ICICI Lombard", "New India", "HDFC Ergo"],
    waitTime: "20-30 mins",
    verified: true,
    awards: ["Pioneer in Electrophysiology 2022"],
    about: "Renowned Electrophysiologist specializing in complex cardiac arrhythmias, device therapies, and innovative ablation techniques.",
    affiliations: ["Heart Rhythm Society", "Indian College of Cardiology"],
    isFavorite: false,
    isAvailable: true,
    nextAvailable: "Today, 2:00 PM"
  },
  {
    id: "doc-3",
    name: "Dr. Priya Mehra",
    specialty: "Endocrinology",
    subSpecialties: ["Diabetes Management", "Thyroid Disorders", "Metabolic Health"],
    qualifications: ["MBBS", "MD (Internal Medicine)", "DM (Endocrinology)"],
    experience: 14,
    rating: 4.7,
    reviewCount: 215,
    hospital: "Fortis Hospital",
    address: "Vasant Kunj, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110070",
    distance: 4.1,
    consultationFee: 1500,
    availability: {
      days: ["Mon", "Tue", "Thu", "Sat"],
      time: "8:00 AM - 4:00 PM"
    },
    languages: ["English", "Hindi", "Spanish"],
    services: ["Glycemic Management", "CGM Monitoring", "Thyroid Ultrasound", "Metabolic Assessment"],
    emergencyAvailable: false,
    telemedicine: true,
    homeVisit: false,
    insuranceAccepted: ["Star Health", "HDFC Ergo", "Digit Insurance"],
    waitTime: "15-20 mins",
    verified: true,
    about: "Expert Endocrinologist with focus on Diabetes, Thyroid disorders, and metabolic health. Pioneer in continuous glucose monitoring.",
    affiliations: ["Endocrine Society of India", "American Diabetes Association"],
    isFavorite: false,
    isAvailable: true,
    nextAvailable: "Tomorrow, 9:30 AM"
  },
  {
    id: "doc-4",
    name: "Dr. Rajesh Khanna",
    specialty: "Internal Medicine",
    subSpecialties: ["Geriatric Medicine", "Metabolic Syndrome", "Preventive Care"],
    qualifications: ["MBBS", "MD (Internal Medicine)", "FACP"],
    experience: 25,
    rating: 4.9,
    reviewCount: 456,
    hospital: "Medanta The Medicity",
    address: "Gurugram, Haryana",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    distance: 12.3,
    consultationFee: 2200,
    availability: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      time: "10:00 AM - 6:00 PM"
    },
    languages: ["English", "Hindi", "Punjabi", "Urdu"],
    services: ["Comprehensive Health Checkup", "Preventive Medicine", "Chronic Disease Management"],
    emergencyAvailable: true,
    telemedicine: true,
    homeVisit: true,
    insuranceAccepted: ["All Major Insurances"],
    waitTime: "5-10 mins",
    verified: true,
    awards: ["Lifetime Achievement Award 2023"],
    about: "Senior Consultant with 25+ years in Internal Medicine. Specializes in comprehensive care for complex multisystem conditions and geriatric health.",
    affiliations: ["American College of Physicians", "Indian Medical Association"],
    isFavorite: false,
    isAvailable: true,
    nextAvailable: "Today, 4:30 PM"
  },
  {
    id: "doc-5",
    name: "Dr. Suresh Reddy",
    specialty: "Neurology",
    subSpecialties: ["Stroke Management", "Migraine", "Movement Disorders"],
    qualifications: ["MBBS", "MD (Neurology)", "DM (Neurology)", "FAN"],
    experience: 16,
    rating: 4.6,
    reviewCount: 178,
    hospital: "AIIMS Hospital",
    address: "Ansari Nagar, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110029",
    distance: 6.8,
    consultationFee: 1600,
    availability: {
      days: ["Tue", "Thu", "Sat"],
      time: "9:00 AM - 3:00 PM"
    },
    languages: ["English", "Hindi", "Telugu"],
    services: ["EEG", "MRI Interpretation", "Stroke Rehabilitation", "Botulinum Toxin Therapy"],
    emergencyAvailable: true,
    telemedicine: true,
    homeVisit: false,
    insuranceAccepted: ["Star Health", "New India", "Bajaj Allianz"],
    waitTime: "25-35 mins",
    verified: true,
    about: "Dedicated Neurologist with special interest in stroke management, migraine, and movement disorders.",
    affiliations: ["Indian Academy of Neurology", "World Stroke Organization"],
    isFavorite: false,
    isAvailable: false,
    nextAvailable: "Next Tuesday, 11:00 AM"
  },
  {
    id: "doc-6",
    name: "Dr. Meera Iyer",
    specialty: "Gastroenterology",
    subSpecialties: ["Hepatology", "Inflammatory Bowel Disease", "Liver Disease"],
    qualifications: ["MBBS", "MD (Medicine)", "DM (Gastroenterology)", "FACG"],
    experience: 13,
    rating: 4.8,
    reviewCount: 203,
    hospital: "Sir Ganga Ram Hospital",
    address: "Rajinder Nagar, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110060",
    distance: 2.9,
    consultationFee: 1700,
    availability: {
      days: ["Mon", "Wed", "Fri"],
      time: "10:00 AM - 6:00 PM"
    },
    languages: ["English", "Hindi", "Tamil"],
    services: ["Endoscopy", "Colonoscopy", "ERCP", "Liver Biopsy"],
    emergencyAvailable: false,
    telemedicine: true,
    homeVisit: false,
    insuranceAccepted: ["Star Health", "HDFC Ergo", "ICICI Lombard"],
    waitTime: "15-20 mins",
    verified: true,
    about: "Gastroenterologist specializing in advanced endoscopic procedures, hepatology, and inflammatory bowel disease.",
    affiliations: ["American College of Gastroenterology", "Indian Society of Gastroenterology"],
    isFavorite: false,
    isAvailable: true,
    nextAvailable: "Tomorrow, 2:30 PM"
  }
];

// ============================================
// SUB-COMPONENTS
// ============================================

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <StarIcon key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />;
        } else if (i === fullStars && hasHalf) {
          return <StarHalf key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />;
        } else {
          return <StarIcon key={i} className="w-3.5 h-3.5 text-gray-600" />;
        }
      })}
    </div>
  );
};

const DoctorCard: React.FC<{
  doctor: DoctorProfile;
  onSelect: (doctor: DoctorProfile) => void;
  onToggleFavorite: (id: string) => void;
  isMatch?: boolean;
}> = ({ doctor, onSelect, onToggleFavorite, isMatch }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div id={`doctor-card-${doctor.id}`} className={`bg-slate-900/80 border rounded-3xl p-5 transition-all hover:shadow-xl ${
      isMatch ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/20' : 'border-slate-800 hover:border-blue-500/40'
    }`}>
      {/* Match badge */}
      {isMatch && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-bold w-fit">
          <Sparkles className="h-3 w-3" /> AI Recommended Match
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 ${
          isMatch ? 'from-emerald-600 to-teal-600' : 'from-blue-600 to-indigo-600'
        }`}>
          {doctor.name.split(" ").map(n => n[0]).join("")}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">{doctor.name}</h3>
                {doctor.verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-400" />
                )}
                {doctor.isAvailable && (
                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    Available
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-400 font-bold">{doctor.specialty}</span>
                {doctor.subSpecialties && doctor.subSpecialties.length > 0 && (
                  <span className="text-slate-400 text-xs">
                    • {doctor.subSpecialties.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <button
              id={`btn-fav-${doctor.id}`}
              type="button"
              onClick={() => onToggleFavorite(doctor.id)}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label={doctor.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`h-5 w-5 ${doctor.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs">
            <div className="flex items-center gap-1">
              <StarRating rating={doctor.rating} />
              <span className="font-bold text-slate-200">{doctor.rating}</span>
              <span className="text-slate-500">({doctor.reviewCount} reviews)</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{doctor.experience} years exp.</span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <Building className="h-3.5 w-3.5" />
            <span>{doctor.hospital}</span>
            <span className="text-slate-600">•</span>
            <LocationIcon className="h-3.5 w-3.5" />
            <span>{doctor.distance?.toFixed(1)} km</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {doctor.emergencyAvailable && (
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Emergency
          </span>
        )}
        {doctor.telemedicine && (
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
            <Video className="h-3 w-3" /> Telemedicine
          </span>
        )}
        {doctor.homeVisit && (
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
            <UserIcon className="h-3 w-3" /> Home Visit
          </span>
        )}
        {doctor.awards && doctor.awards.length > 0 && (
          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
            <Award className="h-3 w-3" /> Awarded
          </span>
        )}
        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[10px] font-medium flex items-center gap-1">
          <ClockIcon className="h-3 w-3" /> {doctor.waitTime}
        </span>
      </div>

      {/* Expandable details */}
      <button
        id={`btn-expand-${doctor.id}`}
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 py-1 border-t border-slate-800 pt-2 cursor-pointer"
      >
        {expanded ? (
          <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
        ) : (
          <>Show More Details <ChevronDown className="h-3.5 w-3.5" /></>
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm border-t border-slate-800 pt-3">
          {doctor.about && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{doctor.about}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualifications</h4>
            <ul className="mt-1 space-y-0.5 text-xs text-slate-300">
              {doctor.qualifications.map((q, i) => (
                <li key={i}>• {q}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Services Offered</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {doctor.services.map((service, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-800 rounded-full text-xs text-slate-300">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insurance Accepted</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {doctor.insuranceAccepted.map((ins, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                  {ins}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Fee:</span>
            <span className="font-bold text-white">₹{doctor.consultationFee}</span>
            <span className="text-xs text-slate-500">/ consult</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <ClockIcon className="h-3 w-3" />
            <span>Next: {doctor.nextAvailable || 'Check availability'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            id={`btn-book-${doctor.id}`}
            type="button"
            onClick={() => onSelect(doctor)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5" />
            Book
          </button>
          <button
            id={`btn-video-${doctor.id}`}
            type="button"
            onClick={() => onSelect(doctor)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Video Consultation"
            aria-label="Start video consultation"
          >
            <Video className="h-4 w-4" />
          </button>
          <button
            id={`btn-chat-${doctor.id}`}
            type="button"
            onClick={() => onSelect(doctor)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Chat"
            aria-label="Send message"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function DoctorDiscovery({
  patientId = "PAT-1001",
  patientName = "Rajesh Kumar",
  patientConditions = ["Stage 1 Hypertension", "Pre-Diabetes (HbA1c 6.6%)", "Mild Asthma"],
  onBookSuccess,
  onBack
}: DoctorDiscoveryProps): React.ReactElement {
  const [doctors, setDoctors] = useState<DoctorProfile[]>(MOCK_DOCTORS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "fee" | "distance" | "availability">("rating");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<"in-person" | "telemedicine" | "home-visit">("in-person");
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAIMatch, setShowAIMatch] = useState<boolean>(true);

  const specialties = useMemo(() => {
    const unique = new Set(doctors.map(d => d.specialty));
    return ["all", ...Array.from(unique)];
  }, [doctors]);

  const cities = useMemo(() => {
    const unique = new Set(doctors.map(d => d.city));
    return ["all", ...Array.from(unique)];
  }, [doctors]);

  const getAIMatchScore = useCallback((doctor: DoctorProfile): number => {
    let score = 0;
    const conditions = patientConditions.map(c => c.toLowerCase());

    const specialtyKeywords: Record<string, string[]> = {
      cardiology: ["hypertension", "heart", "bp", "blood pressure", "cardio"],
      endocrinology: ["diabetes", "hba1c", "sugar", "glucose", "thyroid"],
      neurology: ["migraine", "stroke", "headache", "neuro"],
      pulmonology: ["asthma", "breathing", "respiratory", "lung"],
      gastroenterology: ["liver", "stomach", "digestive", "ibd"]
    };

    const doctorSpecialty = doctor.specialty.toLowerCase();
    const doctorSubSpecialties = doctor.subSpecialties?.map(s => s.toLowerCase()) || [];

    for (const condition of conditions) {
      if (doctorSpecialty.includes(condition) || condition.includes(doctorSpecialty)) {
        score += 15;
      }

      for (const sub of doctorSubSpecialties) {
        if (sub.includes(condition) || condition.includes(sub)) {
          score += 10;
        }
      }

      for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        if (doctorSpecialty.includes(specialty) || doctorSubSpecialties.some(s => s.includes(specialty))) {
          for (const keyword of keywords) {
            if (condition.includes(keyword)) {
              score += 8;
              break;
            }
          }
        }
      }
    }

    if (doctor.experience > 15) score += 5;
    else if (doctor.experience > 10) score += 3;

    if (doctor.rating >= 4.8) score += 5;
    else if (doctor.rating >= 4.5) score += 3;

    if (doctor.isAvailable) score += 5;
    if (doctor.emergencyAvailable) score += 3;
    if (doctor.telemedicine) score += 3;

    return score;
  }, [patientConditions]);

  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = [...doctors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.specialty.toLowerCase().includes(query) ||
        d.hospital.toLowerCase().includes(query) ||
        d.city.toLowerCase().includes(query) ||
        d.subSpecialties?.some(s => s.toLowerCase().includes(query))
      );
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(d => d.specialty === selectedSpecialty);
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter(d => d.city === selectedCity);
    }

    filtered = filtered.filter(d =>
      d.consultationFee >= priceRange[0] && d.consultationFee <= priceRange[1]
    );

    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        filtered.sort((a, b) => b.experience - a.experience);
        break;
      case "fee":
        filtered.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case "distance":
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case "availability":
        filtered.sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return 0;
        });
        break;
    }

    if (showAIMatch) {
      return filtered.map(d => ({
        ...d,
        _aiScore: getAIMatchScore(d)
      })).sort((a, b) => ((b as any)._aiScore || 0) - ((a as any)._aiScore || 0));
    }

    return filtered;
  }, [doctors, searchQuery, selectedSpecialty, selectedCity, priceRange, sortBy, showAIMatch, getAIMatchScore]);

  const aiRecommended = useMemo(() => {
    return filteredAndSortedDoctors
      .filter(d => ((d as any)._aiScore && (d as any)._aiScore > 20))
      .slice(0, 3);
  }, [filteredAndSortedDoctors]);

  const handleToggleFavorite = useCallback((doctorId: string) => {
    setDoctors(prev =>
      prev.map(d => (d.id === doctorId ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  }, []);

  const handleBookAppointment = useCallback((doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);
    setAppointmentTime("10:00");
    setAppointmentType(doctor.telemedicine ? "telemedicine" : "in-person");
    setShowBookingModal(true);
  }, []);

  const handleConfirmAppointment = useCallback(async () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const appointment: BookedAppointment = {
      id: `appt-${Date.now()}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId,
      patientName,
      date: appointmentDate,
      time: appointmentTime,
      type: appointmentType,
      fee: selectedDoctor.consultationFee,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    setIsLoading(false);
    setShowBookingModal(false);

    if (onBookSuccess) {
      onBookSuccess(appointment);
    }
  }, [selectedDoctor, appointmentDate, appointmentTime, appointmentType, patientId, patientName, onBookSuccess]);

  return (
    <div id="doctor-discovery-container" className="space-y-6">
      {/* Header Banner */}
      <div id="doctor-discovery-header" className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/40 p-5 rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-500/30 shrink-0">
              <Stethoscope className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  AI-Powered Discovery
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Personalized Matching
                </span>
                <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {filteredAndSortedDoctors.length} Doctors Available
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                AI Doctor Discovery & Appointment Hub
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Find the best specialists matched to your health profile, location, and preferences.
                {showAIMatch && aiRecommended.length > 0 && ` ${aiRecommended.length} AI-recommended matches for your conditions.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-toggle-ai-match"
              type="button"
              onClick={() => setShowAIMatch(!showAIMatch)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showAIMatch
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bot className="h-4 w-4" />
              {showAIMatch ? 'AI Match ON' : 'AI Match OFF'}
            </button>
            {onBack && (
              <button
                id="btn-back-discovery"
                type="button"
                onClick={onBack}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div id="doctor-search-bar" className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="input-doctor-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors by name, specialty, hospital, or condition..."
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              aria-label="Search doctors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              id="select-specialty-filter"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-sm px-3 py-3 rounded-xl focus:outline-none focus:border-blue-500 min-w-[140px]"
              aria-label="Filter by specialty"
            >
              {specialties.map(s => (
                <option key={s} value={s}>
                  {s === "all" ? "All Specialties" : s}
                </option>
              ))}
            </select>

            <select
              id="select-sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-white text-sm px-3 py-3 rounded-xl focus:outline-none focus:border-blue-500 min-w-[120px]"
              aria-label="Sort results"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee">Lowest Fee</option>
              <option value="distance">Nearest</option>
              <option value="availability">Availability</option>
            </select>

            <button
              id="btn-toggle-view-mode"
              type="button"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            >
              {viewMode === "grid" ? "☰" : "⊞"}
            </button>

            <button
              id="btn-toggle-filters"
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="select-city-filter" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                City
              </label>
              <select
                id="select-city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {cities.map(c => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Cities" : c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="range-fee-filter" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Max Fee: ₹{priceRange[1]}
              </label>
              <input
                id="range-fee-filter"
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
                className="w-full accent-blue-500 cursor-pointer"
                aria-label="Maximum consultation fee"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Services
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                  Telemedicine
                </span>
                <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold">
                  Emergency
                </span>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold">
                  Home Visit
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end text-sm">
              <span className="text-slate-400">
                <span className="font-bold text-white">{filteredAndSortedDoctors.length}</span> doctors found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendations Banner */}
      {showAIMatch && aiRecommended.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border-2 border-emerald-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">AI Recommended Matches</h3>
                <p className="text-xs text-slate-400">
                  Based on your conditions: {patientConditions.join(", ")}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
              {aiRecommended.length} Top Matches
            </span>
          </div>
        </div>
      )}

      {/* Doctor Cards */}
      <div className={`grid ${viewMode === "grid" ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {filteredAndSortedDoctors.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-3xl text-center col-span-full">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-white">No Doctors Found</h3>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          filteredAndSortedDoctors.map((doctor) => {
            const aiScore = (doctor as any)._aiScore || 0;
            const isMatch = showAIMatch && aiScore > 25;
            return (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onSelect={handleBookAppointment}
                onToggleFavorite={handleToggleFavorite}
                isMatch={isMatch}
              />
            );
          })
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div id="modal-appointment-booking" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Book Appointment</h3>
                <p className="text-xs text-slate-400">with {selectedDoctor.name}</p>
              </div>
              <button
                id="btn-close-booking-modal"
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                aria-label="Close booking modal"
              >
                ✕
              </button>
            </div>

            {/* Doctor Info */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black">
                  {selectedDoctor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-white">{selectedDoctor.name}</h4>
                  <p className="text-xs text-slate-400">{selectedDoctor.specialty}</p>
                  <p className="text-xs text-slate-500">{selectedDoctor.hospital}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Appointment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDoctor.telemedicine && (
                    <button
                      id="btn-type-telemed"
                      type="button"
                      onClick={() => setAppointmentType("telemedicine")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        appointmentType === "telemedicine"
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Video className="h-4 w-4 mx-auto mb-1" />
                      Video
                    </button>
                  )}
                  <button
                    id="btn-type-inperson"
                    type="button"
                    onClick={() => setAppointmentType("in-person")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appointmentType === "in-person"
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <UserIcon className="h-4 w-4 mx-auto mb-1" />
                    In-Person
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="input-appointment-date" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  id="input-appointment-date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="select-appointment-time" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Time
                </label>
                <select
                  id="select-appointment-time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  {[
                    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                    "15:00", "15:30", "16:00", "16:30", "17:00"
                  ].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fee & Insurance */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-400">Consultation Fee</span>
                <p className="font-bold text-white">₹{selectedDoctor.consultationFee}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Insurance</span>
                <p className="text-xs text-emerald-400 font-bold">
                  {selectedDoctor.insuranceAccepted.slice(0, 2).join(", ")}
                  {selectedDoctor.insuranceAccepted.length > 2 && " +"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                id="btn-cancel-booking"
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-booking"
                type="button"
                onClick={handleConfirmAppointment}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

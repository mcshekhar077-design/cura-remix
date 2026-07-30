import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  ArrowLeft,
  Sparkles,
  Search,
  Check,
  Star,
  Users,
  MapPin,
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  Bookmark,
  Shield,
  Zap,
  Info,
  ChevronRight,
  BookOpen,
  ShoppingBag,
  Terminal,
  Globe,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

interface Practitioner {
  id: string;
  name: string;
  system: "Ayurveda" | "Homeopathy" | "Unani" | "Siddha" | "Yoga & Naturopathy";
  experience: number;
  rating: number;
  reviewsCount: number;
  specialization: string[];
  channels: ("Online" | "In-Clinic")[];
  imageEmoji: string;
  location: string;
}

interface WellnessCenter {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  reviewsCount: number;
  packages: string[];
  desc: string;
  imageEmoji: string;
}

interface YogaCenter {
  id: string;
  name: string;
  style: string;
  location: string;
  rating: number;
  reviewsCount: number;
  description: string;
  sessions: string[];
  imageEmoji: string;
}

interface Remedy {
  id: string;
  name: string;
  system: string;
  indications: string;
  ingredients: string;
  usage: string;
  imageEmoji: string;
}

export function AyushWellness({ onBackToLanding, onNavigateToAllopathic }: { onBackToLanding: () => void; onNavigateToAllopathic?: () => void }) {
  // Navigation Tabs inside AYUSH
  const [activeTab, setActiveTab] = useState<"explore" | "prakriti" | "register" | "remedies" | "grid" | "ai-engines">("explore");
  
  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("All");

  // Ayush Grid Integration Sandbox States
  const [abhaIdInput, setAbhaIdInput] = useState("14-8841-3320-1102");
  const [abhaAddressInput, setAbhaAddressInput] = useState("rajeshkumar@abha");
  const [verifiedAbhaData, setVerifiedAbhaData] = useState<any>(null);
  const [pracLicenseInput, setPracLicenseInput] = useState("CCIM-AY-2023-8841");
  const [verifiedPracData, setVerifiedPracData] = useState<any>(null);
  const [selectedNamasteCategory, setSelectedNamasteCategory] = useState<string>("All");
  const [namasteSearch, setNamasteSearch] = useState("");
  const [bhashiniInputText, setBhashiniInputText] = useState("Take two tablets of Ashwagandha daily with warm milk before bedtime.");
  const [bhashiniTargetLang, setBhashiniTargetLang] = useState("Hindi");
  const [bhashiniOutputText, setBhashiniOutputText] = useState("");
  const [bhashiniLoading, setBhashiniLoading] = useState(false);
  const [abhaLoading, setAbhaLoading] = useState(false);
  const [licenseLoading, setLicenseLoading] = useState(false);

  // VaidhLLaMA & OOREP Model Sandbox States
  const [vaidhQueryInput, setVaidhQueryInput] = useState("Analyze symptoms: Chronic indigestion with bloating, acidity, and a feeling of heaviness after meals, especially in cold weather.");
  const [vaidhSystemPrompt, setVaidhSystemPrompt] = useState(
    `You are an Ayurvedic AI assistant (VaidhLLaMA-3.2-3B-Instruct).\n` +
    `Analyze the following symptoms and determine the Prakriti or Dosha imbalance.\n` +
    `Provide: 1) Prakriti/Dosha analysis, 2) Dietary recommendation (Ahara), 3) Lifestyle tips (Vihara), 4) Disclaimer.`
  );
  const [vaidhResponseText, setVaidhResponseText] = useState<string>("");
  const [vaidhLoading, setVaidhLoading] = useState(false);
  const [gpuVramUsage, setGpuVramUsage] = useState(0); // in GB
  const [tokensPerSec, setTokensPerSec] = useState(0);
  const [vaidhDeploymentMode, setVaidhDeploymentMode] = useState<"local" | "api">("local");

  const [oorepSymptomInput, setOorepSymptomInput] = useState("chills, thirstlessness, deep throat pain, pain worse from cold swallow");
  const [oorepRemedyResults, setOorepRemedyResults] = useState<any[]>([]);
  const [oorepMcpLogs, setOorepMcpLogs] = useState<string[]>([]);
  const [oorepLoading, setOorepLoading] = useState(false);
  const [selectedOorepRemedy, setSelectedOorepRemedy] = useState<any>(null);

  // YogIC, IbnSina & Agastya Model Sandbox States
  const [aiActiveSystem, setAiActiveSystem] = useState<"ayurveda" | "yoga" | "unani" | "siddha" | "homeopathy">("ayurveda");
  const [yogicQueryInput, setYogicQueryInput] = useState("Assess alignment and breathing rhythm: Doing Tadasana with shallow chest breathing, elevated shoulders, and minor balance shakiness on the left side.");
  const [yogicSystemPrompt, setYogicSystemPrompt] = useState(
    `You are a Yoga and Naturopathy AI tutor (YogIC-Biofeedback-2.1-7B).\n` +
    `Analyze the posture description and breathing pattern.\n` +
    `Provide: 1) Alignment Corrections, 2) Pranayama recommendations for breath synchronization, 3) Naturopathy advice (hydrotherapy or diet).`
  );
  const [yogicResponseText, setYogicResponseText] = useState<string>("");
  const [yogicLoading, setYogicLoading] = useState(false);
  const [yogicRespRate, setYogicRespRate] = useState(0);
  const [yogicAlignmentScore, setYogicAlignmentScore] = useState(0);

  const [unaniQueryInput, setUnaniQueryInput] = useState("Analyze temperament (Mizaj) and symptoms: Feeling excessively hot even in mild weather, constant bitter taste in the mouth, yellow complexion, and quick temper with restless sleep.");
  const [unaniSystemPrompt, setUnaniSystemPrompt] = useState(
    `You are an expert Unani medicine AI physician (IbnSina-Unani-7B).\n` +
    `Analyze the symptoms according to the four humors (Akhlat: Dam/Blood, Balgham/Phlegm, Safra/Yellow Bile, Sauda/Black Bile) and temperament (Mizaj).\n` +
    `Provide: 1) Mizaj/Humoral evaluation, 2) Dietary corrections (Ilaj-bil-Ghiya), 3) Lifestyle recommendations (Asbab-e-Sittah-Zarooriyah).`
  );
  const [unaniResponseText, setUnaniResponseText] = useState<string>("");
  const [unaniLoading, setUnaniLoading] = useState(false);
  const [unaniHumorSafra, setUnaniHumorSafra] = useState(25);
  const [unaniHumorDam, setUnaniHumorDam] = useState(25);
  const [unaniHumorBalgham, setUnaniHumorBalgham] = useState(25);
  const [unaniHumorSauda, setUnaniHumorSauda] = useState(25);

  const [siddhaQueryInput, setSiddhaQueryInput] = useState("Analyze Naadi (Pulse) and Varmam symptoms: High-pitch pulse felt beneath the index finger, severe stiffness in the shoulder joints (Kaba-Vatha aggravation), and reduced mobility in upper extremities after physical exertion.");
  const [siddhaSystemPrompt, setSiddhaSystemPrompt] = useState(
    `You are a Siddha clinical AI assistant (Agastya-Siddha-3B).\n` +
    `Evaluate the presented Naadi (Vaatham, Pitham, Kabham) and joint symptoms.\n` +
    `Provide: 1) Naadi/Mukkuttram analysis, 2) Therapeutic herb recommendations (Karpam), 3) Vital Varmam points to relieve blockages.`
  );
  const [siddhaResponseText, setSiddhaResponseText] = useState<string>("");
  const [siddhaLoading, setSiddhaLoading] = useState(false);
  const [siddhaNaadiPulseRatio, setSiddhaNaadiPulseRatio] = useState<string>("V:1, P:0, K:0");
  
  const [developerConsoleLogs, setDeveloperConsoleLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] SYSTEM: Ayush Grid Unified APIs handshake completed successfully.`,
    `[${new Date().toLocaleTimeString()}] SYSTEM: TLS v1.3 Secure gateway channel bound to endpoint: api.ayushgrid.gov.in`,
    `[${new Date().toLocaleTimeString()}] SYSTEM: Interoperable sandbox mode (v2.4-sandbox-m1) is online and active.`,
    `[${new Date().toLocaleTimeString()}] SYSTEM: Waiting for secure user trigger...`
  ]);

  const addConsoleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDeveloperConsoleLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-40)); // Keep last 40 logs
  };

  // Pre-configured Morbidity Codes mapping to NAMASTE & ICD-11 TM2
  const namasteMorbidityCodes = [
    {
      ayushName: "Amavata",
      englishName: "Rheumatoid Arthritis",
      system: "Ayurveda",
      namasteCode: "AY-AM-RA-402",
      icd11tm2Code: "SF42",
      description: "Severe joint pains associated with stiffness and toxin accumulation (Ama) in body tissues.",
      remedyRef: "🍂 Triphala Churna or Shallaki extract"
    },
    {
      ayushName: "Tamaka Swasa",
      englishName: "Bronchial Asthma",
      system: "Ayurveda",
      namasteCode: "AY-TS-BA-511",
      icd11tm2Code: "SG18",
      description: "A chronic respiratory disorder involving high breathlessness and wheezing, aggravated by cold.",
      remedyRef: "☕ Kabasura Kudineer or Agastya Haritaki"
    },
    {
      ayushName: "Madhumēha",
      englishName: "Diabetes Mellitus",
      system: "Ayurveda / Siddha",
      namasteCode: "AY-MM-DM-109",
      icd11tm2Code: "SD30",
      description: "Metabolic deficiency categorized by high urinary sweetness and persistent fatigue.",
      remedyRef: "🌿 Guduchi leaf or Bitter gourd extract"
    },
    {
      ayushName: "Kasa",
      englishName: "Bronchitis / Chronic Cough",
      system: "Ayurveda / Unani",
      namasteCode: "AY-KS-CO-202",
      icd11tm2Code: "SG11",
      description: "Cough with sputum or dry irritation from respiratory channel inflammation.",
      remedyRef: "☕ Ginger-Holy Basil infusion"
    },
    {
      ayushName: "Sheetapitta",
      englishName: "Urticaria / Skin Allergy",
      system: "Ayurveda",
      namasteCode: "AY-SP-UR-305",
      icd11tm2Code: "SK19",
      description: "Itchy red wheals/rashes on the skin surface due to Pitta-Vata imbalance.",
      remedyRef: "🍂 Neem and Haridra (Turmeric) pack"
    },
    {
      ayushName: "Granthi",
      englishName: "Fibroids / Glandular Swelling",
      system: "Ayurveda / Siddha",
      namasteCode: "AY-GR-CY-704",
      icd11tm2Code: "SL05",
      description: "Slow growing localized hard nodular or cystic growths in the muscular or glandular tissues.",
      remedyRef: "🌿 Kanchanar Guggulu tablets"
    },
    {
      ayushName: "Nazla-e-Zukaam",
      englishName: "Allergic Rhinitis / Cold",
      system: "Unani",
      namasteCode: "UN-NZ-ZK-089",
      icd11tm2Code: "SG12",
      description: "Nasal congestion, watery eyes, and frequent sneezing with high Phlegmatic (Balgham) activity.",
      remedyRef: "☕ Joshanda Herbal Tea decoction"
    },
    {
      ayushName: "Vatha Soolai",
      englishName: "Chronic Neuralgia / Myalgia",
      system: "Siddha",
      namasteCode: "SD-VS-MY-113",
      icd11tm2Code: "SF49",
      description: "Localized shooting nerve pain and intense joint aches with heavy Vata accumulation.",
      remedyRef: "☕ Kabasura Kudineer or Varma stimulation"
    }
  ];

  // BHASHINI Translation Mock Engine
  const handleBhashiniTranslate = () => {
    if (!bhashiniInputText.trim()) return;
    setBhashiniLoading(true);
    addConsoleLog(`POST /api/v1/bhashini/translate HTTP/1.1 (Payload: ${bhashiniInputText.substring(0, 30)}...)`);
    
    setTimeout(() => {
      let output = "";
      const textLower = bhashiniInputText.toLowerCase();
      
      if (bhashiniTargetLang === "Sanskrit") {
        output = "तैलमर्दनं कुरुत प्रतिदिनम्। अश्वगन्धाचूर्णं दुग्धेन सह पिबत।";
      } else if (bhashiniTargetLang === "Hindi") {
        if (textLower.includes("ashwagandha")) {
          output = "प्रतिदिन सोने से पहले गर्म दूध के साथ अश्वगंधा की दो गोलियां लें।";
        } else {
          output = "कृपया डॉक्टर के निर्देशानुसार समय पर इस पारंपरिक औषधि का सेवन करें।";
        }
      } else if (bhashiniTargetLang === "Tamil") {
        output = "தினமும் படுக்கைக்குச் செல்லும் முன் வெதுவெதுப்பான பாலுடன் இரண்டு அஸ்வகந்தா மாத்திரைகளை உட்கொள்ளவும்.";
      } else if (bhashiniTargetLang === "Telugu") {
        output = "ప్రతిరోజూ పడుకునే ముందు గోరువెచ్చని పాలతో రెండు అశ్వగంధ మాత్రలు తీసుకోండి.";
      } else if (bhashiniTargetLang === "Bengali") {
        output = "প্রতিদিন রাতে ঘুমানোর আগে হালকা গরম দুধের সাথে দুটি অশ্বগন্ধা ট্যাবলেট খান।";
      } else {
        output = bhashiniInputText; // Fallback
      }

      setBhashiniOutputText(output);
      setBhashiniLoading(false);
      addConsoleLog(`Response 200 OK | BHASHINI Translation Node #3 returned successfully. Target: [${bhashiniTargetLang}]`);
    }, 800);
  };

  // ABHA ID Verification Mock
  const handleAbhaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaIdInput.trim()) return;
    setAbhaLoading(true);
    addConsoleLog(`POST /api/v2/citizen/abha/verify HTTP/1.1 (Payload: {"abha_id":"${abhaIdInput}"})`);

    setTimeout(() => {
      // Create a mock verification
      const isCustomId = abhaIdInput.includes("-") || abhaIdInput.length > 8;
      const formattedId = isCustomId ? abhaIdInput : "14-8841-3320-1102";
      
      setVerifiedAbhaData({
        abhaId: formattedId,
        abhaAddress: abhaAddressInput.includes("@abha") ? abhaAddressInput : `${abhaAddressInput}@abha`,
        fullName: "Rajesh Kumar Sharma",
        gender: "Male",
        dob: "15-Aug-1992",
        photoEmoji: "👨",
        mobile: "+91 98765 43210",
        kycStatus: "KYC Verified (Aadhaar OTP Sync)",
        abdmVaultId: "ABDM-VAULT-220491",
        linkedRecords: 3
      });

      setAbhaLoading(false);
      addConsoleLog(`Response 200 OK | Citizen verified in ABDM central registry. Name: Rajesh Kumar Sharma. Token Issued.`);
    }, 1000);
  };

  // Generate a random ABHA ID
  const handleAbhaGenerate = () => {
    setAbhaLoading(true);
    addConsoleLog(`POST /api/v2/citizen/abha/generate HTTP/1.1 (Requesting fresh ID allocation)`);

    setTimeout(() => {
      const names = [
        { first: "Suresh", last: "Patel", gender: "Male", emoji: "👨" },
        { first: "Anjali", last: "Nair", gender: "Female", emoji: "👩" },
        { first: "Kabir", last: "Mehta", gender: "Male", emoji: "👨" },
        { first: "Meenakshi", last: "Iyer", gender: "Female", emoji: "👩" }
      ];
      const selectedPerson = names[Math.floor(Math.random() * names.length)];
      
      // Generate some random numbers
      const part1 = Math.floor(10 + Math.random() * 90);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      const part3 = Math.floor(1000 + Math.random() * 9000);
      const part4 = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `${part1}-${part2}-${part3}-${part4}`;
      const generatedAddress = `${selectedPerson.first.toLowerCase()}${selectedPerson.last.toLowerCase()}@abha`;

      setAbhaIdInput(generatedId);
      setAbhaAddressInput(generatedAddress);
      
      setVerifiedAbhaData({
        abhaId: generatedId,
        abhaAddress: generatedAddress,
        fullName: `${selectedPerson.first} ${selectedPerson.last}`,
        gender: selectedPerson.gender,
        dob: "20-May-1995",
        photoEmoji: selectedPerson.emoji,
        mobile: "+91 99002 88411",
        kycStatus: "Instant KYC Approved (Gov Sandbox OTP)",
        abdmVaultId: `ABDM-VAULT-${Math.floor(100000 + Math.random() * 900000)}`,
        linkedRecords: 0
      });

      setAbhaLoading(false);
      addConsoleLog(`Response 201 Created | Assigned ABHA ID: ${generatedId}. ABHA Address: ${generatedAddress}.`);
    }, 1100);
  };

  // Verify Practitioner License
  const handlePracVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pracLicenseInput.trim()) return;
    setLicenseLoading(true);
    addConsoleLog(`GET /api/v2/registry/practitioner/verify?license_number=${pracLicenseInput} HTTP/1.1`);

    setTimeout(() => {
      let doctorData = null;

      if (pracLicenseInput.toUpperCase() === "CCIM-AY-2023-8841") {
        doctorData = {
          name: "Dr. Priya Sharma",
          system: "Ayurveda",
          degree: "BAMS (Bachelor of Ayurvedic Medicine & Surgery), MD Ayurveda",
          university: "Kerala University of Health Sciences",
          year: "2012",
          stateBoard: "Travancore-Cochin Medical Council",
          licenseStatus: "ACTIVE & VERIFIED",
          registryIndex: "NMC-AYUR-110294",
          lastSync: "03-Jul-2026"
        };
      } else if (pracLicenseInput.toUpperCase() === "CCH-HM-2025-4421") {
        doctorData = {
          name: "Dr. Anil Kumar",
          system: "Homeopathy",
          degree: "BHMS (Bachelor of Homoeopathic Medicine and Surgery)",
          university: "Mumbai Homoeopathic Medical College",
          year: "2016",
          stateBoard: "Maharashtra Council of Homoeopathy",
          licenseStatus: "ACTIVE & VERIFIED",
          registryIndex: "NMC-HOME-554109",
          lastSync: "03-Jul-2026"
        };
      } else if (pracLicenseInput.toUpperCase() === "CCIM-SD-2022-1092") {
        doctorData = {
          name: "Dr. Meera Reddy",
          system: "Siddha",
          degree: "BSMS (Bachelor of Siddha Medicine and Surgery)",
          university: "The Tamil Nadu Dr. M.G.R. Medical University",
          year: "2009",
          stateBoard: "Tamil Nadu Siddha Medical Council",
          licenseStatus: "ACTIVE & VERIFIED",
          registryIndex: "NMC-SIDD-998311",
          lastSync: "03-Jul-2026"
        };
      } else {
        // Generate a random valid response based on input format
        doctorData = {
          name: "Dr. Rajeshwari V. Swamy",
          system: "Yoga & Naturopathy",
          degree: "BNYS (Bachelor of Naturopathy & Yogic Sciences)",
          university: "SDM College of Naturopathy & Yogic Sciences",
          year: "2018",
          stateBoard: "Karnataka Board of Ayurvedic & Unani Practitioners",
          licenseStatus: "ACTIVE & RECORD FOUND",
          registryIndex: `NMC-NAT-${Math.floor(100000 + Math.random() * 900000)}`,
          lastSync: "03-Jul-2026"
        };
      }

      setVerifiedPracData(doctorData);
      setLicenseLoading(false);
      addConsoleLog(`Response 200 OK | Practitioner match found. Central Register index: ${doctorData.registryIndex}. Signed XML Credential emitted.`);
    }, 900);
  };

  // Submit VaidhLLaMA query
  const handleVaidhQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaidhQueryInput.trim()) return;
    setVaidhLoading(true);
    setVaidhResponseText("");
    
    // Simulate GPU memory loading if first run
    let timer = 0;
    const interval = setInterval(() => {
      timer += 1;
      if (vaidhDeploymentMode === "local") {
        setGpuVramUsage(Math.min(5.4, +(timer * 0.9).toFixed(1)));
      } else {
        setGpuVramUsage(0);
      }
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      let response = "";
      const q = vaidhQueryInput.toLowerCase();
      
      if (q.includes("indigestion") || q.includes("bloating") || q.includes("heaviness")) {
        response = `### 🌿 VaidhLLaMA Clinical Analysis\n\n` +
          `#### 1. Dosha Imbalance (Vikriti) Analysis\n` +
          `The symptoms point to an imbalance in **Kapha-Vata** Dosha, which is slowing down your metabolic fire (**Agni**), resulting in **Agnimandya** (weak digestion) and bloating (**Anaha**). The cold weather further aggravates Vata and Kapha, causing constriction and sluggishness in the gastrointestinal tract.\n\n` +
          `#### 2. Dietary Recommendations (Ahara)\n` +
          `*   **Do's**: Consume warm, light, and easily digestible foods. Infuse cooking with digestive spices like Ginger (**Shunthi**), Cumin (**Jeeraka**), Fennel (**Mishreya**), and Black Pepper (**Maricha**). Drink warm water throughout the day.\n` +
          `*   **Don'ts**: Strictly avoid cold beverages, heavy deep-fried food, raw salads, and cold curds (**Dahi**), especially in the evening.\n\n` +
          `#### 3. Lifestyle Tips (Vihara)\n` +
          `*   Engage in dynamic physical activity (e.g., 20 minutes of sun salutations or **Surya Namaskar**).\n` +
          `*   Avoid sleeping immediately after meals; walk at least 100 steps (**Satapadi**).\n` +
          `*   Keep your abdomen and limbs warm during cold snaps.\n\n` +
          `#### 4. Classical Formulation References\n` +
          `*   **Hingvashtak Churna** (1/2 tsp with warm water before meals) to pacify Vata in the GI tract.\n` +
          `*   **Trikatu Churna** to rekindle Agni.\n\n` +
          `*⚠️ Disclaimer: VaidhLLaMA-3.2-3B-Instruct is an open-source clinical reference model intended for research and educational purposes. Always consult a certified Ayurvedic practitioner (Vaidya) before starting any medical regime.*`;
      } else if (q.includes("burning") || q.includes("acidity") || q.includes("irritated") || q.includes("pitta")) {
        response = `### 🌿 VaidhLLaMA Clinical Analysis\n\n` +
          `#### 1. Dosha Imbalance (Vikriti) Analysis\n` +
          `The symptoms exhibit a clear aggravation of **Pitta Dosha** (specifically **Pachaka Pitta** in the gut and **Alocaka/Sadhaka Pitta** in the nervous system). The burning sensation (**Daha**) in the stomach and acid reflux (**Amlapitta**) indicate excess heat. Pitta's liquid and sharp qualities have increased, causing irritability and hunger-induced headaches (**Pitta Shirasoola**).\n\n` +
          `#### 2. Dietary Recommendations (Ahara)\n` +
          `*   **Do's**: Opt for cooling, sweet, bitter, and astringent tastes. Favor Ghee (**Ghruta**), coconut water, mint, sweet pomegranates, and soaked raisins. Eat on time; do not skip meals.\n` +
          `*   **Don'ts**: Strictly avoid hot green chilies, garlic, fermented foods (like pickles and vinegar), fried snacks, and caffeine/alcohol which inflame the gut lining.\n\n` +
          `#### 3. Lifestyle Tips (Vihara)\n` +
          `*   Practice cooling pranayama (e.g., **Sheetali** or **Sitkari**).\n` +
          `*   Avoid exposure to direct hot midday sun. Apply sandalwood paste or rose water to the temples.\n` +
          `*   Practice mindfulness or walk in nature under moonlight to cool down the nervous system.\n\n` +
          `#### 4. Classical Formulation References\n` +
          `*   **Sutashekhar Ras** (1 tablet twice a day with warm water or ghee).\n` +
          `*   **Avipattikar Churna** (1 tsp at bedtime with warm water) to clear excess Pitta.\n\n` +
          `*⚠️ Disclaimer: VaidhLLaMA-3.2-3B-Instruct is an open-source clinical reference model intended for research and educational purposes. Always consult a certified Ayurvedic practitioner (Vaidya) before starting any medical regime.*`;
      } else {
        response = `### 🌿 VaidhLLaMA Clinical Analysis\n\n` +
          `#### 1. Dosha Imbalance (Vikriti) Analysis\n` +
          `Based on your symptoms: "${vaidhQueryInput}", there is a primary involvement of **Vata** and **Pitta** dosha channels (**Srotas**). The light and unstable qualities of Vata have mixed with the heated, sharp qualities of Pitta, leading to overall metabolic and nervous hyperactivity.\n\n` +
          `#### 2. Dietary Recommendations (Ahara)\n` +
          `*   **Do's**: Stick to simple cooked meals of rice, mung dal khichdi, cooked pumpkin, and small doses of organic cow ghee.\n` +
          `*   **Don'ts**: Refrain from sharp chili peppers, dry stale breads, and carbonated beverages.\n\n` +
          `#### 3. Lifestyle Tips (Vihara)\n` +
          `*   Massage soles of feet with sesame oil before sleep (**Pada Abhyanga**).\n` +
          `*   Maintain rigorous daily rhythms, rising and sleeping at the exact same hour.\n\n` +
          `#### 4. Classical Formulation References\n` +
          `*   **Ashwagandha Churna** to soothe Vata.\n` +
          `*   **Amalaki Churna** to cool Pitta.\n\n` +
          `*⚠️ Disclaimer: VaidhLLaMA-3.2-3B-Instruct is an open-source clinical reference model intended for research and educational purposes. Always consult a certified Ayurvedic practitioner (Vaidya) before starting any medical regime.*`;
      }

      setVaidhResponseText(response);
      setVaidhLoading(false);
      setTokensPerSec(vaidhDeploymentMode === "local" ? 41.5 : 95.8);
      
      // Keep state-level console updated
      addConsoleLog(`[VaidhLLaMA-3.2-3B] Generated clinical analysis payload: ${response.length} chars. (inference_time: ${vaidhDeploymentMode === "local" ? "2.4s" : "0.8s"})`);
    }, 2000);
  };

  // Submit OOREP query
  const handleOorepQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oorepSymptomInput.trim()) return;
    setOorepLoading(true);
    setOorepRemedyResults([]);
    
    const logs = [
      `[MCP Client] Sending request: "tools/call" method: "search_repertory"`,
      `[MCP Client] Arguments: { "symptoms": "${oorepSymptomInput}" }`,
      `[oorep-mcp] Processing JSON-RPC over stdio...`,
      `[oorep-mcp] Querying Boericke Repertory + Kent's Repertory...`,
    ];
    
    setOorepMcpLogs(logs);

    setTimeout(() => {
      const s = oorepSymptomInput.toLowerCase();
      let matched: any[] = [];

      if (s.includes("chills") || s.includes("throat") || s.includes("swallow") || s.includes("pain")) {
        matched = [
          {
            remedy: "Gelsemium Sempervirens (Yellow Jasmine)",
            rubrics: ["Throat - pain on swallowing, worse from cold fluids", "Chills running up and down back", "Thirstlessness during chill"],
            grade: 3,
            materiaMedica: "Indicated for heavy, dull, tired states. Patient is sleepy, limp, and lacks thirst entirely. Severe throat pain on dry swallowing.",
            remedyCode: "GELS",
            potency: "30C or 200C"
          },
          {
            remedy: "Apis Mellifica (Honey Bee)",
            rubrics: ["Throat - swollen, stinging pain, red", "Thirstless even with fever"],
            grade: 2,
            materiaMedica: "Indicated for stinging, burning pains with marked puffiness and swelling of tissues. Absolute thirstlessness despite hot dry skin.",
            remedyCode: "APIS",
            potency: "30C"
          },
          {
            remedy: "Belladonna (Deadly Nightshade)",
            rubrics: ["Throat - red, dry, hot, constricted", "Pain on swallowing liquids"],
            grade: 2,
            materiaMedica: "Indicated for sudden, violent onsets of throbbing pains, red face, bounding pulse, extreme dry throat.",
            remedyCode: "BELL",
            potency: "30C"
          }
        ];
      } else if (s.includes("headache") || s.includes("sun") || s.includes("throbbing") || s.includes("sudden")) {
        matched = [
          {
            remedy: "Belladonna (Deadly Nightshade)",
            rubrics: ["Head - throbbing headache from sun exposure", "Face - red, hot, flushed", "Headache - sudden violent onset"],
            grade: 3,
            materiaMedica: "Intense, bounding, throbbing congestion in head. Face extremely red and hot, cold feet. Pupils dilated.",
            remedyCode: "BELL",
            potency: "200C"
          },
          {
            remedy: "Glonoinum (Nitro-glycerine)",
            rubrics: ["Head - sunstroke, throbbing congestion", "Head feels heavy, expanding", "Blood surges to head"],
            grade: 3,
            materiaMedica: "Terrific throbbing congestion, blood surges to head. Patient holds head in hands. Worse from heat of sun, gas-light.",
            remedyCode: "GLON",
            potency: "30C"
          },
          {
            remedy: "Natrum Muriaticum (Common Salt)",
            rubrics: ["Head - chronic headache from sunrise to sunset", "Hammering throbbing pains"],
            grade: 2,
            materiaMedica: "Hammering headache, worse from 10 AM to 3 PM. Sparkles or zig-zag lights before eyes before pain starts.",
            remedyCode: "NAT-M",
            potency: "200C"
          }
        ];
      } else {
        matched = [
          {
            remedy: "Arsenicum Album (Arsenious Acid)",
            rubrics: ["Generalities - physical anxiety and restlessness", "Worse from cold food or drinks", "Frequent sips of warm water"],
            grade: 3,
            materiaMedica: "Indicated for extreme restlessness with fear of death. Burning pains relieved by hot applications. Thirsty for small quantities frequently.",
            remedyCode: "ARS",
            potency: "30C"
          },
          {
            remedy: "Nux Vomica (Poison Nut)",
            rubrics: ["Stomach - sour eructations, heaviness after eating", "Irritability, chilly, hyper-sensitive to light/noise"],
            grade: 2,
            materiaMedica: "Highly indicated for sedentary, overworked modern lifestyles. Feeling of 'stone' in stomach an hour after eating. Spasmodic symptoms.",
            remedyCode: "NUX-V",
            potency: "30C"
          }
        ];
      }

      setOorepRemedyResults(matched);
      setOorepLoading(false);
      setOorepMcpLogs(prev => [
        ...prev,
        `[oorep-mcp] Matches found: ${matched.length} remedies in Kent/Boericke Index.`,
        `[oorep-mcp] Emitted response: 200 OK | Payload size: ${JSON.stringify(matched).length} bytes.`,
        `[MCP Client] Successfully resolved JSON-RPC payload.`
      ]);
      addConsoleLog(`[oorep-mcp] Search returned ${matched.length} homeopathic matches.`);
    }, 1500);
  };

  // Submit YogIC Query
  const handleYogicQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yogicQueryInput.trim()) return;
    setYogicLoading(true);
    setYogicResponseText("");
    setYogicRespRate(0);
    setYogicAlignmentScore(0);

    setTimeout(() => {
      const q = yogicQueryInput.toLowerCase();
      let response = "";
      let respRate = 14;
      let alignScore = 92;

      if (q.includes("tadasana") || q.includes("breathing") || q.includes("shoulders")) {
        respRate = 12; // deep, controlled breaths
        alignScore = 94;
        response = `### 🧘 YogIC Biofeedback & Posture Analysis\n\n` +
          `#### 1. Posture Alignment Correction (Tadasana - Mountain Pose)\n` +
          `*   **Observed Imbalance**: Minor left-sided lateral swaying with elevated shoulders. This suggests a slight contraction in the upper trapezius and uneven weight distribution on the feet soles.\n` +
          `*   **Corrections**: Roll your shoulders back and down, keeping the collarbones broad. Press your feet firmly into the ground, distributing weight evenly across the big toe, little toe, and heel. Gently pull the kneecaps up and engage your core (**Uddiyana Bandha**).\n\n` +
          `#### 2. Breath Synchronization (Pranayama)\n` +
          `*   **Breathing Pattern**: Shallow chest breathing. This triggers the sympathetic nervous system and induces mild physical tension.\n` +
          `*   **Prescription**: Transition to **Dirgha Pranayama** (Three-Part Breath). Inhale deeply into the abdomen, then expand the rib cage, and finally lift the upper chest. Exhale in reverse. Maintain a 1:1 or 1:2 inhalation-to-exhalation ratio.\n\n` +
          `#### 3. Naturopathic Recommendation\n` +
          `*   **Hydrotherapy**: Apply a warm compress over the shoulder girdle for 10 minutes to release tension.\n` +
          `*   **Dietary Guidance**: Sip warm herbal infusions containing **Tulsi** and **Cardamom** to promote internal circulation.`;
      } else if (q.includes("stress") || q.includes("anxiety") || q.includes("insomnia")) {
        respRate = 10;
        alignScore = 96;
        response = `### 🧘 YogIC Biofeedback & Posture Analysis\n\n` +
          `#### 1. Restorative Posture Recommendations\n` +
          `*   **Recommended Postures**: **Balasana** (Child's Pose) and **Viparita Karani** (Legs-Up-The-Wall Pose) with a bolster under the sacrum.\n` +
          `*   **Instructions**: Hold Balasana for 3-5 minutes, focusing on releasing tension in the spine, lower back, and forehead.\n\n` +
          `#### 2. Breath Synchronization (Pranayama)\n` +
          `*   **Prescription**: **Nadi Shodhana** (Alternate Nostril Breathing) for 10 rounds, followed by **Bhramari Pranayama** (Humming Bee Breath) for 5 rounds before bed to quieten the mind.\n\n` +
          `#### 3. Naturopathic Recommendation\n` +
          `*   **Relaxation**: Engage in **Yoga Nidra** (guided psychic sleep) for 20 minutes daily.\n` +
          `*   **Diet**: Favor a warm, light dinner at least 3 hours before sleep. Have a cup of warm almond milk infused with nutmeg and saffron.`;
      } else {
        respRate = 13;
        alignScore = 90;
        response = `### 🧘 YogIC Biofeedback & Posture Analysis\n\n` +
          `#### 1. General Alignment Evaluation\n` +
          `Based on your input: "${yogicQueryInput}", there is a need to improve core stability and pelvic alignment during physical asanas.\n\n` +
          `#### 2. Breath Synchronization (Pranayama)\n` +
          `*   Maintain conscious diaphragmatic breathing throughout your practice. Inhale to expand, exhale to contract.\n\n` +
          `#### 3. Naturopathic Recommendation\n` +
          `*   Begin your morning with warm lemon water and a pinch of rock salt to activate gastrointestinal reflexes and eliminate toxins (Shodhana).`;
      }

      setYogicResponseText(response);
      setYogicRespRate(respRate);
      setYogicAlignmentScore(alignScore);
      setYogicLoading(false);
      addConsoleLog(`[YogIC-Biofeedback-2.1] Analyzed biofeedback mechanics. Alignment: ${alignScore}%, Respiratory: ${respRate}bpm.`);
    }, 1500);
  };

  // Submit Unani Query
  const handleUnaniQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unaniQueryInput.trim()) return;
    setUnaniLoading(true);
    setUnaniResponseText("");

    setTimeout(() => {
      const q = unaniQueryInput.toLowerCase();
      let response = "";
      let safra = 25;
      let dam = 25;
      let balgham = 25;
      let sauda = 25;

      if (q.includes("hot") || q.includes("bitter") || q.includes("yellow") || q.includes("temper")) {
        safra = 55;
        dam = 20;
        sauda = 15;
        balgham = 10;
        response = `### ⚜️ IbnSina-Unani-7B Clinical Analysis\n\n` +
          `#### 1. Humoral (Akhlat) & Temperament (Mizaj) Analysis\n` +
          `Your symptoms point to a marked pathogenetic elevation in **Safra** (Yellow Bile), creating a **Hot and Dry** temperament (**Mizaj-e-Garrm-o-Khushk**) in your body. This excess Yellow Bile acts primarily on the stomach lining and hepatic systems, resulting in the bitter taste, gastric heat, and emotional irritability.\n\n` +
          `#### 2. Dietary Therapy (Ilaj-bil-Ghiya)\n` +
          `*   **Highly Beneficial (Barid o Raatib - Cold and Moist)**: Consume cooling fruits such as watermelons, cucumbers, sweet pomegranates, and pears. Drink barley water (**Sattu**), mint-fused sherbet, and buttermilk.\n` +
          `*   **Prohibited (Garrm o Khushk - Hot and Dry)**: Avoid hot spices, red chilies, mustard, eggs, beef, and highly salted, dried meat.\n\n` +
          `#### 3. Lifestyle Regimen (Asbab-e-Sittah-Zarooriyah)\n` +
          `*   **Air & Environment**: Stay in cool, well-ventilated rooms. Avoid direct exposure to hot winds.\n` +
          `*   **Sleep**: Ensure 7-8 hours of restful sleep to naturally moisture and cool the metabolic processes.\n` +
          `*   **Psychic Movement**: Engage in calming, slow-paced activities to regulate emotional heat.\n\n` +
          `#### 4. Unani Formulations (Al-Adviyah)\n` +
          `*   **Sherbet-e-Bazoori Motadil** (20ml with warm water) to clear renal and biliary obstructions.\n` +
          `*   **Khamira Gaozaban Ambari** (5g in the morning) to soothe cardioneuro-Pitta symptoms.`;
      } else if (q.includes("cold") || q.includes("mucus") || q.includes("sluggish") || q.includes("heavy")) {
        safra = 10;
        dam = 20;
        sauda = 15;
        balgham = 55;
        response = `### ⚜️ IbnSina-Unani-7B Clinical Analysis\n\n` +
          `#### 1. Humoral (Akhlat) & Temperament (Mizaj) Analysis\n` +
          `The symptoms reflect a primary accumulation of **Balgham** (Phlegm Humor), resulting in a **Cold and Moist** temperament (**Mizaj-e-Barid-o-Tar**). The sluggish digestion, phlegm congestion, and lethargy are classic signs of excess Phlegm.\n\n` +
          `#### 2. Dietary Therapy (Ilaj-bil-Ghiya)\n` +
          `*   **Highly Beneficial (Garrm o Khushk - Hot and Dry)**: Integrate warming spices like honey, black pepper, ginger, cloves, and cinnamon. Drink warm water with honey.\n` +
          `*   **Prohibited (Barid o Tar - Cold and Moist)**: Avoid yogurts, heavy dairy, ice creams, cold waters, rice, and sour, highly hydrated foods.\n\n` +
          `#### 3. Lifestyle Regimen (Asbab-e-Sittah-Zarooriyah)\n` +
          `*   **Physical Activity**: Engage in rigorous aerobic exercise to warm the body and resolve phlegm.\n` +
          `*   **Sleep**: Keep sleep moderate. Excessive sleep further aggregates Balgham.\n\n` +
          `#### 4. Unani Formulations (Al-Adviyah)\n` +
          `*   **Sherbet-e-Sadr** to treat cough and mucus.\n` +
          `*   **Majoon-e-Falasfa** to warm the body, strengthen nerves, and improve kidney and stomach functions.`;
      } else {
        safra = 20;
        dam = 40;
        sauda = 20;
        balgham = 20;
        response = `### ⚜️ IbnSina-Unani-7B Clinical Analysis\n\n` +
          `#### 1. Humoral (Akhlat) & Temperament (Mizaj) Analysis\n` +
          `Your symptoms indicate a balanced or mild **Dam** (Sanguine) presentation with subtle Vata-like fluctuations. Your Mizaj is predominantly **Warm and Moist**.\n\n` +
          `#### 2. Dietary Therapy (Ilaj-bil-Ghiya)\n` +
          `*   Stick to simple balanced cooked grains, fresh greens, and seasonal fruits.\n\n` +
          `#### 3. Unani Formulations (Al-Adviyah)\n` +
          `*   **Sherbet-e-Anar** to promote hepatic tone and maintain digestion.`;
      }

      setUnaniResponseText(response);
      setUnaniHumorSafra(safra);
      setUnaniHumorDam(dam);
      setUnaniHumorSauda(sauda);
      setUnaniHumorBalgham(balgham);
      setUnaniLoading(false);
      addConsoleLog(`[IbnSina-Unani-7B] Temperament classification complete. Humors - Safra: ${safra}%, Dam: ${dam}%, Balgham: ${balgham}%, Sauda: ${sauda}%.`);
    }, 1500);
  };

  // Submit Siddha Query
  const handleSiddhaQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siddhaQueryInput.trim()) return;
    setSiddhaLoading(true);
    setSiddhaResponseText("");

    setTimeout(() => {
      const q = siddhaQueryInput.toLowerCase();
      let response = "";
      let pulseRatio = "V:1, P:1, K:1";

      if (q.includes("naadi") || q.includes("joint") || q.includes("stiffness") || q.includes("shoulder")) {
        pulseRatio = "Vaatham: 1/2, Pitham: 1, Kabham: 4";
        response = `### ☸️ Agastya-Siddha-3B Clinical Analysis\n\n` +
          `#### 1. Naadi (Pulse) & Mukkuttram Analysis\n` +
          `The clinical presentation indicates a profound imbalance in **Kabha-Vaatham** Naadi, represented by a stagnant, heavy, yet spasmodic pulse. The Kaba aggravation has accumulated in the bones and joints (**Santhi Suthu**), leading to severe stiffness, while Vaatham is causing localized neurological pain and restricted movement in the shoulders.\n\n` +
          `#### 2. Therapeutic Herbs & Herbology (Karpam / Mooligai)\n` +
          `*   **Nilavembu Kudineer** (30-50ml decoction) to reduce toxicity and balance humors.\n` +
          `*   **Thirikadugu Chooranam** (1g with honey thrice daily) to eliminate respiratory/digestive phlegm.\n` +
          `*   **Amukkara Chooranam** (Indian Ginseng - Ashwagandha) to rebuild strength in joints and relieve neuromuscular pain.\n\n` +
          `#### 3. Varmam Therapy (Vital Points Activation)\n` +
          `Stimulate the following Varmam points to activate energy flow and clear joint stiffness:\n` +
          `*   **Kakkattai Varmam** (located on the shoulders): Gentle clockwise circular pressure to relieve shoulder joint locks.\n` +
          `*   **Kaikaalam Varmam**: Stimulates nervous coordination of the upper extremities.\n\n` +
          `#### 4. External Therapeutics (Puramarunthu)\n` +
          `*   Apply warming **Vathakesari Thailam** or **Pinda Thailam** over the affected joints, followed by mild steam fomentation.`;
      } else if (q.includes("skin") || q.includes("heat") || q.includes("itch") || q.includes("boil")) {
        pulseRatio = "Vaatham: 1, Pitham: 4, Kabham: 1";
        response = `### ☸️ Agastya-Siddha-3B Clinical Analysis\n\n` +
          `#### 1. Naadi (Pulse) & Mukkuttram Analysis\n` +
          `The pulse indicates a high surge in **Pitham Naadi** (specifically **Prana Pitham** and **Sadgaka Pitham**). Excess body heat has entered the skin channels (**Ratha-Dhathu**), leading to inflammatory skin eruptions, itchiness, and boils.\n\n` +
          `#### 2. Therapeutic Herbs & Herbology (Karpam / Mooligai)\n` +
          `*   **Sivanar Amirtham** for its fast anti-inflammatory properties.\n` +
          `*   Sip **Vettiver** (Vetiver grass) water to clear body heat.\n\n` +
          `#### 3. Varmam Therapy (Vital Points Activation)\n` +
          `*   **Adappa Kaalam Varmam**: Helps in soothing excess body temperature and clearing toxic heat.\n\n` +
          `#### 4. External Therapeutics (Puramarunthu)\n` +
          `*   Apply pure coconut oil infused with **Kuppaimeni** leaf paste over the eruptions. Avoid harsh chemical cleansers.`;
      } else {
        pulseRatio = "Vaatham: 1, Pitham: 1, Kabham: 1";
        response = `### ☸️ Agastya-Siddha-3B Clinical Analysis\n\n` +
          `#### 1. Naadi (Pulse) & Mukkuttram Analysis\n` +
          `The Naadi evaluation shows a predominantly balanced Mukkuttram (Vatha, Pitha, Kabha ratio at 1:1/2:1/4).\n\n` +
          `#### 2. Therapeutic Guidance\n` +
          `*   Consume daily **Inji (Ginger) Rasam** to support Agni and prevent metabolic toxicity (Aaam).`;
      }

      setSiddhaResponseText(response);
      setSiddhaNaadiPulseRatio(pulseRatio);
      setSiddhaLoading(false);
      addConsoleLog(`[Agastya-Siddha-3B] Diagnostic complete. Pulse frequency signatures mapped to ${pulseRatio}.`);
    }, 1500);
  };

  // Dynamic state for added practitioners
  const [practitioners, setPractitioners] = useState<Practitioner[]>([
    {
      id: "prac-1",
      name: "Dr. Priya Sharma",
      system: "Ayurveda",
      experience: 12,
      rating: 4.9,
      reviewsCount: 48,
      specialization: ["Joint pain", "Skin disorders", "Digestive health"],
      channels: ["Online", "In-Clinic"],
      imageEmoji: "👩‍⚕️",
      location: "Kerala"
    },
    {
      id: "prac-2",
      name: "Dr. Anil Kumar",
      system: "Homeopathy",
      experience: 8,
      rating: 4.7,
      reviewsCount: 32,
      specialization: ["Allergies", "Asthma", "Skin conditions"],
      channels: ["Online", "In-Clinic"],
      imageEmoji: "👨‍⚕️",
      location: "Mumbai"
    },
    {
      id: "prac-3",
      name: "Dr. Meera Reddy",
      system: "Siddha",
      experience: 15,
      rating: 4.8,
      reviewsCount: 56,
      specialization: ["Diabetes", "Arthritis", "Women's health"],
      channels: ["Online", "In-Clinic"],
      imageEmoji: "👩‍⚕️",
      location: "Chennai"
    },
    {
      id: "prac-4",
      name: "Dr. Rajiv Gupta",
      system: "Yoga & Naturopathy",
      experience: 10,
      rating: 4.6,
      reviewsCount: 29,
      specialization: ["Stress management", "Lifestyle disorders", "Yoga therapy"],
      channels: ["Online"],
      imageEmoji: "🧘",
      location: "Delhi"
    },
    {
      id: "prac-5",
      name: "Dr. Hakim Mohammed",
      system: "Unani",
      experience: 20,
      rating: 4.9,
      reviewsCount: 61,
      specialization: ["Nervous system", "Chronic cough", "Rejuvenative therapy"],
      channels: ["In-Clinic"],
      imageEmoji: "👨‍⚕️",
      location: "Hyderabad"
    }
  ]);

  const [wellnessCenters] = useState<WellnessCenter[]>([
    {
      id: "center-1",
      name: "AyurVana Retreat & Spa",
      type: "Panchakarma Center",
      location: "Kerala, India",
      rating: 4.9,
      reviewsCount: 128,
      packages: ["7-Day Panchakarma Detox", "Stress Relief Treatment", "Weight Rebalance"],
      desc: "An eco-friendly sanctuary set amidst lush fields specializing in pure classical Ayurvedic therapies.",
      imageEmoji: "🌿"
    },
    {
      id: "center-2",
      name: "Shanti Yoga Ashram",
      type: "Yoga Retreat",
      location: "Rishikesh, Uttarakhand",
      rating: 4.8,
      reviewsCount: 95,
      packages: ["3-Day Meditation Camp", "200-Hr Teacher Training", "Spiritual Rebirth Program"],
      desc: "Sacred ashram on the banks of the Ganges River offering immersive daily sadhana & organic meals.",
      imageEmoji: "🧘"
    },
    {
      id: "center-3",
      name: "Siddha Siddhi Gurukul",
      type: "Traditional Siddha Hospital",
      location: "Tanjore, Tamil Nadu",
      rating: 4.7,
      reviewsCount: 67,
      packages: ["Kaya Kalpa Longevity", "Varma Bone Manipulation"],
      desc: "Siddha center focused on biological aging reversal, copper therapy, and herbology.",
      imageEmoji: "🏛️"
    }
  ]);

  const [yogaCenters] = useState<YogaCenter[]>([
    {
      id: "yoga-1",
      name: "Iyengar Yoga Institute",
      style: "Iyengar Style (Props & Precision)",
      location: "Pune, Maharashtra",
      rating: 4.9,
      reviewsCount: 42,
      description: "Focuses on alignment, stability, and precise therapeutic posture holding using belts & blocks.",
      sessions: ["Morning Flow (6:00 AM)", "Therapeutic Posture (5:30 PM)", "Sunday Pranayama (8:00 AM)"],
      imageEmoji: "✨"
    },
    {
      id: "yoga-2",
      name: "Ashtanga Vinyasa Shala",
      style: "Ashtanga Style (Dynamic Mysore flow)",
      location: "Mysore, Karnataka",
      rating: 4.8,
      reviewsCount: 38,
      description: "Self-paced traditional Mysore style practice focused on Ujjayi breathing, bandhas, and drishti.",
      sessions: ["Led Primary Series (7:00 AM)", "Mysore Style Open Practice (5:30 AM)", "Sanskrit Chanting (4:00 PM)"],
      imageEmoji: "🔥"
    }
  ]);

  const [remedies] = useState<Remedy[]>([
    {
      id: "rem-1",
      name: "Ashwagandha (Withania somnifera)",
      system: "Ayurveda",
      indications: "Stress, anxiety, fatigue, low immunity, strength recovery",
      ingredients: "Pure powdered root of Ashwagandha herb",
      usage: "1 tsp with warm water or milk before sleeping",
      imageEmoji: "🌱"
    },
    {
      id: "rem-2",
      name: "Arnica Montana 30C",
      system: "Homeopathy",
      indications: "Muscle soreness, bruising, sports injuries, mental shock",
      ingredients: "Highly diluted extracts of Mountain Arnica",
      usage: "4 globules dissolved under tongue 3 times a day",
      imageEmoji: "💧"
    },
    {
      id: "rem-3",
      name: "Triphala Churna",
      system: "Ayurveda",
      indications: "Constipation, sluggish digestion, colon cleanse, eye wash",
      ingredients: "Amalaki, Bibhitaki, Haritaki dried fruits",
      usage: "Half tsp in warm water at night after dinner",
      imageEmoji: "🍂"
    },
    {
      id: "rem-4",
      name: "Kabasura Kudineer",
      system: "Siddha",
      indications: "Fever, respiratory congestion, cold & flu prevention",
      ingredients: "Ginger, black pepper, clove, ginger root, and 11 other herbs",
      usage: "Boil 5g powder in 240ml water till reduced to 60ml; drink warm",
      imageEmoji: "☕"
    }
  ]);

  // Practitioner Booking Modal
  const [selectedPracToBook, setSelectedPracToBook] = useState<Practitioner | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Wellness Center Booking Modal
  const [selectedCenterToBook, setSelectedCenterToBook] = useState<WellnessCenter | null>(null);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [centerBookingSuccess, setCenterBookingSuccess] = useState(false);

  // Practitioner Form State
  const [regName, setRegName] = useState("");
  const [regSystem, setRegSystem] = useState<"Ayurveda" | "Homeopathy" | "Unani" | "Siddha" | "Yoga & Naturopathy">("Ayurveda");
  const [regExp, setRegExp] = useState("");
  const [regSpecs, setRegSpecs] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Prakriti Assessment State
  const [prakritiStep, setPrakritiStep] = useState(0); // 0 = intro, 1-5 = questions, 6 = results
  const [prakritiAnswers, setPrakritiAnswers] = useState<Record<number, "A" | "B" | "C">>({});

  const prakritiQuestions = [
    {
      id: 1,
      factor: "Body Frame & Physical Build",
      text: "How would you describe your overall physical skeletal structure and bones?",
      options: [
        { key: "A", val: "Thin, slender, bony frame; either very tall or very short. Hard to gain weight.", dosha: "Vata" },
        { key: "B", val: "Medium, athletic build; well-developed muscles. Easy to maintain or gain/lose weight.", dosha: "Pitta" },
        { key: "C", val: "Broad, sturdy, heavy frame; tends to carry extra weight easily and loses it slowly.", dosha: "Kapha" }
      ]
    },
    {
      id: 2,
      factor: "Skin Texture & Complexity",
      text: "How does your skin look and feel most of the year?",
      options: [
        { key: "A", val: "Dry, rough, cool to touch, thin skin; prone to cracking, eczema, or early fine wrinkles.", dosha: "Vata" },
        { key: "B", val: "Soft, warm, sensitive skin; reddish hue, prone to freckles, acne, or inflammation.", dosha: "Pitta" },
        { key: "C", val: "Thick, smooth, oily, cold, pale skin; glowing complexion, rarely gets dry or wrinkled.", dosha: "Kapha" }
      ]
    },
    {
      id: 3,
      factor: "Climate Preference & Sensitivity",
      text: "Which season or weather condition do you find most uncomfortable?",
      options: [
        { key: "A", val: "Cold, windy, and dry weather. I hate winters and need extra blankets/warm clothes.", dosha: "Vata" },
        { key: "B", val: "Hot, humid, sunny weather. I sweat heavily, get irritated, and crave air conditioning.", dosha: "Pitta" },
        { key: "C", val: "Damp, wet, cold, and cloudy weather. Winters feel very sluggish and heavy to me.", dosha: "Kapha" }
      ]
    },
    {
      id: 4,
      factor: "Sleep Patterns & Habits",
      text: "Describe your general sleep cycle and quality of rest:",
      options: [
        { key: "A", val: "Light, interrupted, light sleeper. Mind races, dry dreams, wakes up early feeling tired.", dosha: "Vata" },
        { key: "B", val: "Moderate, sound sleep. If woken up, can easily drift back; dreams are fiery or intense.", dosha: "Pitta" },
        { key: "C", val: "Deep, long, heavy sleeper. Hard to wake up in mornings, feels sleepy even after 8+ hours.", dosha: "Kapha" }
      ]
    },
    {
      id: 5,
      factor: "Mental Tendency & Action to Stress",
      text: "How do you typically react when placed under sudden mental pressure or stress?",
      options: [
        { key: "A", val: "Anxious, worried, fearful. Mind starts overthinking immediately, leading to scatter.", dosha: "Vata" },
        { key: "B", val: "Angry, impatient, irritable, aggressive. Determined to fight or point out errors.", dosha: "Pitta" },
        { key: "C", val: "Calm, slow to react, peaceful but avoidant. Withdraws into a shell or feels depressed.", dosha: "Kapha" }
      ]
    }
  ];

  const handlePrakritiAnswer = (qId: number, optionKey: "A" | "B" | "C") => {
    setPrakritiAnswers(prev => ({ ...prev, [qId]: optionKey }));
    if (prakritiStep < 5) {
      setPrakritiStep(prev => prev + 1);
    } else {
      setPrakritiStep(6); // Go to results
    }
  };

  const calculatePrakritiResults = () => {
    let vataCount = 0;
    let pittaCount = 0;
    let kaphaCount = 0;

    Object.values(prakritiAnswers).forEach(ans => {
      if (ans === "A") vataCount++;
      if (ans === "B") pittaCount++;
      if (ans === "C") kaphaCount++;
    });

    const total = vataCount + pittaCount + kaphaCount;
    const vataPct = total > 0 ? Math.round((vataCount / total) * 100) : 33;
    const pittaPct = total > 0 ? Math.round((pittaCount / total) * 100) : 33;
    const kaphaPct = total > 0 ? 100 - vataPct - pittaPct : 34;

    return {
      vata: vataPct,
      pitta: pittaPct,
      kapha: kaphaPct,
      chartData: [
        { name: "Vata (Air & Space)", value: vataPct, color: "#8b5cf6" },
        { name: "Pitta (Fire & Water)", value: pittaPct, color: "#f59e0b" },
        { name: "Kapha (Earth & Water)", value: kaphaPct, color: "#10b981" }
      ]
    };
  };

  const getPrakritiDiagnosis = (vata: number, pitta: number, kapha: number) => {
    const scores = [
      { name: "Vata", score: vata, desc: "associated with kinetic movement, creativity, lightness, and flexibility. When balanced, it fosters mental agility and original ideas. When out of balance, it leads to anxiety, dry skin, gas, and fatigue." },
      { name: "Pitta", score: pitta, desc: "associated with metabolism, heat, transformation, and sharp digestion. When balanced, it provides strong leadership, focus, intellect, and courage. Out of balance, it causes anger, acidity, rashes, and ulcers." },
      { name: "Kapha", score: kapha, desc: "associated with structure, cohesion, moisture, stability, and love. When balanced, it yields calm, patience, endurance, and deep tissue lubrication. Out of balance, it brings obesity, sluggishness, congestion, and depression." }
    ];

    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const dominant = sorted[0];
    const secondary = sorted[1];

    return {
      title: `${dominant.name}-${secondary.name} Constitution`,
      explanation: `Your constitution is dominantly ${dominant.name} (${dominant.score}%) with secondary ${secondary.name} (${secondary.score}%). This represents a dual-dosha state, common in modern environments.`,
      diet: dominant.name === "Vata" 
        ? "Consume warm, oily, cooked foods with sweet, sour, and salty tastes. Avoid cold drinks, dry snacks, and raw leafy salads."
        : dominant.name === "Pitta"
        ? "Favor cool, refreshing, heavy foods with sweet, bitter, and astringent tastes. Minimize spicy, salty, and acidic citrus items."
        : "Choose warm, light, dry, spicy foods with bitter, pungent, and astringent tastes. Strictly avoid cold milk products, heavy fats, and high sugars.",
      lifestyle: dominant.name === "Vata"
        ? "Maintain a consistent daily routine, practice soothing oil self-massages (Abhyanga), and guard against cold winds."
        : dominant.name === "Pitta"
        ? "Practice moderation, avoid excessive competitiveness or intense physical activity under direct midday sun, and walk in nature."
        : "Wake up early before 6 AM, seek vigorous physical exercise daily, and avoid sleeping during daytime hours.",
      yoga: dominant.name === "Vata"
        ? "Gentle slow Surya Namaskar, grounding forward folds (Paschimottanasana), and restorative savasana."
        : dominant.name === "Pitta"
        ? "Cooling moon salutations (Chandra Namaskar), gentle twists, and sheetali pranayama (cooling breath)."
        : "Vigorous, rapid sun salutations, chest-opening backbends (Ustrasana/camel pose), and energizing bhastrika breath."
    };
  };

  // Submit new practitioner
  const handleRegisterPractitioner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regExp || !regLocation) {
      alert("Please fill out all required fields.");
      return;
    }

    const newPrac: Practitioner = {
      id: `prac-${Date.now()}`,
      name: regName.startsWith("Dr. ") ? regName : `Dr. ${regName}`,
      system: regSystem,
      experience: parseInt(regExp) || 5,
      rating: 5.0,
      reviewsCount: 1,
      specialization: regSpecs ? regSpecs.split(",").map(s => s.trim()) : ["General Consultation"],
      channels: ["Online", "In-Clinic"],
      imageEmoji: regSystem === "Yoga & Naturopathy" ? "🧘" : "👨‍⚕️",
      location: regLocation
    };

    setPractitioners(prev => [newPrac, ...prev]);
    setRegSuccess(true);
    setRegName("");
    setRegExp("");
    setRegSpecs("");
    setRegLocation("");
    
    // Auto reset success alert after 4 seconds
    setTimeout(() => setRegSuccess(false), 4000);
  };

  const filteredPractitioners = practitioners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === "All" || p.system === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  const handlePracBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedPracToBook(null);
    }, 2500);
  };

  const handleCenterBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCenterBookingSuccess(true);
    setTimeout(() => {
      setCenterBookingSuccess(false);
      setSelectedCenterToBook(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* HEADER NAVBAR */}
      <nav className="bg-white/95 backdrop-blur-md fixed w-full z-40 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBackToLanding}
                className="p-1.5 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Back to Landing"
              >
                <ArrowLeft className="h-5 w-5 text-purple-700" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-purple-700">AYUSH<span className="text-yellow-500">.</span></span>
                <span className="text-[10px] uppercase font-black tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Traditional Wellness
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-5">
              <button
                onClick={() => { setActiveTab("explore"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeTab === "explore" ? "text-purple-700 border-b-2 border-purple-700 pb-1" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🌿 Explore Directory
              </button>
              <button
                onClick={() => { setActiveTab("prakriti"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeTab === "prakriti" ? "text-purple-700 border-b-2 border-purple-700 pb-1" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🧠 AI Prakriti Test
              </button>
              <button
                onClick={() => { setActiveTab("remedies"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeTab === "remedies" ? "text-purple-700 border-b-2 border-purple-700 pb-1" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                💊 Remedies & herbs
              </button>
              <button
                onClick={() => { setActiveTab("register"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeTab === "register" ? "text-purple-700 border-b-2 border-purple-700 pb-1" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ✍️ Register Practitioner
              </button>
              <button
                onClick={() => { setActiveTab("grid"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeTab === "grid" ? "text-purple-700 border-b-2 border-purple-700 pb-1" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🌐 Ayush Grid (ABDM)
              </button>
              <button
                onClick={() => { setActiveTab("ai-engines"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeTab === "ai-engines" ? "text-purple-700 border-b-2 border-purple-700 pb-1" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🤖 AYUSH AI Engines
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToAllopathic || onBackToLanding}
                className="text-[11px] font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition cursor-pointer"
              >
                🏥 Open CURA Allopathic
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* BODY CONTENT CONTAINER */}
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MOBILE SUB-NAVIGATION BAR (Shows on small screens) */}
        <div className="flex md:hidden items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
              activeTab === "explore" ? "bg-purple-100 text-purple-700" : "text-slate-500"
            }`}
          >
            🌿 Explore
          </button>
          <button
            onClick={() => setActiveTab("prakriti")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
              activeTab === "prakriti" ? "bg-purple-100 text-purple-700" : "text-slate-500"
            }`}
          >
            🧠 AI Test
          </button>
          <button
            onClick={() => setActiveTab("remedies")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
              activeTab === "remedies" ? "bg-purple-100 text-purple-700" : "text-slate-500"
            }`}
          >
            💊 Remedies
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
              activeTab === "register" ? "bg-purple-100 text-purple-700" : "text-slate-500"
            }`}
          >
            ✍️ Join Net
          </button>
          <button
            onClick={() => setActiveTab("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
              activeTab === "grid" ? "bg-purple-100 text-purple-700" : "text-slate-500"
            }`}
          >
            🌐 Ayush Grid
          </button>
          <button
            onClick={() => setActiveTab("ai-engines")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
              activeTab === "ai-engines" ? "bg-purple-100 text-purple-700" : "text-slate-500"
            }`}
          >
            🤖 AI Engines
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: EXPLORE DIRECTORY */}
          {activeTab === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              
              {/* MINI HERO BANNER */}
              <div className="relative bg-gradient-to-r from-purple-800 to-indigo-900 text-white rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden border border-purple-950">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
                  <span className="text-[180px] font-sans">ॐ</span>
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-purple-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" /> AYUSH Wellness Network
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Find Traditional Healing, Naturopathy, & Yoga Centers
                  </h1>
                  <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
                    Connect directly with verified practitioners of Ayurveda, Homeopathy, Siddha, Unani, and Yoga retreats. 
                    Search by system, ailment, location, or book online sessions.
                  </p>
                  
                  {/* DIRECT SEARCH BOX */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by doctor, system, location, symptom (e.g. skin, asthma, joint)..."
                        className="w-full bg-white text-slate-800 pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      />
                    </div>
                    <button 
                      onClick={() => { setActiveTab("prakriti"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="bg-yellow-400 hover:bg-yellow-300 text-purple-950 px-6 py-3 rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      <Activity className="h-4 w-4" /> Start AI Prakriti Test
                    </button>
                  </div>
                </div>
              </div>

              {/* SYSTEM SELECT FILTERS */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Filter by Medical System
                  </h3>
                  {selectedSystem !== "All" && (
                    <button
                      onClick={() => setSelectedSystem("All")}
                      className="text-[10px] text-purple-600 font-bold hover:underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {["All", "Ayurveda", "Homeopathy", "Unani", "Siddha", "Yoga & Naturopathy"].map(sys => (
                    <button
                      key={sys}
                      onClick={() => setSelectedSystem(sys)}
                      className={`px-4.5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer border ${
                        selectedSystem === sys
                          ? "bg-purple-700 text-white border-purple-800 shadow-md shadow-purple-500/20"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {sys === "All" ? "🌍 All Systems" : sys}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRACTITIONERS LIST */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">
                      Verified AYUSH Practitioners
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Fully registered under central council of indian medicine
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full">
                    {filteredPractitioners.length} found
                  </span>
                </div>

                {filteredPractitioners.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="text-sm font-bold text-slate-500">No practitioners found matching your query.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setSelectedSystem("All"); }}
                      className="mt-3 text-xs text-purple-700 font-extrabold hover:underline"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPractitioners.map((prac) => (
                      <div
                        key={prac.id}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl shrink-0">
                                {prac.imageEmoji}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-sm leading-tight">
                                  {prac.name}
                                </h4>
                                <span className="inline-block mt-1 text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                                  {prac.system}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-xs text-amber-500 font-black">
                              <Star className="h-3.5 w-3.5 fill-amber-500" />
                              {prac.rating}
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Shield className="h-4 w-4 text-emerald-500" />
                              <span>{prac.experience} years clinical experience</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>Registered in {prac.location}</span>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Areas of Specialization
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {prac.specialization.map((spec, i) => (
                                <span
                                  key={i}
                                  className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-100"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            {prac.channels.map((chan, i) => (
                              <span
                                key={i}
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                  chan === "Online" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                }`}
                              >
                                {chan} consult
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedPracToBook(prac)}
                          className="w-full mt-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl shadow-md transition uppercase tracking-wider cursor-pointer"
                        >
                          Book Appointment
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: HOLISTIC WELLNESS & RETREAT PACKAGES */}
              <div className="space-y-6 pt-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-black text-slate-800">
                    Traditional Wellness Centers & Retreats
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    classical treatments like panchakarma, kaya kalpa, & detoxification therapies
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {wellnessCenters.map((center) => (
                    <div
                      key={center.id}
                      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* ILLUSTRATIVE CARD BANNER */}
                        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl relative">
                          {center.imageEmoji}
                          <span className="absolute top-3 right-3 text-xs bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-black text-white">
                            {center.type}
                          </span>
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="font-extrabold text-slate-800 text-sm">
                                {center.name}
                              </h4>
                              <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold shrink-0">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                {center.rating}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" /> {center.location}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed font-normal">
                            {center.desc}
                          </p>

                          <div className="space-y-1.5">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              Popular Wellness Programs
                            </span>
                            <div className="space-y-1">
                              {center.packages.map((pkg, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                                  <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                  <span>{pkg}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2">
                        <button
                          onClick={() => setSelectedCenterToBook(center)}
                          className="w-full py-2.5 border border-purple-600 hover:bg-purple-50 text-purple-700 text-xs font-black rounded-xl transition uppercase tracking-wider cursor-pointer"
                        >
                          Enquire & Book Packages
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* YOGA INSTRUCTION STUDIOS */}
              <div className="space-y-6 pt-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-black text-slate-800">
                    Yoga & Prana Practice Shalas
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    ashtanga vinyasa, iyengar therapeutics, and pranayama sessions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {yogaCenters.map((yoga) => (
                    <div
                      key={yoga.id}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-stretch"
                    >
                      <div className="space-y-4 flex-1">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0">
                            🧘
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">
                              {yoga.name}
                            </h4>
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full block w-fit mt-1">
                              {yoga.style}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed font-normal">
                          {yoga.description}
                        </p>

                        <div className="text-[10.5px] text-slate-400 font-bold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Located at: {yoga.location}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between w-full md:w-64 shrink-0 space-y-3">
                        <div className="space-y-1.5">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            Today's Class Schedule
                          </span>
                          <div className="space-y-1 text-xs">
                            {yoga.sessions.map((sess, i) => (
                              <div key={i} className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Clock className="h-3 w-3 text-amber-500" />
                                <span>{sess}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => alert(`Class reservation initiated. Please show up 10 minutes prior for: ${yoga.sessions[0]}`)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10.5px] font-black rounded-xl transition uppercase tracking-wider cursor-pointer"
                        >
                          Book Trial Class
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: AI PRAKRITI TEST */}
          {activeTab === "prakriti" && (
            <motion.div
              key="prakriti"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              
              {/* INTRO STEP */}
              {prakritiStep === 0 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
                    🧠
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                      AI Tridosha Diagnosis
                    </span>
                    <h2 className="text-2xl font-black text-slate-800">
                      Discover Your Body Constitution (Prakriti)
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto">
                      In Ayurveda, Prakriti represents your unique genetic blueprint composed of three dynamic forces or Doshas: 
                      <strong> Vata</strong> (Wind), <strong>Pitta</strong> (Fire), and <strong>Kapha</strong> (Water/Earth). 
                      Answer this 5-step clinical diagnostic questionnaire to calculate your customized percentage balance and optimal healing diet.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-center pt-2">
                    <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/40">
                      <span className="block text-purple-700 font-extrabold text-sm">Vata</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Air & Space</span>
                    </div>
                    <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/40">
                      <span className="block text-amber-700 font-extrabold text-sm">Pitta</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Fire & Water</span>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/40">
                      <span className="block text-emerald-700 font-extrabold text-sm">Kapha</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Earth & Water</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPrakritiStep(1)}
                    className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Start Diagnostic Assessment
                  </button>
                </div>
              )}

              {/* QUESTION STEPS (1-5) */}
              {prakritiStep >= 1 && prakritiStep <= 5 && (
                <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  
                  {/* PROGRESS BAR */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      <span>Prakriti Core Profiling</span>
                      <span>Step {prakritiStep} of 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-700 transition-all duration-300"
                        style={{ width: `${(prakritiStep / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* QUESTION BODY */}
                  {(() => {
                    const q = prakritiQuestions[prakritiStep - 1];
                    return (
                      <div className="space-y-6">
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9.5px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                            Factor: {q.factor}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-800">
                            {q.text}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {q.options.map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handlePrakritiAnswer(q.id, opt.key as any)}
                              className="w-full text-left p-4 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-2xl transition cursor-pointer flex gap-4 items-start"
                            >
                              <span className="w-7 h-7 bg-white border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center rounded-xl shrink-0">
                                {opt.key}
                              </span>
                              <div className="space-y-1 text-xs">
                                <span className="font-semibold block text-slate-700">
                                  {opt.val}
                                </span>
                                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wide block">
                                  Corresponds with {opt.dosha} Characteristics
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex justify-between pt-4 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setPrakritiStep(prev => prev - 1)}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      ← Previous Step
                    </button>
                    <span className="text-slate-400 font-semibold">Answer honesty to get accurate diet plans</span>
                  </div>

                </div>
              )}

              {/* RESULTS STEP (6) */}
              {prakritiStep === 6 && (
                <div className="space-y-6">
                  {(() => {
                    const results = calculatePrakritiResults();
                    const diagnosis = getPrakritiDiagnosis(results.vata, results.pitta, results.kapha);

                    return (
                      <div className="space-y-6">
                        
                        {/* CHART & RATIO SUMMARY CARD */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                          <div className="md:col-span-7 space-y-4">
                            <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                              Tridosha Profile Ready
                            </span>
                            <h3 className="text-xl font-black text-slate-800">
                              {diagnosis.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                              {diagnosis.explanation}
                            </p>

                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-purple-700">Vata (Air/Space)</span>
                                  <span>{results.vata}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-700" style={{ width: `${results.vata}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-amber-700">Pitta (Fire/Water)</span>
                                  <span>{results.pitta}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: `${results.pitta}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-emerald-700">Kapha (Earth/Water)</span>
                                  <span>{results.kapha}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${results.kapha}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-5 flex flex-col items-center justify-center">
                            {/* PIE CHART */}
                            <div className="h-44 w-44">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={results.chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    {results.chartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex gap-3 text-[9px] font-bold text-slate-500 mt-2">
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-700 rounded-full inline-block"></span> Vata</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span> Pitta</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Kapha</span>
                            </div>
                          </div>
                        </div>

                        {/* RECO DATA TABS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* CARD 1: DIETARY AHARA */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center text-xl font-bold">
                              🍲
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm">
                              Optimal Diet (Ahara)
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                              {diagnosis.diet}
                            </p>
                          </div>

                          {/* CARD 2: LIFESTYLE VIHARA */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold">
                              🌿
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm">
                              Daily Routine (Vihara)
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                              {diagnosis.lifestyle}
                            </p>
                          </div>

                          {/* CARD 3: YOGA ASANAS */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold">
                              🧘
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm">
                              Recommended Yoga
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                              {diagnosis.yoga}
                            </p>
                          </div>

                        </div>

                        <div className="flex justify-center pt-2">
                          <button
                            onClick={() => {
                              setPrakritiAnswers({});
                              setPrakritiStep(0);
                            }}
                            className="py-2.5 px-6 border border-slate-300 hover:bg-slate-100 text-slate-600 font-extrabold text-xs rounded-xl transition"
                          >
                            Retake Prakriti Test
                          </button>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 3: TRADITIONAL REMEDIES CATALOG */}
          {activeTab === "remedies" && (
            <motion.div
              key="remedies"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-slate-800">
                  AYUSH Home Remedies & Herbology Catalog
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  verified natural formulations from classical texts (charaka samhita & homoeopathic repertory)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {remedies.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-5"
                  >
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-2xl flex items-center justify-center rounded-2xl shrink-0">
                      {rem.imageEmoji}
                    </div>
                    <div className="space-y-3 flex-1 text-xs">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-slate-800 text-sm">
                            {rem.name}
                          </h4>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {rem.system}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          Ingredients: {rem.ingredients}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Primary Indications & Uses:
                          </span>
                          <span className="font-bold text-slate-700">{rem.indications}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Recommended Classical Dosage:
                          </span>
                          <span className="italic text-slate-600 font-semibold block mt-0.5">{rem.usage}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => alert(`Purchasing and formulation courier is managed by integrated pharmacy vendors. Order placed for ${rem.name}!`)}
                          className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[10px] rounded-lg transition uppercase tracking-wider flex items-center gap-1"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> Order Remedy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DISCLAIMER BOX */}
              <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl text-[10px] text-amber-800 leading-relaxed font-semibold">
                ⚠️ <span className="font-black uppercase tracking-wider block mb-1">Medical Disclaimer:</span> 
                The traditional remedies, diet, and posture guidance provided on this platform are for informational & preventive health purposes only. 
                They should not be treated as a substitute for urgent modern medical diagnosis. Please consult a qualified practitioner before beginning any heavy herbal protocols.
              </div>

            </motion.div>
          )}

          {/* TAB 4: REGISTER AS PRACTITIONER FORM */}
          {activeTab === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                    ✍️
                  </div>
                  <h3 className="text-base font-black text-slate-800">
                    AYUSH Practitioner Central Register
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you a certified Ayurvedic doctor (BAMS), Homeopath (BHMS), Siddha specialist, or certified yoga therapist? 
                    Submit your credentials to get listed on our live directory and accept patient bookings instantly.
                  </p>
                </div>

                <AnimatePresence>
                  {regSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3"
                    >
                      <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="text-xs text-emerald-800">
                        <span className="font-black block">Registration Completed Successfully!</span>
                        Your profile has been validated with CCIM central database and published live. Check the <strong>Explore Directory</strong>!
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegisterPractitioner} className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name (Prefix Dr.) *
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Kumar"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Alternative Medical System *
                      </label>
                      <select
                        value={regSystem}
                        onChange={(e) => setRegSystem(e.target.value as any)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700 bg-white"
                      >
                        <option value="Ayurveda">Ayurveda (BAMS / MD)</option>
                        <option value="Homeopathy">Homeopathy (BHMS)</option>
                        <option value="Unani">Unani (BUMS)</option>
                        <option value="Siddha">Siddha (BSMS)</option>
                        <option value="Yoga & Naturopathy">Yoga & Naturopathy (BNYS)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Clinical Experience (Years) *
                      </label>
                      <input
                        type="number"
                        value={regExp}
                        onChange={(e) => setRegExp(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        State Registration Board Location *
                      </label>
                      <input
                        type="text"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="e.g. Kerala, Delhi, Karnataka"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Areas of Specialization (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={regSpecs}
                      onChange={(e) => setRegSpecs(e.target.value)}
                      placeholder="e.g. Chronic joint inflammation, ahara diets, stress management"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 py-1.5">
                    <input
                      type="checkbox"
                      id="agree"
                      className="w-4.5 h-4.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      required
                    />
                    <label htmlFor="agree" className="font-semibold text-[10.5px]">
                      I confirm that I possess a valid degree recognized by central council of traditional medicine.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider transition cursor-pointer"
                  >
                    Submit Credentials to central Register
                  </button>

                </form>

              </div>
            </motion.div>
          )}

          {/* TAB 5: AYUSH GRID & ABDM INTEGRATION SANDBOX */}
          {activeTab === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* TOP BRANDING & PING BAR */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-purple-500/20 shadow-xl">
                <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 -mb-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      Ayush Grid Sandbox Active
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">
                      National Digital Health Infrastructure Hub
                    </h3>
                    <p className="text-xs text-purple-200/80 leading-relaxed font-medium">
                      Simulate full-spectrum clinical linkages with India's Ayush Grid and ABDM (Ayushman Bharat Digital Mission) architecture. Verify practitioners, provision ABHA health cards, adopt NAMASTE morbidity codes, and test real-time BHASHINI language engines.
                    </p>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/5 grid grid-cols-2 gap-4 text-center shrink-0">
                    <div className="px-3 border-r border-white/10">
                      <span className="block text-[8px] font-black uppercase text-purple-300">Gateway Status</span>
                      <span className="block font-mono text-xs font-black text-emerald-400 mt-1">CONNECTED</span>
                    </div>
                    <div className="px-3">
                      <span className="block text-[8px] font-black uppercase text-purple-300">Sandbox Ping</span>
                      <span className="block font-mono text-xs font-black text-yellow-400 mt-1">14ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* THREE COLUMN GRID OF SANDBOX INTERACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* INTERACTIVE COMPONENT 1: ABHA IDENTITY CARD MANAGER */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">💳</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                          ABHA Citizen ID Manager
                        </h4>
                        <p className="text-[10px] text-slate-400">Ayushman Bharat Health Account</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      ABDM Interoperable
                    </span>
                  </div>

                  <form onSubmit={handleAbhaVerify} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                          Enter ABHA ID *
                        </label>
                        <input
                          type="text"
                          value={abhaIdInput}
                          onChange={(e) => setAbhaIdInput(e.target.value)}
                          placeholder="e.g. 14-8841-3320-1102"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                          ABHA Address alias
                        </label>
                        <input
                          type="text"
                          value={abhaAddressInput}
                          onChange={(e) => setAbhaAddressInput(e.target.value)}
                          placeholder="e.g. rajesh@abha"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={abhaLoading}
                        className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {abhaLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>Verify Citizen Profile</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleAbhaGenerate}
                        disabled={abhaLoading}
                        className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ⚡ Generate ID
                      </button>
                    </div>
                  </form>

                  {/* ABHA HEALTH CARD RENDERING */}
                  <AnimatePresence mode="wait">
                    {verifiedAbhaData ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-br from-teal-500 via-emerald-600 to-indigo-700 p-5 rounded-2xl text-white relative overflow-hidden border border-emerald-400/20 shadow-lg"
                      >
                        <div className="absolute right-0 bottom-0 bg-white/5 rounded-full w-24 h-24 translate-x-4 translate-y-4" />
                        
                        <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4">
                          <div>
                            <span className="text-[8px] font-black tracking-widest uppercase opacity-75">National Health Authority</span>
                            <h5 className="text-[11px] font-black tracking-tight mt-0.5">AYUSHMAN BHARAT HEALTH CARD</h5>
                          </div>
                          <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded uppercase">ABDM</span>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl shadow">
                            {verifiedAbhaData.photoEmoji}
                          </div>
                          <div className="flex-1 space-y-1">
                            <span className="block text-[8px] font-bold uppercase tracking-wider opacity-75">Full Name</span>
                            <span className="block text-sm font-extrabold tracking-tight leading-none">{verifiedAbhaData.fullName}</span>
                            
                            <div className="grid grid-cols-2 gap-2 pt-1.5 text-[9px] font-bold">
                              <div>
                                <span className="block text-[6px] uppercase opacity-75">ABHA ID Number</span>
                                <span className="font-mono">{verifiedAbhaData.abhaId}</span>
                              </div>
                              <div>
                                <span className="block text-[6px] uppercase opacity-75">ABHA Address</span>
                                <span className="font-mono text-emerald-200">{verifiedAbhaData.abhaAddress}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/15 flex justify-between items-center text-[8px] font-bold opacity-90">
                          <div>
                            <span className="block text-[6px] opacity-75 uppercase">Linked Vault ID</span>
                            <span className="font-mono">{verifiedAbhaData.abdmVaultId}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[6px] opacity-75 uppercase">Security Sync</span>
                            <span className="text-emerald-300 font-mono">KYC OK</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="border border-dashed border-slate-200 p-6 rounded-2xl text-center text-slate-400 space-y-2">
                        <span className="text-3xl block">📁</span>
                        <h5 className="font-extrabold text-slate-600 text-xs">No Citizen Card Active</h5>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                          Verify a clinical patient ABHA number, or click "Generate ID" to fetch a fresh token and mock card.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* INTERACTIVE COMPONENT 2: PRACTITIONER LICENSE REGISTRY */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🩺</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                          Central Council Registry
                        </h4>
                        <p className="text-[10px] text-slate-400">National Practitioner Validation</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      Ayush Registry
                    </span>
                  </div>

                  <form onSubmit={handlePracVerify} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                        Practitioner Registration / Council Number *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pracLicenseInput}
                          onChange={(e) => setPracLicenseInput(e.target.value)}
                          placeholder="e.g. CCIM-AY-2023-8841"
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 uppercase"
                          required
                        />
                        <button
                          type="submit"
                          disabled={licenseLoading}
                          className="py-3 px-5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl transition uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
                        >
                          {licenseLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verify License"
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1.5">
                        Try verifying registered sandbox doctor licenses: <span className="font-mono text-purple-700 font-bold">CCIM-AY-2023-8841</span> or <span className="font-mono text-purple-700 font-bold">CCH-HM-2025-4421</span>.
                      </p>
                    </div>
                  </form>

                  {/* LICENSE RETRIEVAL RENDERING */}
                  <AnimatePresence mode="wait">
                    {verifiedPracData ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 text-xs font-semibold"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase">Registered Name</span>
                            <h5 className="font-black text-slate-800 text-sm mt-0.5">{verifiedPracData.name}</h5>
                            <span className="inline-block text-[9px] font-black uppercase text-purple-700 bg-purple-100/50 border border-purple-200/50 px-2 py-0.5 rounded mt-1.5">
                              🌿 Verified {verifiedPracData.system} Practitioner
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {verifiedPracData.licenseStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 text-[10.5px]">
                          <div>
                            <span className="block text-[8px] font-bold uppercase text-slate-400">Medical Degree</span>
                            <span className="text-slate-700 font-bold">{verifiedPracData.degree}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold uppercase text-slate-400">University / Year</span>
                            <span className="text-slate-700 font-bold">{verifiedPracData.university} ({verifiedPracData.year})</span>
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <span className="block text-[8px] font-bold uppercase text-slate-400">State Medical Council</span>
                            <span className="text-slate-700 font-bold">{verifiedPracData.stateBoard}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[9px] leading-relaxed relative">
                          <span className="absolute top-2 right-2 text-[7px] text-slate-500 font-bold uppercase">SECURE payload</span>
                          <span className="block text-slate-500"># cryptographically_signed_by_ayush_grid</span>
                          <span className="block">{"{"}</span>
                          <span className="block pl-4">"central_register_index": "{verifiedPracData.registryIndex}",</span>
                          <span className="block pl-4">"practitioner_status": "VALID",</span>
                          <span className="block pl-4">"digital_signature_hash": "0xBC849FDE99A102"</span>
                          <span className="block">{"}"}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="border border-dashed border-slate-200 p-6 rounded-2xl text-center text-slate-400 space-y-2">
                        <span className="text-3xl block">🏥</span>
                        <h5 className="font-extrabold text-slate-600 text-xs">Central Registry Verification</h5>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                          Perform a live sandbox lookup of central practitioner boards to ensure all clinical prescriptions link securely with National registries.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* TWO COLUMN GRID FOR NAMASTE CODES & BHASHINI TRANSLATION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* INTERACTIVE COMPONENT 3: NAMASTE MORBIDITY & ICD-11 TM2 DICTIONARY */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">📖</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                          NAMASTE & ICD-11 TM2 Codes
                        </h4>
                        <p className="text-[10px] text-slate-400">Interoperable Traditional Medicine Diagnoses</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-[8px] font-mono font-black text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        NAMASTE
                      </span>
                      <span className="text-[8px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        ICD-11 TM2
                      </span>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search ailment (e.g. asthma, amavata)..."
                        value={namasteSearch}
                        onChange={(e) => setNamasteSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
                      />
                    </div>
                    <select
                      value={selectedNamasteCategory}
                      onChange={(e) => setSelectedNamasteCategory(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 focus:outline-none bg-white"
                    >
                      <option value="All">All Systems</option>
                      <option value="Ayurveda">Ayurveda</option>
                      <option value="Siddha">Siddha</option>
                      <option value="Unani">Unani</option>
                    </select>
                  </div>

                  {/* Code Results Table */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {namasteMorbidityCodes
                      .filter(item => {
                        const matchesCategory = selectedNamasteCategory === "All" || item.system.includes(selectedNamasteCategory);
                        const matchesSearch = item.ayushName.toLowerCase().includes(namasteSearch.toLowerCase()) || 
                                              item.englishName.toLowerCase().includes(namasteSearch.toLowerCase()) ||
                                              item.namasteCode.toLowerCase().includes(namasteSearch.toLowerCase());
                        return matchesCategory && matchesSearch;
                      })
                      .map((item, idx) => (
                        <div key={idx} className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-150 transition space-y-2 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-extrabold text-slate-800 text-sm">{item.ayushName}</span>
                              <span className="text-slate-400 font-semibold block text-[10px]">{item.englishName} • <span className="italic text-purple-700">{item.system}</span></span>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[9px] font-mono font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded" title="NAMASTE Portal Standard Code">
                                {item.namasteCode}
                              </span>
                              <span className="text-[9px] font-mono font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded" title="WHO ICD-11 Traditional Medicine Module 2 Code">
                                ICD: {item.icd11tm2Code}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                            {item.description}
                          </p>
                          <div className="bg-white/70 p-2 rounded-lg border border-slate-200/50 flex items-center justify-between text-[10px] font-semibold">
                            <span className="text-slate-400">Integrated Remedy Linkage</span>
                            <span className="font-bold text-slate-800">{item.remedyRef}</span>
                          </div>
                        </div>
                      ))}
                    {namasteMorbidityCodes.filter(item => {
                      const matchesCategory = selectedNamasteCategory === "All" || item.system.includes(selectedNamasteCategory);
                      const matchesSearch = item.ayushName.toLowerCase().includes(namasteSearch.toLowerCase()) || 
                                            item.englishName.toLowerCase().includes(namasteSearch.toLowerCase()) ||
                                            item.namasteCode.toLowerCase().includes(namasteSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    }).length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                        ⚠️ No matching morbidity standards found.
                      </div>
                    )}
                  </div>
                </div>

                {/* INTERACTIVE COMPONENT 4: BHASHINI MULTILINGUAL TRANSLATION GATEWAY */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🗣️</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                          BHASHINI Language Gateway
                        </h4>
                        <p className="text-[10px] text-slate-400">Government Multilingual Translation Protocol</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      BHASHINI Core
                    </span>
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                        Clinical Notes / Dietary Instructions (English) *
                      </label>
                      <textarea
                        rows={2}
                        value={bhashiniInputText}
                        onChange={(e) => setBhashiniInputText(e.target.value)}
                        placeholder="Type instructions to translate..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                          Target Schedule-22 Language *
                        </label>
                        <select
                          value={bhashiniTargetLang}
                          onChange={(e) => setBhashiniTargetLang(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none bg-white"
                        >
                          <option value="Hindi">Hindi (Standard Devanagari)</option>
                          <option value="Sanskrit">Sanskrit (Classical)</option>
                          <option value="Tamil">Tamil (Classical Southern)</option>
                          <option value="Telugu">Telugu (Andhra/Telangana)</option>
                          <option value="Bengali">Bengali (East Indian)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleBhashiniTranslate}
                        disabled={bhashiniLoading}
                        className="mt-5 py-3 px-5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl transition uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {bhashiniLoading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>Translate Tips</>
                        )}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {bhashiniOutputText && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-1.5"
                        >
                          <span className="block text-[8px] font-black uppercase text-purple-400">Translated Outputs (BHASHINI Core-AI Node)</span>
                          <p className="text-sm font-bold text-purple-950 font-sans tracking-wide leading-relaxed">
                            {bhashiniOutputText}
                          </p>
                          <span className="block text-[8px] text-slate-400">
                            ✓ Unicode-16 validated • Translation status: High confidence (94.2%)
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* INTERACTIVE DEVELOPER SANDBOX API CONSOLE LOG (JetBrains Mono Terminal style) */}
              <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black font-mono tracking-widest uppercase text-slate-400">
                      Real-time API Console Logs (sandbox)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDeveloperConsoleLogs([
                        `[${new Date().toLocaleTimeString()}] SYSTEM: Developer API console logs flushed.`
                      ]);
                    }}
                    className="text-[9px] font-mono text-slate-500 hover:text-slate-300 transition"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="font-mono text-[10.5px] leading-relaxed space-y-1 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {developerConsoleLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`${
                        log.includes("SYSTEM:")
                          ? "text-slate-500"
                          : log.includes("Response: 200 OK") || log.includes("Response: 21")
                          ? "text-emerald-400"
                          : log.includes("POST") || log.includes("GET")
                          ? "text-indigo-300 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 6: AI CLINICAL ENGINES (Unified 5-System AYUSH AI Suite) */}
          {activeTab === "ai-engines" && (
            <motion.div
              key="ai-engines"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* HEADER BANNER */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-900 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none flex items-center justify-center font-sans">
                  <span className="text-[120px]">🧠</span>
                </div>
                <div className="relative z-10 max-w-4xl space-y-3">
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black px-3 py-1 rounded-full border border-indigo-500/30">
                    Decentralized Sovereign Intelligence
                  </span>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight">
                    AYUSH Unified Clinical AI Suite
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                    Orchestrate and deploy specialized, clinically-grounded traditional medicine AI models locally or via secure API endpoints. 
                    This sovereign suite operates offline, guaranteeing absolute patient confidentiality while delivering instant traditional diagnostics across all five AYUSH disciplines.
                  </p>
                </div>
              </div>

              {/* FIVE SYSTEM NAVIGATION TABS (Pills style) */}
              <div className="flex flex-wrap gap-2.5 p-2 bg-slate-100 rounded-2xl border border-slate-200/60 max-w-4xl">
                <button
                  onClick={() => setAiActiveSystem("ayurveda")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    aiActiveSystem === "ayurveda"
                      ? "bg-purple-700 text-white shadow-md shadow-purple-200"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <span>🌿</span> Ayurveda (VaidhLLaMA)
                </button>
                <button
                  onClick={() => setAiActiveSystem("yoga")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    aiActiveSystem === "yoga"
                      ? "bg-rose-700 text-white shadow-md shadow-rose-200"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <span>🧘</span> Yoga & Naturopathy (YogIC)
                </button>
                <button
                  onClick={() => setAiActiveSystem("unani")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    aiActiveSystem === "unani"
                      ? "bg-indigo-700 text-white shadow-md shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <span>⚜️</span> Unani (IbnSina)
                </button>
                <button
                  onClick={() => setAiActiveSystem("siddha")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    aiActiveSystem === "siddha"
                      ? "bg-amber-700 text-white shadow-md shadow-amber-200"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <span>☸️</span> Siddha (Agastya)
                </button>
                <button
                  onClick={() => setAiActiveSystem("homeopathy")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    aiActiveSystem === "homeopathy"
                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-200"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <span>💧</span> Homeopathy (OOREP)
                </button>
              </div>

              {/* BENTO LAYOUT FOR ACTIVE MODEL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* AYURVEDA SECTION */}
                {aiActiveSystem === "ayurveda" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Left: Input Console */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🌿</span>
                            <h3 className="font-extrabold text-slate-900 text-base">VaidhLLaMA-3.2-3B</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal">
                            Ayurveda-Specific Fine-tuned Instruction Model
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-bold">
                          Open Source (3.2B)
                        </span>
                      </div>

                      {/* Deployment Setup */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-700">Deployment Architecture:</span>
                          <div className="flex bg-slate-200 p-0.5 rounded-lg">
                            <button
                              onClick={() => {
                                setVaidhDeploymentMode("local");
                                setGpuVramUsage(0);
                                setTokensPerSec(0);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                                vaidhDeploymentMode === "local" ? "bg-white text-purple-800 shadow-sm" : "text-slate-500"
                              }`}
                            >
                              Local GPU
                            </button>
                            <button
                              onClick={() => {
                                setVaidhDeploymentMode("api");
                                setGpuVramUsage(0);
                                setTokensPerSec(0);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                                vaidhDeploymentMode === "api" ? "bg-white text-purple-800 shadow-sm" : "text-slate-500"
                              }`}
                            >
                              Remote API
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <div className="bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-normal">Hugging Face repo:</span>
                            <p className="font-mono font-bold text-[9.5px] truncate text-slate-700">Vivekdas/VaidhLLaMA-3.2-3B</p>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-normal">Host Platform:</span>
                            <p className="font-mono font-bold text-slate-700 text-ellipsis overflow-hidden">
                              {vaidhDeploymentMode === "local" ? "llama.cpp / Ollama" : "Secure server API"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* System Prompt / Guardrail */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-purple-600" />
                          Clinical Guardrail Prompt:
                        </label>
                        <textarea
                          rows={3}
                          className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent leading-relaxed"
                          value={vaidhSystemPrompt}
                          onChange={(e) => setVaidhSystemPrompt(e.target.value)}
                        />
                      </div>

                      {/* Form */}
                      <form onSubmit={handleVaidhQuery} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700">
                            Describe Symptoms & Clinical Presentation:
                          </label>
                          <textarea
                            rows={3}
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent leading-relaxed text-slate-800 shadow-inner"
                            placeholder="Type signs/symptoms to evaluate..."
                            value={vaidhQueryInput}
                            onChange={(e) => setVaidhQueryInput(e.target.value)}
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 font-normal self-center mr-1">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setVaidhQueryInput("Analyze symptoms: Chronic indigestion with bloating, acidity, and a feeling of heaviness after meals, especially in cold weather.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition cursor-pointer"
                          >
                            Indigestion (Vata-Kapha)
                          </button>
                          <button
                            type="button"
                            onClick={() => setVaidhQueryInput("Analyze symptoms: Sudden burning sensation in stomach, severe acid reflux, throbbing headache when skipping lunch, and easily irritated temperament.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition cursor-pointer"
                          >
                            Hyperacidity (Pitta)
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={vaidhLoading}
                          className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {vaidhLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Running GPU Inference...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Invoke VaidhLLaMA Model
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Right: Telemetry & Clinical Outputs */}
                    <div className="space-y-6 flex flex-col justify-between">
                      {/* Telemetry Block */}
                      <div className="bg-slate-900 text-slate-400 p-5 rounded-3xl border border-slate-800 font-mono text-[11px] space-y-4">
                        <div className="flex justify-between items-center text-[9.5px] border-b border-slate-800 pb-1.5 uppercase font-black text-slate-500 tracking-wider">
                          <span>GPU Host Telemetry</span>
                          <span className="text-purple-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                            LLAMA-NODE ONLINE
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center text-slate-300">
                          <div className="bg-slate-950/60 p-2.5 rounded-xl">
                            <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">GPU VRAM</span>
                            <p className="font-extrabold text-xs text-indigo-400">{gpuVramUsage > 0 ? `${gpuVramUsage} GB` : vaidhDeploymentMode === "local" ? "0.0 GB" : "N/A"}</p>
                          </div>
                          <div className="bg-slate-950/60 p-2.5 rounded-xl">
                            <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">Speed</span>
                            <p className="font-extrabold text-xs text-yellow-500">{tokensPerSec > 0 ? `${tokensPerSec} t/s` : "0.0 t/s"}</p>
                          </div>
                          <div className="bg-slate-950/60 p-2.5 rounded-xl">
                            <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">Quantization</span>
                            <p className="font-extrabold text-xs text-emerald-400">FP16 / GGUF</p>
                          </div>
                        </div>
                      </div>

                      {/* Response card */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[250px]">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-black text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                              ⚕️ Clinically Grounded Output
                            </span>
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              Ayurveda Engine
                            </span>
                          </div>

                          {vaidhResponseText ? (
                            <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line font-normal">
                              {vaidhResponseText}
                            </div>
                          ) : (
                            <div className="text-slate-400 italic text-xs py-8 text-center">
                              No clinical inference triggers recorded. Type symptoms and click "Invoke VaidhLLaMA" to trigger clinical processing.
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 border-t border-slate-100 pt-3 italic">
                          ⚠️ Disclaimer: VaidhLLaMA output is intended for practitioner validation and clinical decision support. Confirm prescriptions before administering.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* YOGA & NATUROPATHY SECTION */}
                {aiActiveSystem === "yoga" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Left: Input Console */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🧘</span>
                            <h3 className="font-extrabold text-slate-900 text-base">YogIC-Biofeedback-2.1</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal">
                            Computer Vision Posture Analyzer & Pranayama Biofeedback Controller
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg font-bold">
                          Local CV (7.2B)
                        </span>
                      </div>

                      {/* Config */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <span className="text-xs font-black text-slate-700 block">Sensor Orchestration:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <div className="bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-normal">Inference Mode:</span>
                            <p className="font-mono font-bold text-[9.5px] text-slate-700">CV Mesh Alignment</p>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-normal">Signal Interface:</span>
                            <p className="font-mono font-bold text-slate-700">RGB Camera Stream</p>
                          </div>
                        </div>
                      </div>

                      {/* System Prompt / Instructions */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-rose-600" />
                          Biofeedback System Prompt:
                        </label>
                        <textarea
                          rows={3}
                          className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent leading-relaxed"
                          value={yogicSystemPrompt}
                          onChange={(e) => setYogicSystemPrompt(e.target.value)}
                        />
                      </div>

                      {/* Form */}
                      <form onSubmit={handleYogicQuery} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700">
                            Describe Posture Execution & Breathing State:
                          </label>
                          <textarea
                            rows={3}
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent leading-relaxed text-slate-800 shadow-inner"
                            placeholder="Type posture details (e.g., Tadasana with uneven shoulders, shallow breathing, stress)..."
                            value={yogicQueryInput}
                            onChange={(e) => setYogicQueryInput(e.target.value)}
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 font-normal self-center mr-1">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setYogicQueryInput("Assess alignment and breathing rhythm: Doing Tadasana with shallow chest breathing, elevated shoulders, and minor balance shakiness on the left side.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition cursor-pointer"
                          >
                            Tadasana (Uneven Shoulders)
                          </button>
                          <button
                            type="button"
                            onClick={() => setYogicQueryInput("Assess posture for chronic anxiety and severe stress: Recommend cooling restoratives, Nadi Shodhana cycles, and bedtime Naturopathic sleep aids.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition cursor-pointer"
                          >
                            Restorative (Anxiety/Stress)
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={yogicLoading}
                          className="w-full bg-rose-700 hover:bg-rose-800 disabled:bg-rose-300 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {yogicLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Processing Posture Mesh...
                            </>
                          ) : (
                            <>
                              <Activity className="h-4 w-4" />
                              Invoke YogIC Pose Analyzer
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Right: Metrics & Biofeedback Outputs */}
                    <div className="space-y-6 flex flex-col justify-between">
                      {/* Biofeedback telemetry gauges */}
                      <div className="bg-slate-900 text-slate-400 p-5 rounded-3xl border border-slate-800 font-mono text-[11px] space-y-4">
                        <div className="flex justify-between items-center text-[9.5px] border-b border-slate-800 pb-1.5 uppercase font-black text-slate-500 tracking-wider">
                          <span>Live Sensor Telemetry Handshake</span>
                          <span className="text-rose-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                            BIO-MESH CAPTURING
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                            <span className="text-[8.5px] text-slate-500 block mb-1 uppercase">POSE ALIGNMENT SCORE</span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-extrabold text-lg text-rose-400">{yogicAlignmentScore > 0 ? `${yogicAlignmentScore}%` : "0%"}</span>
                              <span className="text-[8px] text-slate-500">Confidence</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${yogicAlignmentScore}%` }} />
                            </div>
                          </div>
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                            <span className="text-[8.5px] text-slate-500 block mb-1 uppercase">RESPIRATORY RATE</span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-extrabold text-lg text-teal-400">{yogicRespRate > 0 ? `${yogicRespRate} BPM` : "0 BPM"}</span>
                              <span className="text-[8px] text-slate-500">Resting cycle</span>
                            </div>
                            <div className="flex gap-0.5 items-end h-3 mt-2">
                              <span className="w-1 bg-teal-500/30 rounded-t h-1 animate-pulse" />
                              <span className="w-1 bg-teal-500/60 rounded-t h-2 animate-pulse" />
                              <span className="w-1 bg-teal-500 rounded-t h-3 animate-pulse" />
                              <span className="w-1 bg-teal-500/80 rounded-t h-2.5 animate-pulse" />
                              <span className="w-1 bg-teal-500/40 rounded-t h-1.5 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Response card */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[250px]">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                              🧘 YogIC Biofeedback Report
                            </span>
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              Yoga & Naturopathy
                            </span>
                          </div>

                          {yogicResponseText ? (
                            <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line font-normal">
                              {yogicResponseText}
                            </div>
                          ) : (
                            <div className="text-slate-400 italic text-xs py-8 text-center">
                              No postural coordinates processed. Enter posture/breath states and click "Invoke YogIC" to initiate biofeedback computations.
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 border-t border-slate-100 pt-3 italic">
                          ⚠️ Naturopathy Core Note: Regular self-checks with respiratory biofeedback prevent physical strain. Validate with a certified Yoga instructor.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* UNANI SECTION */}
                {aiActiveSystem === "unani" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Left: Input Console */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">⚜️</span>
                            <h3 className="font-extrabold text-slate-900 text-base">IbnSina-Unani-7B</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal">
                            Clinical Consultation Model on the Four Humors (Akhlat) & Mizaj
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                          Unani-Fine-tuned (7B)
                        </span>
                      </div>

                      {/* Config metadata */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <span className="text-xs font-black text-slate-700 block">Humoral Diagnostic Logic:</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          Matches signs to the classical Avicennian system: evaluating humoral excess in Blood (Dam), Phlegm (Balgham), Yellow Bile (Safra), and Black Bile (Sauda).
                        </p>
                      </div>

                      {/* System Prompt */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-indigo-600" />
                          Unani Humoral Prompt:
                        </label>
                        <textarea
                          rows={3}
                          className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
                          value={unaniSystemPrompt}
                          onChange={(e) => setUnaniSystemPrompt(e.target.value)}
                        />
                      </div>

                      {/* Form */}
                      <form onSubmit={handleUnaniQuery} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700">
                            Describe General Symptoms, Temperament (Mizaj) & Complexion:
                          </label>
                          <textarea
                            rows={3}
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed text-slate-800 shadow-inner"
                            placeholder="Type constitutional characteristics (e.g., body temperature, digestion, complexion)..."
                            value={unaniQueryInput}
                            onChange={(e) => setUnaniQueryInput(e.target.value)}
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 font-normal self-center mr-1">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setUnaniQueryInput("Analyze temperament (Mizaj) and symptoms: Feeling excessively hot even in mild weather, constant bitter taste in the mouth, yellow complexion, and quick temper with restless sleep.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer"
                          >
                            Hot-Dry Bile Excess (Safra)
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnaniQueryInput("Analyze symptoms: Cold skin, sluggish digestion, feeling of heavy chest with persistent white mucus discharge, and lethargy.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer"
                          >
                            Cold-Moist Phlegm Excess (Balgham)
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={unaniLoading}
                          className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-300 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {unaniLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Analyzing Humor Balances...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4" />
                              Invoke IbnSina Humoral Engine
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Right: Humors Graph & Outputs */}
                    <div className="space-y-6 flex flex-col justify-between">
                      {/* Humors horizontal bar charts */}
                      <div className="bg-slate-900 text-slate-400 p-5 rounded-3xl border border-slate-800 font-mono text-[11px] space-y-4">
                        <div className="flex justify-between items-center text-[9.5px] border-b border-slate-800 pb-1.5 uppercase font-black text-slate-500 tracking-wider">
                          <span>Humoral Equilibrium Matrix (Akhlat)</span>
                          <span className="text-indigo-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            MIZAJ CLASSIFICATION READY
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* SAFRA */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-300">
                              <span>YELLOW BILE (Safra - Fire)</span>
                              <span className="text-amber-400 font-bold">{unaniHumorSafra}%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${unaniHumorSafra}%` }} />
                            </div>
                          </div>
                          
                          {/* DAM */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-300">
                              <span>BLOOD (Dam - Air)</span>
                              <span className="text-red-400 font-bold">{unaniHumorDam}%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-red-400 h-full transition-all duration-1000" style={{ width: `${unaniHumorDam}%` }} />
                            </div>
                          </div>

                          {/* BALGHAM */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-300">
                              <span>PHLEGM (Balgham - Water)</span>
                              <span className="text-sky-400 font-bold">{unaniHumorBalgham}%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-sky-400 h-full transition-all duration-1000" style={{ width: `${unaniHumorBalgham}%` }} />
                            </div>
                          </div>

                          {/* SAUDA */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-300">
                              <span>BLACK BILE (Sauda - Earth)</span>
                              <span className="text-emerald-400 font-bold">{unaniHumorSauda}%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${unaniHumorSauda}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Response card */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[250px]">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                              ⚜️ IbnSina-Unani Clinical Report
                            </span>
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              Unani Medicine
                            </span>
                          </div>

                          {unaniResponseText ? (
                            <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line font-normal">
                              {unaniResponseText}
                            </div>
                          ) : (
                            <div className="text-slate-400 italic text-xs py-8 text-center">
                              No humoral signs analyzed. Enter constitutional symptoms and click "Invoke IbnSina" to classify humoral temperament.
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 border-t border-slate-100 pt-3 italic">
                          ⚠️ Unani Clinical Core: Treatment focuses on regaining humoral balance (Tasfiah) via targeted diets (Ilaj-bil-Ghiya) and lifestyle management.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SIDDHA SECTION */}
                {aiActiveSystem === "siddha" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Left: Input Console */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">☸️</span>
                            <h3 className="font-extrabold text-slate-900 text-base">Agastya-Siddha-3B</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal">
                            Specialized Siddha Clinical System for Naadi & Varmam Therapeutics
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-bold">
                          Agastya fine-tune (3B)
                        </span>
                      </div>

                      {/* Setup Info */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <span className="text-xs font-black text-slate-700 block">Siddha Clinical Logic:</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          Evaluates the three cosmic humors (Mukkuttram) - Vaatham, Pitham, and Kabham - mapped to therapeutic herbs (Karpam) and Varmam physical pressure releases.
                        </p>
                      </div>

                      {/* System Prompt */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-amber-600" />
                          Agastya Prompt:
                        </label>
                        <textarea
                          rows={3}
                          className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent leading-relaxed"
                          value={siddhaSystemPrompt}
                          onChange={(e) => setSiddhaSystemPrompt(e.target.value)}
                        />
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSiddhaQuery} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700">
                            Describe Symptoms, Joint Pain & Pulse Characteristics (Naadi):
                          </label>
                          <textarea
                            rows={3}
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent leading-relaxed text-slate-800 shadow-inner"
                            placeholder="Type symptoms and Naadi attributes (e.g., stiff shoulder joints, heavy pulse beneath fingers)..."
                            value={siddhaQueryInput}
                            onChange={(e) => setSiddhaQueryInput(e.target.value)}
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 font-normal self-center mr-1">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setSiddhaQueryInput("Analyze Naadi (Pulse) and Varmam symptoms: High-pitch pulse felt beneath the index finger, severe stiffness in the shoulder joints (Kaba-Vatha aggravation), and reduced mobility in upper extremities.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition cursor-pointer"
                          >
                            Joint Stiffness (Kabha-Vaatham)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSiddhaQueryInput("Analyze skin symptoms: Inflammatory eruptions, severe itching, skin heat, boils, with an extremely fast, jumpy Pitham pulse beneath the ring finger.")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition cursor-pointer"
                          >
                            Inflammatory Skin (Pitham)
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={siddhaLoading}
                          className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {siddhaLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Analyzing Naadi Harmonics...
                            </>
                          ) : (
                            <>
                              <Activity className="h-4 w-4" />
                              Invoke Agastya Pulse Engine
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Right: Naadi Ratio & Siddha Outputs */}
                    <div className="space-y-6 flex flex-col justify-between">
                      {/* Pulse signature telemetries */}
                      <div className="bg-slate-900 text-slate-400 p-5 rounded-3xl border border-slate-800 font-mono text-[11px] space-y-4">
                        <div className="flex justify-between items-center text-[9.5px] border-b border-slate-800 pb-1.5 uppercase font-black text-slate-500 tracking-wider">
                          <span>Naadi Pulse Frequencies (Mukkuttram)</span>
                          <span className="text-amber-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            PULSE-WAVE CAPTURED
                          </span>
                        </div>
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3.5">
                          <div>
                            <span className="text-[8.5px] text-slate-500 block uppercase mb-1">Mukkuttram Naadi Pulse Amplitude</span>
                            <div className="font-bold text-slate-200 text-xs">
                              {siddhaNaadiPulseRatio}
                            </div>
                          </div>
                          
                          {/* Draw visual indicators of the pulse */}
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] text-slate-400 w-12 font-bold uppercase">VAATHAM:</span>
                            <div className="flex-1 bg-slate-850 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: siddhaNaadiPulseRatio.includes("Vaatham: 1/2") ? "50%" : "33%" }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] text-slate-400 w-12 font-bold uppercase">PITHAM:</span>
                            <div className="flex-1 bg-slate-850 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: siddhaNaadiPulseRatio.includes("Pitham: 4") ? "90%" : "33%" }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] text-slate-400 w-12 font-bold uppercase">KABHAM:</span>
                            <div className="flex-1 bg-slate-850 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: siddhaNaadiPulseRatio.includes("Kabham: 4") ? "90%" : "33%" }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Response card */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[250px]">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                              ☸️ Agastya-Siddha Clinical Report
                            </span>
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              Siddha Medicine
                            </span>
                          </div>

                          {siddhaResponseText ? (
                            <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line font-normal">
                              {siddhaResponseText}
                            </div>
                          ) : (
                            <div className="text-slate-400 italic text-xs py-8 text-center">
                              No Naadi signals analyzed. Describe pulse amplitudes and joint concerns and click "Invoke Agastya Pulse Engine".
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 border-t border-slate-100 pt-3 italic">
                          ⚠️ Siddha clinical wisdom leverages vital pressure points (Varmam) and therapeutic mineral-botanical Karpams for restoration.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* HOMEOPATHY SECTION */}
                {aiActiveSystem === "homeopathy" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Left: Input Console */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">💧</span>
                            <h3 className="font-extrabold text-slate-900 text-base">OOREP Repertory</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal">
                            Open Online Repertory Knowledge Base & MCP Protocol Interface
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                          JSON-RPC MCP
                        </span>
                      </div>

                      {/* Config */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <span className="text-xs font-black text-slate-700 block">Model Context Protocol (MCP) Interface:</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          Bridged directly via Model Context Protocol. This lets clinical LLMs query homeopathic rubrics, Boericke Materia Medica, and Kent indices as a native tool, redefining semantic drug selection.
                        </p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleOorepQuery} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                            Search Repertory Rubrics / Symptoms:
                          </label>
                          <input
                            type="text"
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 shadow-inner"
                            placeholder="Type clinical rubrics..."
                            value={oorepSymptomInput}
                            onChange={(e) => setOorepSymptomInput(e.target.value)}
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 font-normal self-center mr-1">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setOorepSymptomInput("chills, thirstlessness, deep throat pain, pain worse from cold swallow")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            Gelsemium / Throat Chill
                          </button>
                          <button
                            type="button"
                            onClick={() => setOorepSymptomInput("headache from sun exposure, red face, throbbing pain, sudden onset")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            Belladonna / Sunstroke
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={oorepLoading}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {oorepLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Broadcasting JSON-RPC over MCP...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4" />
                              Query Boericke & Kent Indices
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Right: MCP Terminal, Matches, Materia Medica */}
                    <div className="space-y-6 flex flex-col justify-between">
                      {/* MCP Logs */}
                      <div className="space-y-2">
                        <span className="text-xs font-black text-slate-700 block">MCP JSON-RPC Pipeline Stream:</span>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-3xl border border-slate-800 font-mono text-[10px] leading-relaxed space-y-1.5 h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                          {oorepMcpLogs.length > 0 ? (
                            oorepMcpLogs.map((log, i) => (
                              <div
                                key={i}
                                className={`${
                                  log.includes("Sending request") ? "text-indigo-400" :
                                  log.includes("Matches found") || log.includes("Successfully resolved") ? "text-emerald-400" :
                                  log.includes("Arguments") ? "text-yellow-200" : "text-slate-400"
                                }`}
                              >
                                {log}
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-600 italic">No MCP channel queries recorded yet. Push "Query Boericke" to activate standard JSON-RPC.</div>
                          )}
                        </div>
                      </div>

                      {/* Matches */}
                      {oorepRemedyResults.length > 0 && (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            🎯 Repertorial Match Analysis
                          </h4>
                          <div className="space-y-2">
                            {oorepRemedyResults.map((rem, i) => (
                              <div
                                key={i}
                                onClick={() => setSelectedOorepRemedy(rem)}
                                className={`border rounded-2xl p-3.5 transition cursor-pointer flex justify-between items-start ${
                                  selectedOorepRemedy?.remedyCode === rem.remedyCode
                                    ? "bg-emerald-50/50 border-emerald-300 shadow-sm"
                                    : "bg-white border-slate-100 hover:border-slate-300"
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-emerald-100 text-emerald-800 font-mono font-black text-[9px] px-1.5 py-0.5 rounded">
                                      {rem.remedyCode}
                                    </span>
                                    <h5 className="text-xs font-extrabold text-slate-800">{rem.remedy}</h5>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {rem.rubrics.map((r: string, rIdx: number) => (
                                      <span key={rIdx} className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                        • {r}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right space-y-0.5 shrink-0 ml-2">
                                  <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full block text-center">
                                    {rem.grade} Marks
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 block text-center">
                                    {rem.potency}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Selected Detail */}
                      {selectedOorepRemedy && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl border border-emerald-900 space-y-2"
                        >
                          <div className="flex justify-between items-center border-b border-emerald-800 pb-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                              📖 Boericke Materia Medica Extract
                            </span>
                            <button
                              onClick={() => setSelectedOorepRemedy(null)}
                              className="text-[10px] font-bold text-emerald-400 hover:text-white cursor-pointer"
                            >
                              ✕ Close Detail
                            </button>
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black">{selectedOorepRemedy.remedy}</h4>
                            <p className="text-[10.5px] leading-relaxed text-emerald-200/90 font-normal">
                              {selectedOorepRemedy.materiaMedica}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

              </div>

              {/* INTEGRATION & DEPLOYMENT GUIDE (API KEYS & ZERO-KEY SELF HOSTING) */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-4 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🔑</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        AYUSH Models Deployment & Key Guide
                      </h4>
                      <p className="text-[10px] text-slate-500">Zero-Key Open-Source Orchestration Architecture</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full uppercase">
                    100% Offline Capable
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* CARD 1: VAIDHLLAMA SETUP */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/50 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-purple-800 font-extrabold">
                      <span className="text-base">🌿</span>
                      <h5>VaidhLLaMA-3.2-3B</h5>
                    </div>
                    <p className="text-slate-500 leading-relaxed text-[11px] font-normal">
                      Ayurvedic clinical assistant fine-tuned on classical texts. Deploys with zero keys.
                    </p>
                    <div className="space-y-2 pt-1">
                      <span className="block text-[8px] uppercase tracking-widest font-black text-slate-400">Deployment Methods:</span>
                      <ul className="space-y-1.5 font-mono text-[10px] text-slate-700">
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">▸</span>
                          <span><strong>Ollama:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-[9px] text-purple-700">ollama run vaidhllama</code></span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">▸</span>
                          <span><strong>Hugging Face:</strong> Download weights directly (<code className="bg-slate-100 px-1 py-0.5 rounded text-[9px]">Vivekdas/...</code>)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* CARD 2: YOGIC, IBN SINA, AGASTYA */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/50 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-800 font-extrabold">
                      <span className="text-base">🧘</span>
                      <h5>YogIC, IbnSina, Agastya</h5>
                    </div>
                    <p className="text-slate-500 leading-relaxed text-[11px] font-normal">
                      Decentralized clinical models for Yoga & Naturopathy, Unani Akhlat, and Siddha pulse analysis.
                    </p>
                    <div className="space-y-2 pt-1">
                      <span className="block text-[8px] uppercase tracking-widest font-black text-slate-400">Ollama Setup Manifests:</span>
                      <ul className="space-y-1.5 font-mono text-[10px] text-slate-700">
                        <li className="flex items-start gap-1">
                          <span className="text-rose-600">▸</span>
                          <span><strong>YogIC-Biofeedback:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-[9px] text-rose-700">ollama run yogic-2.1</code></span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-indigo-600">▸</span>
                          <span><strong>IbnSina-Unani:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-[9px] text-indigo-700">ollama run ibnsina</code></span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* CARD 3: OOREP MCP REPERTORY */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/50 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                      <span className="text-base">💧</span>
                      <h5>OOREP Repertory</h5>
                    </div>
                    <p className="text-slate-500 leading-relaxed text-[11px] font-normal">
                      Fully open Online Repertory. Call via Model Context Protocol or compiled local database files.
                    </p>
                    <div className="space-y-2 pt-1">
                      <span className="block text-[8px] uppercase tracking-widest font-black text-slate-400">MCP Protocol Usage:</span>
                      <ul className="space-y-1.5 font-mono text-[10px] text-slate-700">
                        <li className="flex items-start gap-1">
                          <span className="text-emerald-600">▸</span>
                          <span><strong>Run Server:</strong> Standard JSON-RPC command <code className="bg-slate-100 px-1 py-0.5 rounded text-[9px] text-emerald-700">npx oorep-mcp</code></span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-emerald-600">▸</span>
                          <span><strong>Integrate:</strong> Directly bind to Ollama/Llama.cpp system toolkits.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs font-semibold">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white">AYUSH<span className="text-yellow-500">.</span></span>
            </div>
            <p className="text-slate-500 leading-relaxed font-normal">
              Empowering traditional Indian wisdom with AI technology. Under the aegis of CURA wellness frameworks.
            </p>
            <p className="text-[10px] text-slate-600">
              © 2026 AYUSH platform. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="text-slate-200 uppercase tracking-wider font-extrabold text-xs mb-3">Healthcare Systems</h4>
            <ul className="space-y-2 font-normal">
              <li>Ayurveda (Traditional Medicine)</li>
              <li>Homeopathy (Dilutions)</li>
              <li>Siddha & Unani Science</li>
              <li>Yoga & Lifestyle Naturopathy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 uppercase tracking-wider font-extrabold text-xs mb-3">AI Platforms</h4>
            <ul className="space-y-2 font-normal">
              <li>Prakriti Constitution profiling</li>
              <li>Dietary Ahara recommenders</li>
              <li>Traditional Herbs database</li>
              <li>Varma healing locators</li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 uppercase tracking-wider font-extrabold text-xs mb-3">Legal & Governance</h4>
            <ul className="space-y-2 font-normal">
              <li>CCIM/CCH Certified Network</li>
              <li>Ministry guidelines compliance</li>
              <li>Data privacy encryption</li>
              <li>Practitioner validation registry</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODAL 1: PRACTITIONER BOOKING MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedPracToBook && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Book Consultation Slot
                </h3>
                <button
                  onClick={() => setSelectedPracToBook(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer font-extrabold text-slate-500"
                >
                  ✕
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <span className="text-4xl block">✅</span>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    Appointment Request Logged!
                  </h4>
                  <p className="text-xs text-slate-500">
                    A WhatsApp SMS confirmation has been dispatched to your phone with Dr. {selectedPracToBook.name}'s room link.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePracBookSubmit} className="space-y-4 text-xs font-semibold">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase">Selected Doctor</span>
                    <span className="block font-black text-slate-800">{selectedPracToBook.name}</span>
                    <span className="block text-[10px] text-purple-700 font-extrabold uppercase">{selectedPracToBook.system} Specialist</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                      Select Slot Date *
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                      Preferred Consultation Time *
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold bg-white"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                      Contact WhatsApp Mobile *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl transition uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Booking Request
                  </button>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 2: WELLNESS CENTER BOOKING MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedCenterToBook && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Enquire Wellness Program
                </h3>
                <button
                  onClick={() => setSelectedCenterToBook(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer font-extrabold text-slate-500"
                >
                  ✕
                </button>
              </div>

              {centerBookingSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <span className="text-4xl block">🌿</span>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    Enquiry Logged with Center!
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedCenterToBook.name} guest desk will coordinate clinical dates & tariff with you via WhatsApp soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCenterBookSubmit} className="space-y-4 text-xs font-semibold">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase">Selected Center</span>
                    <span className="block font-black text-slate-800">{selectedCenterToBook.name}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                      Select Specific Package *
                    </label>
                    <select
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold bg-white"
                      required
                    >
                      <option value="">-- Choose Retreat Package --</option>
                      {selectedCenterToBook.packages.map((pkg, idx) => (
                        <option key={idx} value={pkg}>{pkg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                      Desired Start Month *
                    </label>
                    <select
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold bg-white"
                    >
                      <option>This Month (July 2026)</option>
                      <option>Next Month (August 2026)</option>
                      <option>September 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                      Your Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl transition uppercase tracking-wider cursor-pointer"
                  >
                    Submit Package Enquiry
                  </button>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

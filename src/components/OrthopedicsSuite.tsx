import React, { useState } from "react";
import {
  Bone,
  Activity,
  Calendar,
  Clock,
  ShieldAlert,
  Plus,
  CheckCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  Award,
  Zap,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
  Scale,
  Ruler,
  ShieldCheck,
  Stethoscope,
  BookOpen,
  Flame,
  Pill,
  Sparkles
} from "lucide-react";

export interface OrthopedicsSuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function OrthopedicsSuite({
  onBackToLanding,
  patientName = "Rajesh Kumar",
  patientAge = 45,
  patientGender = "Male"
}: OrthopedicsSuiteProps) {
  const [activeTab, setActiveTab] = useState<"fracture" | "spine" | "arthroscopy" | "joint" | "rehab" | "sports" | "oa" | "dexa" | "inventory" | "soap">("fracture");

  // Fracture & Open Trauma Gustilo-Anderson State
  const [fractureLocation, setFractureLocation] = useState<string>("Distal Radius (Colles' Fracture)");
  const [fractureType, setFractureType] = useState<string>("Closed, Extra-Articular (AO Type 23-A2)");
  const [gustiloGrade, setGustiloGrade] = useState<string>("Closed Fracture (Skin Intact)");
  const [angulationDeg, setAngulationDeg] = useState<number>(15);
  const [shorteningMm, setShorteningMm] = useState<number>(3);
  const [displacementMm, setDisplacementMm] = useState<number>(4);
  const [treatmentChoice, setTreatmentChoice] = useState<string>("Closed Reduction & Short Arm Cast Immobilization");

  // Spine & Scoliosis State
  const [spineRegion, setSpineRegion] = useState<string>("Lumbar Spine (L4-L5 Disc Herniation)");
  const [cobbAngleDeg, setCobbAngleDeg] = useState<number>(28);
  const [spondylolisthesisGrade, setSpondylolisthesisGrade] = useState<string>("Grade I (L5-S1 Anterolisthesis <25%)");
  const [oswestryDisabilityIndexPct, setOswestryDisabilityIndexPct] = useState<number>(34); // 0-100%
  const [radiculopathyLevel, setRadiculopathyLevel] = useState<string>("Right L5 Nerve Root Distribution");

  // Arthroscopy & Minimally Invasive State
  const [arthroscopyJoint, setArthroscopyJoint] = useState<string>("Right Knee Diagnostic & Therapeutic Arthroscopy");
  const [aclGraftType, setAclGraftType] = useState<string>("Quadrupled Hamstring Autograft (Semitendinosus / Gracilis)");
  const [meniscusRepairType, setMeniscusRepairType] = useState<string>("Inside-Out Meniscal Repair (Fast-Fix 360)");
  const [rotatorCuffSize, setRotatorCuffSize] = useState<string>("Medium Tear (1.5 cm Supraspinatus)");

  // Implant Inventory & Tracking State
  const [implantBrand, setImplantBrand] = useState<string>("Stryker Triathlon Total Knee System");
  const [femoralSerialNo, setFemoralSerialNo] = useState<string>("LOT-2026-88914");
  const [tibialSerialNo, setTibialSerialNo] = useState<string>("LOT-2026-99321");
  const [polyThicknessMm, setPolyThicknessMm] = useState<number>(10);
  const [implantStockStatus, setImplantStockStatus] = useState<string>("In Stock - Sterility Verified (UDI Verified)");

  // Joint Replacement Templating State
  const [jointType, setJointType] = useState<string>("Knee (Primary TKA)");
  const [jointSide, setJointSide] = useState<string>("Right");
  const [femoralComponentSize, setFemoralComponentSize] = useState<string>("Size 4 (PS Design)");
  const [tibialComponentSize, setTibialComponentSize] = useState<string>("Size 3 Tray + 10mm Polyethylene Insert");
  const [oxfordScore, setOxfordScore] = useState<number>(18); // 0-48 score (lower = severe arthritis)

  // Physical Therapy & MMT/ROM State
  const [quadsMmt, setQuadsMmt] = useState<number>(4); // Grade 0-5
  const [hamstringsMmt, setHamstringsMmt] = useState<number>(4);
  const [kneeFlexionRom, setKneeFlexionRom] = useState<number>(105); // degrees
  const [kneeExtensionRom, setKneeExtensionRom] = useState<number>(0); // degrees
  const [gaitAnalysis, setGaitAnalysis] = useState<string>("Antalgic Gait (Reduced Stance Phase on Right)");

  // Sports Injury & Ligament State
  const [sportsInjury, setSportsInjury] = useState<string>("Right Knee ACL Tear + Medial Meniscus Bucket-Handle Tear");
  const [lachmanTest, setLachmanTest] = useState<string>("Grade 2+ (Soft End-Point)");
  const [pivotShiftTest, setPivotShiftTest] = useState<string>("Positive (Glide / Clunk)");
  const [mcmurrayTest, setMcMurrayTest] = useState<string>("Positive for Medial Joint Line Click");
  const [returnToPlayWeeks, setReturnToPlayWeeks] = useState<number>(36);

  // Osteoarthritis (OA) State
  const [klGrade, setKlGrade] = useState<number>(3); // Grade 0-4
  const [womacPainScore, setWomacPainScore] = useState<number>(14); // 0-20
  const [womacStiffnessScore, setWomacStiffnessScore] = useState<number>(6); // 0-8
  const [womacFunctionScore, setWomacFunctionScore] = useState<number>(42); // 0-68
  const totalWomacScore = womacPainScore + womacStiffnessScore + womacFunctionScore;

  // DEXA & Osteoporosis State
  const [lumbarTScore, setLumbarTScore] = useState<number>(-2.8);
  const [femoralNeckTScore, setFemoralNeckTScore] = useState<number>(-2.4);
  const [fraxMajorRiskPct, setFraxMajorRiskPct] = useState<number>(18.5);
  const [fraxHipRiskPct, setFraxHipRiskPct] = useState<number>(4.2);

  const dexaDiagnosis = Math.min(lumbarTScore, femoralNeckTScore) <= -2.5
    ? "Osteoporosis (T-score ≤ -2.5)"
    : Math.min(lumbarTScore, femoralNeckTScore) <= -1.0
    ? "Osteopenia (T-score -1.0 to -2.5)"
    : "Normal Bone Mineral Density";

  // Orthopedic SOAP State
  const [orthoSoap, setOrthoSoap] = useState({
    subjective: "45-year-old male presents with right wrist pain following a slip and fall on an outstretched hand (FOOSH). Complains of acute swelling, deformity ('dinner-fork' appearance), and restricted wrist movements. Denies numbness in median nerve distribution.",
    objective: "Right Wrist Inspection: Dorsal displacement and radial deviation. Palpation: Tenderness over distal radius, no skin tenting. Neurovascular: Radial pulse 2+ equal bilateral, CRT < 2s, Sensation intact in C6-T1 dermatomes. X-ray Right Wrist AP/Lateral: Transverse fracture of distal radial metaphysis with dorsal angulation (15°) and 3mm shortening (Colles' Fracture).",
    assessment: "1. Acute Closed Distal Radius Fracture Right (Colles' Fracture - AO 23-A2).\n2. Intact Neurovascular Status Right Upper Extremity.\n3. Low Immediate Compartment Syndrome Risk.",
    plan: "1. Hematoma block under aseptic precautions using 10ml 1% Lignocaine.\n2. Closed reduction under fluoroscopy and application of Below-Elbow POP Cast.\n3. Post-reduction check X-ray to verify anatomical alignment.\n4. T. Aceclofenac 100mg + Paracetamol 325mg BD for 5 days.\n5. Limb elevation and active finger movements instructed.\n6. Review in OPD with repeat X-ray in 1 week."
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/90 backdrop-blur border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition cursor-pointer"
              >
                ← Back
              </button>
            )}
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl">
              <Bone className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Orthopedics & Musculoskeletal AI
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  AO/OTA & AAOS 2026 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fracture Reduction & Cast Planner, Arthroplasty Templating, Rehab MMT/ROM Suite, Ligament Tests & DEXA FRAX Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>AO Trauma Clinical Protocols Active</span>
          </div>
        </div>

        {/* Patient Profile Banner */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-800 to-slate-900 border border-blue-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: ORTH-2026-7732
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Injury: <strong className="text-blue-300">{fractureLocation}</strong></span>
                <span className="text-slate-500">•</span>
                <span>Type: <strong className="text-emerald-300">{fractureType}</strong></span>
                <span className="text-slate-500">•</span>
                <span>DEXA T-Score: <strong className="text-amber-300">{lumbarTScore}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-blue-900/50 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-200">
              Immobilization: <span className="text-white font-black">Colles Cast (Wk 2/6)</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
              Neurovascular: <span className="text-white font-black">Intact (CRT &lt;2s)</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "fracture", label: "🦴 Fracture & Gustilo Trauma", icon: Bone },
            { id: "spine", label: "🪵 Spine, Scoliosis & Cobb Angle", icon: Ruler },
            { id: "arthroscopy", label: "📹 Arthroscopy & Keyhole Surgery", icon: Stethoscope },
            { id: "joint", label: "🦿 Arthroplasty & Joint Templating", icon: Search },
            { id: "rehab", label: "💪 Physical Therapy & MMT/ROM", icon: Activity },
            { id: "sports", label: "🎾 Sports Medicine & Ligaments", icon: Zap },
            { id: "oa", label: "🩻 Osteoarthritis & WOMAC Score", icon: Scale },
            { id: "dexa", label: "🦴 DEXA Bone Density & FRAX", icon: ShieldAlert },
            { id: "inventory", label: "📦 Surgical Implant Inventory & UDI", icon: ShieldCheck },
            { id: "soap", label: "📝 Orthopedic SOAP Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: FRACTURE & TRAUMA MANAGER */}
        {activeTab === "fracture" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bone className="h-5 w-5 text-blue-400" />
                AO/OTA Fracture Classification & Biomechanical Assessment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Anatomical Location</label>
                  <input
                    type="text"
                    value={fractureLocation}
                    onChange={(e) => setFractureLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">AO Classification / Pattern</label>
                  <input
                    type="text"
                    value={fractureType}
                    onChange={(e) => setFractureType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Dorsal / Volar Angulation (Degrees)</label>
                  <input
                    type="number"
                    value={angulationDeg}
                    onChange={(e) => setAngulationDeg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className={`text-[10px] block ${angulationDeg > 10 ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                    {angulationDeg > 10 ? "⚠️ Angulation > 10° (Requires Reduction)" : "Acceptable Alignment (<10°)"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Gustilo-Anderson Open Fracture Grade</label>
                  <select
                    value={gustiloGrade}
                    onChange={(e) => setGustiloGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="Closed Fracture (Skin Intact)">Closed Fracture (Skin Intact)</option>
                    <option value="Grade I (Clean laceration <1cm)">Grade I (Clean laceration &lt;1cm)</option>
                    <option value="Grade II (Laceration >1cm without extensive soft tissue damage)">Grade II (Laceration &gt;1cm without tissue loss)</option>
                    <option value="Grade IIIA (Adequate soft tissue coverage)">Grade IIIA (High energy, adequate tissue coverage)</option>
                    <option value="Grade IIIB (Extensive soft tissue loss, periosteal stripping)">Grade IIIB (Extensive loss, requires flap closure)</option>
                    <option value="Grade IIIC (Open fracture with arterial injury requiring repair)">Grade IIIC (Arterial injury requiring vascular repair)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Radial Shortening (mm)</label>
                  <input
                    type="number"
                    value={shorteningMm}
                    onChange={(e) => setShorteningMm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className={`text-[10px] block ${shorteningMm > 2 ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                    {shorteningMm > 2 ? "⚠️ Shortening > 2mm (Risk of Ulnar Impaction)" : "Minimal Shortening (≤2mm)"}
                  </span>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Recommended Immobilization / Surgical Intervention</label>
                  <select
                    value={treatmentChoice}
                    onChange={(e) => setTreatmentChoice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="Closed Reduction & Short Arm Cast Immobilization">Closed Reduction & Short Arm Cast Immobilization (6 Weeks)</option>
                    <option value="Percutaneous K-Wire Fixation + Cast">Percutaneous K-Wire Fixation + Cast (Unstable Pattern)</option>
                    <option value="Open Reduction & Internal Fixation (ORIF) with Volar Locking Plate">Open Reduction & Internal Fixation (ORIF) with Volar Locking Plate</option>
                    <option value="External Fixation + Distraction">External Fixation + Distraction (Severely Comminuted)</option>
                  </select>
                </div>
              </div>

              {/* Fracture Healing Timeline Progress */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Fracture Healing Progress (Week 2 of 6)</span>
                  <span className="text-blue-300">Soft Callus Formation Stage</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-700 p-0.5 flex">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: "33%" }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Hematoma (Wk 1)</span>
                  <span className="text-blue-300 font-bold">Soft Callus (Wk 2-3)</span>
                  <span>Hard Callus (Wk 4-6)</span>
                  <span>Remodeling (Mth 3-12)</span>
                </div>
              </div>
            </div>

            {/* AI Trauma & Neurovascular Intelligence Card */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  AI Trauma Biomechanics & Safety
                </h4>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="h-4 w-4" /> Intact Neurovascular Assessment
                  </div>
                  <p>
                    Radial and ulnar pulses palpable bilateral. Sensory distribution of Median, Radial, and Ulnar nerves completely intact.
                  </p>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                  <strong>Compartment Syndrome Protocol:</strong>
                  <p>Warn patient regarding severe unremitting pain, pain with passive finger extension, or paresthesias. Instruct tight cast removal if needed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SPINE, SCOLIOSIS & COBB ANGLE */}
        {activeTab === "spine" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-blue-400" />
                  Spine Surgery, Scoliosis Cobb Angle & Oswestry Disability Index
                </h3>
                <p className="text-xs text-slate-400">
                  Vertebral alignment, disc herniations, spinal stenosis, and ODI functional disability profiling.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-200">
                ODI Disability: <span className="text-white font-black">{oswestryDisabilityIndexPct}% (Moderate Disability)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Spine Region & Primary Pathology</label>
                <input
                  type="text"
                  value={spineRegion}
                  onChange={(e) => setSpineRegion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Scoliosis Cobb Angle (Degrees)</label>
                <input
                  type="number"
                  value={cobbAngleDeg}
                  onChange={(e) => setCobbAngleDeg(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className={`text-[10px] block ${cobbAngleDeg > 25 ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                  {cobbAngleDeg > 40 ? "⚠️ Cobb > 40° (Surgical Fusion Candidate)" : cobbAngleDeg > 25 ? "Bracing Indicated (25°-40°)" : "Observe (<25°)"}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Spondylolisthesis Meyerding Grade</label>
                <input
                  type="text"
                  value={spondylolisthesisGrade}
                  onChange={(e) => setSpondylolisthesisGrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Oswestry Disability Index - ODI (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={oswestryDisabilityIndexPct}
                  onChange={(e) => setOswestryDisabilityIndexPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-300">Nerve Root Radiculopathy Distribution</label>
                <input
                  type="text"
                  value={radiculopathyLevel}
                  onChange={(e) => setRadiculopathyLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: ARTHROSCOPY & KEYHOLE SURGERY */}
        {activeTab === "arthroscopy" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-400" />
                  Minimally Invasive Arthroscopy & Joint Endoscopy Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Ligament reconstruction, meniscal repair, chondroplasty & rotator cuff repairs.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Operative Status: <span className="text-white font-black">Outpatient Day-Care Arthroscopy</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Joint & Diagnostic Indication</label>
                <input
                  type="text"
                  value={arthroscopyJoint}
                  onChange={(e) => setArthroscopyJoint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ACL Reconstruction Graft Harvest</label>
                <input
                  type="text"
                  value={aclGraftType}
                  onChange={(e) => setAclGraftType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Meniscus Repair Technique</label>
                <input
                  type="text"
                  value={meniscusRepairType}
                  onChange={(e) => setMeniscusRepairType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Rotator Cuff Tear Classification</label>
                <input
                  type="text"
                  value={rotatorCuffSize}
                  onChange={(e) => setRotatorCuffSize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SURGICAL IMPLANT INVENTORY & UDI TRACKING */}
        {activeTab === "inventory" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Surgical Implant Inventory & FDA/CDSCO UDI Traceability Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time barcode tracking, lot traceability, sterility verification & recall alerts.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                {implantStockStatus}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Implant System Brand & Line</label>
                <input
                  type="text"
                  value={implantBrand}
                  onChange={(e) => setImplantBrand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Femoral Component UDI / Serial No.</label>
                <input
                  type="text"
                  value={femoralSerialNo}
                  onChange={(e) => setFemoralSerialNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tibial Tray UDI / Serial No.</label>
                <input
                  type="text"
                  value={tibialSerialNo}
                  onChange={(e) => setTibialSerialNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sterility & Expiry Audit Trail
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Sterilization Method</span>
                  <strong className="text-white">Ethylene Oxide (EtO)</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Sterility Expiry Date</span>
                  <strong className="text-emerald-300 font-mono">2031-04-15</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Manufacturer Barcode</span>
                  <strong className="text-white font-mono">(01)050123456789(17)310415(10)LOT88914</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Safety Recalls</span>
                  <strong className="text-emerald-400">0 Active Alerts</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTHROPLASTY & JOINT TEMPLATING */}
        {activeTab === "joint" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-400" />
                  Pre-Operative Joint Replacement Templating & Oxford Score
                </h3>
                <p className="text-xs text-slate-400">
                  Implant sizing, component alignment, and functional joint scoring.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-200">
                Oxford Knee Score: <span className="text-white font-black">{oxfordScore}/48 (Severe OA)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Target Joint & Procedure</label>
                <select
                  value={jointType}
                  onChange={(e) => setJointType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Knee (Primary TKA)">Knee (Primary Total Knee Arthroplasty)</option>
                  <option value="Hip (Primary THA)">Hip (Primary Total Hip Arthroplasty)</option>
                  <option value="Shoulder (Reverse TSA)">Shoulder (Reverse Total Shoulder Arthroplasty)</option>
                  <option value="Revision TKA">Revision Total Knee Arthroplasty</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Surgical Side</label>
                <select
                  value={jointSide}
                  onChange={(e) => setJointSide(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Right">Right Side</option>
                  <option value="Left">Left Side</option>
                  <option value="Bilateral Staged">Bilateral Staged</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Oxford Joint Score (0-48)</label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={oxfordScore}
                  onChange={(e) => setOxfordScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Femoral Component Size</label>
                <input
                  type="text"
                  value={femoralComponentSize}
                  onChange={(e) => setFemoralComponentSize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-300">Tibial Component & Polyethylene Bearing Size</label>
                <input
                  type="text"
                  value={tibialComponentSize}
                  onChange={(e) => setTibialComponentSize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICAL THERAPY & MMT/ROM */}
        {activeTab === "rehab" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Manual Muscle Testing (MMT 0-5) & Goniometric Range of Motion (ROM)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Quadriceps Strength (MMT 0-5)</label>
                <select
                  value={quadsMmt}
                  onChange={(e) => setQuadsMmt(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value={5}>Grade 5/5 (Normal - Holds against max resistance)</option>
                  <option value={4}>Grade 4/5 (Good - Holds against moderate resistance)</option>
                  <option value={3}>Grade 3/5 (Fair - Full ROM against gravity)</option>
                  <option value={2}>Grade 2/5 (Poor - Full ROM gravity eliminated)</option>
                  <option value={1}>Grade 1/5 (Trace - Trace contraction felt)</option>
                  <option value={0}>Grade 0/5 (Zero - No contraction)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Active Knee Flexion (Degrees)</label>
                <input
                  type="number"
                  value={kneeFlexionRom}
                  onChange={(e) => setKneeFlexionRom(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-emerald-300 block">Functional Target: ≥120° Flexion</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Knee Extension Deficit (Degrees)</label>
                <input
                  type="number"
                  value={kneeExtensionRom}
                  onChange={(e) => setKneeExtensionRom(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-emerald-300 block">Target: 0° Full Extension</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPORTS MEDICINE & LIGAMENTS */}
        {activeTab === "sports" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Sports Ligament Evaluator & Return-to-Play Criteria
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-300">Clinical Special Tests</h4>
                <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                  <span>Lachman Test (ACL):</span>
                  <strong className="text-white">{lachmanTest}</strong>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                  <span>Pivot Shift Test (Rotational Instability):</span>
                  <strong className="text-white">{pivotShiftTest}</strong>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                  <span>McMurray Test (Meniscus):</span>
                  <strong className="text-white">{mcmurrayTest}</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-300">Return-to-Play Timeline</h4>
                <p className="text-slate-300">Post ACL Reconstruction Protocol: Expected competitive clearance at {returnToPlayWeeks} weeks.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OSTEOARTHRITIS & WOMAC SCORE */}
        {activeTab === "oa" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-400" />
              Kellgren-Lawrence OA Grading & WOMAC Osteoarthritis Index
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">WOMAC Pain Score</span>
                <strong className="text-lg font-mono text-white block">{womacPainScore} / 20</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">WOMAC Stiffness</span>
                <strong className="text-lg font-mono text-white block">{womacStiffnessScore} / 8</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">WOMAC Physical Function</span>
                <strong className="text-lg font-mono text-white block">{womacFunctionScore} / 68</strong>
              </div>
              <div className="p-3 bg-blue-950 rounded-xl border border-blue-500/40 space-y-1">
                <span className="text-blue-300 font-bold">Total WOMAC Index</span>
                <strong className="text-lg font-mono text-white block">{totalWomacScore} / 96</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DEXA BONE DENSITY & FRAX */}
        {activeTab === "dexa" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              DEXA Scan T-Score Analysis & WHO FRAX 10-Year Fracture Risk
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Lumbar Spine DEXA T-Score</label>
                <input
                  type="number"
                  step="0.1"
                  value={lumbarTScore}
                  onChange={(e) => setLumbarTScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Femoral Neck DEXA T-Score</label>
                <input
                  type="number"
                  step="0.1"
                  value={femoralNeckTScore}
                  onChange={(e) => setFemoralNeckTScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">BMD Diagnostic Classification</label>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold text-rose-300">
                  {dexaDiagnosis}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ORTHOPEDIC SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Orthopedic Specialist Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">S - Subjective (Mechanism & Pain History)</label>
                <textarea
                  value={orthoSoap.subjective}
                  onChange={(e) => setOrthoSoap({ ...orthoSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">O - Objective (Deformity, Neurovascular, X-ray)</label>
                <textarea
                  value={orthoSoap.objective}
                  onChange={(e) => setOrthoSoap({ ...orthoSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">A - Assessment (Diagnosis & AO Pattern)</label>
                <textarea
                  value={orthoSoap.assessment}
                  onChange={(e) => setOrthoSoap({ ...orthoSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">P - Plan (Reduction, Cast, Surgery, Meds)</label>
                <textarea
                  value={orthoSoap.plan}
                  onChange={(e) => setOrthoSoap({ ...orthoSoap, plan: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrthopedicsSuite;

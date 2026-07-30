import React, { useState } from "react";
import {
  Eye,
  Activity,
  Zap,
  ShieldAlert,
  Clock,
  Layers,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Pill,
  Sliders,
  TrendingUp,
  Stethoscope,
  Heart,
  Droplet,
  Hospital,
  Flame,
  Award,
  Thermometer,
  Wind,
  Mic,
  Volume2,
  Brain,
  Camera,
  ScanLine
} from "lucide-react";

export interface OphthalmologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function OphthalmologySuite({
  onBackToLanding,
  patientName = "Meenakshi Sundaram",
  patientAge = 64,
  patientGender = "Female"
}: OphthalmologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "refraction" | "iop_glaucoma" | "oct_retina" | "cataract_biometry" | "soap"
  >("refraction");

  // Visual Acuity & Refraction State
  const [vaOdUncorrected, setVaOdUncorrected] = useState<string>("6/18 (20/60)");
  const [vaOsUncorrected, setVaOsUncorrected] = useState<string>("6/12 (20/40)");
  const [vaOdCorrected, setVaOdCorrected] = useState<string>("6/6 (20/20)");
  const [vaOsCorrected, setVaOsCorrected] = useState<string>("6/6 (20/20)");

  // Manifest Refraction (OD / OS)
  const [sphereOd, setSphereOd] = useState<number>(-2.25);
  const [cylinderOd, setCylinderOd] = useState<number>(-0.75);
  const [axisOd, setAxisOd] = useState<number>(90);
  const [addOd, setAddOd] = useState<number>(+2.50);

  const [sphereOs, setSphereOs] = useState<number>(-1.50);
  const [cylinderOs, setCylinderOs] = useState<number>(-0.50);
  const [axisOs, setAxisOs] = useState<number>(85);
  const [addOs, setAddOs] = useState<number>(+2.50);

  // Intraocular Pressure (IOP mmHg) & Glaucoma
  const [iopOd, setIopOd] = useState<number>(22.5); // mmHg
  const [iopOs, setIopOs] = useState<number>(18.0); // mmHg
  const [cdRatioOd, setCdRatioOd] = useState<number>(0.65); // Cup-to-Disc ratio
  const [cdRatioOs, setCdRatioOs] = useState<number>(0.45);
  const [glaucomaStage, setGlaucomaStage] = useState<string>("Primary Open-Angle Glaucoma (POAG) - Moderate Stage OD");
  const [pachyCentralCornealThicknessOd, setPachyCentralCornealThicknessOd] = useState<number>(535); // microns (CCT)

  // OCT Retinal Layer & Diabetic Retinopathy
  const [octRnflThicknessOd, setOctRnflThicknessOd] = useState<number>(72); // microns (Thinning <80)
  const [octRnflThicknessOs, setOctRnflThicknessOs] = useState<number>(94); // Normal
  const [diabeticRetinopathyGrade, setDiabeticRetinopathyGrade] = useState<string>("Moderate Non-Proliferative Diabetic Retinopathy (NPDR) with Macular Edema");
  const [fundusHemorrhagesCount, setFundusHemorrhagesCount] = useState<number>(12);

  // Cataract & SRK/T IOL Power Calculation
  const [cataractGradeOd, setCataractGradeOd] = useState<string>("Nuclear Sclerosis Grade NC3 / C2 Cortical Opacity");
  const [axialLengthOd, setAxialLengthOd] = useState<number>(23.85); // mm
  const [keratometryK1Od, setKeratometryK1Od] = useState<number>(43.50); // Diopters
  const [keratometryK2Od, setKeratometryK2Od] = useState<number>(44.25);
  const [calculatedIolPowerOd, setCalculatedIolPowerOd] = useState<number>(+21.50); // Diopters Monofocal Hydrophobic IOL

  // Ophthalmology Consultation SOAP State
  const [ophthaSoap, setOphthaSoap] = useState({
    subjective:
      "64-year-old female presents with 8-month history of progressive painless blurring of distance vision in right eye, difficulty reading fine print, and halos around headlights at night. Known Type 2 Diabetic (HbA1c 7.8%) and Hypertensive for 12 years.",
    objective:
      "Visual Acuity: OD 6/18 (corr 6/6), OS 6/12 (corr 6/6).\nRefraction: OD -2.25DS / -0.75DC x 90 (Add +2.50), OS -1.50DS / -0.50DC x 85 (Add +2.50).\nGoldmann Tonometry IOP: OD 22.5 mmHg, OS 18.0 mmHg (CCT OD 535µm).\nSlit Lamp: OD NC3/C2 Nuclear Cataract. OS Clear lens.\nFundoscopy: OD C/D ratio 0.65 with inferior neuroretinal rim thinning, microaneurysms & hard exudates in macula. OCT RNFL OD 72µm.",
    assessment:
      "1. Moderate Primary Open-Angle Glaucoma (POAG) Right Eye (IOP 22.5 mmHg, C/D 0.65, RNFL 72µm).\n2. Nuclear Sclerotic Cataract Grade 3 Right Eye.\n3. Moderate Non-Proliferative Diabetic Retinopathy (NPDR) with Diabetic Macular Edema (DME) Right Eye.",
    plan:
      "1. Initiate Latanoprost 0.005% Eye Drops 1 drop OD at bedtime (Target IOP <15 mmHg).\n2. Schedule Phacoemulsification with Monofocal Hydrophobic IOL (+21.50D) for Right Eye next month.\n3. Refer for Anti-VEGF Intravitreal Injection (Ranibizumab) for DME OD prior to surgery.\n4. Recheck IOP and OCT Macula in 4 weeks."
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Banner */}
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
              <Eye className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Ophthalmology & Vision AI Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  AAO EyeCare 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Goldmann Tonometry, OCT RNFL Retinal Scan, SRK/T Biometry IOL Calculator & Diabetic Retinopathy Grading
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-blue-400" />
            <span>AI Ophthalmic Diagnostic Assistant Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical Eye Metrics Banner */}
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
                  ID: OPH-2026-9041
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>IOP R/L: <strong className="text-amber-300 font-mono">{iopOd} / {iopOs} mmHg</strong></span>
                <span className="text-slate-500">•</span>
                <span>C/D Ratio OD: <strong className="text-rose-300 font-mono">{cdRatioOd}</strong></span>
                <span className="text-slate-500">•</span>
                <span>OCT RNFL OD: <strong className="text-purple-300 font-mono">{octRnflThicknessOd} µm</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
              Biometry IOL OD: <span className="text-white font-black">{calculatedIolPowerOd} D</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
              Glaucoma Stage: <span className="text-white font-black">Moderate POAG OD</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "refraction", label: "👓 Visual Acuity & Manifest Refraction", icon: Eye },
            { id: "iop_glaucoma", label: "👁️ Tonometry IOP & Glaucoma C/D Matrix", icon: Droplet },
            { id: "oct_retina", label: "📸 OCT RNFL Scan & Diabetic Retinopathy", icon: Camera },
            { id: "cataract_biometry", label: "🔍 Cataract Grade & SRK/T IOL Calculator", icon: ScanLine },
            { id: "soap", label: "📝 Ophthalmology SOAP Note", icon: FileText }
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

        {/* TAB 1: VISUAL ACUITY & REFRACTION */}
        {activeTab === "refraction" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  Snellen Visual Acuity & Manifest Refraction Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Uncorrected vs Best Corrected Visual Acuity (BCVA) and Sphere, Cylinder, Axis, Add prescription for Right Eye (OD) & Left Eye (OS).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/80 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
                BCVA: <span className="text-white font-black">OD 6/6 | OS 6/6</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Right Eye (OD) Refraction */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <strong className="text-blue-300 font-bold">Right Eye (OD - Oculus Dexter)</strong>
                  <span className="text-slate-400">Uncorrected: {vaOdUncorrected}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">SPHERE (DS)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={sphereOd}
                      onChange={(e) => setSphereOd(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">CYLINDER (DC)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={cylinderOd}
                      onChange={(e) => setCylinderOd(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">AXIS (°)</label>
                    <input
                      type="number"
                      value={axisOd}
                      onChange={(e) => setAxisOd(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">ADD (DS)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={addOd}
                      onChange={(e) => setAddOd(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Corrected BCVA:</span>
                  <span className="text-emerald-400 font-bold font-mono">{vaOdCorrected}</span>
                </div>
              </div>

              {/* Left Eye (OS) Refraction */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <strong className="text-blue-300 font-bold">Left Eye (OS - Oculus Sinister)</strong>
                  <span className="text-slate-400">Uncorrected: {vaOsUncorrected}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">SPHERE (DS)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={sphereOs}
                      onChange={(e) => setSphereOs(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">CYLINDER (DC)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={cylinderOs}
                      onChange={(e) => setCylinderOs(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">AXIS (°)</label>
                    <input
                      type="number"
                      value={axisOs}
                      onChange={(e) => setAxisOs(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">ADD (DS)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={addOs}
                      onChange={(e) => setAddOs(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Corrected BCVA:</span>
                  <span className="text-emerald-400 font-bold font-mono">{vaOsCorrected}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TONOMETRY IOP & GLAUCOMA */}
        {activeTab === "iop_glaucoma" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-amber-400" />
                  Goldmann Applanation Tonometry & Glaucoma C/D Ratio
                </h3>
                <p className="text-xs text-slate-400">
                  Intraocular Pressure (mmHg), Central Corneal Thickness (CCT), Cup-to-Disc ratio, and target IOP.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                Glaucoma Status: <span className="text-white font-black">{glaucomaStage}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">IOP Right Eye OD (mmHg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={iopOd}
                  onChange={(e) => setIopOd(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{iopOd > 21 ? "⚠️ Elevated (>21 mmHg)" : "Normal Range"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">IOP Left Eye OS (mmHg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={iopOs}
                  onChange={(e) => setIopOs(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{iopOs > 21 ? "Elevated" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Cup-to-Disc Ratio (OD)</label>
                <input
                  type="number"
                  step="0.05"
                  value={cdRatioOd}
                  onChange={(e) => setCdRatioOd(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{cdRatioOd > 0.5 ? "⚠️ Significant Cupping" : "Normal Rim"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Central Corneal Thickness OD (µm)</label>
                <input
                  type="number"
                  value={pachyCentralCornealThicknessOd}
                  onChange={(e) => setPachyCentralCornealThicknessOd(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Average 540 µm</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OCT RNFL SCAN & DIABETIC RETINOPATHY */}
        {activeTab === "oct_retina" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-400" />
                  Optical Coherence Tomography (OCT) RNFL & Retinopathy Grading
                </h3>
                <p className="text-xs text-slate-400">
                  Retinal Nerve Fiber Layer (RNFL) thickness in microns and fundus photo microaneurysm / hard exudate count.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                Retinopathy: <span className="text-white font-black">{diabeticRetinopathyGrade}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">OCT RNFL Average Thickness OD (µm)</label>
                <input
                  type="number"
                  value={octRnflThicknessOd}
                  onChange={(e) => setOctRnflThicknessOd(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{octRnflThicknessOd < 80 ? "⚠️ Pathologic Thinning (<80µm)" : "Normal Thickness"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">OCT RNFL Average Thickness OS (µm)</label>
                <input
                  type="number"
                  value={octRnflThicknessOs}
                  onChange={(e) => setOctRnflThicknessOs(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal Thickness</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Fundus Microaneurysm Count (OD)</label>
                <input
                  type="number"
                  value={fundusHemorrhagesCount}
                  onChange={(e) => setFundusHemorrhagesCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Grading: Moderate NPDR</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATARACT GRADE & SRK/T IOL CALCULATOR */}
        {activeTab === "cataract_biometry" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-emerald-400" />
                  Cataract Grading & Optical Biometry SRK/T IOL Power Calculator
                </h3>
                <p className="text-xs text-slate-400">
                  Axial Length (AL mm), Keratometry K1/K2 diopters, and calculated Intraocular Lens (IOL) power.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
                Calculated IOL Power: <span className="text-white font-black">+{calculatedIolPowerOd} D</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-300 block">Cataract Slit Lamp Grading OD</span>
                <input
                  type="text"
                  value={cataractGradeOd}
                  onChange={(e) => setCataractGradeOd(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-300 block">Axial Length OD (mm)</span>
                <input
                  type="number"
                  step="0.01"
                  value={axialLengthOd}
                  onChange={(e) => setAxialLengthOd(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OPHTHALMOLOGY SOAP CONSULTATION NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Ophthalmology Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">S - Subjective (Vision Complaints, Halos, Glare, Diabetic History)</label>
                <textarea
                  value={ophthaSoap.subjective}
                  onChange={(e) => setOphthaSoap({ ...ophthaSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">O - Objective (BCVA, Refraction, IOP, Slit Lamp, Fundoscopy & OCT)</label>
                <textarea
                  value={ophthaSoap.objective}
                  onChange={(e) => setOphthaSoap({ ...ophthaSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">A - Assessment (POAG, Cataract Grade, NPDR with DME)</label>
                <textarea
                  value={ophthaSoap.assessment}
                  onChange={(e) => setOphthaSoap({ ...ophthaSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-300">P - Plan (Latanoprost Drops, Phacoemulsification, Anti-VEGF)</label>
                <textarea
                  value={ophthaSoap.plan}
                  onChange={(e) => setOphthaSoap({ ...ophthaSoap, plan: e.target.value })}
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

export default OphthalmologySuite;

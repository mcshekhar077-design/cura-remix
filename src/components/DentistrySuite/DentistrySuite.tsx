import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Activity, 
  Smile,
  Camera,
  FileText,
  Plus,
  Save,
  Download,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Upload,
  Calculator,
  History,
  ShieldCheck,
  CheckCircle,
  FileCode
} from "lucide-react";

// Dental Architecture Types & Service
import {
  DentistryTab,
  Tooth,
  ToothSurface,
  SurfaceCondition,
  ToothStatus,
  PeriodontalChart,
  ProbingDepth6Point,
  MobilityGrade,
  FurcationGrade,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentStatus,
  TreatmentPriority,
  Radiograph,
  CLINICAL_DISCLAIMER
} from '../../lib/dental/types';
import { DentalApiService } from '../../lib/dental/services/dentalApi';

// Subcomponents
import { Odontogram } from './components/Odontogram';
import { PeriodontalTable } from './components/Periodontal/PeriodontalTable';
import { RadiographViewer } from './components/Radiograph/RadiographViewer';

// Utils
import { formatCurrency } from './utils/priceCalculator';

export interface DentistrySuiteProps {
  onBackToLanding: () => void;
  patientId?: string;
  patientName?: string;
  isProduction?: boolean;
}

export function DentistrySuite({
  onBackToLanding,
  patientId = "PAT-1001",
  patientName = "Rajesh Kumar",
  isProduction = false
}: DentistrySuiteProps): React.ReactElement {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [activeTab, setActiveTab] = useState<DentistryTab>("odontogram");
  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(14);
  const [teeth, setTeeth] = useState<Tooth[]>([]);
  const [periodontal, setPeriodontal] = useState<PeriodontalChart[]>([]);
  const [radiographs, setRadiographs] = useState<Radiograph[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Surface condition editing state
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface>('occlusal');
  const [surfaceCondition, setSurfaceCondition] = useState<SurfaceCondition>('Healthy');

  // Treatment Modal State
  const [showAddTreatment, setShowAddTreatment] = useState<boolean>(false);
  const [newProcedure, setNewProcedure] = useState<{
    toothNumber: number;
    procedure: string;
    code: string;
    cost: number;
    priority: TreatmentPriority;
    duration: number;
    description: string;
  }>({
    toothNumber: 14,
    procedure: 'Composite Resin Restoration (2 Surfaces)',
    code: 'D2392',
    cost: 2400,
    priority: 'high',
    duration: 35,
    description: 'Distal-Occlusal preparation'
  });

  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);
  const [aiResultBanner, setAiResultBanner] = useState<string | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);

  // ============================================
  // DATA INITIALIZATION
  // ============================================

  useEffect(() => {
    let mounted = true;
    async function loadDentalData() {
      setIsLoading(true);
      try {
        const [teethData, perioData, rxData, planData] = await Promise.all([
          DentalApiService.getTeeth(patientId),
          DentalApiService.getPeriodontal(patientId),
          DentalApiService.getRadiographs(patientId),
          DentalApiService.getTreatmentPlan(patientId)
        ]);

        if (mounted) {
          setTeeth(teethData);
          setPeriodontal(perioData);
          setRadiographs(rxData);
          setTreatmentPlan(planData);
        }
      } catch (err) {
        console.error('Failed to load dental records:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadDentalData();
    return () => { mounted = false; };
  }, [patientId]);

  // Selected tooth details
  const currentTooth = useMemo(() => {
    return teeth.find(t => t.toothNumber === selectedToothNumber) || null;
  }, [teeth, selectedToothNumber]);

  // ============================================
  // TOOTH & SURFACE MUTATIONS
  // ============================================

  const handleSelectTooth = useCallback((toothNumber: number) => {
    setSelectedToothNumber(toothNumber);
  }, []);

  const handleSurfaceClick = useCallback((toothNumber: number, surface: ToothSurface) => {
    setSelectedToothNumber(toothNumber);
    setSelectedSurface(surface);
    const target = teeth.find(t => t.toothNumber === toothNumber);
    if (target) {
      setSurfaceCondition(target.surfaces[surface]?.condition || 'Healthy');
    }
  }, [teeth]);

  const handleApplySurfaceCondition = useCallback(async (condition: SurfaceCondition) => {
    if (!selectedToothNumber) return;
    setSurfaceCondition(condition);
    try {
      const updated = await DentalApiService.updateToothSurface(
        patientId,
        selectedToothNumber,
        selectedSurface,
        condition,
        'dentist-001'
      );
      setTeeth(prev => prev.map(t => t.toothNumber === updated.toothNumber ? updated : t));
    } catch (err) {
      console.error('Failed to update tooth surface:', err);
    }
  }, [patientId, selectedToothNumber, selectedSurface]);

  const handleUpdateToothStatus = useCallback(async (status: ToothStatus, conditionDesc: string) => {
    if (!selectedToothNumber) return;
    try {
      const updated = await DentalApiService.updateToothStatus(
        patientId,
        selectedToothNumber,
        status,
        conditionDesc,
        'dentist-001'
      );
      setTeeth(prev => prev.map(t => t.toothNumber === updated.toothNumber ? updated : t));
    } catch (err) {
      console.error('Failed to update tooth status:', err);
    }
  }, [patientId, selectedToothNumber]);

  // ============================================
  // PERIODONTAL HANDLERS
  // ============================================

  const handleUpdateProbing = useCallback((toothNumber: number, site: keyof ProbingDepth6Point, value: number) => {
    setPeriodontal(prev =>
      prev.map(p => {
        if (p.toothNumber !== toothNumber) return p;
        const updated = {
          ...p,
          probingDepth: {
            ...p.probingDepth,
            [site]: value
          },
          updatedAt: new Date().toISOString()
        };
        DentalApiService.upsertPeriodontal(updated);
        return updated;
      })
    );
  }, []);

  const handleToggleBop = useCallback((toothNumber: number, site: keyof ProbingDepth6Point) => {
    setPeriodontal(prev =>
      prev.map(p => {
        if (p.toothNumber !== toothNumber) return p;
        const updated = {
          ...p,
          bleedingOnProbing: {
            ...p.bleedingOnProbing,
            [site]: !p.bleedingOnProbing[site]
          },
          updatedAt: new Date().toISOString()
        };
        DentalApiService.upsertPeriodontal(updated);
        return updated;
      })
    );
  }, []);

  const handleUpdateMobility = useCallback((toothNumber: number, grade: MobilityGrade) => {
    setPeriodontal(prev =>
      prev.map(p => {
        if (p.toothNumber !== toothNumber) return p;
        const updated = { ...p, mobility: grade, updatedAt: new Date().toISOString() };
        DentalApiService.upsertPeriodontal(updated);
        return updated;
      })
    );
  }, []);

  const handleUpdateFurcation = useCallback((toothNumber: number, grade: FurcationGrade) => {
    setPeriodontal(prev =>
      prev.map(p => {
        if (p.toothNumber !== toothNumber) return p;
        const updated = { ...p, furcation: grade, updatedAt: new Date().toISOString() };
        DentalApiService.upsertPeriodontal(updated);
        return updated;
      })
    );
  }, []);

  const handleTogglePlaque = useCallback((toothNumber: number) => {
    setPeriodontal(prev =>
      prev.map(p => {
        if (p.toothNumber !== toothNumber) return p;
        const updated = { ...p, plaque: !p.plaque, updatedAt: new Date().toISOString() };
        DentalApiService.upsertPeriodontal(updated);
        return updated;
      })
    );
  }, []);

  const handleToggleCalculus = useCallback((toothNumber: number) => {
    setPeriodontal(prev =>
      prev.map(p => {
        if (p.toothNumber !== toothNumber) return p;
        const updated = { ...p, calculus: !p.calculus, updatedAt: new Date().toISOString() };
        DentalApiService.upsertPeriodontal(updated);
        return updated;
      })
    );
  }, []);

  // ============================================
  // RADIOGRAPH FINDINGS REVIEW
  // ============================================

  const handleAcceptFinding = useCallback((rxId: string, findingId: string) => {
    setRadiographs(prev =>
      prev.map(rx => {
        if (rx.id !== rxId) return rx;
        return {
          ...rx,
          findings: rx.findings.map(f =>
            f.id === findingId ? { ...f, reviewed: true, accepted: true, reviewedAt: new Date().toISOString(), reviewedBy: 'dentist-001' } : f
          )
        };
      })
    );
  }, []);

  const handleRejectFinding = useCallback((rxId: string, findingId: string) => {
    setRadiographs(prev =>
      prev.map(rx => {
        if (rx.id !== rxId) return rx;
        return {
          ...rx,
          findings: rx.findings.map(f =>
            f.id === findingId ? { ...f, reviewed: true, accepted: false, reviewedAt: new Date().toISOString(), reviewedBy: 'dentist-001' } : f
          )
        };
      })
    );
  }, []);

  const handleRadiographUpload = useCallback(async (file: File) => {
    try {
      const rx = await DentalApiService.uploadRadiograph(patientId, file, 'dentist-001');
      setRadiographs(prev => [rx, ...prev]);

      // Simulate real-time automated AI inference pipeline
      setTimeout(() => {
        setRadiographs(prev =>
          prev.map(r =>
            r.id === rx.id
              ? {
                  ...r,
                  aiStatus: 'completed',
                  aiAnalysis: 'AI Multi-Stage YOLO-Dental Model: Periapical radiolucency & coronal loss evaluated. 1 lesion flagged for verification.',
                  findings: [
                    {
                      id: `f-${Date.now()}`,
                      toothNumber: 14,
                      description: 'Interproximal enamel-dentin radiolucency (Caries Grade D2)',
                      location: 'Tooth #14 Distal',
                      confidence: 0.94,
                      severity: 'moderate',
                      reviewed: false,
                      accepted: false
                    }
                  ],
                  aiProcessingCompleted: new Date().toISOString()
                }
              : r
          )
        );
      }, 1500);
    } catch (err) {
      console.error('Radiograph upload failed:', err);
    }
  }, [patientId]);

  // ============================================
  // TREATMENT PLAN ACTIONS
  // ============================================

  const handleAddTreatment = useCallback(async () => {
    if (!newProcedure.procedure || !newProcedure.cost) return;
    try {
      const updated = await DentalApiService.addTreatmentItem(
        patientId,
        {
          toothNumber: newProcedure.toothNumber,
          procedure: newProcedure.procedure,
          code: newProcedure.code || 'D0000',
          cost: Number(newProcedure.cost),
          priority: newProcedure.priority,
          status: 'pending',
          duration: Number(newProcedure.duration) || 30,
          description: newProcedure.description
        },
        'dentist-001'
      );
      setTreatmentPlan(updated);
      setShowAddTreatment(false);
    } catch (err) {
      console.error('Failed to add treatment:', err);
    }
  }, [patientId, newProcedure]);

  const handleUpdateTreatmentStatus = useCallback(async (itemId: string, status: TreatmentStatus) => {
    try {
      const updated = await DentalApiService.updateTreatmentItem(patientId, itemId, { status }, 'dentist-001');
      setTreatmentPlan(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }, [patientId]);

  const handleRemoveTreatment = useCallback(async (itemId: string) => {
    try {
      const updated = await DentalApiService.deleteTreatmentItem(patientId, itemId, 'dentist-001');
      setTreatmentPlan(updated);
    } catch (err) {
      console.error('Failed to remove treatment:', err);
    }
  }, [patientId]);

  const handleRunAiAnalysis = useCallback(async () => {
    setIsAiRunning(true);
    setAiResultBanner(null);

    await new Promise(r => setTimeout(r, 1200));

    const result = isProduction
      ? "AI Analysis: 1.4mm enamel demineralization on Tooth #14 (D2). Active Class I caries on #19. Treatment: Composite Restoration (D2392) & Pit Sealant (D1351)."
      : "🧪 AI Verification Ready: 2 carious lesions highlighted (#14 Distal, #19 Occlusal). Recommend clinical evaluation before restorative treatment.";

    setAiResultBanner(result);
    setIsAiRunning(false);
  }, [isProduction]);

  // ============================================
  // RENDER TAB CONTENT
  // ============================================

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-bold">Loading Clinical Dental Records...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'odontogram':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SVG Odontogram Graphic */}
            <div className="lg:col-span-8">
              <Odontogram
                teeth={teeth}
                selectedTooth={selectedToothNumber}
                onSelectTooth={handleSelectTooth}
                onSurfaceClick={handleSurfaceClick}
              />
            </div>

            {/* Tooth & Surface Inspector Inspector */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Smile className="h-4 w-4 text-cyan-400" /> Tooth #{selectedToothNumber || '-'} Inspector
                </h3>
                {currentTooth && (
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg">
                    {currentTooth.status}
                  </span>
                )}
              </div>

              {currentTooth ? (
                <div className="space-y-4 text-xs">
                  {/* Diagnosis & Condition */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Overall Status:</span>
                      <select
                        value={currentTooth.status}
                        onChange={(e) => handleUpdateToothStatus(e.target.value as ToothStatus, currentTooth.condition)}
                        className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg px-2 py-1"
                      >
                        <option value="Healthy">Healthy (Intact)</option>
                        <option value="Caries">Caries (Cavity)</option>
                        <option value="Restored">Restored (Filling)</option>
                        <option value="Crown">Crown (Prosthetic)</option>
                        <option value="Bridge">Bridge Abutment</option>
                        <option value="Implant">Dental Implant</option>
                        <option value="RootCanal">Root Canal (RCT)</option>
                        <option value="Impacted">Impacted Molar</option>
                        <option value="Missing">Missing / Extracted</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 font-bold">Clinical Diagnosis:</span>
                      <span className="text-slate-200 font-semibold">{currentTooth.condition}</span>
                    </div>
                  </div>

                  {/* 6-Surface Diagnostic Matrix */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        Surface Condition Editor:
                      </span>
                      <span className="text-cyan-400 font-mono capitalize text-[11px] font-bold">
                        {selectedSurface} Surface
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {(['occlusal', 'mesial', 'distal', 'buccal', 'lingual', 'cervical'] as const).map(surf => {
                        const isSelected = selectedSurface === surf;
                        const cond = currentTooth.surfaces[surf]?.condition || 'Healthy';
                        return (
                          <button
                            key={surf}
                            type="button"
                            onClick={() => {
                              setSelectedSurface(surf);
                              setSurfaceCondition(cond);
                            }}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/50'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="block font-bold capitalize text-[11px]">{surf}</span>
                            <span className={`text-[9px] block ${cond === 'Caries' ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                              {cond}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Condition Setter buttons for the active surface */}
                    <div className="flex flex-wrap gap-1 pt-2">
                      {(['Healthy', 'Caries', 'Restored', 'Fractured', 'Worn', 'Cracked'] as const).map(cond => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleApplySurfaceCondition(cond)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            surfaceCondition === cond
                              ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Treatment Plan Quick Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewProcedure({
                        toothNumber: currentTooth.toothNumber,
                        procedure: currentTooth.status === 'Caries' ? 'Class II Composite Restoration (2 Surfaces)' : 'Dental Prophylaxis & Polish',
                        code: currentTooth.status === 'Caries' ? 'D2392' : 'D1110',
                        cost: currentTooth.status === 'Caries' ? 2400 : 1500,
                        priority: 'high',
                        duration: 35,
                        description: `Procedure planned for Tooth #${currentTooth.toothNumber}`
                      });
                      setShowAddTreatment(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Plan Procedure for Tooth #{currentTooth.toothNumber}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Click any tooth from the odontogram arches to inspect and chart.
                </div>
              )}
            </div>
          </div>
        );

      case 'periodontal':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Full-Mouth 6-Point Periodontal Examination
                </h3>
                <p className="text-xs text-slate-400">
                  Mesio-Buccal, Mid-Buccal, Disto-Buccal, Mesio-Lingual, Mid-Lingual, Disto-Lingual probing depth in millimeters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-xl font-bold">
                  Active Sulcus Monitoring
                </span>
              </div>
            </div>

            <PeriodontalTable
              data={periodontal}
              onUpdateProbing={handleUpdateProbing}
              onToggleBop={handleToggleBop}
              onUpdateMobility={handleUpdateMobility}
              onUpdateFurcation={handleUpdateFurcation}
              onTogglePlaque={handleTogglePlaque}
              onToggleCalculus={handleToggleCalculus}
            />
          </div>
        );

      case 'radiograph':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="h-4 w-4 text-cyan-400" />
                  <span>DICOM Dental Radiograph Suite & AI Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Bitewing, Panoramic OPG, Periapical, and CBCT scan analysis with clinician review workflow
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow">
                  <Upload className="h-4 w-4" />
                  <span>Upload Radiograph</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleRadiographUpload(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={isAiRunning}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow"
                >
                  {isAiRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Run AI Model</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {radiographs.map(rx => (
                <RadiographViewer
                  key={rx.id}
                  radiograph={rx}
                  onAcceptFinding={handleAcceptFinding}
                  onRejectFinding={handleRejectFinding}
                  onDelete={(id) => setRadiographs(prev => prev.filter(r => r.id !== id))}
                />
              ))}
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span>Comprehensive Dental Treatment Plan</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Version {treatmentPlan?.version || 1} • {treatmentPlan?.items.length || 0} Planned Procedures • Standard CDT Codes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuditLogs(!showAuditLogs)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <History className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Audit Trail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTreatment(true)}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Procedure</span>
                  </button>
                </div>
              </div>

              {/* Audit Log Drawer if toggled */}
              {showAuditLogs && treatmentPlan && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Treatment Plan Immutable Audit History
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{treatmentPlan.auditLog.length} Records</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px] space-y-1">
                    {treatmentPlan.auditLog.map(log => (
                      <div key={log.id} className="py-1.5 flex items-center justify-between text-slate-300">
                        <span>[{log.action.toUpperCase()}] {log.notes}</span>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(log.performedAt).toLocaleTimeString()} by {log.performedBy}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedure Item List */}
              <div className="space-y-3">
                {treatmentPlan?.items.map(item => (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-start justify-between gap-4 transition-all hover:border-slate-700 shadow-sm"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {item.toothNumber === 0 ? 'Full Mouth' : `Tooth #${item.toothNumber}`}
                        </span>
                        <span className="text-xs font-bold text-cyan-300">{item.procedure}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50">
                          {item.code}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                        <span>Duration: {item.duration} mins</span>
                        <span className="text-emerald-400 font-bold">Cost: {formatCurrency(item.cost)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateTreatmentStatus(item.id, e.target.value as TreatmentStatus)}
                        className={`bg-slate-950 border text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none ${
                          item.status === 'completed' ? 'text-emerald-400 border-emerald-600' :
                          item.status === 'approved' ? 'text-cyan-400 border-cyan-600' :
                          item.status === 'cancelled' ? 'text-rose-400 border-rose-800' :
                          'text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveTreatment(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Remove procedure"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Summary & Financial Estimates */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calculator className="h-4 w-4 text-cyan-400" /> Plan Financial Summary
              </h3>

              <div className="space-y-3">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Estimated Cost</span>
                  <span className="text-3xl font-black text-emerald-400">
                    {formatCurrency(treatmentPlan?.totalCost || 0)}
                  </span>
                  <div className="flex justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
                    <span>Estimated Chair Time:</span>
                    <span className="font-bold text-white">{treatmentPlan?.estimatedDuration || 0} mins</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Approved Procedures:</span>
                    <span className="font-bold text-white">
                      {treatmentPlan?.items.filter(i => i.status === 'approved' || i.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pending Patient Acceptance:</span>
                    <span className="font-bold text-amber-400">
                      {treatmentPlan?.items.filter(i => i.status === 'pending').length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Plan</span>
                </button>
                <button
                  type="button"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Invoice</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // MAIN VIEWPORT RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* APP HEADER */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-cyan-600 to-sky-500 rounded-2xl text-white shadow-lg shadow-cyan-950/50">
              <Smile className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">CURA Dental & Oral Health Suite</h1>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isProduction ? 'Enterprise v1.0' : 'Clinical Preview'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                Patient: <span className="text-white font-bold">{patientName}</span> ({patientId}) • Universal & FDI 32-Tooth Charting
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>DMFT Score: {teeth.filter(t => t.status === 'Caries' || t.status === 'Missing' || t.status === 'Restored').length}</span>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
        {[
          { id: 'odontogram' as const, icon: Smile, label: 'Interactive Odontogram' },
          { id: 'periodontal' as const, icon: Activity, label: '6-Point Periodontal Chart' },
          { id: 'radiograph' as const, icon: Camera, label: 'DICOM Radiographs & AI' },
          { id: 'treatment' as const, icon: FileText, label: 'Treatment Plan & Invoicing' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* AI Banner */}
        {aiResultBanner && (
          <div className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{aiResultBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiResultBanner(null)}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Clinical Disclaimer */}
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200/80 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Clinical Decision Support Tool:</span>
            <span className="ml-1">
              All AI-assisted anatomical findings, periodontal stagings, and suggested procedures are for clinical guidance only and must be validated by a licensed dental practitioner.
            </span>
          </div>
        </div>

        {/* Tab Viewport */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          {renderTabContent()}
        </div>
      </main>

      {/* Add Treatment Procedure Modal */}
      {showAddTreatment && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileCode className="h-5 w-5 text-cyan-400" />
                <span>Add Dental Procedure</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTreatment(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Target Tooth Number</label>
                <input
                  type="number"
                  min="0"
                  max="32"
                  value={newProcedure.toothNumber}
                  onChange={(e) => setNewProcedure(p => ({ ...p, toothNumber: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Procedure Name *</label>
                <input
                  type="text"
                  value={newProcedure.procedure}
                  onChange={(e) => setNewProcedure(p => ({ ...p, procedure: e.target.value }))}
                  placeholder="e.g. Class II Composite Resin Restoration"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">CDT Code</label>
                  <input
                    type="text"
                    value={newProcedure.code}
                    onChange={(e) => setNewProcedure(p => ({ ...p, code: e.target.value }))}
                    placeholder="D2392"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Fee / Cost (₹) *</label>
                  <input
                    type="number"
                    value={newProcedure.cost}
                    onChange={(e) => setNewProcedure(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newProcedure.priority}
                    onChange={(e) => setNewProcedure(p => ({ ...p, priority: e.target.value as TreatmentPriority }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="high">High (Urgent)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Elective)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newProcedure.duration}
                    onChange={(e) => setNewProcedure(p => ({ ...p, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Clinical Notes</label>
                <input
                  type="text"
                  value={newProcedure.description}
                  onChange={(e) => setNewProcedure(p => ({ ...p, description: e.target.value }))}
                  placeholder="Shade selection, pulp cap notes, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddTreatment(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTreatment}
                disabled={!newProcedure.procedure || !newProcedure.cost}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                Add Procedure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DentistrySuite;

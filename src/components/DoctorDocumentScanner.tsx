import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  RefreshCw, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  Stethoscope, 
  BookmarkPlus, 
  AlertCircle, 
  Calendar, 
  ChevronDown, 
  Table, 
  PlusCircle,
  FileCheck,
  CheckCircle,
  Clock,
  Camera,
  RotateCw
} from "lucide-react";
import { Patient, ScannedReport } from "../types";

interface DoctorDocumentScannerProps {
  patient: Patient;
  onReportSaved: (updatedPatient: Patient) => void;
  activePrescriptions: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    reason: string;
  }>;
  setActivePrescriptions: React.Dispatch<React.SetStateAction<Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    reason: string;
  }>>>;
  setSuccessMsg: (msg: string | null) => void;
  setErrorAlert: (msg: string | null) => void;
}

export function DoctorDocumentScanner({
  patient,
  onReportSaved,
  activePrescriptions,
  setActivePrescriptions,
  setSuccessMsg,
  setErrorAlert
}: DoctorDocumentScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analyzedData, setAnalyzedData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [importedRx, setImportedRx] = useState(false);

  // Camera & Scanner Mode States
  const [scannerMode, setScannerMode] = useState<"upload" | "camera">("upload");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Quick editable state fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Lab Report");
  const [diagnosis, setDiagnosis] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [summary, setSummary] = useState("");
  const [labResults, setLabResults] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  // Camera Control Functions
  const startCamera = async (deviceId?: string) => {
    setCameraError("");
    setIsCameraActive(true);
    try {
      // Stop any prior tracks
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: { ideal: "environment" } } // Prefer back-facing camera on mobile devices
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn("Initial camera constraint failed, retrying basic video:", firstErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      activeStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.warn("Video play error:", err));
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setCameraDevices(videoDevices);

      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeSettings = activeTrack ? activeTrack.getSettings() : null;
        const currentId = activeSettings?.deviceId || videoDevices[0].deviceId;
        setSelectedDeviceId(currentId);
      } else if (deviceId) {
        setSelectedDeviceId(deviceId);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(err.message || "Failed to access camera device. Please confirm permission grants.");
    }
  };

  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const base64Data = dataUrl.split(",")[1];
        
        stopCamera();
        setFile({ name: "camera_captured_doc.jpg", size: Math.round(base64Data.length * 0.75) } as File);
        triggerScanPipeline("camera_captured_doc.jpg", "Mobile Camera Scan", "Lab Report", base64Data, "image/jpeg");
      }
    } catch (err: any) {
      setErrorAlert(`Failed to capture photo: ${err.message}`);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up camera stream on unmount
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1];
      const mimeType = selectedFile.type || "application/octet-stream";
      triggerScanPipeline(selectedFile.name, selectedFile.name, "Lab Report", base64Data, mimeType);
    };
    reader.onerror = () => {
      triggerScanPipeline(selectedFile.name, selectedFile.name, "Lab Report");
    };
    reader.readAsDataURL(selectedFile);
  };

  const triggerScanPipeline = async (
    fileName: string, 
    manualTitle: string, 
    manualCategory: string,
    customBase64?: string,
    customMimeType?: string
  ) => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setImportedRx(false);

    // Beautiful staggered loading animation simulation
    const timer1 = setTimeout(() => setAnalysisStep(2), 700);
    const timer2 = setTimeout(() => setAnalysisStep(3), 1500);

    try {
      const base64ToSend = customBase64 || "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      const mimeToSend = customMimeType || "image/gif";
      
      const res = await fetch(`/api/v1/patients/${patient.id}/scanned-reports/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName,
          base64Data: base64ToSend,
          mimeType: mimeToSend,
          manualTitle,
          manualDate: new Date().toISOString().split("T")[0],
          manualCategory,
          userRole: "doctor"
        })
      });

      // Wait a bit to let step animations feel natural and clinical
      await new Promise(r => setTimeout(r, 2200));

      if (res.ok) {
        const data = await res.json();
        setAnalyzedData(data);
        
        // Populate editable states
        setTitle(data.title || manualTitle);
        setDate(data.date || new Date().toISOString().split("T")[0]);
        setCategory(data.category || manualCategory);
        setDiagnosis(data.diagnosis || "");
        setIcdCode(data.suggestedIcdCode || "");
        setSummary(data.summaryForDoctor || data.aiSummary || "");
        setLabResults(data.labResults || []);
        setMedications(data.medications || []);
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to analyze document.");
        resetScanner();
      }
    } catch (e: any) {
      setErrorAlert(`Server communication failed: ${e.message}`);
      resetScanner();
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handleSaveToEMR = async () => {
    if (!title.trim()) {
      setErrorAlert("Please specify a document title.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/patients/${patient.id}/scanned-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          date,
          category,
          fileName: file?.name || "scanned_report.pdf",
          fileSize: "450 KB",
          extractedText: analyzedData?.extractedText || "",
          aiSummary: summary,
          keyFindings: analyzedData?.keyFindings || labResults.map(l => `${l.test}: ${l.value} (${l.normalRange})`),
          
          // Dual-sided fields
          riskLevel: analyzedData?.riskLevel || "low",
          abnormalValues: analyzedData?.abnormalValues || [],
          possibleConditions: analyzedData?.possibleConditions || [diagnosis].filter(Boolean),
          suggestedSpecialist: analyzedData?.suggestedSpecialist || "",
          suggestedDoctorName: "Dr. Rajesh Sharma",
          followUpRecommendation: analyzedData?.followUpRecommendation || "",
          
          // Doctor EMR fields
          extractedPatientName: analyzedData?.extractedPatientName || patient.fullName,
          medications,
          diagnosis,
          labResults,
          summaryForDoctor: summary,
          suggestedIcdCode: icdCode,
          action: "Add to patient record"
        })
      });

      if (res.ok) {
        const updatedPatient = await res.json();
        setSuccessMsg(`"${title}" successfully saved to EMR record & Consultation History sync completed!`);
        onReportSaved(updatedPatient);
        resetScanner();
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to save record to patient file.");
      }
    } catch (e: any) {
      setErrorAlert(`Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportToRx = () => {
    if (!medications || medications.length === 0) return;
    
    const formattedMeds = medications.map(m => ({
      drugName: m.name,
      dosage: m.dosage || "1 tab",
      frequency: m.frequency || "once daily",
      duration: m.duration || "5 days",
      reason: m.reason || diagnosis || "Prescription Scan Import"
    }));

    // Merge or append to active prescriptions, keeping uniqueness by name
    setActivePrescriptions(prev => {
      const existingNames = new Set(prev.map(p => p.drugName.toLowerCase()));
      const filteredNew = formattedMeds.filter(m => !existingNames.has(m.drugName.toLowerCase()));
      return [...prev, ...filteredNew];
    });

    setImportedRx(true);
    setSuccessMsg(`${formattedMeds.length} medications successfully pre-populated into your active Rx basket!`);
  };

  const resetScanner = () => {
    setFile(null);
    setAnalyzedData(null);
    setTitle("");
    setDate("");
    setCategory("Lab Report");
    setDiagnosis("");
    setIcdCode("");
    setSummary("");
    setLabResults([]);
    setMedications([]);
    setImportedRx(false);
  };

  const addLabResultRow = () => {
    setLabResults(prev => [...prev, { test: "", value: "", normalRange: "", status: "Normal" }]);
  };

  const updateLabResultRow = (index: number, field: string, val: string) => {
    setLabResults(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  const removeLabResultRow = (index: number) => {
    setLabResults(prev => prev.filter((_, i) => i !== index));
  };

  const addMedicationRow = () => {
    setMedications(prev => [...prev, { name: "", dosage: "", frequency: "", duration: "", reason: "" }]);
  };

  const updateMedicationRow = (index: number, field: string, val: string) => {
    setMedications(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  const removeMedicationRow = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-inner space-y-5" id="doctor-document-scanner">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">Smart Document Ingestion</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI OCR & Clinical Structuring</p>
          </div>
        </div>
        {analyzedData && (
          <button 
            type="button" 
            onClick={resetScanner}
            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            title="Clear and start over"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 1. Drag & Drop Upload or Live Camera scan view */}
      {!file && !isAnalyzing && !analyzedData && (
        <div className="space-y-4">
          {/* Dual-Mode Selector Tab */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl text-xs font-bold text-slate-500">
            <button
              type="button"
              onClick={() => {
                if (isCameraActive) stopCamera();
                setScannerMode("upload");
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scannerMode === "upload" 
                  ? "bg-white text-slate-800 shadow-sm font-black" 
                  : "hover:text-slate-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setScannerMode("camera");
                startCamera();
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scannerMode === "camera" 
                  ? "bg-white text-emerald-700 shadow-sm font-black" 
                  : "hover:text-slate-800"
              }`}
            >
              <Camera className="h-3.5 w-3.5" /> Mobile Camera Scan
            </button>
          </div>

          {scannerMode === "upload" ? (
            <div className="space-y-4">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive 
                    ? "border-emerald-500 bg-emerald-50/50" 
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } cursor-pointer relative group`}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Drag & drop patient file here</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">PDF, PNG or JPG up to 10MB</p>
                  </div>
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 mt-2"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-[4/3] border border-slate-800 flex flex-col justify-between">
                {/* Live Camera Stream */}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && activeStreamRef.current) {
                      if (el.srcObject !== activeStreamRef.current) {
                        el.srcObject = activeStreamRef.current;
                      }
                      el.play().catch(err => console.warn("Video play error:", err));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={true}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Laser scan animation line overlay */}
                <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-[pulse_1.5s_infinite] top-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-70" />

                {/* Framing Box Overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-emerald-400/40 rounded-xl flex items-center justify-center pointer-events-none z-10">
                  <span className="text-[10px] text-emerald-400/80 bg-slate-900/80 px-2 py-1 rounded-md font-bold tracking-wider uppercase backdrop-blur-sm">
                    Align document inside bounds
                  </span>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-20 space-y-2">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                    <p className="text-xs font-extrabold text-white">Camera Access Failed</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(selectedDeviceId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Retry Camera
                    </button>
                  </div>
                )}

                {/* Quick Switcher Device HUD */}
                <div className="absolute bottom-2 inset-x-2 flex justify-between items-center z-10 pointer-events-auto">
                  {cameraDevices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = cameraDevices.findIndex(d => d.deviceId === selectedDeviceId);
                        const nextIndex = (currentIndex + 1) % cameraDevices.length;
                        const nextDevice = cameraDevices[nextIndex];
                        startCamera(nextDevice.deviceId);
                      }}
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm cursor-pointer"
                      title="Switch Camera Feed"
                    >
                      <RotateCw className="h-3 w-3" />
                      <span>Flip Camera</span>
                    </button>
                  )}
                  <span className="text-[8px] text-slate-400 bg-slate-950/70 py-1 px-1.5 rounded font-mono tracking-tight ml-auto">
                    Live Stream
                  </span>
                </div>
              </div>

              {/* Camera Trigger Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScannerMode("upload");
                  }}
                  className="flex-1 py-2 text-xs font-black border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all text-center cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!!cameraError}
                  className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Camera className="h-4 w-4" /> Capture & AI Structuring
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Real-time AI Progress Modal Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden animate-fade-in">
            {/* Top Glowing AI Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
                <span>AI Medical Parsing Engine Active</span>
              </span>
            </div>

            {/* Document Hologram / Laser Scanning Display */}
            <div className="relative w-44 h-56 mx-auto bg-slate-950 rounded-2xl border-2 border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-4 group">
              {/* Retro Grid Background */}
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:12px_12px]" />
              
              {/* Laser Beam Animation */}
              <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_#10b981] animate-[laserScan_2s_ease-in-out_infinite] z-20" />
              <style>{`
                @keyframes laserScan {
                  0%, 100% { top: 6%; }
                  50% { top: 92%; }
                }
              `}</style>

              <FileText className="h-16 w-16 text-emerald-400/80 animate-pulse filter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] z-10" />
              <div className="mt-3 space-y-1 text-center relative z-10 max-w-[130px]">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block font-mono">Parsing Document</span>
                <span className="text-xs text-white font-bold block truncate">{file?.name || "medical_report.pdf"}</span>
                <span className="text-[9px] text-slate-500 font-mono block">Patient: {patient.fullName}</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h4 className="text-base font-black text-white tracking-wide">
                Analyzing Clinical Document
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Gemini Multimodal OCR is extracting lab values, medications, ICD-10 codes, and clinical summaries.
              </p>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                <span className="text-emerald-400">
                  {analysisStep === 1 && "Layout & Image De-skewing..."}
                  {analysisStep === 2 && "Gemini OCR Biomarker Extraction..."}
                  {analysisStep === 3 && "DeepSeek Clinical Reasoning..."}
                  {analysisStep > 3 && "Structuring EMR Data..."}
                </span>
                <span className="text-white">
                  {analysisStep === 1 ? "35%" : analysisStep === 2 ? "70%" : analysisStep === 3 ? "92%" : "98%"}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                  style={{
                    width: analysisStep === 1 ? "35%" : analysisStep === 2 ? "70%" : analysisStep === 3 ? "92%" : "98%"
                  }}
                />
              </div>
            </div>

            {/* Step Checklist */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left space-y-2.5 text-[11px] font-bold text-slate-400 shadow-inner">
              <div className={`flex items-center gap-2.5 transition-colors ${analysisStep >= 1 ? "text-emerald-400" : "text-slate-600"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  analysisStep > 1 ? "bg-emerald-500 text-slate-950" : analysisStep === 1 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse" : "bg-slate-900 text-slate-600"
                }`}>
                  {analysisStep > 1 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "1"}
                </div>
                <span className={analysisStep === 1 ? "text-white font-extrabold" : ""}>
                  De-skewing & Layout Optical Character Recognition
                </span>
              </div>

              <div className={`flex items-center gap-2.5 transition-colors ${analysisStep >= 2 ? "text-emerald-400" : "text-slate-600"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  analysisStep > 2 ? "bg-emerald-500 text-slate-950" : analysisStep === 2 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse" : "bg-slate-900 text-slate-600"
                }`}>
                  {analysisStep > 2 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "2"}
                </div>
                <span className={analysisStep === 2 ? "text-white font-extrabold" : ""}>
                  Extracting Lab Test Values & Clinical Parameters
                </span>
              </div>

              <div className={`flex items-center gap-2.5 transition-colors ${analysisStep >= 3 ? "text-emerald-400" : "text-slate-600"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  analysisStep > 3 ? "bg-emerald-500 text-slate-950" : analysisStep === 3 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse" : "bg-slate-900 text-slate-600"
                }`}>
                  {analysisStep > 3 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "3"}
                </div>
                <span className={analysisStep === 3 ? "text-white font-extrabold" : ""}>
                  Correlating Medical ICD-10 Codes & Prescription Drugs
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-mono italic">
              ⚡ High-speed AI inference in progress. Please do not close the window.
            </p>
          </div>
        </div>
      )}

      {/* 3. Fully Editable Review Screen */}
      {analyzedData && !isAnalyzing && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          
          <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-emerald-800 font-semibold leading-normal">
              CURA Smart Scanner parsed the file successfully. Please review, edit fields, and choose which details to sync into {patient.fullName}'s active health records.
            </p>
          </div>

          {/* Form Segment A: Document Metadata */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">A. Document Specifications</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Document Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Report Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Category Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Radiology">Radiology</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Form Segment B: Lab Results Table */}
          {labResults.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">B. Extracted Blood & Lab Metrics</span>
                <button 
                  type="button" 
                  onClick={addLabResultRow}
                  className="text-[9px] text-emerald-600 font-extrabold uppercase hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> Add Test
                </button>
              </div>
              <div className="space-y-2">
                {labResults.map((res, index) => (
                  <div key={index} className="flex items-center gap-2 border-b border-slate-50 pb-2 last:border-none last:pb-0">
                    <input 
                      type="text" 
                      placeholder="Test name" 
                      value={res.test} 
                      onChange={(e) => updateLabResultRow(index, "test", e.target.value)}
                      className="w-2/5 p-1.5 border border-slate-100 rounded-lg text-xs text-slate-700 font-extrabold bg-slate-50"
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      value={res.value} 
                      onChange={(e) => updateLabResultRow(index, "value", e.target.value)}
                      className="w-1/5 p-1.5 border border-slate-100 rounded-lg text-xs text-slate-700 font-extrabold text-center bg-slate-50"
                    />
                    <input 
                      type="text" 
                      placeholder="Ref range" 
                      value={res.normalRange} 
                      onChange={(e) => updateLabResultRow(index, "normalRange", e.target.value)}
                      className="w-1/5 p-1.5 border border-slate-100 rounded-lg text-xs text-slate-600 text-center bg-slate-50"
                    />
                    <select
                      value={res.status}
                      onChange={(e) => updateLabResultRow(index, "status", e.target.value)}
                      className={`w-1/5 p-1.5 rounded-lg text-[10px] font-extrabold text-center border-none ${
                        res.status === "High" ? "bg-rose-50 text-rose-700" :
                        res.status === "Low" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                    <button 
                      type="button" 
                      onClick={() => removeLabResultRow(index)}
                      className="p-1 hover:bg-slate-100 text-rose-500 rounded-md shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Segment C: Extracted Medications & Rx Actions */}
          {medications.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">C. Extracted Medications</span>
                <button 
                  type="button" 
                  onClick={addMedicationRow}
                  className="text-[9px] text-emerald-600 font-extrabold uppercase hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> Add Drug
                </button>
              </div>

              {/* Medication Import Trigger block */}
              <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between gap-2 shadow-inner">
                <div>
                  <p className="text-[10px] font-black text-sky-800">Pre-fill active consultation Rx</p>
                  <p className="text-[9px] text-slate-500 font-semibold leading-tight">Clicking this automatically pre-fills the prescription form below with these drugs.</p>
                </div>
                <button
                  type="button"
                  onClick={handleImportToRx}
                  disabled={importedRx}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg shadow-sm transition-all flex items-center gap-1 ${
                    importedRx 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-sky-600 hover:bg-sky-700 text-white"
                  }`}
                >
                  {importedRx ? (
                    <>
                      <CheckCircle className="h-3 w-3" /> Imported
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-3 w-3" /> Pre-fill Rx
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {medications.map((med, index) => (
                  <div key={index} className="p-2 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeMedicationRow(index)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-0.5 rounded-lg hover:bg-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-extrabold text-slate-400 uppercase">Drug Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Atorvastatin"
                          value={med.name} 
                          onChange={(e) => updateMedicationRow(index, "name", e.target.value)}
                          className="w-full p-1 border border-slate-100 rounded bg-white text-xs text-slate-700 font-extrabold"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-extrabold text-slate-400 uppercase">Dosage</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 10mg"
                          value={med.dosage} 
                          onChange={(e) => updateMedicationRow(index, "dosage", e.target.value)}
                          className="w-full p-1 border border-slate-100 rounded bg-white text-xs text-slate-700 font-extrabold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-extrabold text-slate-400 uppercase">Frequency</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1-0-1"
                          value={med.frequency} 
                          onChange={(e) => updateMedicationRow(index, "frequency", e.target.value)}
                          className="w-full p-1 border border-slate-100 rounded bg-white text-[10px] text-slate-600 font-bold"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-extrabold text-slate-400 uppercase">Duration</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 30 days"
                          value={med.duration} 
                          onChange={(e) => updateMedicationRow(index, "duration", e.target.value)}
                          className="w-full p-1 border border-slate-100 rounded bg-white text-[10px] text-slate-600 font-bold"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-extrabold text-slate-400 uppercase">Reason</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Cholesterol"
                          value={med.reason} 
                          onChange={(e) => updateMedicationRow(index, "reason", e.target.value)}
                          className="w-full p-1 border border-slate-100 rounded bg-white text-[10px] text-slate-600 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Segment D: Clinical Hypotheses */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">D. Clinical Hypotheses</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Suggested Diagnosis</label>
                <input 
                  type="text" 
                  value={diagnosis} 
                  placeholder="e.g. Borderline Hyperlipidemia"
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">ICD-10 Code</label>
                <input 
                  type="text" 
                  value={icdCode} 
                  placeholder="e.g. E78.5"
                  onChange={(e) => setIcdCode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Form Segment E: Executive Summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">E. Clinical Executive Summary</span>
            <textarea 
              value={summary} 
              rows={3}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={resetScanner}
              className="py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-500 text-xs font-extrabold rounded-xl transition-all text-center"
            >
              Discard Scan
            </button>
            <button
              type="button"
              onClick={handleSaveToEMR}
              disabled={isSaving}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" /> Save to EMR Record
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

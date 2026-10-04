import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import LandingPage from "./components/LandingPage";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminPanel from "./components/AdminPanel";
import PatientMobileApp from "./components/PatientMobileApp";
import PharmacyDashboard from "./components/PharmacyDashboard";
import { AyushWellness } from "./components/AyushWellness";
import MRReferral from "./components/MRReferral";
import { MentalHealthConsult } from "./components/MentalHealthConsult";
import CardiologySuite from "./components/CardiologySuite";
import PediatricsSuite from "./components/PediatricsSuite";
import WomensHealthSuite from "./components/WomensHealthSuite";
import OrthopedicsSuite from "./components/OrthopedicsSuite";
import DermatologySuite from "./components/DermatologySuite";
import NeurologySuite from "./components/NeurologySuite";
import OncologySuite from "./components/OncologySuite";
import EmergencySuite from "./components/EmergencySuite";
import ENTSuite from "./components/ENTSuite";
import SharedAICoreSuite from "./components/SharedAICoreSuite";
import OphthalmologySuite from "./components/OphthalmologySuite";
import HematologySuite from "./components/HematologySuite";
import NephrologySuite from "./components/NephrologySuite";
import RheumatologySuite from "./components/RheumatologySuite";
import CriticalCareSuite from "./components/CriticalCareSuite";
import GastroenterologySuite from "./components/GastroenterologySuite";
import AnalyticsSuite from "./components/AnalyticsSuite";
import DentistrySuite from "./components/DentistrySuite";
import PhysiologySuite from "./components/PhysiologySuite";
import VideoConsultation from "./components/VideoConsultation";
import AICareNavigation from "./components/AICareNavigation";
import ProductionBlueprintSuite from "./components/ProductionBlueprintSuite";
import ThemeSelectorWidget, { ThemeProvider } from "./components/ThemeSelector";
import OfflineSyncEngine from "./components/OfflineSyncEngine";
import GlobalEmergencySOS from "./components/GlobalEmergencySOS";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ClinitialAuthModal from "./components/ClinitialAuthModal";

type ViewState = 
  | "landing" 
  | "dashboard" 
  | "admin" 
  | "patient" 
  | "pharmacy" 
  | "ayush" 
  | "mr" 
  | "mental_health" 
  | "cardiology" 
  | "pediatrics" 
  | "womens_health" 
  | "orthopedics" 
  | "dermatology" 
  | "neurology" 
  | "oncology" 
  | "emergency" 
  | "ent" 
  | "ai_core" 
  | "ophthalmology" 
  | "hematology" 
  | "nephrology" 
  | "rheumatology" 
  | "critical_care" 
  | "gastroenterology" 
  | "analytics" 
  | "dentistry" 
  | "physiology" 
  | "video_consultation" 
  | "care_navigation"
  | "blueprint";

function MainRouter() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [dashboardMedicalSystem, setDashboardMedicalSystem] = useState<"allopathy" | "ayurveda" | "homeopathy" | "unani" | "siddha" | "yoga">("allopathy");
  
  const { isAuthenticated, isAdmin, currentUser, isAuthModalOpen, intendedView, closeAuthModal, openAuthModal } = useAuth();

  const navigateTo = (view: ViewState) => {
    if (view === "admin") {
      if (!isAuthenticated || !isAdmin) {
        openAuthModal("admin", "Clinitial Enterprise Admin Console");
        return;
      }
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = () => {
    if (intendedView === "admin") {
      if (isAdmin) {
        setCurrentView("admin");
      }
      return;
    }
    if (intendedView) {
      navigateTo(intendedView as ViewState);
    }
  };

  // Support direct hash navigation for #admin
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "admin") {
        navigateTo("admin");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [isAuthenticated, isAdmin]);

  return (
    <>
      {/* Global Auth Modal Triggered by AuthContext */}
      <ClinitialAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        intendedModuleTitle={intendedView ? intendedView.toUpperCase().replace(/_/g, " ") : undefined}
        onSuccess={handleAuthSuccess}
      />

      {currentView === "landing" && (
        <LandingPage 
          onNavigateToDashboard={() => {
            setDashboardMedicalSystem("allopathy");
            navigateTo("dashboard");
          }}
          onNavigateToAdmin={() => navigateTo("admin")}
          onNavigateToPatient={() => navigateTo("patient")}
          onNavigateToPharmacy={() => navigateTo("pharmacy")}
          onNavigateToAyush={() => navigateTo("ayush")}
          onNavigateToMR={() => navigateTo("mr")}
          onNavigateToMentalHealth={() => navigateTo("mental_health")}
          onNavigateToCardiology={() => navigateTo("cardiology")}
          onNavigateToPediatrics={() => navigateTo("pediatrics")}
          onNavigateToWomensHealth={() => navigateTo("womens_health")}
          onNavigateToOrthopedics={() => navigateTo("orthopedics")}
          onNavigateToDermatology={() => navigateTo("dermatology")}
          onNavigateToNeurology={() => navigateTo("neurology")}
          onNavigateToOncology={() => navigateTo("oncology")}
          onNavigateToEmergency={() => navigateTo("emergency")}
          onNavigateToENT={() => navigateTo("ent")}
          onNavigateToAICore={() => navigateTo("ai_core")}
          onNavigateToOphthalmology={() => navigateTo("ophthalmology")}
          onNavigateToHematology={() => navigateTo("hematology")}
          onNavigateToNephrology={() => navigateTo("nephrology")}
          onNavigateToRheumatology={() => navigateTo("rheumatology")}
          onNavigateToCriticalCare={() => navigateTo("critical_care")}
          onNavigateToGastroenterology={() => navigateTo("gastroenterology")}
          onNavigateToAnalytics={() => navigateTo("analytics")}
          onNavigateToDentistry={() => navigateTo("dentistry")}
          onNavigateToPhysiology={() => navigateTo("physiology")}
          onNavigateToVideoConsultation={() => navigateTo("video_consultation")}
          onNavigateToCareNavigation={() => navigateTo("care_navigation")}
          onNavigateToBlueprint={() => navigateTo("blueprint")}
        />
      )}

      {currentView === "dashboard" && (
        <DoctorDashboard 
          initialMedicalSystem={dashboardMedicalSystem}
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "admin" && (
        isAdmin ? (
          <AdminPanel 
            onBackToLanding={() => navigateTo("landing")}
          />
        ) : (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">Administrator Privileges Required</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {currentUser 
                    ? `You are currently authenticated as ${currentUser.fullName} (${currentUser.role}). Access to the Clinitial Admin OS requires verified Hospital or System Administrator credentials.`
                    : "Access to the Clinitial Admin OS and enterprise governance console requires verified Administrator credentials."}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2.5">
                <button 
                  onClick={() => openAuthModal("admin", "Clinitial Enterprise Admin Console")}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  Authenticate as Administrator
                </button>
                <button 
                  onClick={() => navigateTo("landing")}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )
      )}
      {currentView === "patient" && (
        <PatientMobileApp 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "pharmacy" && (
        <PharmacyDashboard 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "ayush" && (
        <AyushWellness 
          onBackToLanding={() => navigateTo("landing")}
          onNavigateToAllopathic={() => {
            setDashboardMedicalSystem("ayurveda");
            navigateTo("dashboard");
          }}
        />
      )}
      {currentView === "mr" && (
        <MRReferral 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "mental_health" && (
        <MentalHealthConsult 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "cardiology" && (
        <CardiologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "pediatrics" && (
        <PediatricsSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "womens_health" && (
        <WomensHealthSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "orthopedics" && (
        <OrthopedicsSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "dermatology" && (
        <DermatologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "neurology" && (
        <NeurologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "oncology" && (
        <OncologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "emergency" && (
        <EmergencySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "ent" && (
        <ENTSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "ai_core" && (
        <SharedAICoreSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "ophthalmology" && (
        <OphthalmologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "hematology" && (
        <HematologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "nephrology" && (
        <NephrologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "rheumatology" && (
        <RheumatologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "critical_care" && (
        <CriticalCareSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "gastroenterology" && (
        <GastroenterologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "analytics" && (
        <AnalyticsSuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "dentistry" && (
        <DentistrySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "physiology" && (
        <PhysiologySuite 
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "video_consultation" && (
        <VideoConsultation 
          onBack={() => navigateTo("landing")}
        />
      )}
      {currentView === "care_navigation" && (
        <AICareNavigation 
          onBack={() => navigateTo("landing")}
        />
      )}
      {currentView === "blueprint" && (
        <ProductionBlueprintSuite 
          onBack={() => navigateTo("landing")}
        />
      )}

      {/* Global Multi-Color Theme Switcher Widget */}
      <ThemeSelectorWidget />

      {/* Global Offline Storage Sink & Auto-Sync Engine */}
      <OfflineSyncEngine />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Global Emergency SOS Floating Action Button */}
      <GlobalEmergencySOS 
        onNavigateToEmergency={() => navigateTo("emergency")}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

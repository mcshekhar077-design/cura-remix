import { useState } from "react";
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
import ThemeSelectorWidget, { ThemeProvider } from "./components/ThemeSelector";
import OfflineSyncEngine from "./components/OfflineSyncEngine";
import GlobalEmergencySOS from "./components/GlobalEmergencySOS";

type ViewState = "landing" | "dashboard" | "admin" | "patient" | "pharmacy" | "ayush" | "mr" | "mental_health" | "cardiology" | "pediatrics" | "womens_health" | "orthopedics" | "dermatology" | "neurology" | "oncology" | "emergency" | "ent" | "ai_core" | "ophthalmology" | "hematology" | "nephrology" | "rheumatology" | "critical_care" | "gastroenterology" | "analytics" | "dentistry" | "physiology" | "video_consultation" | "care_navigation";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [dashboardMedicalSystem, setDashboardMedicalSystem] = useState<"allopathy" | "ayurveda" | "homeopathy" | "unani" | "siddha" | "yoga">("allopathy");

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider>
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
        />
      )}
      {currentView === "dashboard" && (
        <DoctorDashboard 
          initialMedicalSystem={dashboardMedicalSystem}
          onBackToLanding={() => navigateTo("landing")}
        />
      )}
      {currentView === "admin" && (
        <AdminPanel 
          onBackToLanding={() => navigateTo("landing")}
        />
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
            setDashboardMedicalSystem("ayurveda"); // Open dashboard in AYUSH mode!
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

      {/* Global Multi-Color Theme Switcher Widget */}
      <ThemeSelectorWidget />

      {/* Global Offline Storage Sink & Auto-Sync Engine */}
      <OfflineSyncEngine />

      {/* Global Emergency SOS Floating Action Button */}
      <GlobalEmergencySOS 
        onNavigateToEmergency={() => navigateTo("emergency")}
      />
    </ThemeProvider>
  );
}

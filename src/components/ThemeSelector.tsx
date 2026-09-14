import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import { Palette, Check, Sparkles, Moon, Sun, RefreshCw, X, CheckCircle2, Sliders, Pipette } from "lucide-react";

export interface ThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  type: "light" | "dark";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgSubtle: string;
  gradientText: string;
  gradientBg: string;
  previewBg: string;
  cardBorder: string;
  tagBg: string;
  tagText: string;
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "clinical-sapphire",
    name: "Clinical Sapphire",
    subtitle: "Default Allopathic Sky-Blue Medical Grade",
    type: "dark",
    primaryColor: "#0EA5E9",
    secondaryColor: "#10B981",
    accentColor: "#6366F1",
    bgSubtle: "#F8FAFC",
    gradientText: "from-sky-500 via-indigo-500 to-emerald-500",
    gradientBg: "from-sky-700 via-indigo-800 to-slate-900",
    previewBg: "bg-sky-500",
    cardBorder: "border-sky-500/30",
    tagBg: "bg-sky-500/20",
    tagText: "text-sky-300"
  },
  {
    id: "emerald-healing",
    name: "Emerald Healing",
    subtitle: "NABH Eco-Green, Mint & Holistic Wellness",
    type: "dark",
    primaryColor: "#059669",
    secondaryColor: "#0D9488",
    accentColor: "#10B981",
    bgSubtle: "#F0FDF4",
    gradientText: "from-emerald-400 via-teal-400 to-cyan-400",
    gradientBg: "from-emerald-800 via-teal-900 to-slate-950",
    previewBg: "bg-emerald-500",
    cardBorder: "border-emerald-500/30",
    tagBg: "bg-emerald-500/20",
    tagText: "text-emerald-300"
  },
  {
    id: "amethyst-ai",
    name: "Amethyst Clinical AI",
    subtitle: "High-Tech Autonomous CDSS & Deep Neural Purple",
    type: "dark",
    primaryColor: "#8B5CF6",
    secondaryColor: "#6366F1",
    accentColor: "#EC4899",
    bgSubtle: "#FAF5FF",
    gradientText: "from-purple-400 via-indigo-400 to-pink-400",
    gradientBg: "from-purple-900 via-indigo-950 to-slate-950",
    previewBg: "bg-purple-600",
    cardBorder: "border-purple-500/30",
    tagBg: "bg-purple-500/20",
    tagText: "text-purple-300"
  },
  {
    id: "sunset-vitality",
    name: "Sunset Amber & Rose",
    subtitle: "Ayush Heritage, Vitality & Warm Care Theme",
    type: "dark",
    primaryColor: "#D97706",
    secondaryColor: "#E11D48",
    accentColor: "#F59E0B",
    bgSubtle: "#FFFBEB",
    gradientText: "from-amber-400 via-orange-400 to-rose-400",
    gradientBg: "from-amber-900 via-orange-950 to-stone-900",
    previewBg: "bg-amber-500",
    cardBorder: "border-amber-500/30",
    tagBg: "bg-amber-500/20",
    tagText: "text-amber-300"
  },
  {
    id: "cyber-midnight",
    name: "Cyber Obsidian (Cyan)",
    subtitle: "Low-Light ER & CathLab High-Contrast Cyan",
    type: "dark",
    primaryColor: "#06B6D4",
    secondaryColor: "#10B981",
    accentColor: "#3B82F6",
    bgSubtle: "#090D16",
    gradientText: "from-cyan-400 via-emerald-400 to-sky-400",
    gradientBg: "from-slate-950 via-cyan-950 to-slate-900",
    previewBg: "bg-cyan-500",
    cardBorder: "border-cyan-500/30",
    tagBg: "bg-cyan-500/20",
    tagText: "text-cyan-300"
  },
  {
    id: "crimson-emergency",
    name: "Crimson Emergency & Trauma",
    subtitle: "Urgent Care, Triage & Critical Red Code",
    type: "dark",
    primaryColor: "#E11D48",
    secondaryColor: "#F97316",
    accentColor: "#DC2626",
    bgSubtle: "#FEF2F2",
    gradientText: "from-rose-400 via-red-500 to-amber-400",
    gradientBg: "from-rose-950 via-red-950 to-slate-950",
    previewBg: "bg-rose-600",
    cardBorder: "border-rose-500/30",
    tagBg: "bg-rose-500/20",
    tagText: "text-rose-300"
  },
  {
    id: "royal-cobalt",
    name: "Royal Cobalt Enterprise",
    subtitle: "Executive Hospital Administration & Deep Blue",
    type: "dark",
    primaryColor: "#2563EB",
    secondaryColor: "#4F46E5",
    accentColor: "#0284C7",
    bgSubtle: "#EFF6FF",
    gradientText: "from-blue-400 via-indigo-400 to-sky-400",
    gradientBg: "from-blue-950 via-indigo-950 to-slate-950",
    previewBg: "bg-blue-600",
    cardBorder: "border-blue-500/30",
    tagBg: "bg-blue-500/20",
    tagText: "text-blue-300"
  },
  {
    id: "teal-precision",
    name: "Teal Precision OT",
    subtitle: "Surgical Suite, Operations & Diagnostic Mint",
    type: "dark",
    primaryColor: "#0D9488",
    secondaryColor: "#059669",
    accentColor: "#06B6D4",
    bgSubtle: "#F0FDFA",
    gradientText: "from-teal-400 via-emerald-400 to-cyan-400",
    gradientBg: "from-teal-950 via-slate-900 to-slate-950",
    previewBg: "bg-teal-600",
    cardBorder: "border-teal-500/30",
    tagBg: "bg-teal-500/20",
    tagText: "text-teal-300"
  },
  {
    id: "nordic-accessibility",
    name: "Nordic Monochrome",
    subtitle: "Maximum Accessibility & Slate High-Contrast",
    type: "dark",
    primaryColor: "#475569",
    secondaryColor: "#2563EB",
    accentColor: "#0F172A",
    bgSubtle: "#F1F5F9",
    gradientText: "from-slate-300 via-blue-300 to-slate-100",
    gradientBg: "from-slate-900 via-blue-950 to-black",
    previewBg: "bg-slate-700",
    cardBorder: "border-slate-500/30",
    tagBg: "bg-slate-500/20",
    tagText: "text-slate-200"
  }
];

// Helper functions for programmatic color scale generation
function parseHex(hex: string): [number, number, number] {
  let c = (hex || "#0EA5E9").replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map(x => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [14, 165, 233];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}

function mixRgb(color: [number, number, number], target: [number, number, number], weight: number): string {
  const r = color[0] * (1 - weight) + target[0] * weight;
  const g = color[1] * (1 - weight) + target[1] * weight;
  const b = color[2] * (1 - weight) + target[2] * weight;
  return rgbToHex(r, g, b);
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateColorScale(hex: string) {
  const rgb = parseHex(hex);
  const white: [number, number, number] = [255, 255, 255];
  const darkTint: [number, number, number] = [9, 13, 22];

  return {
    50: mixRgb(rgb, white, 0.94),
    100: mixRgb(rgb, white, 0.85),
    200: mixRgb(rgb, white, 0.70),
    300: mixRgb(rgb, white, 0.52),
    400: mixRgb(rgb, white, 0.28),
    500: rgbToHex(rgb[0], rgb[1], rgb[2]),
    600: mixRgb(rgb, darkTint, 0.16),
    700: mixRgb(rgb, darkTint, 0.32),
    800: mixRgb(rgb, darkTint, 0.48),
    900: mixRgb(rgb, darkTint, 0.65),
    950: mixRgb(rgb, darkTint, 0.82)
  };
}

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  customPrimary: string;
  setCustomPrimary: (color: string) => void;
  isPaletteOpen: boolean;
  setIsPaletteOpen: (open: boolean) => void;
  openPalette: () => void;
  closePalette: () => void;
  colorMode: "dark" | "light";
  setColorMode: (mode: "dark" | "light") => void;
  toggleColorMode: () => void;
  toastMessage: string | null;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: THEME_PRESETS[0],
  setTheme: () => {},
  customPrimary: "",
  setCustomPrimary: () => {},
  isPaletteOpen: false,
  setIsPaletteOpen: () => {},
  openPalette: () => {},
  closePalette: () => {},
  colorMode: "dark",
  setColorMode: () => {},
  toggleColorMode: () => {},
  toastMessage: null
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem("cura_theme_id") || "clinical-sapphire";
  });
  const [customPrimary, setCustomPrimary] = useState<string>(() => {
    return localStorage.getItem("cura_custom_primary") || "";
  });
  const [colorMode, setColorMode] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("cura_color_mode") as "dark" | "light") || "dark";
  });
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentTheme = useMemo(() => {
    return THEME_PRESETS.find(t => t.id === selectedThemeId) || THEME_PRESETS[0];
  }, [selectedThemeId]);

  const openPalette = () => setIsPaletteOpen(true);
  const closePalette = () => setIsPaletteOpen(false);

  const toggleColorMode = () => {
    setColorMode(prev => (prev === "dark" ? "light" : "dark"));
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleSetTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    setCustomPrimary("");
    localStorage.setItem("cura_theme_id", themeId);
    localStorage.removeItem("cura_custom_primary");
    const found = THEME_PRESETS.find(t => t.id === themeId);
    if (found) {
      showNotification(`Theme applied: ${found.name}`);
    }
  };

  const handleSetCustomPrimary = (color: string) => {
    setCustomPrimary(color);
    if (color) {
      localStorage.setItem("cura_custom_primary", color);
      showNotification(`Custom Accent applied: ${color.toUpperCase()}`);
    } else {
      localStorage.removeItem("cura_custom_primary");
      showNotification(`Reset to ${currentTheme.name} default`);
    }
  };

  useEffect(() => {
    localStorage.setItem("cura_color_mode", colorMode);
    const root = document.documentElement;

    if (colorMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }
  }, [colorMode]);

  useEffect(() => {
    const root = document.documentElement;
    const activePrimary = customPrimary || currentTheme.primaryColor;
    const activeSecondary = currentTheme.secondaryColor;
    const activeAccent = currentTheme.accentColor;
    const bgSubtle = currentTheme.bgSubtle;

    const pScale = generateColorScale(activePrimary);
    const sScale = generateColorScale(activeSecondary);
    const aScale = generateColorScale(activeAccent);

    // 1. Set Tailwind v4 CSS variables on :root for cyan, sky, blue, and indigo
    // This immediately re-colors all utility classes in Tailwind v4!
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

    steps.forEach((step) => {
      const pVal = pScale[step];
      const sVal = sScale[step];
      // Override cyan (which LandingPage & Dark Mode use overwhelmingly)
      root.style.setProperty(`--color-cyan-${step}`, pVal);
      // Override sky (used across clinical dashboards)
      root.style.setProperty(`--color-sky-${step}`, pVal);
      // Override blue (used across CTAs)
      root.style.setProperty(`--color-blue-${step}`, pVal);
      // Override indigo (used for secondary accents)
      root.style.setProperty(`--color-indigo-${step}`, sVal);
    });

    // 2. CURA Core Branding Variables
    root.style.setProperty("--cura-primary", pScale[600]);
    root.style.setProperty("--cura-primary-dark", pScale[800]);
    root.style.setProperty("--cura-primary-light", pScale[400]);
    root.style.setProperty("--cura-secondary", sScale[500]);
    root.style.setProperty("--cura-accent", aScale[500]);
    root.style.setProperty("--cura-bg-subtle", bgSubtle);

    root.style.setProperty("--color-cura-primary", pScale[600]);
    root.style.setProperty("--color-cura-primary-dark", pScale[800]);
    root.style.setProperty("--color-cura-primary-light", pScale[400]);
    root.style.setProperty("--color-cura-secondary", sScale[500]);
    root.style.setProperty("--color-cura-accent", aScale[500]);
    root.style.setProperty("--color-cura-bg-subtle", bgSubtle);

    // 3. Dynamic injected stylesheet to guarantee all buttons, borders, texts,
    //    and backgrounds across pre-compiled components update instantly
    let styleEl = document.getElementById("cura-dynamic-theme-style") as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "cura-dynamic-theme-style";
      document.head.appendChild(styleEl);
    }

    const css = `
      :root {
        --tw-color-theme-primary: ${pScale[500]};
        --tw-color-theme-primary-hover: ${pScale[600]};
        --tw-color-theme-accent: ${aScale[500]};
      }

      /* 1. Primary Solid Buttons & Badges */
      .bg-cyan-600, .bg-cyan-500, .bg-sky-600, .bg-sky-500, .bg-blue-600, .bg-indigo-600 {
        background-color: ${pScale[600]} !important;
      }
      .hover\\:bg-cyan-500:hover, .hover\\:bg-cyan-600:hover,
      .hover\\:bg-sky-700:hover, .hover\\:bg-sky-600:hover,
      .hover\\:bg-blue-700:hover, .hover\\:bg-blue-600:hover,
      .hover\\:bg-indigo-700:hover, .hover\\:bg-indigo-600:hover {
        background-color: ${pScale[700]} !important;
      }

      /* 2. Primary Text Accents & Icons */
      .text-cyan-400, .text-cyan-300, .text-sky-400, .text-sky-300, .text-blue-400, .text-indigo-400 {
        color: ${pScale[400]} !important;
      }
      .text-cyan-500, .text-cyan-600, .text-sky-600, .text-sky-500, .text-blue-600, .text-indigo-600 {
        color: ${pScale[600]} !important;
      }
      .text-cyan-700, .text-cyan-800, .text-sky-700, .text-sky-800 {
        color: ${pScale[800]} !important;
      }

      /* 3. Primary Borders */
      .border-cyan-500, .border-cyan-400, .border-sky-500, .border-blue-500, .border-indigo-500 {
        border-color: ${pScale[500]} !important;
      }
      .border-cyan-500\\/30, .border-cyan-500\\/40, .border-cyan-500\\/20,
      .border-sky-500\\/30, .border-blue-500\\/30 {
        border-color: ${hexToRgba(pScale[500], 0.35)} !important;
      }
      .border-cyan-800\\/40, .border-cyan-800\\/50 {
        border-color: ${hexToRgba(pScale[700], 0.45)} !important;
      }

      /* 4. Tinted Soft Backgrounds & Tags */
      .bg-cyan-500\\/10, .bg-sky-500\\/10, .bg-blue-500\\/10, .bg-cyan-50, .bg-sky-50, .bg-blue-50, .bg-indigo-50 {
        background-color: ${hexToRgba(pScale[500], 0.12)} !important;
      }
      .bg-cyan-500\\/20, .bg-sky-100, .bg-cyan-100, .bg-blue-100 {
        background-color: ${hexToRgba(pScale[500], 0.22)} !important;
      }
      .bg-cyan-950\\/60, .bg-cyan-950\\/40, .bg-sky-950\\/60 {
        background-color: ${hexToRgba(pScale[950], 0.65)} !important;
      }

      /* 5. Rings & Focus Outlines */
      .ring-cyan-500, .ring-sky-500,
      .focus\\:ring-cyan-500:focus, .focus\\:ring-sky-500:focus,
      .focus\\:border-cyan-500:focus, .focus\\:border-sky-500:focus {
        --tw-ring-color: ${pScale[500]} !important;
        border-color: ${pScale[500]} !important;
      }

      /* 6. Dynamic Gradients & Glows */
      .gradient-text-cura {
        background: linear-gradient(135deg, ${pScale[400]}, ${sScale[400]}) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      .gradient-bg-cura {
        background: linear-gradient(135deg, ${pScale[800]} 0%, ${pScale[600]} 100%) !important;
      }
      .gradient-btn-cura {
        background: linear-gradient(135deg, ${pScale[600]}, ${sScale[600]}) !important;
      }
      .shadow-glow-cura {
        box-shadow: 0 0 35px ${hexToRgba(pScale[500], 0.45)} !important;
      }
      .shadow-glow-cta {
        box-shadow: 0 15px 45px ${hexToRgba(pScale[500], 0.35)} !important;
      }

      /* 7. Text Selection */
      ::selection {
        background-color: ${pScale[500]} !important;
        color: #ffffff !important;
      }
    `;

    styleEl.textContent = css;
  }, [selectedThemeId, customPrimary, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: handleSetTheme,
        customPrimary,
        setCustomPrimary: handleSetCustomPrimary,
        isPaletteOpen,
        setIsPaletteOpen,
        openPalette,
        closePalette,
        colorMode,
        setColorMode,
        toggleColorMode,
        toastMessage
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default function ThemeSelectorWidget() {
  const {
    currentTheme,
    setTheme,
    customPrimary,
    setCustomPrimary,
    isPaletteOpen,
    setIsPaletteOpen,
    openPalette,
    closePalette,
    colorMode,
    toggleColorMode,
    toastMessage
  } = useTheme();

  const activeColor = customPrimary || currentTheme.primaryColor;

  return (
    <>
      {/* REAL-TIME TOAST CONFIRMATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[110] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-white shadow-2xl backdrop-blur-xl">
            <span
              className="w-3 h-3 rounded-full border border-white shadow-sm shrink-0"
              style={{ backgroundColor: activeColor }}
            />
            <span className="text-xs font-bold text-slate-100">{toastMessage}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-1" />
          </div>
        </div>
      )}

      {/* FLOATING QUICK TOGGLE TRIGGER BUTTON (Bottom-Left) */}
      {!isPaletteOpen && (
        <div className="fixed bottom-5 left-5 z-50 font-sans">
          <button
            onClick={openPalette}
            id="cura-floating-palette-trigger"
            className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-black text-white shadow-2xl border border-slate-700/90 backdrop-blur-xl transition-all hover:scale-105 cursor-pointer"
            title="Change Platform Color Palette & Theme"
          >
            <div className="relative flex items-center justify-center">
              <Palette className="h-5 w-5 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
                style={{ backgroundColor: activeColor }}
              />
            </div>
            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline text-slate-200">
              {currentTheme.name.split(" ")[0]}
            </span>
            <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
              Palette
            </span>
          </button>
        </div>
      )}

      {/* EXPANDED MULTI-COLOR THEME DRAWER / PANEL */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-start sm:justify-start sm:p-5 p-2 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:w-[420px] max-h-[90vh] bg-slate-950/95 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl backdrop-blur-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto scrollbar-thin">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md text-white transition-colors"
                  style={{ backgroundColor: activeColor }}
                >
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Color Palette & Theme Engine
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    Customize CURA Health OS in Real-Time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleColorMode}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-800"
                  title={`Switch to ${colorMode === "dark" ? "Light" : "Dark"} Mode`}
                >
                  {colorMode === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-sky-400" />
                  )}
                </button>
                <button
                  onClick={closePalette}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-800"
                  title="Close Palette"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Live Preview
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">
                  {customPrimary ? "Custom Accent" : currentTheme.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: activeColor }}
                >
                  Primary Button
                </button>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: hexToRgba(activeColor, 0.15),
                    borderColor: hexToRgba(activeColor, 0.4),
                    color: activeColor
                  }}
                >
                  Active Pill
                </span>
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-950"
                  style={{ color: activeColor }}
                >
                  {activeColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* PRESET PALETTES GRID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Clinical Color Presets
                </p>
                <span className="text-[9.5px] text-slate-500 font-mono">
                  {THEME_PRESETS.length} Themes
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {THEME_PRESETS.map(preset => {
                  const isSelected = currentTheme.id === preset.id && !customPrimary;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setTheme(preset.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? "bg-slate-900 border-white/60 ring-2 ring-white/20 shadow-lg"
                          : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: preset.primaryColor }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: preset.secondaryColor }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                        </div>
                        {isSelected && (
                          <CheckCircle2
                            className="h-3.5 w-3.5"
                            style={{ color: preset.primaryColor }}
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white leading-snug">{preset.name}</p>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                          {preset.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM COLOR ACCENT PICKER */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Custom Spectrum Picker
                </span>
                {customPrimary && (
                  <button
                    onClick={() => setCustomPrimary("")}
                    className="text-[10px] font-bold hover:underline cursor-pointer"
                    style={{ color: activeColor }}
                  >
                    Reset to Preset
                  </button>
                )}
              </div>

              {/* Quick Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  "#0EA5E9", // Sky
                  "#059669", // Emerald
                  "#8B5CF6", // Amethyst Purple
                  "#EC4899", // Pink
                  "#D97706", // Amber
                  "#E11D48", // Crimson Red
                  "#2563EB", // Royal Blue
                  "#06B6D4", // Cyan
                  "#0D9488", // Teal
                  "#F97316"  // Sunset Orange
                ].map(color => (
                  <button
                    key={color}
                    onClick={() => setCustomPrimary(color)}
                    className={`w-7 h-7 rounded-xl border-2 transition-transform hover:scale-115 cursor-pointer ${
                      activeColor.toLowerCase() === color.toLowerCase()
                        ? "border-white ring-2 ring-white/50 scale-110 shadow-md"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Apply ${color}`}
                  />
                ))}

                {/* Native HTML5 Color Picker */}
                <label className="relative flex items-center justify-center w-7 h-7 rounded-xl border border-slate-700 bg-slate-900 hover:border-slate-500 cursor-pointer overflow-hidden group">
                  <Pipette className="h-3.5 w-3.5 text-slate-300 group-hover:text-white" />
                  <input
                    type="color"
                    value={activeColor}
                    onChange={e => setCustomPrimary(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Choose any custom color from the wheel"
                  />
                </label>
              </div>

              {/* Hex input & live indicator */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className="w-8 h-8 rounded-xl border border-slate-700 shrink-0 shadow-sm"
                  style={{ backgroundColor: activeColor }}
                />
                <input
                  type="text"
                  value={customPrimary || activeColor}
                  onChange={e => {
                    const val = e.target.value;
                    if (val.startsWith("#") && val.length <= 7) {
                      setCustomPrimary(val);
                    }
                  }}
                  placeholder="#0EA5E9"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-slate-600"
                />
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Applied instantly</span>
              <button
                onClick={() => {
                  setTheme("clinical-sapphire");
                  setCustomPrimary("");
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Reset Default
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, createContext, useContext } from "react";
import { Palette, Check, Sparkles, Moon, Sun, Monitor, RefreshCw, X, Eye, Sliders, CheckCircle2 } from "lucide-react";

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
    subtitle: "Default Allopathic & Sky-Blue Medical Grade",
    type: "light",
    primaryColor: "#0EA5E9",
    secondaryColor: "#10B981",
    accentColor: "#6366F1",
    bgSubtle: "#F8FAFC",
    gradientText: "from-sky-600 via-indigo-600 to-emerald-600",
    gradientBg: "from-sky-700 via-indigo-800 to-slate-900",
    previewBg: "bg-sky-500",
    cardBorder: "border-sky-200",
    tagBg: "bg-sky-100",
    tagText: "text-sky-800"
  },
  {
    id: "emerald-healing",
    name: "Emerald Healing",
    subtitle: "NABH Eco-Green, Mint & Holistic Wellness",
    type: "light",
    primaryColor: "#059669",
    secondaryColor: "#0D9488",
    accentColor: "#10B981",
    bgSubtle: "#F0FDF4",
    gradientText: "from-emerald-600 via-teal-600 to-cyan-600",
    gradientBg: "from-emerald-800 via-teal-900 to-slate-950",
    previewBg: "bg-emerald-500",
    cardBorder: "border-emerald-200",
    tagBg: "bg-emerald-100",
    tagText: "text-emerald-800"
  },
  {
    id: "amethyst-ai",
    name: "Amethyst Clinical AI",
    subtitle: "High-Tech Autonomous CDSS & Deep Neural Purple",
    type: "light",
    primaryColor: "#8B5CF6",
    secondaryColor: "#6366F1",
    accentColor: "#EC4899",
    bgSubtle: "#FAF5FF",
    gradientText: "from-purple-600 via-indigo-600 to-pink-600",
    gradientBg: "from-purple-900 via-indigo-950 to-slate-950",
    previewBg: "bg-purple-600",
    cardBorder: "border-purple-200",
    tagBg: "bg-purple-100",
    tagText: "text-purple-800"
  },
  {
    id: "sunset-vitality",
    name: "Sunset Amber & Rose",
    subtitle: "Ayush Heritage, Vitality & Warm Care Theme",
    type: "light",
    primaryColor: "#D97706",
    secondaryColor: "#E11D48",
    accentColor: "#F59E0B",
    bgSubtle: "#FFFBEB",
    gradientText: "from-amber-600 via-orange-600 to-rose-600",
    gradientBg: "from-amber-900 via-orange-950 to-stone-900",
    previewBg: "bg-amber-500",
    cardBorder: "border-amber-200",
    tagBg: "bg-amber-100",
    tagText: "text-amber-800"
  },
  {
    id: "cyber-midnight",
    name: "Cyber Obsidian (Dark)",
    subtitle: "Low-Light ER & CathLab High-Contrast Cyan",
    type: "dark",
    primaryColor: "#06B6D4",
    secondaryColor: "#10B981",
    accentColor: "#3B82F6",
    bgSubtle: "#090D16",
    gradientText: "from-cyan-400 via-emerald-400 to-sky-400",
    gradientBg: "from-slate-950 via-cyan-950 to-slate-900",
    previewBg: "bg-slate-900",
    cardBorder: "border-cyan-500/30",
    tagBg: "bg-cyan-500/20",
    tagText: "text-cyan-300"
  },
  {
    id: "nordic-accessibility",
    name: "Nordic High-Contrast",
    subtitle: "Maximum Accessibility & Crisp Black-Navy Borders",
    type: "light",
    primaryColor: "#1E293B",
    secondaryColor: "#2563EB",
    accentColor: "#0F172A",
    bgSubtle: "#F1F5F9",
    gradientText: "from-slate-900 via-blue-900 to-slate-800",
    gradientBg: "from-slate-900 via-blue-950 to-black",
    previewBg: "bg-slate-800",
    cardBorder: "border-slate-400",
    tagBg: "bg-slate-200",
    tagText: "text-slate-900"
  }
];

function hexToRgba(hex: string, alpha: number) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map(x => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(14, 165, 233, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustHex(hex: string, percent: number) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map(x => x + x).join("");
  }
  let num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  customPrimary: string;
  setCustomPrimary: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: THEME_PRESETS[0],
  setTheme: () => {},
  customPrimary: "",
  setCustomPrimary: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem("cura_theme_id") || "clinical-sapphire";
  });
  const [customPrimary, setCustomPrimary] = useState<string>("");

  const currentTheme = THEME_PRESETS.find(t => t.id === selectedThemeId) || THEME_PRESETS[0];

  useEffect(() => {
    localStorage.setItem("cura_theme_id", selectedThemeId);
    
    // Inject CSS variables into :root
    const root = document.documentElement;
    const activePrimary = customPrimary || currentTheme.primaryColor;
    const primaryDark = adjustHex(activePrimary, -25);
    const primaryLight = adjustHex(activePrimary, 30);
    const activeSecondary = currentTheme.secondaryColor;
    const activeAccent = currentTheme.accentColor;
    const bgSubtle = currentTheme.bgSubtle;
    
    root.style.setProperty("--cura-primary", activePrimary);
    root.style.setProperty("--cura-primary-dark", primaryDark);
    root.style.setProperty("--cura-primary-light", primaryLight);
    root.style.setProperty("--cura-secondary", activeSecondary);
    root.style.setProperty("--cura-accent", activeAccent);
    root.style.setProperty("--cura-bg-subtle", bgSubtle);
    
    if (currentTheme.type === "dark") {
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#090D16";
      document.body.style.color = "#F8FAFC";
    } else {
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = bgSubtle || "#FFFFFF";
      document.body.style.color = "#0F172A";
    }

    // Dynamic style sheet injection to recolor standard primary classes
    let styleEl = document.getElementById("cura-dynamic-theme-style") as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "cura-dynamic-theme-style";
      document.head.appendChild(styleEl);
    }

    const css = `
      :root {
        --cura-primary: ${activePrimary};
        --cura-primary-dark: ${primaryDark};
        --cura-primary-light: ${primaryLight};
        --cura-secondary: ${activeSecondary};
        --cura-accent: ${activeAccent};
        --cura-bg-subtle: ${bgSubtle};
      }

      /* Primary buttons & backgrounds */
      .bg-sky-600, .bg-sky-500, .bg-sky-700,
      .hover\\:bg-sky-700:hover, .hover\\:bg-sky-600:hover {
        background-color: ${activePrimary} !important;
      }

      .bg-sky-50, .bg-sky-100\\/50, .bg-sky-100\\/80 {
        background-color: ${hexToRgba(activePrimary, 0.1)} !important;
      }
      .bg-sky-100 {
        background-color: ${hexToRgba(activePrimary, 0.18)} !important;
      }

      /* Primary text colors */
      .text-sky-600, .text-sky-500, .text-sky-700, .text-sky-800, .text-sky-900,
      .group-hover\\:text-sky-600:hover, .hover\\:text-sky-600:hover, .hover\\:text-sky-500:hover {
        color: ${activePrimary} !important;
      }

      /* Borders */
      .border-sky-200, .border-sky-300, .border-sky-400, .border-sky-500, .border-sky-600,
      .focus\\:border-sky-500:focus, .focus\\:border-sky-600:focus {
        border-color: ${activePrimary} !important;
      }

      /* Rings */
      .ring-sky-500, .focus\\:ring-sky-500:focus {
        --tw-ring-color: ${activePrimary} !important;
      }

      /* Gradients */
      .gradient-text-cura {
        background: linear-gradient(135deg, ${activePrimary}, ${activeSecondary}) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }

      .gradient-bg-cura {
        background: linear-gradient(135deg, ${primaryDark} 0%, ${activePrimary} 100%) !important;
      }

      .gradient-btn-cura {
        background: linear-gradient(135deg, ${activePrimary}, ${activeSecondary}) !important;
      }

      /* Dark mode styles */
      body.dark {
        background-color: #090D16 !important;
        color: #F8FAFC !important;
      }
      body.dark .bg-white {
        background-color: #0F172A !important;
        color: #F8FAFC !important;
        border-color: #1E293B !important;
      }
      body.dark .bg-slate-50 {
        background-color: #1E293B !important;
        color: #F1F5F9 !important;
      }
      body.dark .text-slate-800, body.dark .text-slate-900 {
        color: #F8FAFC !important;
      }
      body.dark .text-slate-600, body.dark .text-slate-500 {
        color: #94A3B8 !important;
      }
      body.dark .border-slate-100, body.dark .border-slate-200 {
        border-color: #1E293B !important;
      }
    `;

    styleEl.textContent = css;
  }, [selectedThemeId, customPrimary, currentTheme]);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme: setSelectedThemeId,
      customPrimary,
      setCustomPrimary
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function ThemeSelectorWidget() {
  const { currentTheme, setTheme, customPrimary, setCustomPrimary } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-40 font-sans">
      
      {/* FLOATING QUICK TOGGLE TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-black text-white shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          title="Customize Platform Theme & Palette"
        >
          <div className="relative flex items-center justify-center">
            <Palette className="h-5 w-5 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
            <span 
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
              style={{ backgroundColor: customPrimary || currentTheme.primaryColor }}
            />
          </div>
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline text-slate-200">
            {currentTheme.name.split(" ")[0]} Theme
          </span>
          <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
            Palette
          </span>
        </button>
      )}

      {/* EXPANDED MULTI-COLOR THEME DRAWER / PANEL */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-950/95 border border-slate-800/90 text-slate-100 rounded-3xl shadow-2xl backdrop-blur-xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200 relative">
          
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Multi-Color Theme Engine</h3>
                <p className="text-[10px] text-slate-400 font-medium">Customize CURA Health OS Appearance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ACTIVE THEME SUMMARY BADGE */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-5 h-5 rounded-full border-2 border-white shadow-md shrink-0"
                style={{ backgroundColor: customPrimary || currentTheme.primaryColor }}
              />
              <div>
                <p className="text-xs font-black text-white">{currentTheme.name}</p>
                <p className="text-[9.5px] text-slate-400">{currentTheme.subtitle}</p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
              Active
            </span>
          </div>

          {/* PRESET PALETTES GRID */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Clinical Color Preset</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {THEME_PRESETS.map((preset) => {
                const isSelected = currentTheme.id === preset.id && !customPrimary;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCustomPrimary("");
                      setTheme(preset.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                      isSelected
                        ? "bg-slate-900 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
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
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-sky-400" />}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white leading-snug">{preset.name}</p>
                      <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{preset.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM COLOR ACCENT PICKER */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Accent Overlay</span>
              {customPrimary && (
                <button
                  onClick={() => setCustomPrimary("")}
                  className="text-[9.5px] font-bold text-sky-400 hover:underline cursor-pointer"
                >
                  Reset Preset Color
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {[
                "#0EA5E9", // Sky
                "#059669", // Emerald
                "#8B5CF6", // Amethyst Purple
                "#EC4899", // Pink
                "#D97706", // Amber
                "#E11D48", // Crimson
                "#2563EB", // Royal Blue
                "#06B6D4"  // Cyan
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => setCustomPrimary(color)}
                  className={`w-7 h-7 rounded-xl border-2 transition-transform hover:scale-110 cursor-pointer ${
                    customPrimary === color ? "border-white ring-2 ring-purple-500/50 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Apply custom ${color} accent`}
                />
              ))}
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Themes applied globally</span>
            <button
              onClick={() => {
                setTheme("clinical-sapphire");
                setCustomPrimary("");
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Reset Default
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

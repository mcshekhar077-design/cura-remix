import React, { useState, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Heart,
  Pill,
  Phone,
  MapPin,
  Activity,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2
} from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: 'immediate' | 'preparation' | 'information';
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export interface EmergencyChecklistProps {
  onComplete?: (itemId: string) => void;
  onReset?: () => void;
}

export const EmergencyChecklist: React.FC<EmergencyChecklistProps> = ({
  onComplete,
  onReset
}) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      label: 'Call Emergency Services (108 / 911)',
      description: 'Dial emergency response hotline immediately for ambulance dispatch',
      category: 'immediate',
      completed: true,
      icon: Phone
    },
    {
      id: '2',
      label: 'Check Airway & Patient Breathing',
      description: 'Ensure airway is unblocked and evaluate chest rise / fall',
      category: 'immediate',
      completed: false,
      icon: Activity
    },
    {
      id: '3',
      label: 'Check for Medical Alert / ID',
      description: 'Verify ABHA QR card, medical bracelet, or digital health vault',
      category: 'immediate',
      completed: false,
      icon: Shield
    },
    {
      id: '4',
      label: 'Gather Current Medications & Dosages',
      description: 'Collect active prescriptions, insulin, inhalers, or cardiac pills',
      category: 'preparation',
      completed: false,
      icon: Pill
    },
    {
      id: '5',
      label: 'Prepare Clinical History & Allergies',
      description: 'Review known drug allergies (e.g. Penicillin) and prior surgeries',
      category: 'preparation',
      completed: false,
      icon: FileText
    },
    {
      id: '6',
      label: 'Notify Family / Primary Caregiver',
      description: 'Send direct emergency SMS broadcast with GPS coordinate link',
      category: 'preparation',
      completed: false,
      icon: Heart
    },
    {
      id: '7',
      label: 'Broadcast Live GPS Telemetry',
      description: 'Keep location services active for ER navigation and ambulance rendezvous',
      category: 'information',
      completed: true,
      icon: MapPin
    }
  ]);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    immediate: true,
    preparation: true,
    information: true
  });

  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    if (onComplete) onComplete(id);
  }, [onComplete]);

  const handleReset = useCallback(() => {
    setItems(prev => prev.map(item => ({ ...item, completed: false })));
    if (onReset) onReset();
  }, [onReset]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'immediate': return '1. Immediate Triage Actions';
      case 'preparation': return '2. Clinical Prep & History';
      case 'information': return '3. Real-time Telemetry & Sharing';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate': return AlertCircle;
      case 'preparation': return Shield;
      case 'information': return Share2;
      default: return AlertCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'immediate': return 'border-rose-500/30 bg-rose-950/20';
      case 'preparation': return 'border-amber-500/30 bg-amber-950/20';
      case 'information': return 'border-emerald-500/30 bg-emerald-950/20';
      default: return 'border-slate-800 bg-slate-950/20';
    }
  };

  const progress = items.filter(i => i.completed).length;
  const total = items.length;

  return (
    <div id="emergency-checklist-container" className="space-y-3 text-left">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">ER Response Checklist</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {progress}/{total} Steps ({Math.round((progress / total) * 100)}%)
          </span>
        </div>
        <button
          id="btn-reset-checklist"
          type="button"
          onClick={handleReset}
          className="text-[10px] text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            progress === total ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>

      {shareMsg && (
        <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{shareMsg}</span>
        </div>
      )}

      {/* Checklist Sections */}
      {['immediate', 'preparation', 'information'].map((category) => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;

        const Icon = getCategoryIcon(category);
        const isExpanded = expandedCategories[category];
        const completedCount = categoryItems.filter(i => i.completed).length;

        return (
          <div
            key={category}
            className={`border rounded-xl overflow-hidden ${getCategoryColor(category)}`}
          >
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full p-2.5 flex items-center justify-between hover:bg-slate-950/40 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${
                  completedCount === categoryItems.length ? 'text-emerald-400' : 'text-slate-400'
                }`} />
                <span className="text-xs font-bold text-white">
                  {getCategoryLabel(category)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({completedCount}/{categoryItems.length})
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <div className="p-2.5 pt-0 space-y-1.5">
                {categoryItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`w-full p-2 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        item.completed
                          ? 'bg-emerald-950/30 border border-emerald-500/30'
                          : 'bg-slate-950/50 border border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <ItemIcon className={`h-3 w-3 ${
                            item.completed ? 'text-emerald-400' : 'text-slate-400'
                          }`} />
                          <span className={`text-xs font-bold ${
                            item.completed ? 'text-emerald-300 line-through opacity-80' : 'text-white'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-relaxed ${
                          item.completed ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Quick Actions */}
      <div className="flex gap-2 pt-1">
        <button
          id="btn-print-checklist"
          type="button"
          onClick={() => {
            window.print();
          }}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save PDF
        </button>
        <button
          id="btn-share-checklist"
          type="button"
          onClick={() => {
            setShareMsg("✓ Emergency checklist shared with active ER responders!");
            setTimeout(() => setShareMsg(null), 3000);
          }}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share with Responders
        </button>
      </div>
    </div>
  );
};

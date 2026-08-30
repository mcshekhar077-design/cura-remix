// ============================================
// TREATMENT PLAN - MAIN MODULE EXPORT
// ============================================

import React, { useState } from 'react';
import { TreatmentPlan, TreatmentPlanItem, TreatmentStatus, TreatmentPriority } from '../../types';
import { PlanEditor } from './PlanEditor';
import { CostCalculator } from './CostCalculator';
import { AuditLog } from './AuditLog';
import { Plus, Save, Download, FileText, Calculator, History, CheckCircle2, Clock, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '../../utils/priceCalculator';

interface TreatmentProps {
  plan: TreatmentPlan | null;
  onAddItem: (item: Omit<TreatmentPlanItem, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  onUpdateItem: (itemId: string, updates: Partial<TreatmentPlanItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateStatus: (status: TreatmentPlan['status']) => Promise<void>;
  onSave: () => Promise<void>;
  onExportPDF: () => void;
  loading?: boolean;
  selectedToothNumber?: number | null;
}

export const Treatment: React.FC<TreatmentProps> = ({
  plan,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateStatus,
  onSave,
  onExportPDF,
  loading = false,
  selectedToothNumber = 14
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [editingItem, setEditingItem] = useState<TreatmentPlanItem | null>(null);

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
        <span className="ml-3 text-slate-400 text-xs font-semibold">Loading treatment plan...</span>
      </div>
    );
  }

  const getStatusColor = (status: TreatmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'approved': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'in_progress': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: TreatmentPriority) => {
    switch (priority) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            Comprehensive Dental Treatment Plan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Version {plan.version} • {plan.items.length} Planned Procedures • Status: <span className="font-bold text-white capitalize">{plan.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAudit(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <History className="h-3.5 w-3.5" />
            Audit Trail
          </button>
          
          <button
            onClick={onExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Print Estimate
          </button>

          <button
            onClick={onSave}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowEditor(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-900/30"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Procedure
          </button>
        </div>
      </div>

      {/* Plan Status & Timeline Selector */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Master Plan Status:</span>
          <select
            value={plan.status}
            onChange={(e) => onUpdateStatus(e.target.value as TreatmentPlan['status'])}
            className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-cyan-500"
          >
            <option value="draft">Draft Formulation</option>
            <option value="in_progress">Active Clinical Treatment</option>
            <option value="approved">Patient & Dentist Approved</option>
            <option value="completed">All Procedures Completed</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400">
          Last Saved: <strong className="text-slate-300">{new Date(plan.updatedAt || Date.now()).toLocaleDateString()}</strong>
        </div>
      </div>

      {/* Treatment Items Listing */}
      {plan.items.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-2">
          <FileText className="h-10 w-10 mx-auto text-slate-600" />
          <p className="text-sm font-bold text-slate-400">No Treatment Procedures Recorded</p>
          <p className="text-xs text-slate-500">
            Click "+ Add Procedure" or select a tooth from the Odontogram to create restorative or periodontal procedures.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {plan.items.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-900/70 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black px-2 py-0.5 rounded-lg">
                    Tooth #{item.toothNumber}
                  </span>
                  <span className="text-xs font-black text-white">{item.procedure}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)} bg-slate-950`}>
                    {item.priority} Priority
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    Estimated Time: <strong className="text-slate-300">{item.duration} mins</strong>
                  </span>
                  <span>
                    Fee: <strong className="text-cyan-300">{formatCurrency(item.cost)}</strong>
                  </span>
                  {item.description && (
                    <span className="text-slate-500 italic">
                      • {item.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowEditor(true);
                  }}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded-xl transition-all"
                  title="Edit procedure"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove procedure ${item.procedure} for Tooth #${item.toothNumber}?`)) {
                      onDeleteItem(item.id);
                    }
                  }}
                  className="p-2 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                  title="Delete procedure"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Financial & Time Estimates Section */}
      <CostCalculator plan={plan} />

      {/* Modal Editor */}
      {showEditor && (
        <PlanEditor
          item={editingItem}
          defaultToothNumber={selectedToothNumber || 14}
          onSave={async (itemData) => {
            if (editingItem) {
              await onUpdateItem(editingItem.id, itemData);
            } else {
              await onAddItem(itemData);
            }
            setShowEditor(false);
            setEditingItem(null);
          }}
          onCancel={() => {
            setShowEditor(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Audit Log Modal */}
      {showAudit && <AuditLog plan={plan} onClose={() => setShowAudit(false)} />}
    </div>
  );
};

export default Treatment;

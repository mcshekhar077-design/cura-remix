// ============================================
// TREATMENT PLAN - PLAN EDITOR MODAL
// ============================================

import React, { useState } from 'react';
import { TreatmentPlanItem, TreatmentPriority, TreatmentStatus } from '../../types';
import { X, Plus, Save, Sparkles, AlertCircle } from 'lucide-react';
import { DENTAL_PRICE_LIST } from '../../utils/priceCalculator';

interface PlanEditorProps {
  item?: TreatmentPlanItem | null;
  onSave: (item: Omit<TreatmentPlanItem, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  onCancel: () => void;
  defaultToothNumber?: number;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({
  item,
  onSave,
  onCancel,
  defaultToothNumber = 14
}) => {
  const [toothNumber, setToothNumber] = useState<number>(item?.toothNumber || defaultToothNumber);
  const [selectedCode, setSelectedCode] = useState<string>(item?.code || 'D2392');
  const [procedure, setProcedure] = useState<string>(item?.procedure || 'Composite Resin Restoration (2 Surfaces)');
  const [cost, setCost] = useState<number>(item?.cost || 2400);
  const [priority, setPriority] = useState<TreatmentPriority>(item?.priority || 'high');
  const [status, setStatus] = useState<TreatmentStatus>(item?.status || 'pending');
  const [duration, setDuration] = useState<number>(item?.duration || 35);
  const [description, setDescription] = useState<string>(item?.description || '');
  const [notes, setNotes] = useState<string>(item?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProcedureSelect = (code: string) => {
    setSelectedCode(code);
    const found = DENTAL_PRICE_LIST.find(p => p.code === code);
    if (found) {
      setProcedure(found.procedure);
      setCost(found.basePrice);
      // Auto estimate duration by category
      if (found.category === 'Endodontics') setDuration(60);
      else if (found.category === 'Prosthodontics') setDuration(45);
      else if (found.category === 'Oral Surgery') setDuration(40);
      else if (found.category === 'Periodontics') setDuration(45);
      else setDuration(30);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        toothNumber,
        procedure,
        code: selectedCode,
        description,
        cost,
        priority,
        status,
        duration,
        notes
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {item ? 'Edit Treatment Procedure' : 'Add Treatment Procedure'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                CDT Dental Code & Pricing Catalog
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Target Tooth Number
              </label>
              <input
                type="number"
                min="1"
                max="32"
                value={toothNumber}
                onChange={(e) => setToothNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Clinical Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TreatmentPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="high">🔴 High Priority (Immediate)</option>
                <option value="medium">🟡 Medium Priority (Elective)</option>
                <option value="low">🟢 Low Priority (Maintenance)</option>
              </select>
            </div>
          </div>

          {/* Quick Procedure Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Select CDT Standard Procedure
            </label>
            <select
              value={selectedCode}
              onChange={(e) => handleProcedureSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500"
            >
              {DENTAL_PRICE_LIST.map((p) => (
                <option key={p.code} value={p.code}>
                  [{p.code}] {p.procedure} — ₹{p.basePrice} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Procedure Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-black text-cyan-300 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Chair Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TreatmentStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Clinical Details & Preparation Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Mesial-Occlusal composite filling, localized anesthesia 2% lignocaine"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
            >
              <Save className="h-3.5 w-3.5" />
              {isSubmitting ? 'Saving...' : 'Save Procedure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// TREATMENT PLAN - COST CALCULATOR
// ============================================

import React from 'react';
import { TreatmentPlan } from '../../types';
import { formatCurrency, calculateTaxBreakdown } from '../../utils/priceCalculator';
import { Calculator, Clock, CreditCard, Receipt } from 'lucide-react';

interface CostCalculatorProps {
  plan: TreatmentPlan;
  gstRate?: number;
  discountPercent?: number;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  plan,
  gstRate = 18,
  discountPercent = 0
}) => {
  const subtotal = plan.items.reduce((acc, item) => acc + item.cost, 0);
  const totalDuration = plan.items.reduce((acc, item) => acc + item.duration, 0);
  const breakdown = calculateTaxBreakdown(subtotal, gstRate, discountPercent);

  const formatHours = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins} mins`;
    if (remainingMins === 0) return `${hours} hrs`;
    return `${hours} hrs ${remainingMins} mins`;
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Financial Summary & Time Estimates
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-cyan-400" />
          Chair-time: <strong className="text-white">{formatHours(totalDuration)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Procedures Base Cost</span>
          <span className="text-lg font-black text-white">{formatCurrency(breakdown.baseAmount)}</span>
          <span className="text-[10px] text-slate-500 block">{plan.items.length} Planned Procedures</span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicable GST ({gstRate}%)</span>
          <span className="text-lg font-black text-amber-400">{formatCurrency(breakdown.taxAmount)}</span>
          <span className="text-[10px] text-slate-500 block">Healthcare Services Standard</span>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 to-sky-950/40 p-3.5 rounded-xl border border-cyan-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-300 block">Estimated Net Total</span>
          <span className="text-xl font-black text-cyan-300">{formatCurrency(breakdown.totalAmount)}</span>
          <span className="text-[10px] text-cyan-400/70 block">Includes Tax & Materials</span>
        </div>
      </div>

      {plan.items.length > 0 && (
        <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl flex items-center justify-between border border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-cyan-400" />
            Average Procedure Fee: <strong>{formatCurrency(Math.round(subtotal / plan.items.length))}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
            Insurance / PM-JAY Co-pay Eligible: <strong>Applicable on Restorative/Perio</strong>
          </span>
        </div>
      )}
    </div>
  );
};

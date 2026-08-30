// ============================================
// TREATMENT PLAN - AUDIT LOG
// ============================================

import React from 'react';
import { TreatmentPlan } from '../../types';
import { History, X, ShieldCheck, Clock, UserCheck } from 'lucide-react';

interface AuditLogProps {
  plan: TreatmentPlan;
  onClose: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ plan, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                Immutable Treatment Audit Trail
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Version {plan.version} • Patient ID: {plan.patientId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Audit Log Entries */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 text-xs">
          {(!plan.auditLog || plan.auditLog.length === 0) ? (
            <div className="text-center py-8 text-slate-500">
              <History className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold text-slate-400">Initial Version Created</p>
              <p className="text-[10px] text-slate-500">
                Created on {new Date(plan.createdAt || Date.now()).toLocaleString()} by {plan.createdBy || 'dentist-001'}
              </p>
            </div>
          ) : (
            plan.auditLog.map((log, index) => (
              <div 
                key={log.id || index}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      log.action === 'create' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : log.action === 'status_change'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : log.action === 'delete'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[11px] font-bold text-white">
                      {log.notes || `Plan event: ${log.action}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {new Date(log.performedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/50">
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-cyan-400" />
                    Performed by: <strong className="text-slate-300">{log.performedBy}</strong>
                  </span>
                  <span>{new Date(log.performedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

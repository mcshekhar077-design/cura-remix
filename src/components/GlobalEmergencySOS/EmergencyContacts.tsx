import React, { useState, useCallback } from "react";
import {
  User,
  Phone,
  Plus,
  X,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  MessageCircle
} from "lucide-react";

export interface EmergencyContactItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relation: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  isVerified?: boolean;
  notificationsEnabled?: boolean;
  lastNotified?: string;
}

export interface EmergencyContactsProps {
  contacts: EmergencyContactItem[];
  onAddContact: (contact: Omit<EmergencyContactItem, 'id'>) => void;
  onUpdateContact: (id: string, contact: Partial<EmergencyContactItem>) => void;
  onDeleteContact: (id: string) => void;
  onTestContact: (id: string) => void;
  onNotifyAll: () => void;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onTestContact,
  onNotifyAll
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relation: 'Spouse',
    priority: 'primary' as const,
    notificationsEnabled: true
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Name and phone are required');
      return;
    }

    setIsLoading(true);

    if (editingId) {
      onUpdateContact(editingId, formData);
    } else {
      onAddContact(formData);
    }

    setIsLoading(false);
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      relation: 'Spouse',
      priority: 'primary',
      notificationsEnabled: true
    });
  }, [formData, editingId, onAddContact, onUpdateContact]);

  const handleEdit = useCallback((contact: EmergencyContactItem) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      relation: contact.relation,
      priority: contact.priority,
      notificationsEnabled: contact.notificationsEnabled ?? true
    });
    setShowAddForm(true);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'primary': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'secondary': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'tertiary': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'primary': return 'Primary Caregiver';
      case 'secondary': return 'Secondary';
      case 'tertiary': return 'Tertiary';
      default: return priority;
    }
  };

  return (
    <div id="emergency-contacts-manager" className="space-y-3.5 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-emerald-400" />
            Emergency Contacts
          </h4>
          <p className="text-[11px] text-slate-400">
            {contacts.length} designated responders on call
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            id="btn-notify-all-contacts"
            type="button"
            onClick={() => {
              onNotifyAll();
              setFeedbackMsg("SMS alerts dispatched to all emergency contacts!");
              setTimeout(() => setFeedbackMsg(null), 3000);
            }}
            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <MessageCircle className="h-3 w-3" />
            Notify All
          </button>
          <button
            id="btn-add-contact-toggle"
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
            }}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Contact
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h5 className="text-[11px] font-bold text-white">
              {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h5>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setError(null);
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-400 text-[11px] bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-contact-name">
                Full Name *
              </label>
              <input
                id="input-contact-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Priya Kumar"
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-contact-phone">
                Phone Number *
              </label>
              <input
                id="input-contact-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-contact-rel">
                Relation
              </label>
              <select
                id="input-contact-rel"
                value={formData.relation}
                onChange={(e) => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                {['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Neighbor', 'Caregiver', 'Other'].map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="input-contact-pri">
                Priority
              </label>
              <select
                id="input-contact-pri"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="tertiary">Tertiary</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              id="btn-save-contact-submit"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {editingId ? 'Update Contact' : 'Save Contact'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setError(null);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
        {contacts.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 border border-slate-800 rounded-xl">
            <User className="h-6 w-6 mx-auto text-slate-600 mb-1" />
            No emergency contacts configured
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-2.5 bg-slate-950/60 rounded-xl border transition-all ${
                contact.priority === 'primary'
                  ? 'border-emerald-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white truncate">
                      {contact.name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getPriorityColor(contact.priority)}`}>
                      {getPriorityLabel(contact.priority)}
                    </span>
                    {contact.isVerified && (
                      <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono">{contact.phone}</span>
                    <span className="text-slate-700">•</span>
                    <span>{contact.relation}</span>
                  </div>
                  {contact.lastNotified && (
                    <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      Notified: {new Date(contact.lastNotified).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onTestContact(contact.id);
                      setFeedbackMsg(`Verification ping sent to ${contact.name}!`);
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all cursor-pointer"
                    title="Test contact alert"
                  >
                    <Shield className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(contact)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                    title="Edit contact"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteContact(contact.id);
                    }}
                    className="p-1 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                    title="Remove contact"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Phone className="h-2.5 w-2.5" />
                  Call Contact
                </a>
                <a
                  href={`sms:${contact.phone}?body=EMERGENCY%20SOS%20from%20CURA%20Health.%20Please%20check%20on%20me%20immediately.`}
                  className="flex-1 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="h-2.5 w-2.5" />
                  SMS Location
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

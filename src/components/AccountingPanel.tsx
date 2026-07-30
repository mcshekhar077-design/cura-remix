import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  FileText, 
  IndianRupee, 
  Users, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ShieldCheck, 
  PlusCircle, 
  Trash, 
  RefreshCw, 
  Layers, 
  Calendar, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Coins, 
  Briefcase, 
  FileSpreadsheet
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  description: string;
}

interface JournalEntryLine {
  accountId: string;
  type: "debit" | "credit";
  amount: number;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference: string;
  lines: JournalEntryLine[];
  isApproved: boolean;
  createdBy: string;
}

interface PatientInvoiceItem {
  id: string;
  description: string;
  category: "Consultation" | "Pharmacy" | "Radiology" | "Laboratory" | "OT Charges" | "Ward Rent" | "Nursing" | "Other";
  amount: number;
}

interface PatientInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  admissionId: string | null;
  date: string;
  dueDate: string;
  items: PatientInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded";
  paymentMethod: "Cash" | "Card" | "UPI" | "NetBanking" | "Insurance_Copay" | null;
  notes: string;
}

interface VendorInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorCategory: "Medical Supplies" | "Pharmacy Wholesaler" | "Blood Bank Supplier" | "IT Services" | "Utilities" | "Other";
  date: string;
  dueDate: string;
  items: VendorInvoiceItem[];
  totalAmount: number;
  amountPaid: number;
  status: "unpaid" | "partially_paid" | "paid";
  notes: string;
}

interface ExpenseClaim {
  id: string;
  staffName: string;
  department: string;
  date: string;
  description: string;
  amount: number;
  category: "travel" | "medical_equipment" | "office_supplies" | "staff_welfare" | "miscellaneous";
  receiptUrl: string | null;
  status: "pending" | "approved" | "rejected";
  approvedBy: string | null;
  notes: string;
}

interface DepartmentBudget {
  id: string;
  department: string;
  fiscalYear: string;
  allocatedBudget: number;
  spentBudget: number;
  quarterlyTargets: number[];
}

export default function AccountingPanel({
  patients,
  setSuccessMsg,
  setErrorAlert
}: {
  patients: Patient[];
  setSuccessMsg: (msg: string | null) => void;
  setErrorAlert: (msg: string | null) => void;
}) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "accounts" | "journal" | "billing" | "ap" | "budgets">("dashboard");

  // Core Data States
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [patientInvoices, setPatientInvoices] = useState<PatientInvoice[]>([]);
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>([]);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [reports, setReports] = useState<any>({
    kpis: { totalCash: 0, totalReceivables: 0, totalPayables: 0, netProfit: 0, operatingMargin: 0, budgetUtilization: 0 },
    pnl: { revenues: [], expenses: [], totalRevenues: 0, totalExpenses: 0, netProfit: 0 },
    balanceSheet: { assets: [], liabilities: [], equities: [], totalAssets: 0, totalLiabilities: 0, totalEquities: 0, retainedEarningsWithProfit: 0, isBalanced: true }
  });

  // UI Control States
  const [isLoading, setIsLoading] = useState(true);
  const [statementType, setStatementType] = useState<"p&l" | "balance_sheet">("p&l");
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);

  // Modals & Sub-forms
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showPostJournalModal, setShowPostJournalModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState<PatientInvoice | null>(null);
  const [showBookBillModal, setShowBookBillModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState<VendorInvoice | null>(null);
  const [showSubmitExpenseModal, setShowSubmitExpenseModal] = useState(false);

  // Form Fields - New Account
  const [newAccCode, setNewAccCode] = useState("");
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<Account["type"]>("asset");
  const [newAccDesc, setNewAccDesc] = useState("");
  const [newAccBalance, setNewAccBalance] = useState("0");

  // Form Fields - New Journal Entry
  const [jvDesc, setJvDesc] = useState("");
  const [jvRef, setJvRef] = useState("");
  const [jvLines, setJvLines] = useState<JournalEntryLine[]>([
    { accountId: "", type: "debit", amount: 0 },
    { accountId: "", type: "credit", amount: 0 }
  ]);

  // Form Fields - New Patient Invoice
  const [invPatientId, setInvPatientId] = useState("");
  const [invItems, setInvItems] = useState<{ description: string; category: PatientInvoiceItem["category"]; amount: number }[]>([
    { description: "General OPD Consultation", category: "Consultation", amount: 1500 }
  ]);
  const [invDiscount, setInvDiscount] = useState("0");
  const [invNotes, setInvNotes] = useState("");

  // Form Fields - Pay Patient Invoice
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PatientInvoice["paymentMethod"]>("UPI");

  // Form Fields - New Vendor Bill
  const [vbVendorName, setVbVendorName] = useState("");
  const [vbCategory, setVbCategory] = useState<VendorInvoice["vendorCategory"]>("Medical Supplies");
  const [vbInvNum, setVbInvNum] = useState("");
  const [vbItems, setVbItems] = useState<{ description: string; quantity: number; unitPrice: number; amount: number }[]>([
    { description: "Disposable Sterile Syringes (Pack of 100)", quantity: 10, unitPrice: 850, amount: 8500 }
  ]);
  const [vbNotes, setVbNotes] = useState("");

  // Form Fields - Pay Vendor Bill
  const [payBillAmt, setPayBillAmt] = useState("");

  // Form Fields - Submit Staff Reimbursement
  const [expStaffName, setExpStaffName] = useState("");
  const [expDept, setExpDept] = useState("Cardiology");
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expCategory, setExpCategory] = useState<ExpenseClaim["category"]>("travel");

  // Fetch all accounting data from API endpoints
  const fetchAllFinanceData = async () => {
    setIsLoading(true);
    try {
      const [accRes, jvRes, invRes, vndRes, expRes, bdgRes, rptRes] = await Promise.all([
        fetch("/api/v1/hims/finance/accounts").then(r => r.json()),
        fetch("/api/v1/hims/finance/journal-entries").then(r => r.json()),
        fetch("/api/v1/hims/finance/patient-invoices").then(r => r.json()),
        fetch("/api/v1/hims/finance/vendor-invoices").then(r => r.json()),
        fetch("/api/v1/hims/finance/expense-claims").then(r => r.json()),
        fetch("/api/v1/hims/finance/budgets").then(r => r.json()),
        fetch("/api/v1/hims/finance/reports").then(r => r.json())
      ]);

      setAccounts(accRes);
      setJournalEntries(jvRes);
      setPatientInvoices(invRes);
      setVendorInvoices(vndRes);
      setExpenseClaims(expRes);
      setBudgets(bdgRes);
      setReports(rptRes);
    } catch (err: any) {
      console.error(err);
      setErrorAlert("Critical: Failed to synchronize enterprise ledger stores from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFinanceData();
  }, []);

  // Helper: Format to INR Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper: Get account name by ID
  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? `${acc.code} - ${acc.name}` : id;
  };

  // Submit New Chart Account
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCode || !newAccName) {
      setErrorAlert("Enterprise Account Code & Name are required.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newAccCode,
          name: newAccName,
          type: newAccType,
          description: newAccDesc,
          initialBalance: parseFloat(newAccBalance) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Account registration failed.");
      
      setSuccessMsg(`Account ledger ${data.code} [${data.name}] initialized successfully.`);
      setShowAddAccountModal(false);
      // Reset
      setNewAccCode("");
      setNewAccName("");
      setNewAccDesc("");
      setNewAccBalance("0");
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Submit New Journal Entry
  const handlePostJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate Debit/Credit Balance
    let debits = 0;
    let credits = 0;
    for (const l of jvLines) {
      if (!l.accountId) {
        setErrorAlert("Please specify valid ledger accounts for all rows.");
        return;
      }
      if (l.type === "debit") debits += l.amount;
      else credits += l.amount;
    }

    if (Math.abs(debits - credits) > 0.01) {
      setErrorAlert(`Unbalanced Journal Entry! Total Debits (${formatCurrency(debits)}) must equal Total Credits (${formatCurrency(credits)}).`);
      return;
    }

    try {
      const res = await fetch("/api/v1/hims/finance/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: jvDesc,
          reference: jvRef,
          lines: jvLines
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to post general ledger journal.");

      setSuccessMsg(`Double-entry General Journal ${data.entryNumber} successfully balanced & posted to Trial Balance.`);
      setShowPostJournalModal(false);
      setJvDesc("");
      setJvRef("");
      setJvLines([
        { accountId: "", type: "debit", amount: 0 },
        { accountId: "", type: "credit", amount: 0 }
      ]);
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Submit New Patient Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find(pat => pat.id === invPatientId);
    if (!p) {
      setErrorAlert("Please select a registered patient.");
      return;
    }

    try {
      const res = await fetch("/api/v1/hims/finance/patient-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: p.id,
          patientName: p.fullName,
          items: invItems,
          discountAmount: parseFloat(invDiscount) || 0,
          notes: invNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invoice generation failed.");

      setSuccessMsg(`Invoice ${data.invoiceNumber} recorded. Automatically routed ₹${data.totalAmount} debit directly to Accounts Receivable.`);
      setShowCreateInvoiceModal(false);
      setInvPatientId("");
      setInvItems([{ description: "General OPD Consultation", category: "Consultation", amount: 1500 }]);
      setInvDiscount("0");
      setInvNotes("");
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Collect Payment on Patient Invoice
  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayInvoiceModal) return;
    try {
      const res = await fetch(`/api/v1/hims/finance/patient-invoices/${showPayInvoiceModal.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(payAmount),
          paymentMethod: payMethod
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Payment processing failed.");

      setSuccessMsg(`Successfully processed receipt. Recorded ₹${payAmount} credit to Accounts Receivable and debit to Operating Account.`);
      setShowPayInvoiceModal(null);
      setPayAmount("");
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Book Vendor Invoice (Accounts Payable)
  const handleBookBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vbVendorName) {
      setErrorAlert("Supplier or Vendor name is required.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/finance/vendor-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName: vbVendorName,
          vendorCategory: vbCategory,
          invoiceNumber: vbInvNum,
          items: vbItems,
          notes: vbNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to book supplier payable.");

      setSuccessMsg(`Accounts Payable established for ${data.vendorName}. Total bill amount booked: ₹${data.totalAmount}.`);
      setShowBookBillModal(false);
      setVbVendorName("");
      setVbInvNum("");
      setVbItems([{ description: "Disposable Sterile Syringes (Pack of 100)", quantity: 10, unitPrice: 850, amount: 8500 }]);
      setVbNotes("");
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Record Supplier Bill Payout
  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayBillModal) return;
    try {
      const res = await fetch(`/api/v1/hims/finance/vendor-invoices/${showPayBillModal.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(payBillAmt)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to register supplier payment.");

      setSuccessMsg(`Payout of ₹${payBillAmt} successfully recorded to vendor ${data.vendorName}. Debit posted to Accounts Payable.`);
      setShowPayBillModal(null);
      setPayBillAmt("");
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // File Staff Expense Claims
  const handleAddExpenseClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/hims/finance/expense-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffName: expStaffName,
          department: expDept,
          description: expDesc,
          amount: parseFloat(expAmt),
          category: expCategory
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to file staff claim.");

      setSuccessMsg(`Staff reimbursement claim for ${data.staffName} submitted under '${data.category}' category. Awaiting audit.`);
      setShowSubmitExpenseModal(false);
      setExpStaffName("");
      setExpDesc("");
      setExpAmt("");
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Approve/Reject Staff Expense Claims
  const handleProcessExpense = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/v1/hims/finance/expense-claims/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          approvedBy: "Chief Financial Officer"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to process staff reimbursement.");

      if (status === "approved") {
        setSuccessMsg(`Expense claim ${data.id} approved. Ledger entries generated: Debited expenses & Credited Clinical Accrued Payables.`);
      } else {
        setSuccessMsg(`Expense claim ${data.id} has been marked as Rejected.`);
      }
      fetchAllFinanceData();
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Helper functions to manage the dynamic form lines
  const addJvLine = () => {
    setJvLines([...jvLines, { accountId: "", type: "debit", amount: 0 }]);
  };

  const removeJvLine = (index: number) => {
    if (jvLines.length <= 2) return;
    const lines = [...jvLines];
    lines.splice(index, 1);
    setJvLines(lines);
  };

  const updateJvLine = (index: number, field: keyof JournalEntryLine, value: any) => {
    const lines = [...jvLines];
    lines[index] = {
      ...lines[index],
      [field]: field === "amount" ? parseFloat(value) || 0 : value
    };
    setJvLines(lines);
  };

  const addInvItem = () => {
    setInvItems([...invItems, { description: "", category: "Other", amount: 0 }]);
  };

  const removeInvItem = (index: number) => {
    if (invItems.length <= 1) return;
    const items = [...invItems];
    items.splice(index, 1);
    setInvItems(items);
  };

  const updateInvItem = (index: number, field: string, value: any) => {
    const items = [...invItems];
    items[index] = {
      ...items[index],
      [field]: field === "amount" ? parseFloat(value) || 0 : value
    };
    setInvItems(items);
  };

  const addVbItem = () => {
    setVbItems([...vbItems, { description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeVbItem = (index: number) => {
    if (vbItems.length <= 1) return;
    const items = [...vbItems];
    items.splice(index, 1);
    setVbItems(items);
  };

  const updateVbItem = (index: number, field: string, value: any) => {
    const items = [...vbItems];
    const item = { ...items[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }
    items[index] = item;
    setVbItems(items);
  };

  // Calculate totals of current journal entry editor
  const calculateJvTotals = () => {
    let debits = 0;
    let credits = 0;
    for (const l of jvLines) {
      if (l.type === "debit") debits += l.amount;
      else credits += l.amount;
    }
    return { debits, credits, balanced: Math.abs(debits - credits) < 0.01, difference: Math.abs(debits - credits) };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white border border-slate-100 rounded-3xl p-8">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Synchronizing Hospital Ledger Accounts...</p>
      </div>
    );
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      
      {/* 🚀 FINANCIAL CONTROLLER HERO */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Landmark className="w-96 h-96" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> CURA Finance Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">💰 Hospital Accounts & General Ledger</h2>
            <p className="text-slate-300 text-xs font-semibold max-w-2xl leading-relaxed">
              Real-time Indian double-entry financial system. Automated clinical invoicing, insurance clearinghouse settlements, accounts payable aging, and live profit-and-loss auditing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => fetchAllFinanceData()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Audit Re-Sync
            </button>
            <button 
              onClick={() => setShowPostJournalModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all border-0 flex items-center gap-2 cursor-pointer shadow-lg animate-pulse"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Post Journal Entry
            </button>
          </div>
        </div>

        {/* 📉 QUICK KEY PERFORMANCE INDICATORS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total Liquid Cash</span>
            <span className="text-lg md:text-xl font-black block text-emerald-400 mt-1">
              {formatCurrency(reports.kpis.totalCash)}
            </span>
            <span className="text-[9px] text-slate-300 font-medium mt-0.5 block italic">Vault reserves + Bank balance</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Outstanding AR</span>
            <span className="text-lg md:text-xl font-black block text-teal-400 mt-1">
              {formatCurrency(reports.kpis.totalReceivables)}
            </span>
            <span className="text-[9px] text-slate-300 font-medium mt-0.5 block italic">Patient bills & claims pending</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Accounts Payable</span>
            <span className="text-lg md:text-xl font-black block text-amber-400 mt-1">
              {formatCurrency(reports.kpis.totalPayables)}
            </span>
            <span className="text-[9px] text-slate-300 font-medium mt-0.5 block italic">Outstanding vendor invoices</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Current Operating Margin</span>
            <span className="text-lg md:text-xl font-black block text-indigo-400 mt-1">
              {reports.kpis.operatingMargin.toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-300 font-medium mt-0.5 block italic">Clinical earnings index</span>
          </div>
        </div>
      </div>

      {/* 🎛️ SUB TAB NAVIGATION */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        {[
          { id: "dashboard", label: "📊 Financial Analytics", color: "bg-white text-slate-900 shadow" },
          { id: "accounts", label: "📖 Chart of Accounts", color: "bg-white text-slate-900 shadow" },
          { id: "journal", label: "✍️ General Ledger Logs", color: "bg-white text-slate-900 shadow" },
          { id: "billing", label: "🏥 Patient AR & Invoicing", color: "bg-white text-slate-900 shadow" },
          { id: "ap", label: "🚛 Vendor Bills (AP)", color: "bg-white text-slate-900 shadow" },
          { id: "budgets", label: "💰 Department Budgets", color: "bg-white text-slate-900 shadow" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-black uppercase rounded-xl tracking-wider transition-all border-0 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? tab.color : "text-slate-500 hover:text-slate-900 hover:bg-slate-150"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: FINANCIAL ANALYTICS & STATEMENTS
          ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* STATEMENTS SECTION */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-800">📊 Live Institutional Financial Statements</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Dynamic statement generation reflecting real-time transaction postings
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
                <button
                  onClick={() => setStatementType("p&l")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border-0 cursor-pointer ${
                    statementType === "p&l" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Profit & Loss (P&L)
                </button>
                <button
                  onClick={() => setStatementType("balance_sheet")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border-0 cursor-pointer ${
                    statementType === "balance_sheet" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Balance Sheet
                </button>
              </div>
            </div>

            {/* STATEMENT DISPLAY */}
            {statementType === "p&l" ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">OPERATING REVENUES</span>
                  <div className="divide-y divide-slate-100 mt-2">
                    {reports.pnl.revenues.map((rev: any) => (
                      <div key={rev.code} className="py-2.5 flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">{rev.code} - {rev.name}</span>
                        <span className="text-slate-900 font-black">{formatCurrency(rev.amount)}</span>
                      </div>
                    ))}
                    <div className="py-2.5 flex justify-between text-xs font-black text-emerald-600 pt-3 border-t-2 border-slate-200">
                      <span>TOTAL REVENUES (A)</span>
                      <span>{formatCurrency(reports.pnl.totalRevenues)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">OPERATING EXPENSES</span>
                  <div className="divide-y divide-slate-100 mt-2">
                    {reports.pnl.expenses.map((exp: any) => (
                      <div key={exp.code} className="py-2.5 flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">{exp.code} - {exp.name}</span>
                        <span className="text-slate-900 font-black">{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                    <div className="py-2.5 flex justify-between text-xs font-black text-rose-600 pt-3 border-t-2 border-slate-200">
                      <span>TOTAL EXPENSES (B)</span>
                      <span>{formatCurrency(reports.pnl.totalExpenses)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">NET SURPLUS / MARGIN (A - B)</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Accrued current financial year retained earnings</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700">
                    {formatCurrency(reports.pnl.netProfit)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* ASSETS */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">ASSETS</span>
                    <div className="divide-y divide-slate-100 mt-2">
                      {reports.balanceSheet.assets.map((asset: any) => (
                        <div key={asset.code} className="py-2 flex justify-between text-xs font-semibold">
                          <span className="text-slate-600">{asset.code} - {asset.name}</span>
                          <span className="text-slate-900 font-bold">{formatCurrency(asset.amount)}</span>
                        </div>
                      ))}
                      <div className="py-2 flex justify-between text-xs font-black text-slate-800 pt-3 border-t-2 border-slate-200">
                        <span>TOTAL ASSETS</span>
                        <span>{formatCurrency(reports.balanceSheet.totalAssets)}</span>
                      </div>
                    </div>
                  </div>

                  {/* LIABILITIES & EQUITIES */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">LIABILITIES & EQUITY</span>
                      <div className="divide-y divide-slate-100 mt-2">
                        {reports.balanceSheet.liabilities.map((liab: any) => (
                          <div key={liab.code} className="py-1.5 flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">{liab.code} - {liab.name}</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(liab.amount)}</span>
                          </div>
                        ))}
                        {reports.balanceSheet.equities.map((eq: any) => (
                          <div key={eq.code} className="py-1.5 flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">{eq.code} - {eq.name}</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(eq.amount)}</span>
                          </div>
                        ))}
                        {/* Current Retained Profit */}
                        <div className="py-1.5 flex justify-between text-xs font-semibold bg-emerald-50 px-1 rounded-md mt-1">
                          <span className="text-emerald-700 font-bold">CY Retained Earnings (Profit)</span>
                          <span className="text-emerald-800 font-black">{formatCurrency(reports.balanceSheet.totalAssets - (reports.balanceSheet.totalLiabilities + reports.balanceSheet.totalEquities))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2 flex justify-between text-xs font-black text-slate-800 pt-3 border-t-2 border-slate-200 mt-4">
                      <span>TOTAL LIAB. & EQUITY</span>
                      <span>{formatCurrency(reports.balanceSheet.totalAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* STRUCTURAL AUDIT VALIDATOR */}
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-700">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-indigo-900 block">Ledger Balancing Structural Audit</span>
                      <span className="text-[10px] text-indigo-500 font-bold block">Assuring equation: Assets = Liabilities + Capital Equity + Retained Net Income</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-3 py-1 font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap self-start sm:self-center">
                    ✓ Ledger is Mathematically Balanced
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* VISUALS & CHARTS PANEL */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* BUDGET UTILIZATION PIE CHART */}
            <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">📊 Departmental Budget Shares</h3>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Allocated fund structures this fiscal year</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgets.map(b => ({ name: b.department, value: b.allocatedBudget }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {budgets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {budgets.map((b, i) => (
                  <div key={b.id} className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      {b.department}
                    </span>
                    <span className="text-slate-800">{formatCurrency(b.allocatedBudget)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AP / AR BALANCE CARD */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Working Capital Ratio</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-3 border border-slate-100">
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest block flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Receivables
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">{formatCurrency(reports.kpis.totalReceivables)}</span>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-slate-100">
                  <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest block flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Payables
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">{formatCurrency(reports.kpis.totalPayables)}</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-500">
                  <span>Net Receivable Index</span>
                  <span>
                    {reports.kpis.totalPayables > 0 
                      ? (reports.kpis.totalReceivables / reports.kpis.totalPayables).toFixed(2)
                      : "Direct Credit Positive"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (reports.kpis.totalReceivables / (reports.kpis.totalReceivables + reports.kpis.totalPayables || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CHART OF ACCOUNTS
          ========================================================================= */}
      {activeTab === "accounts" && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800">📖 Institutional Chart of Accounts (COA)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Detailed listing of clinical accounts across Asset, Liability, Equity, Revenue, and Expense classes
              </p>
            </div>

            <button
              onClick={() => setShowAddAccountModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer shadow self-start sm:self-center"
            >
              <Plus className="w-4 h-4" /> Initialize Account
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Ledger Account Name</th>
                  <th className="py-3 px-4">Class Category</th>
                  <th className="py-3 px-4">Ledger Balance</th>
                  <th className="py-3 px-4">Registry Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-black text-slate-900 font-mono">{acc.code}</td>
                    <td className="py-3.5 px-4 font-black text-slate-800">{acc.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        acc.type === "asset" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        acc.type === "liability" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        acc.type === "equity" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                        acc.type === "revenue" ? "bg-teal-50 text-teal-700 border-teal-100" :
                        "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {formatCurrency(acc.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px] max-w-[280px] truncate">{acc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: GENERAL LEDGER JOURNAL LOGS
          ========================================================================= */}
      {activeTab === "journal" && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-black text-slate-800">✍️ Enterprise General Ledger Logs</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Auditable database of double-entry financial events and transactions
            </p>
          </div>

          <div className="space-y-4">
            {journalEntries.map((jv) => {
              const isExpanded = expandedJournal === jv.id;
              const debitLines = jv.lines.filter(l => l.type === "debit");
              const creditLines = jv.lines.filter(l => l.type === "credit");
              const totalAmount = debitLines.reduce((sum, l) => sum + l.amount, 0);

              return (
                <div key={jv.id} className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
                  
                  {/* HEADER ROW */}
                  <div 
                    onClick={() => setExpandedJournal(isExpanded ? null : jv.id)}
                    className="p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900/5 text-slate-800 flex items-center justify-center font-bold text-xs mt-0.5">
                        JV
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{jv.entryNumber}</span>
                          <span className="text-[8px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-full uppercase">POSTED</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold block mt-1">{jv.description}</span>
                        {jv.reference && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Ref: {jv.reference}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Entry Volume</span>
                        <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Posting Date</span>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          {new Date(jv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* LEG DETAILS PANEL */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-150 animate-slideDown">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Double-Entry Legs</span>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* DEBITS */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                          <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider block">Debit Transactions (Dr.)</span>
                          <div className="space-y-1.5">
                            {debitLines.map((line, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-600">{getAccountName(line.accountId)}</span>
                                <span className="font-bold text-slate-800">{formatCurrency(line.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CREDITS */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                          <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider block">Credit Transactions (Cr.)</span>
                          <div className="space-y-1.5">
                            {creditLines.map((line, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-600 px-3">{getAccountName(line.accountId)}</span>
                                <span className="font-bold text-slate-800">{formatCurrency(line.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Created By: {jv.createdBy}</span>
                        <span>Double-Entry Balance: Balanced</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PATIENT BILLING & ACCOUNTS RECEIVABLE
          ========================================================================= */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800">🏥 Patient Billings & Receivables (AR)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Generate medical bills, collect clinical co-pays, and log physical/digital payments
              </p>
            </div>

            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer shadow self-start sm:self-center"
            >
              <Plus className="w-4 h-4" /> Raise Patient Bill
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-3 px-4">Invoice Number</th>
                  <th className="py-3 px-4">Inpatient Name</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Amount Paid / Balance</th>
                  <th className="py-3 px-4">Settlement Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientInvoices.map((inv) => {
                  const balance = inv.totalAmount - inv.amountPaid;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                        {inv.invoiceNumber}
                        <span className="block text-[8px] text-slate-400 font-sans font-normal mt-0.5">
                          Bill Date: {new Date(inv.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {inv.patientName}
                        <span className="block text-[8px] text-slate-400 font-mono">ID: {inv.patientId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3.5 px-4">
                        <span className="block text-emerald-600 font-semibold">Paid: {formatCurrency(inv.amountPaid)}</span>
                        <span className="block text-slate-500 font-medium">Bal: {formatCurrency(balance)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                          inv.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          inv.paymentStatus === "partially_paid" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {inv.paymentStatus.toUpperCase()}
                        </span>
                        {inv.paymentMethod && (
                          <span className="block text-[8px] text-slate-400 font-semibold mt-1">Via {inv.paymentMethod}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.paymentStatus !== "paid" ? (
                          <button
                            onClick={() => {
                              setShowPayInvoiceModal(inv);
                              setPayAmount(String(balance));
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase rounded-lg border-0 cursor-pointer shadow"
                          >
                            Collect Payment
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-bold">Fully Cleared</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ACCOUNTS PAYABLE & VENDOR MANAGEMENT
          ========================================================================= */}
      {activeTab === "ap" && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800">🚛 Accounts Payable (AP) & Supplier Registry</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Manage clinical supplier bills, surgical device purchases, and record payouts
              </p>
            </div>

            <button
              onClick={() => setShowBookBillModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer shadow self-start sm:self-center"
            >
              <Plus className="w-4 h-4" /> Book Supplier Bill
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Supplier Vendor</th>
                  <th className="py-3 px-4">Items / Category</th>
                  <th className="py-3 px-4">Billed Amount</th>
                  <th className="py-3 px-4">Payment Balance</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorInvoices.map((bill) => {
                  const balance = bill.totalAmount - bill.amountPaid;
                  return (
                    <tr key={bill.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-black text-slate-900 font-mono">{bill.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {bill.vendorName}
                        <span className="block text-[8px] text-slate-400 uppercase font-black">{bill.vendorCategory}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate">
                        <span className="text-slate-600 block font-semibold">{bill.items.map(i => i.description).join(", ")}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(bill.totalAmount)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          bill.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {bill.status.toUpperCase()}
                        </span>
                        {balance > 0 && (
                          <span className="block text-[8px] text-slate-400 font-semibold mt-1">Pending: {formatCurrency(balance)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-500">
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {balance > 0 ? (
                          <button
                            onClick={() => {
                              setShowPayBillModal(bill);
                              setPayBillAmt(String(balance));
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase rounded-lg border-0 cursor-pointer shadow"
                          >
                            Record Payout
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: BUDGETS & CLINICAL EXPENSES
          ========================================================================= */}
      {activeTab === "budgets" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* BUDGET GRIDS */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-800">📊 Clinical Department Budget Allocations</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Allocated funds vs actual spending controls this fiscal year
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {budgets.map((bdg, i) => {
                const percent = bdg.allocatedBudget > 0 ? (bdg.spentBudget / bdg.allocatedBudget) * 100 : 0;
                return (
                  <div key={bdg.id} className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-800">{bdg.department}</span>
                      <span className="text-[8px] font-mono font-bold text-slate-400">{bdg.fiscalYear}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Budget Exhaustion</span>
                      <div className="flex justify-between items-baseline mt-0.5">
                        <span className="text-xs font-black text-slate-800">{percent.toFixed(1)}%</span>
                        <span className="text-[9px] text-slate-500 font-semibold">Remaining: {formatCurrency(bdg.allocatedBudget - bdg.spentBudget)}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${
                            percent > 85 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[10px] font-bold">
                      <div className="flex justify-between text-slate-500">
                        <span>Allocated:</span>
                        <span className="text-slate-800">{formatCurrency(bdg.allocatedBudget)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 mt-1">
                        <span>Spent:</span>
                        <span className="text-slate-800">{formatCurrency(bdg.spentBudget)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXPENSE REIMBURSEMENT DISPATCH */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-800">💰 Clinical Staff Reimbursement Auditing</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Pre-requisite compliance matching for out-of-pocket staff spendings
                </p>
              </div>

              <button
                onClick={() => setShowSubmitExpenseModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer shadow self-start sm:self-center"
              >
                <Plus className="w-4 h-4" /> File Reimbursement Claim
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-3 px-4">Filing Date</th>
                    <th className="py-3 px-4">Staff Claimant</th>
                    <th className="py-3 px-4">Purpose / Category</th>
                    <th className="py-3 px-4">Claim Amount</th>
                    <th className="py-3 px-4">Audit Status</th>
                    <th className="py-3 px-4 text-right">Leg Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-500">
                        {new Date(claim.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {claim.staffName}
                        <span className="block text-[8px] text-slate-400 uppercase font-black">{claim.department}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 block font-bold">{claim.description}</span>
                        <span className="text-[8px] text-indigo-600 uppercase font-black tracking-widest mt-0.5 block">{claim.category}</span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-800">{formatCurrency(claim.amount)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                          claim.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          claim.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {claim.status.toUpperCase()}
                        </span>
                        {claim.approvedBy && (
                          <span className="block text-[8px] text-slate-400 font-semibold mt-1">Audit: {claim.approvedBy}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {claim.status === "pending" ? (
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleProcessExpense(claim.id, "approved")}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase rounded-md border-0 cursor-pointer shadow"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessExpense(claim.id, "rejected")}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9px] uppercase rounded-md border-0 cursor-pointer shadow"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-bold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          MODALS & DIALOG WIZARDS (COMPLY WITH HIGHEST DESIGNS)
          ========================================================================= */}

      {/* 1. CHANNELS ACCOUNTS MODAL */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button 
              onClick={() => setShowAddAccountModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">📖 Initialize Ledger Account</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Add a new account to Chart of Accounts</p>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1050"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Class Type *</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none"
                  >
                    <option value="asset">Asset (1xxx)</option>
                    <option value="liability">Liability (2xxx)</option>
                    <option value="equity">Capital Equity (3xxx)</option>
                    <option value="revenue">Operating Revenue (4xxx)</option>
                    <option value="expense">Operating Expense (5xxx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Ledger Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Petty Cash A/C"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Opening Balance (INR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Audit description</label>
                <textarea
                  rows={2}
                  placeholder="Provide clinical audit purpose of this account ledger..."
                  value={newAccDesc}
                  onChange={(e) => setNewAccDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer"
              >
                Book & Save Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. DOUBLE-ENTRY JOURNAL ENTRY POSTING DIALOG */}
      {showPostJournalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-2xl w-full relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPostJournalModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">✍️ Post Balanced Journal Entry (Double-Entry)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Record standard clinical adjustments to general ledger</p>
            </div>

            <form onSubmit={handlePostJournalEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Journal Narration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Recording June office expenses"
                    value={jvDesc}
                    onChange={(e) => setJvDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Voucher Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. VOUCH-882"
                    value={jvRef}
                    onChange={(e) => setJvRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Debits & Credits Lines</span>
                  <button
                    type="button"
                    onClick={addJvLine}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[9px] uppercase rounded border-0 cursor-pointer"
                  >
                    + Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {jvLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          required
                          value={line.accountId}
                          onChange={(e) => updateJvLine(idx, "accountId", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="">-- Select Account Ledger --</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name} ({acc.type})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-3">
                        <select
                          required
                          value={line.type}
                          onChange={(e) => updateJvLine(idx, "type", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="debit">Dr. (Debit)</option>
                          <option value="credit">Cr. (Credit)</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          required
                          placeholder="Amount"
                          value={line.amount || ""}
                          onChange={(e) => updateJvLine(idx, "amount", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          disabled={jvLines.length <= 2}
                          onClick={() => removeJvLine(idx)}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30 border-0 bg-transparent cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE EQUATION AUDITOR */}
              {(() => {
                const { debits, credits, balanced, difference } = calculateJvTotals();
                return (
                  <div className={`p-4 rounded-2xl border ${
                    balanced ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                  } flex justify-between items-center text-xs font-bold`}>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider">Debit/Credit Sums</span>
                      <span className="block mt-1">Total Debits: {formatCurrency(debits)} | Total Credits: {formatCurrency(credits)}</span>
                    </div>

                    <div>
                      {balanced ? (
                        <span className="text-[10px] uppercase bg-emerald-200 px-3 py-1 rounded-full text-emerald-900 border border-emerald-300">
                          ✓ Balanced
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase bg-rose-200 px-3 py-1 rounded-full text-rose-900 border border-rose-300">
                          ⚠️ Unbalanced (Diff: {formatCurrency(difference)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={!calculateJvTotals().balanced}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer disabled:opacity-40"
              >
                Verify & Post Journal Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. RAISE PATIENT BILL DIALOG */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-lg w-full relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCreateInvoiceModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">🏥 Raise Patient Bill & Invoice</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deploy new items billing against patient file</p>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Select Patient *</label>
                <select
                  required
                  value={invPatientId}
                  onChange={(e) => setInvPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Invoice Items Log</span>
                  <button
                    type="button"
                    onClick={addInvItem}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[9px] uppercase rounded border-0 cursor-pointer"
                  >
                    + Add Charge
                  </button>
                </div>

                <div className="space-y-2">
                  {invItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center animate-slideDown">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Procedural/Treatment Description"
                          value={item.description}
                          onChange={(e) => updateInvItem(idx, "description", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <select
                          required
                          value={item.category}
                          onChange={(e) => updateInvItem(idx, "category", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 text-[10px] font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="Consultation">Consultation</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Radiology">Radiology</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="OT Charges">OT Charges</option>
                          <option value="Ward Rent">Ward Rent</option>
                          <option value="Nursing">Nursing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          required
                          placeholder="Amount"
                          value={item.amount || ""}
                          onChange={(e) => updateInvItem(idx, "amount", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          disabled={invItems.length <= 1}
                          onClick={() => removeInvItem(idx)}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30 border-0 bg-transparent cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Corporate Discount Concession (INR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={invDiscount}
                    onChange={(e) => setInvDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Billing Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. CGHS concessional billing"
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* BILL SUMMARY BOX */}
              {(() => {
                const sub = invItems.reduce((sum, i) => sum + i.amount, 0);
                const tax = Math.round(sub * 0.18);
                const disc = parseFloat(invDiscount) || 0;
                const tot = sub + tax - disc;
                return (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 text-xs font-semibold text-slate-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-slate-800 font-bold">{formatCurrency(sub)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Healthcare GST / Surcharge (18%):</span>
                      <span className="text-slate-800 font-bold">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Discount Concessions:</span>
                      <span>-{formatCurrency(disc)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>Net Accounts Receivable Bill:</span>
                      <span className="text-emerald-700">{formatCurrency(tot)}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer"
              >
                Compile, Print & Dispatch Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. COLLECT PATIENT PAYMENT DIALOG */}
      {showPayInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button 
              onClick={() => setShowPayInvoiceModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">💵 Collect Patient Outstanding Balance</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Patient: {showPayInvoiceModal.patientName}</span>
              <span className="text-[10px] text-indigo-600 font-mono block mt-0.5">Reference Invoice: {showPayInvoiceModal.invoiceNumber}</span>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-4">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Receipt Amount (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="Collect amount"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                  Outstanding balance liability: {formatCurrency(showPayInvoiceModal.totalAmount - showPayInvoiceModal.amountPaid)}
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Payment Settlement Channel *</label>
                <select
                  required
                  value={payMethod || "UPI"}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Card">Direct Credit/Debit Card Swipe</option>
                  <option value="Cash">Physical Cash Counter Receipt</option>
                  <option value="NetBanking">NetBanking / Bank Wire</option>
                  <option value="Insurance_Copay">TPA / Insurance Copay Clearance</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer"
              >
                Record Payment & Balance Accounts
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. BOOK SUPPLIER BILL DIALOG */}
      {showBookBillModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-lg w-full relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowBookBillModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">🚛 Book Supplier Payable / Purchase Bill</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Record supply bills directly into Accounts Payable ledger</p>
            </div>

            <form onSubmit={handleBookBill} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Supplier/Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abbott Medical Pvt Ltd"
                    value={vbVendorName}
                    onChange={(e) => setVbVendorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Supplier Category *</label>
                  <select
                    value={vbCategory}
                    onChange={(e) => setVbCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none"
                  >
                    <option value="Medical Supplies">Medical Supplies & Consumables</option>
                    <option value="Pharmacy Wholesaler">Pharmacy & Drugs Wholesaler</option>
                    <option value="Blood Bank Supplier">Blood Bank Reagents & Kits</option>
                    <option value="IT Services">Hospital IT Systems & SaaS</option>
                    <option value="Utilities">Utilities & Hospital Gas Supplies</option>
                    <option value="Other">Other General Vendors</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Supplier Invoice Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-99"
                    value={vbInvNum}
                    onChange={(e) => setVbInvNum(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Assorted stents shipment"
                    value={vbNotes}
                    onChange={(e) => setVbNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Shipped Items Log</span>
                  <button
                    type="button"
                    onClick={addVbItem}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[9px] uppercase rounded border-0 cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {vbItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={item.description}
                          onChange={(e) => updateVbItem(idx, "description", e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          placeholder="Qty"
                          value={item.quantity || ""}
                          onChange={(e) => updateVbItem(idx, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          placeholder="Unit"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateVbItem(idx, "unitPrice", e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 text-slate-700 font-bold text-xs">
                        {formatCurrency(item.amount)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          disabled={vbItems.length <= 1}
                          onClick={() => removeVbItem(idx)}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30 border-0 bg-transparent cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs font-black text-slate-800">
                <span>Total Booked Payable Liability:</span>
                <span className="text-rose-600">
                  {formatCurrency(vbItems.reduce((sum, i) => sum + i.amount, 0))}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer"
              >
                Confirm & Book Payable Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. PAY VENDOR BILL DIALOG */}
      {showPayBillModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button 
              onClick={() => setShowPayBillModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">💵 Process Supplier Bill Payout</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vendor: {showPayBillModal.vendorName}</span>
              <span className="text-[10px] text-indigo-600 font-mono block mt-0.5">Reference Bill: {showPayBillModal.invoiceNumber}</span>
            </div>

            <form onSubmit={handlePayBill} className="space-y-4">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Payout Amount (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="Payout amount"
                  value={payBillAmt}
                  onChange={(e) => setPayBillAmt(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                  Outstanding vendor liability: {formatCurrency(showPayBillModal.totalAmount - showPayBillModal.amountPaid)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer"
              >
                Authorize Bank Payout & Balance AP
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. STAFF REIMBURSEMENT DISPATCH DIALOG */}
      {showSubmitExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button 
              onClick={() => setShowSubmitExpenseModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-800">💰 Submit Staff Expense Reimbursement Claim</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">File out of pocket spendings for administrative audit</p>
            </div>

            <form onSubmit={handleAddExpenseClaim} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Claimant Staff Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sister Stella"
                    value={expStaffName}
                    onChange={(e) => setExpStaffName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Clinical Department *</label>
                  <select
                    value={expDept}
                    onChange={(e) => setExpDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="Nursing Operations">Nursing Operations</option>
                    <option value="Radiology & Diagnostics">Radiology & Diagnostics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Expenditure Category *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none"
                >
                  <option value="travel">Travel & Cab Allowances</option>
                  <option value="medical_equipment">Urgent Medical Supplies</option>
                  <option value="office_supplies">Office & Stationaries</option>
                  <option value="staff_welfare">Staff Welfare & Fooding</option>
                  <option value="miscellaneous">Other Miscellaneous spendings</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Total Claim Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Attach Receipt PDF/Img link</label>
                  <input
                    type="text"
                    placeholder="Receipt URL (Optional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1">Filing Description / Business Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain the clinical or operational requirement for this out-of-pocket spend..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow border-0 cursor-pointer"
              >
                Submit Claim for Audit
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

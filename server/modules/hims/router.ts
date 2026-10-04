import { Router, Request, Response } from "express";
import { auditLogMiddleware } from "../../middleware/audit";

export const himsRouter = Router();

// 1. Emergency Department Cases
himsRouter.get("/emergency-cases", (req: Request, res: Response) => {
  res.json({
    success: true,
    cases: [
      {
        id: "emg_001",
        patientName: "Vikram Malhotra",
        age: 52,
        triageLevel: "Red - Immediate",
        chiefComplaint: "Acute chest pain radiating to left arm",
        bp: "158/98 mmHg",
        spo2: "94%",
        heartRate: "112 bpm",
        status: "Active Resuscitation"
      }
    ]
  });
});

himsRouter.get("/emergency/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: {
      activeCases: 4,
      redTriage: 1,
      yellowTriage: 2,
      greenTriage: 1,
      availableBeds: 6
    }
  });
});

// 2. Nursing Station
himsRouter.get("/nursing/shifts", (req: Request, res: Response) => {
  res.json({
    success: true,
    shifts: [
      { id: "shift_1", nurseName: "Sister Ananya Roy, RN", ward: "Cardiology ICU", shiftTime: "07:00 - 15:00", status: "active" }
    ]
  });
});

himsRouter.get("/nursing/tasks", (req: Request, res: Response) => {
  res.json({
    success: true,
    tasks: [
      { id: "task_101", patientName: "Ramesh Kumar", task: "Administer IV Infusion", dueTime: "11:00 AM", status: "pending" }
    ]
  });
});

himsRouter.get("/nursing/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: { totalAssigned: 12, completed: 8, pending: 4, handoversDue: 1 }
  });
});

// 3. Radiology Studies & Reports
himsRouter.get("/radiology/requests", (req: Request, res: Response) => {
  res.json({
    success: true,
    requests: [
      { id: "rad_req_1", patientName: "Ramesh Kumar", studyType: "Chest X-Ray PA View", urgency: "Routine", status: "scheduled" }
    ]
  });
});

himsRouter.get("/radiology/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: { pendingReads: 3, completedToday: 18, criticalFindings: 0 }
  });
});

// 4. Blood Bank
himsRouter.get("/bloodbank/bags", (req: Request, res: Response) => {
  res.json({
    success: true,
    inventory: [
      { group: "A+", units: 14, status: "adequate" },
      { group: "B+", units: 22, status: "adequate" },
      { group: "O+", units: 18, status: "adequate" },
      { group: "AB+", units: 7, status: "moderate" },
      { group: "O-", units: 3, status: "critical_low" }
    ]
  });
});

himsRouter.get("/bloodbank/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: { totalUnits: 64, criticalShortages: 1, pendingCrossmatch: 2 }
  });
});

// 5. Cath Lab & Interventional Suites
himsRouter.get("/cathlab/rooms", (req: Request, res: Response) => {
  res.json({
    success: true,
    rooms: [
      { id: "cath_1", name: "Cath Lab 1 (Bi-plane)", status: "In Procedure", currentDoctor: "Dr. K. S. Murthy" },
      { id: "cath_2", name: "Cath Lab 2 (Single-plane)", status: "Ready / Sanitized" }
    ]
  });
});

himsRouter.get("/cathlab/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: { proceduresToday: 6, averageTurnaroundMin: 48, scheduledRemaining: 3 }
  });
});

// 6. Hospital Finance & Enterprise Ledger
const initialAccounts = [
  { id: "acc_101", code: "1010", name: "Operating Bank Account (HDFC)", type: "asset" as const, balance: 14250000, description: "Primary operational treasury" },
  { id: "acc_102", code: "1020", name: "OPD Petty Cash", type: "asset" as const, balance: 75000, description: "Front desk billing collection vault" },
  { id: "acc_103", code: "1100", name: "Patient Accounts Receivable", type: "asset" as const, balance: 2840000, description: "Outstanding patient bills and co-pays" },
  { id: "acc_104", code: "1150", name: "TPAs & Insurance Receivables", type: "asset" as const, balance: 8900000, description: "Empanelled corporate & AB-PMJAY claims" },
  { id: "acc_201", code: "2010", name: "Vendor Accounts Payable", type: "liability" as const, balance: 3450000, description: "Pharmacy wholesalers and implant suppliers" },
  { id: "acc_301", code: "3000", name: "Hospital Retained Reserves", type: "equity" as const, balance: 18500000, description: "Foundational capital reserve" },
  { id: "acc_401", code: "4010", name: "OPD Consultation Revenue", type: "revenue" as const, balance: 6420000, description: "Doctor outpatient consult receipts" },
  { id: "acc_402", code: "4020", name: "IPD Bed & Nursing Revenue", type: "revenue" as const, balance: 12850000, description: "Inpatient admission & ICU suite billing" },
  { id: "acc_403", code: "4030", name: "Pharmacy Sales Revenue", type: "revenue" as const, balance: 9340000, description: "Central pharmacy dispensing turnover" },
  { id: "acc_501", code: "5010", name: "Pharmaceutical Cost of Goods", type: "expense" as const, balance: 5120000, description: "Wholesale medicines & consumables cost" },
  { id: "acc_502", code: "5020", name: "Doctor & Staff Payroll", type: "expense" as const, balance: 8400000, description: "Monthly clinician honorariums and nursing salaries" },
  { id: "acc_503", code: "5030", name: "Diagnostic Consumables & Reagents", type: "expense" as const, balance: 1450000, description: "Pathology biochemistry & radiology contrast" }
];

let accountsStore = [...initialAccounts];

let journalEntriesStore: any[] = [
  {
    id: "jv_001",
    entryNumber: "JV-2026-0089",
    date: new Date().toISOString().split("T")[0],
    description: "Daily OPD Cash and UPI Settlement from Desk 1",
    reference: "SETTLE-OPD-041",
    lines: [
      { accountId: "acc_101", type: "debit", amount: 184500 },
      { accountId: "acc_401", type: "credit", amount: 184500 }
    ],
    isApproved: true,
    createdBy: "Senior Accountant (M. Rao)"
  },
  {
    id: "jv_002",
    entryNumber: "JV-2026-0090",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    description: "Wholesale procurement of IV fluids and emergency injectables",
    reference: "PO-SUNPHARMA-812",
    lines: [
      { accountId: "acc_501", type: "debit", amount: 240000 },
      { accountId: "acc_201", type: "credit", amount: 240000 }
    ],
    isApproved: true,
    createdBy: "Store Procurement Officer"
  }
];

let patientInvoicesStore: any[] = [
  {
    id: "inv_901",
    invoiceNumber: "INV-2026-1042",
    patientId: "demo-pat-1",
    patientName: "Rajesh Kumar",
    admissionId: null,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    items: [
      { id: "item_1", description: "Comprehensive Specialist Consultation (General Medicine)", category: "Consultation", amount: 1200 },
      { id: "item_2", description: "Glycated Hemoglobin (HbA1c) & Lipid Profile", category: "Laboratory", amount: 1800 }
    ],
    subtotal: 3000,
    taxAmount: 0,
    discountAmount: 200,
    totalAmount: 2800,
    amountPaid: 2800,
    paymentStatus: "paid" as const,
    paymentMethod: "UPI" as const,
    notes: "Consultation + Diagnostic screening package"
  },
  {
    id: "inv_902",
    invoiceNumber: "INV-2026-1043",
    patientId: "pat_101",
    patientName: "Ramesh Kumar",
    admissionId: "adm_201",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    items: [
      { id: "item_3", description: "ICU Monitored Bed Charges (3 Days)", category: "Ward Rent", amount: 18000 },
      { id: "item_4", description: "Telemetry ECG Monitoring & Nursing Care", category: "Nursing", amount: 4500 },
      { id: "item_5", description: "Emergency Pharmacotherapy Consumables", category: "Pharmacy", amount: 6200 }
    ],
    subtotal: 28700,
    taxAmount: 0,
    discountAmount: 1500,
    totalAmount: 27200,
    amountPaid: 15000,
    paymentStatus: "partially_paid" as const,
    paymentMethod: "NetBanking" as const,
    notes: "Balance pending TPA cashless pre-authorization approval"
  }
];

let vendorInvoicesStore: any[] = [
  {
    id: "vnd_001",
    invoiceNumber: "BILL-MEDPLUS-9912",
    vendorName: "MedPlus Central Pharmaceuticals Wholesale",
    vendorCategory: "Pharmacy Wholesaler" as const,
    date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split("T")[0],
    items: [
      { description: "Ceftriaxone 1g IV Injectable Vials (Box of 50)", quantity: 20, unitPrice: 1800, amount: 36000 },
      { description: "Normal Saline 500ml 0.9% IV Infusion (Carton of 40)", quantity: 50, unitPrice: 950, amount: 47500 }
    ],
    totalAmount: 83500,
    amountPaid: 83500,
    status: "paid" as const,
    notes: "Batch expiry audited March 2028. Good to stock."
  },
  {
    id: "vnd_002",
    invoiceNumber: "BILL-ROCHE-4410",
    vendorName: "Roche Diagnostics Reagents India Ltd",
    vendorCategory: "Medical Supplies" as const,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    items: [
      { description: "Cobas e411 Troponin-I High Sensitivity Kits", quantity: 5, unitPrice: 14200, amount: 71000 }
    ],
    totalAmount: 71000,
    amountPaid: 0,
    status: "unpaid" as const,
    notes: "Invoice verified by Chief Lab Technologist."
  }
];

let expenseClaimsStore: any[] = [
  {
    id: "exp_101",
    staffName: "Sister Ananya Roy, RN",
    department: "Cardiology ICU",
    date: new Date().toISOString().split("T")[0],
    description: "Emergency procurement of sterile dressing packs during midnight surge",
    amount: 3200,
    category: "medical_equipment" as const,
    receiptUrl: null,
    status: "approved" as const,
    approvedBy: "Medical Superintendent",
    notes: "Reimbursed via petty cash voucher #481"
  },
  {
    id: "exp_102",
    staffName: "Dr. Sandeep Kulkarni",
    department: "Internal Medicine",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    description: "CME Conference Registration: Advanced Sepsis Protocols 2026",
    amount: 8500,
    category: "travel" as const,
    receiptUrl: null,
    status: "pending" as const,
    approvedBy: null,
    notes: "Awaiting Finance Director review"
  }
];

let budgetsStore: any[] = [
  { id: "bdg_1", department: "Cardiology", fiscalYear: "2026-27", allocatedBudget: 15000000, spentBudget: 4200000, quarterlyTargets: [3750000, 3750000, 3750000, 3750000] },
  { id: "bdg_2", department: "Emergency & Trauma", fiscalYear: "2026-27", allocatedBudget: 12000000, spentBudget: 5100000, quarterlyTargets: [3000000, 3000000, 3000000, 3000000] },
  { id: "bdg_3", department: "Pharmacy & Stores", fiscalYear: "2026-27", allocatedBudget: 25000000, spentBudget: 9400000, quarterlyTargets: [6250000, 6250000, 6250000, 6250000] },
  { id: "bdg_4", department: "Pathology & Radiology", fiscalYear: "2026-27", allocatedBudget: 8000000, spentBudget: 2800000, quarterlyTargets: [2000000, 2000000, 2000000, 2000000] }
];

// Accounts
himsRouter.get("/finance/accounts", (req: Request, res: Response) => {
  res.json(accountsStore);
});

himsRouter.post("/finance/accounts", (req: Request, res: Response) => {
  const newAcc = {
    id: `acc_${Date.now()}`,
    code: req.body.code || String(Math.floor(1000 + Math.random() * 9000)),
    name: req.body.name || "New Ledger Account",
    type: req.body.type || "asset",
    balance: Number(req.body.balance) || 0,
    description: req.body.description || ""
  };
  accountsStore.push(newAcc);
  res.status(201).json(newAcc);
});

// Journal Entries
himsRouter.get("/finance/journal-entries", (req: Request, res: Response) => {
  res.json(journalEntriesStore);
});

himsRouter.post("/finance/journal-entries", (req: Request, res: Response) => {
  const newJv = {
    id: `jv_${Date.now()}`,
    entryNumber: `JV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: req.body.date || new Date().toISOString().split("T")[0],
    description: req.body.description || "General Journal Voucher",
    reference: req.body.reference || "MANUAL-JV",
    lines: Array.isArray(req.body.lines) ? req.body.lines : [],
    isApproved: true,
    createdBy: req.body.createdBy || req.user?.fullName || "Accounting Admin"
  };
  journalEntriesStore.unshift(newJv);
  res.status(201).json(newJv);
});

// Patient Invoices
himsRouter.get("/finance/patient-invoices", (req: Request, res: Response) => {
  res.json(patientInvoicesStore);
});

himsRouter.post("/finance/patient-invoices", (req: Request, res: Response) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
  const tax = Number(req.body.taxAmount) || 0;
  const discount = Number(req.body.discountAmount) || 0;
  const total = Math.max(0, subtotal + tax - discount);

  const newInv = {
    id: `inv_${Date.now()}`,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: req.body.patientId || "demo-pat-1",
    patientName: req.body.patientName || "Rajesh Kumar",
    admissionId: req.body.admissionId || null,
    date: req.body.date || new Date().toISOString().split("T")[0],
    dueDate: req.body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    items,
    subtotal,
    taxAmount: tax,
    discountAmount: discount,
    totalAmount: total,
    amountPaid: Number(req.body.amountPaid) || 0,
    paymentStatus: req.body.paymentStatus || (Number(req.body.amountPaid) >= total ? "paid" : "unpaid"),
    paymentMethod: req.body.paymentMethod || "UPI",
    notes: req.body.notes || ""
  };
  patientInvoicesStore.unshift(newInv);
  res.status(201).json(newInv);
});

himsRouter.post("/finance/patient-invoices/:id/pay", (req: Request, res: Response) => {
  const inv = patientInvoicesStore.find(i => i.id === req.params.id);
  if (!inv) {
    return res.status(404).json({ success: false, detail: "Invoice not found" });
  }
  const payAmt = Number(req.body.amount) || inv.totalAmount - inv.amountPaid;
  inv.amountPaid += payAmt;
  inv.paymentMethod = req.body.paymentMethod || inv.paymentMethod || "UPI";
  if (inv.amountPaid >= inv.totalAmount) {
    inv.paymentStatus = "paid";
  } else if (inv.amountPaid > 0) {
    inv.paymentStatus = "partially_paid";
  }
  res.json({ success: true, invoice: inv });
});

// Vendor Invoices
himsRouter.get("/finance/vendor-invoices", (req: Request, res: Response) => {
  res.json(vendorInvoicesStore);
});

himsRouter.post("/finance/vendor-invoices", (req: Request, res: Response) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.amount) || (Number(item.quantity) * Number(item.unitPrice)) || 0), 0);
  const newVnd = {
    id: `vnd_${Date.now()}`,
    invoiceNumber: req.body.invoiceNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    vendorName: req.body.vendorName || "Medical Supplier",
    vendorCategory: req.body.vendorCategory || "Medical Supplies",
    date: req.body.date || new Date().toISOString().split("T")[0],
    dueDate: req.body.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    items,
    totalAmount,
    amountPaid: Number(req.body.amountPaid) || 0,
    status: req.body.status || "unpaid",
    notes: req.body.notes || ""
  };
  vendorInvoicesStore.unshift(newVnd);
  res.status(201).json(newVnd);
});

himsRouter.post("/finance/vendor-invoices/:id/pay", (req: Request, res: Response) => {
  const bill = vendorInvoicesStore.find(v => v.id === req.params.id);
  if (!bill) {
    return res.status(404).json({ success: false, detail: "Vendor invoice not found" });
  }
  const payAmt = Number(req.body.amount) || bill.totalAmount - bill.amountPaid;
  bill.amountPaid += payAmt;
  if (bill.amountPaid >= bill.totalAmount) {
    bill.status = "paid";
  } else if (bill.amountPaid > 0) {
    bill.status = "partially_paid";
  }
  res.json({ success: true, bill });
});

// Expense Claims
himsRouter.get("/finance/expense-claims", (req: Request, res: Response) => {
  res.json(expenseClaimsStore);
});

himsRouter.post("/finance/expense-claims", (req: Request, res: Response) => {
  const newExp = {
    id: `exp_${Date.now()}`,
    staffName: req.body.staffName || req.user?.fullName || "Staff Member",
    department: req.body.department || "General Hospital",
    date: req.body.date || new Date().toISOString().split("T")[0],
    description: req.body.description || "",
    amount: Number(req.body.amount) || 0,
    category: req.body.category || "miscellaneous",
    receiptUrl: req.body.receiptUrl || null,
    status: "pending" as const,
    approvedBy: null,
    notes: req.body.notes || ""
  };
  expenseClaimsStore.unshift(newExp);
  res.status(201).json(newExp);
});

himsRouter.patch("/finance/expense-claims/:id/status", (req: Request, res: Response) => {
  const exp = expenseClaimsStore.find(e => e.id === req.params.id);
  if (!exp) {
    return res.status(404).json({ success: false, detail: "Expense claim not found" });
  }
  exp.status = req.body.status || exp.status;
  if (req.body.status === "approved") {
    exp.approvedBy = req.user?.fullName || "Finance Admin";
  }
  res.json({ success: true, expense: exp });
});

// Budgets
himsRouter.get("/finance/budgets", (req: Request, res: Response) => {
  res.json(budgetsStore);
});

// Reports
himsRouter.get("/finance/reports", (req: Request, res: Response) => {
  const totalCash = accountsStore
    .filter(a => a.type === "asset" && a.code.startsWith("10"))
    .reduce((acc, a) => acc + a.balance, 0);

  const totalReceivables = accountsStore
    .filter(a => a.type === "asset" && a.code.startsWith("11"))
    .reduce((acc, a) => acc + a.balance, 0);

  const totalPayables = accountsStore
    .filter(a => a.type === "liability")
    .reduce((acc, a) => acc + a.balance, 0);

  const revenues = accountsStore.filter(a => a.type === "revenue");
  const expenses = accountsStore.filter(a => a.type === "expense");
  const totalRevenues = revenues.reduce((acc, a) => acc + a.balance, 0);
  const totalExpenses = expenses.reduce((acc, a) => acc + a.balance, 0);
  const netProfit = totalRevenues - totalExpenses;
  const operatingMargin = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0;

  const assets = accountsStore.filter(a => a.type === "asset");
  const liabilities = accountsStore.filter(a => a.type === "liability");
  const equities = accountsStore.filter(a => a.type === "equity");
  const totalAssets = assets.reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = liabilities.reduce((acc, a) => acc + a.balance, 0);
  const totalEquities = equities.reduce((acc, a) => acc + a.balance, 0);

  res.json({
    kpis: {
      totalCash,
      totalReceivables,
      totalPayables,
      netProfit,
      operatingMargin: Number(operatingMargin.toFixed(1)),
      budgetUtilization: 38.4
    },
    pnl: {
      revenues,
      expenses,
      totalRevenues,
      totalExpenses,
      netProfit
    },
    balanceSheet: {
      assets,
      liabilities,
      equities,
      totalAssets,
      totalLiabilities,
      totalEquities,
      retainedEarningsWithProfit: totalEquities + netProfit,
      isBalanced: true
    }
  });
});

// 7. Wards & Inpatient Departments
const wardsList = [
  { id: "ward_1", name: "Cardiology ICU", type: "ICU", floor: "3rd Floor", building: "Tower A", totalBeds: 12, occupiedBeds: 8, nurseInCharge: "Sister Ananya Roy, RN", status: "Active" },
  { id: "ward_2", name: "General Medical Ward", type: "General", floor: "2nd Floor", building: "Tower A", totalBeds: 24, occupiedBeds: 16, nurseInCharge: "Sister Geeta Menon, RN", status: "Active" },
  { id: "ward_3", name: "Surgical Post-Op", type: "Post-Op", floor: "4th Floor", building: "Tower B", totalBeds: 16, occupiedBeds: 10, nurseInCharge: "Sister Maria D'Souza, RN", status: "Active" },
  { id: "ward_4", name: "Pediatric Care Unit", type: "Pediatric", floor: "1st Floor", building: "Tower A", totalBeds: 14, occupiedBeds: 6, nurseInCharge: "Sister Rekha Nair, RN", status: "Active" }
];

himsRouter.get("/wards", (req: Request, res: Response) => {
  res.json(wardsList);
});

himsRouter.post("/wards", (req: Request, res: Response) => {
  const newWard = {
    id: `ward_${Date.now()}`,
    name: req.body.name || "New Inpatient Ward",
    type: req.body.type || "General",
    floor: req.body.floor || "1st Floor",
    building: req.body.building || "Main Block",
    totalBeds: Number(req.body.totalBeds) || 10,
    occupiedBeds: 0,
    nurseInCharge: req.body.nurseInCharge || "Staff Nurse",
    status: "Active"
  };
  wardsList.unshift(newWard);
  res.status(201).json(newWard);
});

himsRouter.patch("/wards/:id", (req: Request, res: Response) => {
  const ward = wardsList.find(w => w.id === req.params.id);
  if (ward) {
    Object.assign(ward, req.body);
    return res.json(ward);
  }
  res.status(404).json({ success: false, error: "Ward not found" });
});

// 8. Beds Management
const bedsList = [
  { id: "bed_101", wardId: "ward_1", wardName: "Cardiology ICU", bedNumber: "ICU-01", status: "Occupied", patientName: "Vikram Malhotra", patientId: "pat_101", type: "Motorized ICU Bed", oxygenPoint: true, ventilatorReady: true },
  { id: "bed_102", wardId: "ward_1", wardName: "Cardiology ICU", bedNumber: "ICU-02", status: "Available", type: "Motorized ICU Bed", oxygenPoint: true, ventilatorReady: true },
  { id: "bed_103", wardId: "ward_2", wardName: "General Medical Ward", bedNumber: "MED-14", status: "Occupied", patientName: "Ramesh Kumar", patientId: "pat_101", type: "Semi-Fowler Bed", oxygenPoint: true, ventilatorReady: false },
  { id: "bed_104", wardId: "ward_2", wardName: "General Medical Ward", bedNumber: "MED-15", status: "Available", type: "Semi-Fowler Bed", oxygenPoint: true, ventilatorReady: false },
  { id: "bed_105", wardId: "ward_3", wardName: "Surgical Post-Op", bedNumber: "SURG-08", status: "Cleaning", type: "Fowler Bed", oxygenPoint: true, ventilatorReady: false }
];

himsRouter.get("/beds", (req: Request, res: Response) => {
  res.json(bedsList);
});

himsRouter.patch("/beds/:id/status", (req: Request, res: Response) => {
  const bed = bedsList.find(b => b.id === req.params.id);
  if (bed) {
    bed.status = req.body.status || bed.status;
    return res.json(bed);
  }
  res.status(404).json({ success: false, error: "Bed not found" });
});

// 9. Inpatient Admissions
const admissionsList = [
  {
    id: "adm_2026_01",
    patientId: "demo-pat-1",
    patientName: "Rajesh Kumar",
    mrn: "MRN-AP-2026-101",
    wardName: "General Medical Ward",
    bedNumber: "MED-14",
    attendingDoctor: "Dr. Rajesh Sharma",
    admittedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    provisionalDiagnosis: "Acute Asthmatic Bronchospasm",
    status: "Admitted"
  },
  {
    id: "adm_2026_02",
    patientId: "pat_101",
    patientName: "Ramesh Kumar",
    mrn: "MRN-AP-2026-001",
    wardName: "Cardiology ICU",
    bedNumber: "ICU-01",
    attendingDoctor: "Dr. K. S. Murthy",
    admittedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    provisionalDiagnosis: "Hypertensive Urgency with Unstable Angina",
    status: "Admitted"
  }
];

himsRouter.get("/admissions", (req: Request, res: Response) => {
  res.json(admissionsList);
});

himsRouter.post("/admissions", (req: Request, res: Response) => {
  const newAdm = {
    id: `adm_${Date.now()}`,
    ...req.body,
    admittedAt: new Date().toISOString(),
    status: "Admitted"
  };
  admissionsList.unshift(newAdm);
  res.status(201).json(newAdm);
});

himsRouter.post("/admissions/admit", (req: Request, res: Response) => {
  const newAdm = {
    id: `adm_${Date.now()}`,
    ...req.body,
    admittedAt: new Date().toISOString(),
    status: "Admitted"
  };
  admissionsList.unshift(newAdm);
  res.status(201).json(newAdm);
});

// 10. Operation Theatres & OT Schedules
const otsList = [
  { id: "ot_1", name: "Major OT 1 (Cardiothoracic & Vascular)", building: "Tower B", floor: "3rd Floor", status: "In Use", sterileCleanlinessGrade: "ISO 5 (Class 100)" },
  { id: "ot_2", name: "Major OT 2 (Orthopedics & Joint Replacement)", building: "Tower B", floor: "3rd Floor", status: "Ready", sterileCleanlinessGrade: "ISO 5 (Class 100)" },
  { id: "ot_3", name: "Emergency Trauma OT", building: "Tower A", floor: "Ground Floor", status: "On Standby", sterileCleanlinessGrade: "ISO 6 (Class 1000)" }
];

himsRouter.get("/ots", (req: Request, res: Response) => {
  res.json(otsList);
});

const otSchedulesList = [
  { id: "otsched_01", otId: "ot_1", procedureName: "CABG Off-Pump Bypass", patientName: "Vikram Malhotra", surgeon: "Dr. K. S. Murthy", time: "09:00 - 13:00", status: "In Progress" },
  { id: "otsched_02", otId: "ot_2", procedureName: "Total Knee Arthroplasty", patientName: "Sunita Devi", surgeon: "Dr. Rajesh Sharma", time: "14:00 - 16:30", status: "Scheduled" }
];

himsRouter.get("/ot-schedules", (req: Request, res: Response) => {
  res.json(otSchedulesList);
});

himsRouter.get("/ot/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    totalTheatres: 3,
    activeSurgeries: 1,
    scheduledToday: 5,
    sterilizationCompliance: "99.8%"
  });
});

// 11. Insurance Providers & Claims
himsRouter.get("/insurance-providers", (req: Request, res: Response) => {
  res.json([
    { id: "ins_1", name: "Star Health & Allied Insurance", tpaPartner: "Medi Assist TPA", cashlessAvailable: true, preAuthTAT: "45 mins" },
    { id: "ins_2", name: "HDFC ERGO General Insurance", tpaPartner: "Vidal Health TPA", cashlessAvailable: true, preAuthTAT: "60 mins" },
    { id: "ins_3", name: "Ayushman Bharat PMJAY (Govt)", tpaPartner: "National Health Authority", cashlessAvailable: true, preAuthTAT: "Instant Automated" }
  ]);
});

himsRouter.get("/claims", (req: Request, res: Response) => {
  res.json([
    { id: "clm_101", patientName: "Ramesh Kumar", insurer: "Star Health", claimedAmount: 185000, approvedAmount: 172000, status: "Approved", preAuthCode: "STAR-PA-8841" },
    { id: "clm_102", patientName: "Vikram Malhotra", insurer: "HDFC ERGO", claimedAmount: 240000, approvedAmount: 0, status: "Under Review", preAuthCode: "HDFC-PA-9920" }
  ]);
});

// 12. NABH Standards & Compliance Audits
himsRouter.get("/nabh-standards", (req: Request, res: Response) => {
  res.json([
    { id: "nabh_aac", chapter: "Access, Assessment and Continuity of Care (AAC)", complianceScore: 98, status: "Compliant" },
    { id: "nabh_cop", chapter: "Care of Patients (COP)", complianceScore: 96, status: "Compliant" },
    { id: "nabh_mom", chapter: "Management of Medication (MOM)", complianceScore: 99, status: "Compliant" },
    { id: "nabh_hic", chapter: "Hospital Infection Control (HIC)", complianceScore: 97, status: "Compliant" },
    { id: "nabh_cqis", chapter: "Continuous Quality Improvement (CQI)", complianceScore: 95, status: "Compliant" }
  ]);
});

himsRouter.get("/compliance-audits", (req: Request, res: Response) => {
  res.json([
    { id: "aud_01", auditName: "Emergency Crash Cart & Defibrillator Verification", auditor: "Quality Assurance Committee", date: new Date().toISOString().split("T")[0], result: "Pass (Zero Discrepancies)" },
    { id: "aud_02", auditName: "Biomedical Waste Segregation & Color Coding", auditor: "NABH Internal Auditor", date: new Date(Date.now() - 48 * 3600000).toISOString().split("T")[0], result: "Pass (100% Adherence)" }
  ]);
});

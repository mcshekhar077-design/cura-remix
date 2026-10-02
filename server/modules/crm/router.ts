import { Router, Request, Response } from "express";

export const crmRouter = Router();

// CRM Lead interface matching client AdminLeads
interface CrmLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  clinicName: string;
  clinicType: "clinic" | "nursing_home" | "hospital";
  city: string;
  state: string;
  pincode: string;
  doctorCount: number;
  bedsCount: number;
  source: "website" | "referral" | "social_media" | "mr" | "other";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  interests: string[];
  budgetRange: string;
  lastContact?: string;
  nextFollowUp?: string;
  notes: string;
  createdAt: string;
}

interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  city: string;
  state: string;
  pincode: string;
  plan: "basic" | "clinic" | "hospital" | "enterprise";
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "churned";
  totalConsultations: number;
  totalPatients: number;
  totalDoctors: number;
  preferredContact: "whatsapp" | "email" | "phone";
  lifetimeValue: number;
  churnRisk: number; // 0-100
  notes: string;
  createdAt: string;
}

interface CrmDeal {
  id: string;
  leadId: string;
  dealName: string;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  amount: number;
  probability: number; // 0-100
  expectedCloseDate: string;
  products: string[];
  decisionMaker: string;
  decisionMakerRole: string;
  notes: string;
  createdAt: string;
}

interface CrmInteraction {
  id: string;
  leadId?: string;
  customerId?: string;
  interactionType: "call" | "email" | "meeting" | "whatsapp" | "demo" | "follow_up" | "support";
  subject: string;
  description: string;
  interactionDate: string;
  durationMinutes: number;
  outcome: "positive" | "neutral" | "negative";
  followUpDate?: string;
  followUpAction?: string;
  notes?: string;
  createdAt: string;
}

interface CrmTicket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  leadId?: string;
  category: "billing" | "technical" | "support" | "consultation";
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo: string;
  resolution?: string;
  resolvedAt?: string;
  customerSatisfaction?: number; // 1-5
  feedback?: string;
  createdAt: string;
}

// In-memory data store for CRM
let crmLeads: CrmLead[] = [
  {
    id: "lead_1",
    fullName: "Dr. Arvind Rao",
    email: "arvind.rao@citycare.org",
    phone: "+91 98450 12345",
    clinicName: "City Care Polyclinic",
    clinicType: "clinic",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    doctorCount: 4,
    bedsCount: 10,
    source: "website",
    status: "qualified",
    interests: ["Ambient Voice AI", "ABDM M1-M3 Integration", "WhatsApp Bot"],
    budgetRange: "₹50,000 - ₹1,00,000",
    lastContact: "2026-03-04",
    nextFollowUp: "2026-03-12",
    notes: "Requires 4-doctor license with ABDM Scan & Share for front-desk.",
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "lead_2",
    fullName: "Dr. Preeti Jain",
    email: "pjain@sanjivani.med.in",
    phone: "+91 98220 45678",
    clinicName: "Sanjivani Multispecialty",
    clinicType: "hospital",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    doctorCount: 12,
    bedsCount: 45,
    source: "mr",
    status: "contacted",
    interests: ["Hospital IPD Suite", "NABH Log Tracking", "Pharmacy POS"],
    budgetRange: "₹2,00,000+",
    lastContact: "2026-03-07",
    nextFollowUp: "2026-03-15",
    notes: "Migrating from 10-year-old on-premise legacy database to CLINITIAL Cloud.",
    createdAt: "2026-03-05T14:30:00Z"
  },
  {
    id: "lead_3",
    fullName: "Dr. Rajesh Gupta",
    email: "rajesh@guptaheart.in",
    phone: "+91 94400 89012",
    clinicName: "Gupta Heart & Diabetic Care",
    clinicType: "clinic",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    doctorCount: 2,
    bedsCount: 0,
    source: "social_media",
    status: "new",
    interests: ["Voice AI Rx", "WhatsApp Patient Follow-up"],
    budgetRange: "₹25,000 - ₹50,000",
    notes: "Requested 14-day free trial for single-doctor cardiology OPD.",
    createdAt: "2026-03-10T09:15:00Z"
  }
];

let crmCustomers: CrmCustomer[] = [
  {
    id: "cust_1",
    name: "Apollo Clinic - Koramangala Hub",
    email: "admin@apollo-kora.in",
    phone: "+91 98450 11223",
    type: "clinic",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    plan: "clinic",
    startDate: "2026-01-15",
    endDate: "2027-01-15",
    status: "active",
    totalConsultations: 1420,
    totalPatients: 850,
    totalDoctors: 5,
    preferredContact: "whatsapp",
    lifetimeValue: 72000,
    churnRisk: 12,
    notes: "High engagement with voice prescription module.",
    createdAt: "2026-01-15T08:00:00Z"
  },
  {
    id: "cust_2",
    name: "Metro Wellness & Daycare Center",
    email: "contact@metrowellness.org",
    phone: "+91 91234 56789",
    type: "nursing_home",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    plan: "hospital",
    startDate: "2025-11-01",
    endDate: "2026-11-01",
    status: "active",
    totalConsultations: 3890,
    totalPatients: 2400,
    totalDoctors: 14,
    preferredContact: "email",
    lifetimeValue: 180000,
    churnRisk: 8,
    notes: "Planning second branch expansion in Gurgaon.",
    createdAt: "2025-11-01T08:00:00Z"
  }
];

let crmDeals: CrmDeal[] = [
  {
    id: "deal_1",
    leadId: "lead_1",
    dealName: "City Care Polyclinic - 4 Doctor Suite",
    stage: "proposal",
    amount: 84000,
    probability: 70,
    expectedCloseDate: "2026-04-15",
    products: ["Core EHR", "ABDM Sync", "WhatsApp Bot"],
    decisionMaker: "Dr. Arvind Rao",
    decisionMakerRole: "Managing Director",
    notes: "Sent proposal with 10% annual billing discount.",
    createdAt: "2026-03-02T11:00:00Z"
  },
  {
    id: "deal_2",
    leadId: "lead_2",
    dealName: "Sanjivani Multispecialty - Hospital License",
    stage: "negotiation",
    amount: 240000,
    probability: 80,
    expectedCloseDate: "2026-04-30",
    products: ["Hospital OS", "IPD / OT Suite", "NABH Compliance Module"],
    decisionMaker: "Dr. Preeti Jain",
    decisionMakerRole: "Medical Superintendent",
    notes: "Negotiating on-site training for 24 staff members.",
    createdAt: "2026-03-06T16:00:00Z"
  }
];

let crmInteractions: CrmInteraction[] = [
  {
    id: "int_1",
    leadId: "lead_1",
    interactionType: "demo",
    subject: "Product walkthrough with Clinicians",
    description: "Demonstrated Ambient Voice Rx and ABDM Scan & Share.",
    interactionDate: "2026-03-04T11:00:00Z",
    durationMinutes: 45,
    outcome: "positive",
    followUpDate: "2026-03-12",
    followUpAction: "Send customized commercial proposal.",
    notes: "Clinicians loved the 10-second prescription generation.",
    createdAt: "2026-03-04T12:00:00Z"
  },
  {
    id: "int_2",
    leadId: "lead_2",
    interactionType: "call",
    subject: "Initial Discovery Call",
    description: "Discussed requirement for 45-bed hospital management.",
    interactionDate: "2026-03-07T15:00:00Z",
    durationMinutes: 25,
    outcome: "positive",
    followUpDate: "2026-03-15",
    followUpAction: "Schedule on-site meeting in Pune.",
    notes: "Has existing legacy software, wants smooth migration.",
    createdAt: "2026-03-07T15:30:00Z"
  }
];

let crmTickets: CrmTicket[] = [
  {
    id: "tkt_1",
    ticketNumber: "TKT-1001",
    customerId: "cust_1",
    category: "technical",
    subject: "Printer template alignment for Thermal 3-inch slip",
    description: "Thermal receipt paper margins cut off hospital header logo.",
    priority: "medium",
    status: "resolved",
    assignedTo: "Engineering Support",
    resolution: "Adjusted CSS print stylesheet margins to 4mm.",
    resolvedAt: "2026-03-10T14:00:00Z",
    customerSatisfaction: 5,
    feedback: "Resolved quickly within 2 hours. Thanks!",
    createdAt: "2026-03-10T10:00:00Z"
  },
  {
    id: "tkt_2",
    ticketNumber: "TKT-1002",
    customerId: "cust_2",
    category: "billing",
    subject: "Add 3 additional clinician seats to invoice",
    description: "New pediatricians joined the clinic team.",
    priority: "high",
    status: "open",
    assignedTo: "Billing Team",
    createdAt: "2026-03-14T09:00:00Z"
  }
];

// Helper to compute CRM statistics
function computeCrmDashboard() {
  const totalPipelineValue = crmDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const closedWonValue = crmDeals
    .filter(d => d.stage === "closed_won")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return {
    totalLeads: crmLeads.length,
    newLeadsCount: crmLeads.filter(l => l.status === "new").length,
    qualifiedLeadsCount: crmLeads.filter(l => l.status === "qualified").length,
    convertedLeadsCount: crmLeads.filter(l => l.status === "converted").length,
    totalCustomers: crmCustomers.length,
    activeCustomers: crmCustomers.filter(c => c.status === "active").length,
    openTicketsCount: crmTickets.filter(t => t.status === "open" || t.status === "in_progress").length,
    urgentTicketsCount: crmTickets.filter(t => (t.status === "open" || t.status === "in_progress") && t.priority === "urgent").length,
    totalPipelineValue,
    closedWonValue
  };
}

// 1. CRM Dashboard Metrics
crmRouter.get("/crm/dashboard", (req: Request, res: Response) => {
  const stats = computeCrmDashboard();
  res.json({
    success: true,
    stats,
    ...stats
  });
});

// 2. CRM Leads (GET & POST)
crmRouter.get("/crm/leads", (req: Request, res: Response) => {
  res.json(crmLeads);
});

crmRouter.post("/crm/leads", (req: Request, res: Response) => {
  const body = req.body || {};
  const newLead: CrmLead = {
    id: `lead_${Date.now()}`,
    fullName: body.fullName || "New Clinic Lead",
    email: body.email || "",
    phone: body.phone || "",
    clinicName: body.clinicName || "Clinic",
    clinicType: body.clinicType || "clinic",
    city: body.city || "New Delhi",
    state: body.state || "Delhi",
    pincode: body.pincode || "110001",
    doctorCount: Number(body.doctorCount) || 1,
    bedsCount: Number(body.bedsCount) || 0,
    source: body.source || "website",
    status: "new",
    interests: Array.isArray(body.interests) ? body.interests : ["Core EHR"],
    budgetRange: body.budgetRange || "₹50,000 - ₹1,00,000",
    notes: body.notes || "",
    createdAt: new Date().toISOString()
  };

  crmLeads.unshift(newLead);
  res.status(201).json(newLead);
});

// 3. Update Lead Status / Fields
crmRouter.patch("/crm/leads/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const leadIndex = crmLeads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ success: false, error: "Lead not found" });
  }

  crmLeads[leadIndex] = { ...crmLeads[leadIndex], ...req.body };
  res.json({ success: true, lead: crmLeads[leadIndex] });
});

// 4. Convert Lead to Paid Customer
crmRouter.post("/crm/leads/:id/convert", (req: Request, res: Response) => {
  const { id } = req.params;
  const lead = crmLeads.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ success: false, error: "Lead not found" });
  }

  lead.status = "converted";

  const { plan = "clinic", preferredContact = "whatsapp" } = req.body;
  const newCustomer: CrmCustomer = {
    id: `cust_${Date.now()}`,
    name: lead.clinicName,
    email: lead.email,
    phone: lead.phone,
    type: lead.clinicType,
    city: lead.city,
    state: lead.state,
    pincode: lead.pincode,
    plan,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "active",
    totalConsultations: 0,
    totalPatients: 0,
    totalDoctors: lead.doctorCount,
    preferredContact,
    lifetimeValue: plan === "hospital" ? 180000 : plan === "enterprise" ? 350000 : 72000,
    churnRisk: 5,
    notes: `Converted from lead ${lead.id} (${lead.fullName})`,
    createdAt: new Date().toISOString()
  };

  crmCustomers.unshift(newCustomer);
  res.status(201).json({ success: true, customer: newCustomer });
});

// 5. CRM Customers (GET)
crmRouter.get("/crm/customers", (req: Request, res: Response) => {
  res.json(crmCustomers);
});

// 6. CRM Deals (GET, POST, PATCH)
crmRouter.get("/crm/deals", (req: Request, res: Response) => {
  res.json(crmDeals);
});

crmRouter.post("/crm/deals", (req: Request, res: Response) => {
  const body = req.body || {};
  const newDeal: CrmDeal = {
    id: `deal_${Date.now()}`,
    leadId: body.leadId || "",
    dealName: body.dealName || "New Subscription Deal",
    stage: body.stage || "prospecting",
    amount: Number(body.amount) || 50000,
    probability: Number(body.probability) || 20,
    expectedCloseDate: body.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    products: Array.isArray(body.products) ? body.products : ["Core EHR"],
    decisionMaker: body.decisionMaker || "",
    decisionMakerRole: body.decisionMakerRole || "",
    notes: body.notes || "",
    createdAt: new Date().toISOString()
  };

  crmDeals.unshift(newDeal);
  res.status(201).json(newDeal);
});

crmRouter.patch("/crm/deals/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const dealIndex = crmDeals.findIndex(d => d.id === id);
  if (dealIndex === -1) {
    return res.status(404).json({ success: false, error: "Deal not found" });
  }

  crmDeals[dealIndex] = { ...crmDeals[dealIndex], ...req.body };
  res.json({ success: true, deal: crmDeals[dealIndex] });
});

// 7. CRM Interactions (GET & POST)
crmRouter.get("/crm/interactions", (req: Request, res: Response) => {
  res.json(crmInteractions);
});

crmRouter.post("/crm/interactions", (req: Request, res: Response) => {
  const body = req.body || {};
  const newInteraction: CrmInteraction = {
    id: `int_${Date.now()}`,
    leadId: body.leadId,
    customerId: body.customerId,
    interactionType: body.interactionType || "call",
    subject: body.subject || "Follow-up Interaction",
    description: body.description || "",
    interactionDate: body.interactionDate || new Date().toISOString(),
    durationMinutes: Number(body.durationMinutes) || 15,
    outcome: body.outcome || "positive",
    followUpDate: body.followUpDate,
    followUpAction: body.followUpAction,
    notes: body.notes || "",
    createdAt: new Date().toISOString()
  };

  crmInteractions.unshift(newInteraction);
  res.status(201).json(newInteraction);
});

// 8. CRM Support Tickets (GET, POST, PATCH)
crmRouter.get("/crm/tickets", (req: Request, res: Response) => {
  res.json(crmTickets);
});

crmRouter.post("/crm/tickets", (req: Request, res: Response) => {
  const body = req.body || {};
  const newTicket: CrmTicket = {
    id: `tkt_${Date.now()}`,
    ticketNumber: `TKT-${1000 + crmTickets.length + 1}`,
    customerId: body.customerId,
    leadId: body.leadId,
    category: body.category || "support",
    subject: body.subject || "Support Request",
    description: body.description || "",
    priority: body.priority || "medium",
    status: "open",
    assignedTo: body.assignedTo || "Technical Support",
    createdAt: new Date().toISOString()
  };

  crmTickets.unshift(newTicket);
  res.status(201).json(newTicket);
});

crmRouter.patch("/crm/tickets/:id/resolve", (req: Request, res: Response) => {
  const { id } = req.params;
  const ticket = crmTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: "Ticket not found" });
  }

  ticket.status = "resolved";
  ticket.resolution = req.body.resolution || "Resolved by support team";
  ticket.resolvedAt = new Date().toISOString();
  if (req.body.customerSatisfaction) {
    ticket.customerSatisfaction = Number(req.body.customerSatisfaction);
  }
  if (req.body.feedback) {
    ticket.feedback = req.body.feedback;
  }

  res.json({ success: true, ticket });
});

// MR (Medical Representative) Connect
crmRouter.get("/mr/profiles", (req: Request, res: Response) => {
  res.json({
    success: true,
    profiles: [
      { id: "mr_1", name: "Sunil Verma", company: "Cipla Therapeutics", territory: "South Mumbai", status: "Verified" },
      { id: "mr_2", name: "Ananya Sharma", company: "Sun Pharma Oncology", territory: "Bengaluru Central", status: "Verified" }
    ]
  });
});

crmRouter.get("/mr/dashboard/:id", (req: Request, res: Response) => {
  res.json({
    success: true,
    dashboard: { mrId: req.params.id, scheduledVisits: 3, completedSamples: 14, clinicianFeedback: 4.8 }
  });
});

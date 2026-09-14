import { Router, Request, Response } from "express";

export const crmRouter = Router();

// CRM Leads & Deals
crmRouter.get("/crm/dashboard", (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: { totalLeads: 28, activeDeals: 14, closedWon: 9, conversionRate: "32.1%" }
  });
});

crmRouter.get("/crm/leads", (req: Request, res: Response) => {
  res.json({
    success: true,
    leads: [
      { id: "lead_1", name: "City Care Polyclinic", contactPerson: "Dr. Arvind Rao", city: "Bengaluru", status: "Demo Scheduled" },
      { id: "lead_2", name: "Sanjivani Multispecialty", contactPerson: "Dr. Preeti Jain", city: "Pune", status: "Proposal Sent" }
    ]
  });
});

crmRouter.post("/crm/leads", (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    lead: { id: `lead_${Date.now()}`, ...req.body, createdAt: new Date().toISOString() }
  });
});

// MR (Medical Representative) Connect
crmRouter.get("/mr/profiles", (req: Request, res: Response) => {
  res.json({
    success: true,
    profiles: [
      { id: "mr_1", name: "Sunil Verma", company: "Cipla Therapeutics", territory: "South Mumbai", status: "Verified" }
    ]
  });
});

crmRouter.get("/mr/dashboard/:id", (req: Request, res: Response) => {
  res.json({
    success: true,
    dashboard: { mrId: req.params.id, scheduledVisits: 3, completedSamples: 14, clinicianFeedback: 4.8 }
  });
});

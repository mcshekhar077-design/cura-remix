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

// 6. Hospital Finance
himsRouter.get("/finance/patient-invoices", (req: Request, res: Response) => {
  res.json({
    success: true,
    invoices: [
      { id: "inv_901", patientName: "Ramesh Kumar", amount: 2500, status: "paid", date: new Date().toISOString().split("T")[0] }
    ]
  });
});

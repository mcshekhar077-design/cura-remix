import { Router } from "express";
import { AppointmentDomainService } from "../services/appointmentDomainService";
import { authenticateGateway, requirePermission } from "../gateway/rbacAuth";

export const appointmentRouter = Router();

// GET /api/v2/appointments
appointmentRouter.get("/", authenticateGateway, requirePermission("appointments:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const doctorId = req.query.doctorId as string | undefined;
    const list = await AppointmentDomainService.getAppointments(tenantId, doctorId);
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/appointments
appointmentRouter.post("/", authenticateGateway, requirePermission("appointments:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const doctorId = req.body.doctorId || (req as any).gatewayUser?.id || "user_doc_1";
    const apt = await AppointmentDomainService.scheduleAppointment(tenantId, {
      ...req.body,
      doctorId
    });
    res.status(201).json({ success: true, message: "Appointment scheduled", data: apt });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/v2/appointments/:id/queue
appointmentRouter.patch("/:id/queue", authenticateGateway, requirePermission("appointments:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const status = req.body.status;
    const updated = await AppointmentDomainService.updateQueueStatus(tenantId, req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

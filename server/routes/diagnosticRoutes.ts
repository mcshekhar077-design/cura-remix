import { Router } from "express";
import { DiagnosticDomainService } from "../services/diagnosticDomainService";
import { authenticateGateway, requirePermission } from "../gateway/rbacAuth";

export const diagnosticRouter = Router();

// GET /api/v2/diagnostics/orders
diagnosticRouter.get("/orders", authenticateGateway, requirePermission("clinical:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const patientId = req.query.patientId as string | undefined;
    const orders = await DiagnosticDomainService.getOrders(tenantId, patientId);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/diagnostics/orders
diagnosticRouter.post("/orders", authenticateGateway, requirePermission("clinical:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const doctorId = (req as any).gatewayUser?.id || "user_doc_1";
    const order = await DiagnosticDomainService.createOrder(tenantId, {
      ...req.body,
      doctorId
    });
    res.status(201).json({ success: true, message: "Diagnostic order placed", data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

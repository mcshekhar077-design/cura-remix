import { Router } from "express";
import { BillingDomainService } from "../services/billingDomainService";
import { authenticateGateway, requirePermission } from "../gateway/rbacAuth";

export const billingRouter = Router();

// GET /api/v2/billing/invoices
billingRouter.get("/invoices", authenticateGateway, requirePermission("billing:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const patientId = req.query.patientId as string | undefined;
    const invoices = await BillingDomainService.getInvoices(tenantId, patientId);
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/billing/invoices
billingRouter.post("/invoices", authenticateGateway, requirePermission("billing:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const invoice = await BillingDomainService.createInvoice(tenantId, req.body);
    res.status(201).json({ success: true, message: "Invoice generated", data: invoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

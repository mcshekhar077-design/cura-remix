import { Router } from "express";
import { PharmacyDomainService } from "../services/pharmacyDomainService";
import { authenticateGateway, requirePermission } from "../gateway/rbacAuth";

export const pharmacyRouter = Router();

// GET /api/v2/pharmacy/inventory
pharmacyRouter.get("/inventory", authenticateGateway, requirePermission("pharmacy:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const search = req.query.search as string | undefined;
    const items = await PharmacyDomainService.getInventory(tenantId, search);
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/pharmacy/dispense
pharmacyRouter.post("/dispense", authenticateGateway, requirePermission("pharmacy:dispense"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const pharmacistId = (req as any).gatewayUser?.id || "user_pharm_1";
    const { prescriptionId } = req.body;
    const result = await PharmacyDomainService.dispenseMedication(tenantId, prescriptionId, pharmacistId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

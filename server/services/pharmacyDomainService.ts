import crypto from "crypto";
import { db } from "../storage/postgres/client";
import { cryptoLedger } from "../gateway/cryptoAudit";

export interface PharmacyItem {
  id: string;
  tenantId: string;
  medicineName: string;
  composition: string;
  category: string;
  batchNumber: string;
  quantityAvailable: number;
  reorderLevel: number;
  unitPrice: number;
  mrp: number;
  expiryDate: string;
  isNarcotic: boolean;
}

export class PharmacyDomainService {
  public static async getInventory(tenantId: string, search?: string): Promise<PharmacyItem[]> {
    const table = (db as any).getTable("pharmacy_inventory");
    let items: PharmacyItem[] = [];
    for (const item of table.values()) {
      if (item.tenant_id === tenantId) {
        items.push({
          id: item.id,
          tenantId: item.tenant_id,
          medicineName: item.medicine_name,
          composition: item.composition,
          category: item.category,
          batchNumber: item.batch_number,
          quantityAvailable: item.quantity_available,
          reorderLevel: item.reorder_level,
          unitPrice: item.unit_price,
          mrp: item.mrp,
          expiryDate: item.expiry_date,
          isNarcotic: item.is_narcotic
        });
      }
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.medicineName.toLowerCase().includes(q) || i.composition.toLowerCase().includes(q));
    }
    return items;
  }

  public static async dispenseMedication(
    tenantId: string,
    prescriptionId: string,
    pharmacistId: string
  ): Promise<{ success: boolean; prescriptionId: string; status: string }> {
    const rxTable = (db as any).getTable("prescriptions");
    const rx = rxTable.get(prescriptionId);
    if (!rx || rx.tenant_id !== tenantId) {
      return { success: false, prescriptionId, status: "NOT_FOUND" };
    }

    rx.dispense_status = "DISPENSED";
    rxTable.set(prescriptionId, rx);

    cryptoLedger.appendBlock({
      tenantId,
      eventType: "MEDICATION_DISPENSED",
      actorId: pharmacistId,
      actorRole: "pharmacist",
      resourceType: "Prescription",
      resourceId: prescriptionId,
      eventData: { dispensedAt: new Date().toISOString() }
    });

    return { success: true, prescriptionId, status: "DISPENSED" };
  }
}

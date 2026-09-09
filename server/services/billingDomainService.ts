import crypto from "crypto";
import { db } from "../storage/postgres/client";
import { cryptoLedger } from "../gateway/cryptoAudit";

export interface Invoice {
  id: string;
  tenantId: string;
  patientId: string;
  encounterId?: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  paymentMode?: string;
  lineItems: Array<{ desc: string; amount: number }>;
  createdAt: string;
}

export class BillingDomainService {
  public static async getInvoices(tenantId: string, patientId?: string): Promise<Invoice[]> {
    const table = (db as any).getTable("billing_invoices");
    const results: Invoice[] = [];
    for (const item of table.values()) {
      if (item.tenant_id === tenantId) {
        if (!patientId || item.patient_id === patientId) {
          results.push({
            id: item.id,
            tenantId: item.tenant_id,
            patientId: item.patient_id,
            encounterId: item.encounter_id,
            invoiceNumber: item.invoice_number,
            subtotal: item.subtotal,
            taxAmount: item.tax_amount || 0,
            discountAmount: item.discount_amount || 0,
            totalAmount: item.total_amount,
            amountPaid: item.amount_paid || 0,
            paymentStatus: item.payment_status || "UNPAID",
            paymentMode: item.payment_mode,
            lineItems: item.line_items || [],
            createdAt: item.created_at
          });
        }
      }
    }
    return results.reverse();
  }

  public static async createInvoice(
    tenantId: string,
    data: {
      patientId: string;
      encounterId?: string;
      lineItems: Array<{ desc: string; amount: number }>;
      discountAmount?: number;
      paymentMode?: string;
    }
  ): Promise<Invoice> {
    const subtotal = data.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = Math.round(subtotal * 0.05); // 5% GST on clinical services/consumables
    const discount = data.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discount;

    const id = `inv_${crypto.randomBytes(6).toString("hex")}`;
    const invoiceNumber = `INV-${tenantId.replace("tenant_", "").toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const inv: Invoice = {
      id,
      tenantId,
      patientId: data.patientId,
      encounterId: data.encounterId,
      invoiceNumber,
      subtotal,
      taxAmount,
      discountAmount: discount,
      totalAmount,
      amountPaid: totalAmount,
      paymentStatus: "PAID",
      paymentMode: data.paymentMode || "UPI",
      lineItems: data.lineItems,
      createdAt: new Date().toISOString()
    };

    const table = (db as any).getTable("billing_invoices");
    table.set(id, {
      id: inv.id,
      tenant_id: inv.tenantId,
      patient_id: inv.patientId,
      encounter_id: inv.encounterId,
      invoice_number: inv.invoiceNumber,
      subtotal: inv.subtotal,
      tax_amount: inv.taxAmount,
      discount_amount: inv.discountAmount,
      total_amount: inv.totalAmount,
      amount_paid: inv.amountPaid,
      payment_status: inv.paymentStatus,
      payment_mode: inv.paymentMode,
      line_items: inv.lineItems,
      created_at: inv.createdAt
    });

    cryptoLedger.appendBlock({
      tenantId,
      eventType: "BILLING_INVOICE_GENERATED",
      actorId: "billing_counter",
      actorRole: "hospital_admin",
      resourceType: "BillingInvoice",
      resourceId: id,
      eventData: { invoiceNumber, totalAmount }
    });

    return inv;
  }
}

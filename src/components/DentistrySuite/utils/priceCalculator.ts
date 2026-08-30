import { TreatmentPlanItem, PriceListEntry } from '../types';

// ============================================
// PRICE CALCULATION
// ============================================

export const calculateItemCost = (
  item: TreatmentPlanItem,
  priceList: PriceListEntry[]
): { base: number; gst: number; discount: number; total: number } => {
  const entry = priceList.find(p => p.code === item.code);
  
  if (!entry) {
    return { base: item.cost, gst: 0, discount: 0, total: item.cost };
  }

  const base = entry.basePrice || item.cost;
  const gst = base * (entry.gstPercent / 100);
  const discount = base * (entry.discountPercent / 100);
  const total = base + gst - discount;

  return { base, gst, discount, total };
};

export const calculateTotalCost = (
  items: TreatmentPlanItem[],
  priceList: PriceListEntry[]
): { subtotal: number; tax: number; discount: number; total: number } => {
  let subtotal = 0;
  let tax = 0;
  let discount = 0;

  items.forEach(item => {
    const result = calculateItemCost(item, priceList);
    subtotal += result.base;
    tax += result.gst;
    discount += result.discount;
  });

  return {
    subtotal,
    tax,
    discount,
    total: subtotal + tax - discount
  };
};

export const getCurrencySymbol = (locale: string = 'en-IN'): string => {
  const currencySymbols: Record<string, string> = {
    'en-IN': '₹',
    'en-US': '$',
    'en-GB': '£',
    'en-EU': '€'
  };
  return currencySymbols[locale] || '₹';
};

export const DENTAL_PRICE_LIST: PriceListEntry[] = [
  { id: 'cd-1', code: 'D0120', procedure: 'Periodic Oral Evaluation & Diagnosis', category: 'Diagnostic', basePrice: 500, gstPercent: 18, discountPercent: 0, finalPrice: 590, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-2', code: 'D0210', procedure: 'Full Mouth Intraoral Radiographic Series (IOPA/OPG)', category: 'Diagnostic', basePrice: 1200, gstPercent: 18, discountPercent: 0, finalPrice: 1416, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-3', code: 'D1110', procedure: 'Ultrasonic Dental Prophylaxis & Scaling (Full Arch)', category: 'Preventive', basePrice: 1500, gstPercent: 18, discountPercent: 0, finalPrice: 1770, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-4', code: 'D2391', procedure: 'Composite Resin Restoration (1 Surface - Posterior)', category: 'Restorative', basePrice: 1800, gstPercent: 18, discountPercent: 0, finalPrice: 2124, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-5', code: 'D2392', procedure: 'Composite Resin Restoration (2 Surfaces - Posterior)', category: 'Restorative', basePrice: 2400, gstPercent: 18, discountPercent: 0, finalPrice: 2832, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-6', code: 'D3330', procedure: 'Endodontic Therapy (Molar Root Canal)', category: 'Endodontics', basePrice: 6500, gstPercent: 18, discountPercent: 0, finalPrice: 7670, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-7', code: 'D2740', procedure: 'Full Ceramic / Zirconia CAD/CAM Crown', category: 'Prosthodontics', basePrice: 8500, gstPercent: 18, discountPercent: 0, finalPrice: 10030, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-8', code: 'D4341', procedure: 'Periodontal Scaling & Root Planing (Per Quadrant)', category: 'Periodontics', basePrice: 2200, gstPercent: 18, discountPercent: 0, finalPrice: 2596, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-9', code: 'D7140', procedure: 'Atraumatic Tooth Extraction (Erupted)', category: 'Oral Surgery', basePrice: 1500, gstPercent: 18, discountPercent: 0, finalPrice: 1770, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-10', code: 'D7210', procedure: 'Surgical Extraction / Impaction (Odontectomy)', category: 'Oral Surgery', basePrice: 4500, gstPercent: 18, discountPercent: 0, finalPrice: 5310, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' },
  { id: 'cd-11', code: 'D6010', procedure: 'Surgical Placement of Endosteal Implant Body', category: 'Implantology', basePrice: 28000, gstPercent: 18, discountPercent: 0, finalPrice: 33040, clinicId: 'clinic-main', effectiveFrom: '2026-01-01' }
];

export const calculateTaxBreakdown = (
  baseAmount: number,
  gstRate: number = 18,
  discountPercent: number = 0
): { baseAmount: number; taxAmount: number; discountAmount: number; totalAmount: number } => {
  const discountAmount = Math.round(baseAmount * (discountPercent / 100));
  const taxableAmount = Math.max(0, baseAmount - discountAmount);
  const taxAmount = Math.round(taxableAmount * (gstRate / 100));
  const totalAmount = taxableAmount + taxAmount;

  return {
    baseAmount,
    taxAmount,
    discountAmount,
    totalAmount
  };
};

export const formatCurrency = (amount: number, locale: string = 'en-IN'): string => {
  const symbol = getCurrencySymbol(locale);
  return `${symbol}${amount.toLocaleString(locale)}`;
};

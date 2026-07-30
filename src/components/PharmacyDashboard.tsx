import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pill,
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Plus,
  Search,
  Bell,
  ArrowLeft,
  CheckCircle,
  Download,
  RefreshCw,
  Percent,
  DollarSign,
  Calendar,
  Layers,
  Info,
  Truck,
  Send,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: "tablet" | "capsule" | "syrup" | "injection" | "ointment" | "drops" | "inhaler" | "other";
  manufacturer: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
  batchNumber: string;
  requiresPrescription: boolean;
  isActive: boolean;
}

interface Sale {
  id: string;
  medicineId: string;
  medicineName: string;
  patientName: string;
  patientPhone: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentMethod: "cash" | "card" | "upi" | "insurance";
  saleDate: string;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  orderDate: string;
  status: "pending" | "received" | "cancelled";
}

interface PharmacyDashboardProps {
  onBackToLanding: () => void;
}

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin Trihydrate",
    category: "capsule",
    manufacturer: "Abbott Pharmaceuticals",
    currentStock: 450,
    minStockLevel: 50,
    maxStockLevel: 1000,
    reorderLevel: 100,
    purchasePrice: 4.5,
    sellingPrice: 8.0,
    expiryDate: "2027-03-15",
    batchNumber: "AMX-7762",
    requiresPrescription: true,
    isActive: true
  },
  {
    id: "med-2",
    name: "Metformin 850mg",
    genericName: "Metformin Hydrochloride",
    category: "tablet",
    manufacturer: "Cipla Ltd",
    currentStock: 80,
    minStockLevel: 100,
    maxStockLevel: 1200,
    reorderLevel: 150, // Low stock!
    purchasePrice: 2.2,
    sellingPrice: 4.5,
    expiryDate: "2026-11-30",
    batchNumber: "MET-1120",
    requiresPrescription: true,
    isActive: true
  },
  {
    id: "med-3",
    name: "Cough-Relief Syrup",
    genericName: "Dextromethorphan HBr",
    category: "syrup",
    manufacturer: "Sun Pharma",
    currentStock: 12,
    minStockLevel: 20,
    maxStockLevel: 200,
    reorderLevel: 25, // Critically Low stock!
    purchasePrice: 35.0,
    sellingPrice: 75.0,
    expiryDate: "2026-07-28", // Expiring soon!
    batchNumber: "CRS-8812",
    requiresPrescription: false,
    isActive: true
  },
  {
    id: "med-4",
    name: "Lisinopril 10mg",
    genericName: "Lisinopril Dihydrate",
    category: "tablet",
    manufacturer: "Lupin Pharmaceuticals",
    currentStock: 340,
    minStockLevel: 40,
    maxStockLevel: 800,
    reorderLevel: 80,
    purchasePrice: 1.8,
    sellingPrice: 5.0,
    expiryDate: "2027-08-10",
    batchNumber: "LIS-5541",
    requiresPrescription: true,
    isActive: true
  },
  {
    id: "med-5",
    name: "Atorvastatin 20mg",
    genericName: "Atorvastatin Calcium",
    category: "tablet",
    manufacturer: "Pfizer Healthcare",
    currentStock: 510,
    minStockLevel: 60,
    maxStockLevel: 1000,
    reorderLevel: 120,
    purchasePrice: 5.5,
    sellingPrice: 12.0,
    expiryDate: "2026-06-12", // Expired! (current date is 2026-07)
    batchNumber: "ATR-9021",
    requiresPrescription: true,
    isActive: true
  },
  {
    id: "med-6",
    name: "Paracetamol 650mg",
    genericName: "Acetaminophen",
    category: "tablet",
    manufacturer: "GSK Consumer Healthcare",
    currentStock: 1200,
    minStockLevel: 150,
    maxStockLevel: 3000,
    reorderLevel: 250,
    purchasePrice: 0.8,
    sellingPrice: 2.0,
    expiryDate: "2028-01-20",
    batchNumber: "PAR-3301",
    requiresPrescription: false,
    isActive: true
  },
  {
    id: "med-7",
    name: "Budecort Inhaler 200mcg",
    genericName: "Budesonide",
    category: "inhaler",
    manufacturer: "AstraZeneca",
    currentStock: 45,
    minStockLevel: 10,
    maxStockLevel: 100,
    reorderLevel: 15,
    purchasePrice: 180.0,
    sellingPrice: 290.0,
    expiryDate: "2027-05-05",
    batchNumber: "BDC-0094",
    requiresPrescription: true,
    isActive: true
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: "sal-1001",
    medicineId: "med-1",
    medicineName: "Amoxicillin 500mg",
    patientName: "Arun Kumar",
    patientPhone: "+91 98765 43210",
    quantity: 15,
    unitPrice: 8.0,
    totalAmount: 120.0,
    discountAmount: 10.0,
    netAmount: 110.0,
    paymentMethod: "upi",
    saleDate: "2026-06-28"
  },
  {
    id: "sal-1002",
    medicineId: "med-4",
    medicineName: "Lisinopril 10mg",
    patientName: "Meera Nair",
    patientPhone: "+91 91234 56789",
    quantity: 30,
    unitPrice: 5.0,
    totalAmount: 150.0,
    discountAmount: 0,
    netAmount: 150.0,
    paymentMethod: "cash",
    saleDate: "2026-06-29"
  },
  {
    id: "sal-1003",
    medicineId: "med-6",
    medicineName: "Paracetamol 650mg",
    patientName: "Rajesh Sharma",
    patientPhone: "+91 94567 12345",
    quantity: 20,
    unitPrice: 2.0,
    totalAmount: 40.0,
    discountAmount: 2.0,
    netAmount: 38.0,
    paymentMethod: "upi",
    saleDate: "2026-06-30"
  },
  {
    id: "sal-1004",
    medicineId: "med-2",
    medicineName: "Metformin 850mg",
    patientName: "Sanjay Gupta",
    patientPhone: "+91 93321 88990",
    quantity: 60,
    unitPrice: 4.5,
    totalAmount: 270.0,
    discountAmount: 15.0,
    netAmount: 255.0,
    paymentMethod: "card",
    saleDate: "2026-07-01"
  }
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-501",
    supplierName: "Apex Med Distributors",
    medicineName: "Metformin 850mg",
    quantity: 500,
    unitPrice: 2.2,
    totalCost: 1100.0,
    orderDate: "2026-06-25",
    status: "received"
  },
  {
    id: "po-502",
    supplierName: "Abbott Direct Channels",
    medicineName: "Amoxicillin 500mg",
    quantity: 300,
    unitPrice: 4.5,
    totalCost: 1350.0,
    orderDate: "2026-06-30",
    status: "pending"
  }
];

export default function PharmacyDashboard({ onBackToLanding }: PharmacyDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "dispensing" | "alerts" | "orders">("overview");

  // Load from localStorage or initialize
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem("cura_pharmacy_medicines");
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem("cura_pharmacy_sales");
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("cura_pharmacy_orders");
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("cura_pharmacy_medicines", JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem("cura_pharmacy_sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("cura_pharmacy_orders", JSON.stringify(orders));
  }, [orders]);

  // Inventory Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals / Action States
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [selectedMedForAdjust, setSelectedMedForAdjust] = useState<Medicine | null>(null);

  // New Medicine Form State
  const [newMed, setNewMed] = useState<Partial<Medicine>>({
    name: "",
    genericName: "",
    category: "tablet",
    manufacturer: "",
    currentStock: 100,
    minStockLevel: 20,
    maxStockLevel: 1000,
    reorderLevel: 30,
    purchasePrice: 1.0,
    sellingPrice: 2.5,
    expiryDate: "2027-12-31",
    batchNumber: "BAT-" + Math.floor(1000 + Math.random() * 9000),
    requiresPrescription: true,
    isActive: true
  });

  // Adjust Stock Form State
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<"addition" | "subtraction">("addition");

  // Dispensing Form State
  const [dispensePatientName, setDispensePatientName] = useState("");
  const [dispensePatientPhone, setDispensePatientPhone] = useState("");
  const [dispenseMedId, setDispenseMedId] = useState("");
  const [dispenseQty, setDispenseQty] = useState<number>(1);
  const [dispensePayment, setDispensePayment] = useState<"cash" | "card" | "upi" | "insurance">("upi");
  const [dispenseDiscount, setDispenseDiscount] = useState<number>(0);
  const [whatsappDispatched, setWhatsappDispatched] = useState(false);
  const [dispenseSuccess, setDispenseSuccess] = useState(false);

  // New Purchase Order Form State
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState("");
  const [orderMedName, setOrderMedName] = useState("");
  const [orderQty, setOrderQty] = useState<number>(100);
  const [orderPrice, setOrderPrice] = useState<number>(1.5);

  // Stats Counters
  const totalStockItems = medicines.reduce((sum, item) => sum + (item.isActive ? 1 : 0), 0);
  
  const lowStockItems = medicines.filter(
    item => item.isActive && item.currentStock <= item.reorderLevel
  );

  const currentDateObj = new Date("2026-07-03"); // fixed simulation date from context
  const expiringSoonItems = medicines.filter(item => {
    if (!item.isActive) return false;
    const expDate = new Date(item.expiryDate);
    const diffTime = expDate.getTime() - currentDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60; // next 60 days
  });

  const expiredItems = medicines.filter(item => {
    if (!item.isActive) return false;
    const expDate = new Date(item.expiryDate);
    return expDate.getTime() < currentDateObj.getTime();
  });

  const totalSalesRevenue = sales.reduce((sum, item) => sum + item.netAmount, 0);
  const totalPurchaseCost = orders.reduce((sum, item) => sum + (item.status === "received" ? item.totalCost : 0), 0);
  const grossProfit = totalSalesRevenue - sales.reduce((sum, s) => {
    const med = medicines.find(m => m.id === s.medicineId);
    const cost = med ? med.purchasePrice : s.unitPrice * 0.5;
    return sum + (cost * s.quantity);
  }, 0);

  // Add Medicine Action
  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;

    const created: Medicine = {
      id: "med-" + Date.now(),
      name: newMed.name,
      genericName: newMed.genericName || "",
      category: (newMed.category || "tablet") as any,
      manufacturer: newMed.manufacturer || "Generic Pharma",
      currentStock: Number(newMed.currentStock) || 0,
      minStockLevel: Number(newMed.minStockLevel) || 10,
      maxStockLevel: Number(newMed.maxStockLevel) || 1000,
      reorderLevel: Number(newMed.reorderLevel) || 20,
      purchasePrice: Number(newMed.purchasePrice) || 0,
      sellingPrice: Number(newMed.sellingPrice) || 0,
      expiryDate: newMed.expiryDate || "2027-12-31",
      batchNumber: newMed.batchNumber || "GEN-01",
      requiresPrescription: newMed.requiresPrescription !== undefined ? newMed.requiresPrescription : true,
      isActive: true
    };

    setMedicines(prev => [...prev, created]);
    setShowAddMedModal(false);
    // Reset form
    setNewMed({
      name: "",
      genericName: "",
      category: "tablet",
      manufacturer: "",
      currentStock: 100,
      minStockLevel: 20,
      maxStockLevel: 1000,
      reorderLevel: 30,
      purchasePrice: 1.0,
      sellingPrice: 2.5,
      expiryDate: "2027-12-31",
      batchNumber: "BAT-" + Math.floor(1000 + Math.random() * 9000),
      requiresPrescription: true,
      isActive: true
    });
  };

  // Adjust Stock Action
  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForAdjust || adjustQty <= 0) return;

    setMedicines(prev => prev.map(m => {
      if (m.id === selectedMedForAdjust.id) {
        const delta = adjustType === "addition" ? adjustQty : -adjustQty;
        const nextStock = Math.max(0, m.currentStock + delta);
        return { ...m, currentStock: nextStock };
      }
      return m;
    }));

    // Record dynamic stock movement in simulated PO or adjustment logs if needed
    if (adjustType === "addition") {
      const newPO: PurchaseOrder = {
        id: "po-" + Date.now(),
        supplierName: "Manual Adjustment Addition",
        medicineName: selectedMedForAdjust.name,
        quantity: adjustQty,
        unitPrice: selectedMedForAdjust.purchasePrice,
        totalCost: adjustQty * selectedMedForAdjust.purchasePrice,
        orderDate: new Date().toISOString().split("T")[0],
        status: "received"
      };
      setOrders(prev => [newPO, ...prev]);
    }

    setShowAdjustStockModal(false);
    setSelectedMedForAdjust(null);
    setAdjustQty(0);
  };

  // Dispensing & Notification Action
  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicines.find(m => m.id === dispenseMedId);
    if (!med || !dispensePatientName || dispenseQty <= 0) return;

    if (med.currentStock < dispenseQty) {
      alert(`Insufficient stock! Only ${med.currentStock} units available.`);
      return;
    }

    const total = med.sellingPrice * dispenseQty;
    const net = Math.max(0, total - dispenseDiscount);

    const newSale: Sale = {
      id: "sal-" + Math.floor(1000 + Math.random() * 9000),
      medicineId: med.id,
      medicineName: med.name,
      patientName: dispensePatientName,
      patientPhone: dispensePatientPhone || "+91 99000 00000",
      quantity: dispenseQty,
      unitPrice: med.sellingPrice,
      totalAmount: total,
      discountAmount: dispenseDiscount,
      netAmount: net,
      paymentMethod: dispensePayment,
      saleDate: new Date().toISOString().split("T")[0]
    };

    // Update medication stock
    setMedicines(prev => prev.map(m => {
      if (m.id === med.id) {
        return { ...m, currentStock: m.currentStock - dispenseQty };
      }
      return m;
    }));

    setSales(prev => [newSale, ...prev]);
    setDispenseSuccess(true);
    setWhatsappDispatched(true);

    // Auto dismiss notification state after some seconds
    setTimeout(() => {
      setWhatsappDispatched(false);
    }, 8000);

    // Reset dispensing inputs
    setDispensePatientName("");
    setDispensePatientPhone("");
    setDispenseMedId("");
    setDispenseQty(1);
    setDispenseDiscount(0);
  };

  // Add Purchase Order Action
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSupplier || !orderMedName) return;

    const newPO: PurchaseOrder = {
      id: "po-" + Date.now(),
      supplierName: orderSupplier,
      medicineName: orderMedName,
      quantity: orderQty,
      unitPrice: orderPrice,
      totalCost: orderQty * orderPrice,
      orderDate: new Date().toISOString().split("T")[0],
      status: "pending"
    };

    setOrders(prev => [newPO, ...prev]);
    setShowAddOrderModal(false);
    setOrderSupplier("");
    setOrderMedName("");
    setOrderQty(100);
    setOrderPrice(1.5);
  };

  // Mark Order as Received
  const handleReceiveOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Try to find matching medicine in catalog to top up stock
    setMedicines(prev => {
      const exists = prev.some(m => m.name.toLowerCase().includes(targetOrder.medicineName.toLowerCase()));
      if (exists) {
        return prev.map(m => {
          if (m.name.toLowerCase().includes(targetOrder.medicineName.toLowerCase())) {
            return { ...m, currentStock: m.currentStock + targetOrder.quantity };
          }
          return m;
        });
      } else {
        // Create new item dynamically if not found
        const newlyDiscovered: Medicine = {
          id: "med-" + Date.now(),
          name: targetOrder.medicineName,
          genericName: "Generic Compound",
          category: "tablet",
          manufacturer: targetOrder.supplierName,
          currentStock: targetOrder.quantity,
          minStockLevel: 20,
          maxStockLevel: 1000,
          reorderLevel: 30,
          purchasePrice: targetOrder.unitPrice,
          sellingPrice: Math.round(targetOrder.unitPrice * 2.2 * 10) / 10,
          expiryDate: "2028-12-31",
          batchNumber: "PO-RECV-" + Math.floor(100 + Math.random() * 900),
          requiresPrescription: true,
          isActive: true
        };
        return [...prev, newlyDiscovered];
      }
    });

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: "received" };
      }
      return o;
    }));
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate high level category pie chart data
  const getCategoryChartData = () => {
    const counts: Record<string, number> = {};
    medicines.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
  };

  // Sales Trends chart data
  const getSalesTrendData = () => {
    // Return sample timeline of sales by date
    const daily: Record<string, number> = {
      "2026-06-25": 180,
      "2026-06-26": 240,
      "2026-06-27": 195,
      "2026-06-28": 120,
      "2026-06-29": 150,
      "2026-06-30": 40,
      "2026-07-01": 270,
      "2026-07-02": 310,
      "2026-07-03": dispenseSuccess ? 180 : 0
    };

    // Override or append actual sales
    sales.forEach(sale => {
      if (daily[sale.saleDate] !== undefined) {
        daily[sale.saleDate] += sale.netAmount;
      } else {
        daily[sale.saleDate] = sale.netAmount;
      }
    });

    return Object.entries(daily).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      amount
    })).slice(-7); // Last 7 days
  };

  const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6", "#14b8a6"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3.5 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToLanding}
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl bg-emerald-500 text-slate-950 p-1.5 rounded-xl font-black">
              <Pill className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white uppercase flex items-center gap-2">
                CURA Pharmacy Portal
                <span className="text-[8.5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest leading-none">
                  Included
                </span>
              </h1>
              <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Clinical Inventory & Dispensing Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Indicators */}
          {(lowStockItems.length > 0 || expiredItems.length > 0) && (
            <div 
              onClick={() => setActiveTab("alerts")}
              className="relative cursor-pointer bg-slate-900 hover:bg-slate-850 p-2 rounded-xl border border-slate-800 transition-all flex items-center justify-center"
              title="Stock Alerts Active"
            >
              <Bell className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                {lowStockItems.length + expiredItems.length}
              </span>
            </div>
          )}

          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-[9.5px] font-black text-white">CENTRAL PHARMACY</span>
            <span className="text-[8.5px] text-emerald-400 font-bold tracking-widest uppercase">● SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* FLOATING WHATSAPP BROADCAST CONFIRMATION */}
      <AnimatePresence>
        {whatsappDispatched && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 border-2 border-emerald-500/40 p-4.5 rounded-2xl shadow-2xl shadow-emerald-500/10 backdrop-blur-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl">
                <Send className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">WhatsApp Dispatched</h4>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    SIMULATED
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  A real-time prescription dispatch receipt has been compiled and messaged to the patient.
                </p>
                <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-emerald-400 leading-normal space-y-0.5 mt-2">
                  <p className="font-bold text-white">💬 CURA Dispense Receipt:</p>
                  <p>Patient: {dispensePatientName || "Anonymous"}</p>
                  <p>Rx Item: Metformin or selected compound</p>
                  <p>Message: "Hello, your order is ready for collection at Central Pharmacy. Total: INR."</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* COMPREHENSIVE SUB-NAVIGATION TABS */}
        <div className="flex overflow-x-auto pb-1 bg-slate-900/50 border border-slate-900 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "inventory"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <Package className="h-4 w-4" />
            Inventory ({totalStockItems})
          </button>
          <button
            onClick={() => setActiveTab("dispensing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "dispensing"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Dispense (POS)
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "alerts"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Stock Alerts
            {(lowStockItems.length > 0 || expiredItems.length > 0) && (
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black leading-none">
                {lowStockItems.length + expiredItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <Truck className="h-4 w-4" />
            Purchase Orders
          </button>
        </div>

        {/* ======================= OVERVIEW TAB ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* KPI STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gross Sales Revenue</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">₹{totalSalesRevenue.toLocaleString("en-IN")}</span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">▲ 12%</span>
                </div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase">All transactions cleared</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Estimated Margin Profit</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-emerald-400">₹{grossProfit.toLocaleString("en-IN")}</span>
                  <span className="text-[9px] text-slate-500 font-bold">({Math.round((grossProfit / (totalSalesRevenue || 1)) * 100)}%)</span>
                </div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase">Based on batch margins</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-black ${lowStockItems.length > 0 ? "text-amber-400" : "text-white"}`}>
                    {lowStockItems.length}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">SKUs</span>
                </div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase">Below safety trigger level</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Expired Compounds</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-black ${expiredItems.length > 0 ? "text-rose-500 animate-pulse" : "text-white"}`}>
                    {expiredItems.length}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">SKUs</span>
                </div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase">Requires clinical removal</p>
              </div>
            </div>

            {/* CHARTS SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sales Trend Recharts */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Pharmacy Sales Performance</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Historical trend tracking over last 7 days</p>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-wider">
                    Gross Volume
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getSalesTrendData()} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} 
                        labelStyle={{ fontSize: 9, color: "#94a3b8", fontWeight: "bold" }}
                        itemStyle={{ fontSize: 10, color: "#0ea5e9" }}
                        formatter={(value: any) => [`₹${value}`, 'Daily Sales']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#0ea5e9" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#salesGlow)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Categorical Breakdown Recharts */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Category Distribution</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Inventory distribution by formulation</p>
                </div>

                <div className="h-44 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {getCategoryChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} 
                        itemStyle={{ fontSize: 9 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend center text */}
                  <div className="absolute text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Total SKUs</span>
                    <span className="text-lg font-black text-white">{medicines.length}</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  {getCategoryChartData().map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* INTEGRATED CLINICAL ADVANTAGES BANNER */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-slate-900/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-3 items-start md:items-center">
                <span className="p-2 bg-emerald-500 text-slate-950 rounded-xl leading-none">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Clinical Differentiation Advantage</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Unlike standard platforms like NeftX and Healthray which charge extra for core pharmacy workflows, CURA includes fully integrated stock tracking, automated alerts, and WhatsApp dispensing notification capabilities at zero extra cost.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab("dispensing")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Dispense Now
                </button>
              </div>
            </div>

            {/* RECENT SALES ACTIVITY TABLE */}
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Recent Dispensing Activity</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Real-time prescription logs completed by Central Pharmacy</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="pb-2">Sale ID</th>
                      <th className="pb-2">Medicine / Drug SKU</th>
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Total Net</th>
                      <th className="pb-2 text-center">Payment</th>
                      <th className="pb-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all">
                        <td className="py-2.5 font-mono text-[10px] text-slate-400">{sale.id}</td>
                        <td className="py-2.5 font-bold text-white">
                          {sale.medicineName}
                        </td>
                        <td className="py-2.5 text-slate-300">
                          <div>{sale.patientName}</div>
                          <div className="text-[8.5px] text-slate-500">{sale.patientPhone}</div>
                        </td>
                        <td className="py-2.5 text-slate-400 font-mono">{sale.quantity}</td>
                        <td className="py-2.5 text-right text-slate-400 font-mono">₹{sale.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-black text-emerald-400 font-mono">₹{sale.netAmount.toFixed(2)}</td>
                        <td className="py-2.5 text-center">
                          <span className="text-[8.5px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-400 font-mono text-[10px]">{sale.saleDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= INVENTORY TAB ======================= */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            
            {/* ACTION & SEARCH BAR */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search medicines by name, generic ingredient, batch, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">All Formulations</option>
                  <option value="tablet">Tablets</option>
                  <option value="capsule">Capsules</option>
                  <option value="syrup">Syrups</option>
                  <option value="injection">Injections</option>
                  <option value="ointment">Ointments</option>
                  <option value="drops">Drops</option>
                  <option value="inhaler">Inhalers</option>
                </select>

                <button 
                  onClick={() => setShowAddMedModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3px]" /> Add Medicine
                </button>
              </div>
            </div>

            {/* INVENTORY CATALOG GRID */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-900/20">
                      <th className="p-4">Drug / Brand Name</th>
                      <th className="p-4">Generic Ingredient</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Current Stock</th>
                      <th className="p-4 text-right">Buy / Sell Price</th>
                      <th className="p-4 text-center">Batch / Expiry</th>
                      <th className="p-4 text-center">Prescription</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((item) => {
                      const isLow = item.currentStock <= item.reorderLevel;
                      const isCriticallyLow = item.currentStock <= item.reorderLevel / 2;
                      
                      const expDate = new Date(item.expiryDate);
                      const isExpired = expDate.getTime() < currentDateObj.getTime();
                      const isExpiringSoon = !isExpired && (expDate.getTime() - currentDateObj.getTime() <= 60 * 24 * 60 * 60 * 1000);

                      return (
                        <tr 
                          key={item.id} 
                          className="border-b border-slate-900 hover:bg-slate-900/20 transition-all"
                        >
                          <td className="p-4">
                            <div className="font-bold text-white text-xs">{item.name}</div>
                            <div className="text-[8.5px] text-slate-500 font-semibold uppercase">{item.manufacturer}</div>
                          </td>
                          <td className="p-4 text-slate-300 italic max-w-[150px] truncate">{item.genericName}</td>
                          <td className="p-4">
                            <span className="text-[8.5px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className={`font-mono font-black ${
                              isCriticallyLow ? "text-rose-500 font-extrabold animate-pulse" : isLow ? "text-amber-400" : "text-white"
                            }`}>
                              {item.currentStock}
                            </div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase">Min: {item.reorderLevel}</div>
                          </td>
                          <td className="p-4 text-right font-mono">
                            <div className="text-slate-400">B: ₹{item.purchasePrice.toFixed(2)}</div>
                            <div className="text-emerald-400 font-bold">S: ₹{item.sellingPrice.toFixed(2)}</div>
                          </td>
                          <td className="p-4 text-center font-mono">
                            <div className="text-[9.5px] text-slate-400">{item.batchNumber}</div>
                            <div className={`text-[9.5px] font-bold ${
                              isExpired ? "text-rose-500" : isExpiringSoon ? "text-amber-400" : "text-slate-500"
                            }`}>
                              {item.expiryDate} {isExpired && "⚠️"}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              item.requiresPrescription 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {item.requiresPrescription ? "Rx Req" : "OTC"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedMedForAdjust(item);
                                setShowAdjustStockModal(true);
                              }}
                              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= DISPENSING TAB ======================= */}
        {activeTab === "dispensing" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* POS DISPENSING INTERACTION FORM */}
            <div className="lg:col-span-3 bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Dispense Prescription SKU</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Select medicine, compute clinical pricing, and trigger WhatsApp notification</p>
              </div>

              <form onSubmit={handleDispense} className="space-y-4.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Patient Full Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Arun Kumar"
                      value={dispensePatientName}
                      onChange={(e) => setDispensePatientName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Patient Phone Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={dispensePatientPhone}
                      onChange={(e) => setDispensePatientPhone(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Select Compound SKU *</label>
                  <select 
                    required
                    value={dispenseMedId}
                    onChange={(e) => setDispenseMedId(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Select Medicine --</option>
                    {medicines.filter(m => m.isActive).map(m => (
                      <option key={m.id} value={m.id} disabled={m.currentStock === 0}>
                        {m.name} ({m.currentStock} in stock) - ₹{m.sellingPrice}/unit
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Dispense Qty *</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      value={dispenseQty}
                      onChange={(e) => setDispenseQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Discount (₹)</label>
                    <input 
                      type="number"
                      min={0}
                      value={dispenseDiscount}
                      onChange={(e) => setDispenseDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Payment Method</label>
                    <select 
                      value={dispensePayment}
                      onChange={(e) => setDispensePayment(e.target.value as any)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="upi">UPI / QR Code</option>
                      <option value="cash">Cash Payment</option>
                      <option value="card">Card Terminal</option>
                      <option value="insurance">Insurance Claim</option>
                    </select>
                  </div>
                </div>

                {/* DYNAMIC BILLING COMPUTATION PREVIEW */}
                {(() => {
                  const selected = medicines.find(m => m.id === dispenseMedId);
                  if (!selected) return null;

                  const rawTotal = selected.sellingPrice * dispenseQty;
                  const finalTotal = Math.max(0, rawTotal - dispenseDiscount);

                  return (
                    <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-2 font-mono">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Billing Computation Summary</span>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{selected.name} x {dispenseQty}</span>
                        <span>₹{rawTotal.toFixed(2)}</span>
                      </div>
                      {dispenseDiscount > 0 && (
                        <div className="flex justify-between text-xs text-rose-400">
                          <span>Special Discount Accent</span>
                          <span>-₹{dispenseDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Simulated CGST/SGST (5.0%)</span>
                        <span>₹{(finalTotal * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-900 my-1" />
                      <div className="flex justify-between text-sm font-black text-emerald-400">
                        <span>NET PAYABLE TOTAL</span>
                        <span>₹{(finalTotal * 1.05).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="h-4.5 w-4.5 stroke-[2.5px]" /> Complete Dispense & Send WhatsApp Notification
                </button>
              </form>
            </div>

            {/* INTEGRATED WHATSAPP NOTIFICATION PREVIEW & HISTORICAL LOGS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* WHATSAPP LAYOUT PREVIEW */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">WhatsApp Template Layout</h3>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-inner">
                  {/* Mock WhatsApp Header */}
                  <div className="bg-slate-900 p-3 flex items-center gap-2.5 border-b border-slate-950">
                    <span className="h-7 w-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">C</span>
                    <div>
                      <h4 className="text-[11px] font-black text-white">CURA Clinical Alerts</h4>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Verified Account</p>
                    </div>
                  </div>

                  {/* Mock Chat Canvas */}
                  <div className="p-4 bg-slate-900/40 space-y-3 min-h-[180px] flex flex-col justify-end">
                    
                    {/* Incoming system text */}
                    <div className="max-w-[85%] bg-slate-850 border border-slate-800/60 p-3 rounded-2xl rounded-tl-none self-start space-y-1">
                      <p className="text-[10px] text-slate-300 leading-normal">
                        Hello! This is <span className="text-white font-bold">CURA Central Pharmacy</span>.
                      </p>
                      <p className="text-[10px] text-slate-300 leading-normal">
                        Your clinical prescription has been dispensed successfully. Please pick it up at your convenience.
                      </p>
                      <div className="bg-slate-950/60 p-2 rounded-lg text-[9px] font-mono text-emerald-400 leading-normal border border-slate-900">
                        <p className="text-white font-bold">📄 ORDER RECEIPT:</p>
                        <p>ID: TXN-CURA-4491</p>
                        <p>Status: Ready for Collection</p>
                        <p>Total: Paid with UPI</p>
                      </div>
                      <span className="text-[8px] text-slate-500 font-bold block text-right">10:44 PM</span>
                    </div>

                  </div>
                </div>

                <p className="text-[9.5px] text-slate-400 leading-normal text-center italic bg-slate-900/10 p-2 rounded-lg">
                  Every transaction automatically compiles a localized invoice receipt and triggers WhatsApp broadcasts via verified API nodes.
                </p>
              </div>

              {/* RECENT REVENUE METRIC SUMMARY CARDS */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-3.5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Dispensing Analytics</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Orders Settled</span>
                    <span className="font-bold text-white font-mono">{sales.length} orders</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Avg Transaction Value</span>
                    <span className="font-bold text-white font-mono">₹{Math.round(totalSalesRevenue / (sales.length || 1))}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================= STOCK ALERTS TAB ======================= */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            
            {/* ALERT OVERVIEW HEADER */}
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-1.5">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                Live Inventory Safety Panel
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Review below all clinical drugs requiring restocking actions or safe medical disposal due to shelf-life expiration constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LOW STOCK ALERT COLUMN */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    Low Stock Warnings ({lowStockItems.length})
                  </h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Compounds currently below designated reorder threshold</p>
                </div>

                <div className="space-y-3">
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 italic">No low-stock events currently flagged.</div>
                  ) : (
                    lowStockItems.map(item => (
                      <div key={item.id} className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[9.5px] text-slate-400 uppercase font-bold">{item.category} • {item.manufacturer}</p>
                          <div className="text-[9.5px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg inline-block font-bold">
                            Safety Minimum: {item.reorderLevel} units
                          </div>
                        </div>

                        <div className="text-right space-y-1.5">
                          <p className="text-lg font-mono font-black text-amber-400">{item.currentStock}</p>
                          <button
                            onClick={() => {
                              setSelectedMedForAdjust(item);
                              setAdjustType("addition");
                              setShowAdjustStockModal(true);
                            }}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Order Stock
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* EXPIRY ALERT COLUMN */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    Expiry Alerts ({expiringSoonItems.length + expiredItems.length})
                  </h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Shelf life alerts currently tracked</p>
                </div>

                <div className="space-y-3">
                  {expiredItems.map(item => (
                    <div key={item.id} className="bg-slate-950/80 border-2 border-rose-500/20 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[9.5px] text-slate-400 uppercase font-bold">Batch: {item.batchNumber}</p>
                        <span className="text-[8.5px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-lg inline-block font-bold uppercase tracking-widest">
                          EXPIRED: {item.expiryDate}
                        </span>
                      </div>
                      <span className="text-xs bg-rose-500/10 text-rose-400 p-1.5 rounded-xl">⚠️ Expired</span>
                    </div>
                  ))}

                  {expiringSoonItems.map(item => (
                    <div key={item.id} className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[9.5px] text-slate-400 uppercase font-bold">Batch: {item.batchNumber}</p>
                        <span className="text-[8.5px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-lg inline-block font-bold uppercase tracking-widest">
                          EXPIRING SOON: {item.expiryDate}
                        </span>
                      </div>
                      <span className="text-xs bg-amber-500/10 text-amber-400 p-1.5 rounded-xl">⏰ Soon</span>
                    </div>
                  ))}

                  {expiringSoonItems.length === 0 && expiredItems.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500 italic">No expiring compounds currently flagged.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================= PURCHASE ORDERS TAB ======================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            
            {/* ACTION BAR */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Purchase Order Fulfillment</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Procure inventory from pharmaceutical suppliers</p>
              </div>

              <button 
                onClick={() => setShowAddOrderModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3px]" /> Create Purchase Order
              </button>
            </div>

            {/* PURCHASE ORDERS LIST */}
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-900/20">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Supplier Distributor</th>
                      <th className="p-3">Medicine SKU</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Cost</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all">
                        <td className="p-3 font-mono text-[10px] text-slate-400">{ord.id}</td>
                        <td className="p-3 font-bold text-white">{ord.supplierName}</td>
                        <td className="p-3 text-slate-300">{ord.medicineName}</td>
                        <td className="p-3 text-center font-mono text-slate-300">{ord.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-400">₹{ord.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-black text-emerald-400">₹{ord.totalCost.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[8.5px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            ord.status === "received" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {ord.status === "pending" ? (
                            <button
                              onClick={() => handleReceiveOrder(ord.id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Receive Stock
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic flex items-center justify-end gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Stock Top-Up Complete
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* ADD MEDICINE MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-emerald-400" />
                Add Medicine SKU
              </h3>
              <button 
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Drug / Brand Name *</label>
                  <input 
                    type="text"
                    required
                    value={newMed.name}
                    onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Generic Ingredient</label>
                  <input 
                    type="text"
                    value={newMed.genericName}
                    onChange={(e) => setNewMed(prev => ({ ...prev, genericName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Category Formulation</label>
                  <select 
                    value={newMed.category}
                    onChange={(e) => setNewMed(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Batch Number</label>
                  <input 
                    type="text"
                    value={newMed.batchNumber}
                    onChange={(e) => setNewMed(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Expiry Date</label>
                  <input 
                    type="date"
                    value={newMed.expiryDate}
                    onChange={(e) => setNewMed(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Initial Stock</label>
                  <input 
                    type="number"
                    value={newMed.currentStock}
                    onChange={(e) => setNewMed(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Buy Price (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={newMed.purchasePrice}
                    onChange={(e) => setNewMed(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Sell Price (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={newMed.sellingPrice}
                    onChange={(e) => setNewMed(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase">Manufacturer</label>
                  <input 
                    type="text"
                    value={newMed.manufacturer}
                    onChange={(e) => setNewMed(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox"
                    id="new_med_rx"
                    checked={newMed.requiresPrescription}
                    onChange={(e) => setNewMed(prev => ({ ...prev, requiresPrescription: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="new_med_rx" className="text-xs font-bold text-slate-300 cursor-pointer">
                    Requires Prescription (Rx Req)
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Insert SKU into Inventory Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {showAdjustStockModal && selectedMedForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Adjust SKU Inventory
              </h3>
              <button 
                onClick={() => {
                  setShowAdjustStockModal(false);
                  setSelectedMedForAdjust(null);
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs text-slate-400 space-y-1">
              <p className="font-bold text-white">{selectedMedForAdjust.name}</p>
              <p>Current Batch: {selectedMedForAdjust.batchNumber}</p>
              <p>Current Stock Level: <span className="font-bold text-white font-mono">{selectedMedForAdjust.currentStock} units</span></p>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("addition")}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                      adjustType === "addition"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-black"
                        : "bg-transparent text-slate-400 border-slate-800"
                    }`}
                  >
                    Add Qty (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("subtraction")}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                      adjustType === "subtraction"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30 font-black"
                        : "bg-transparent text-slate-400 border-slate-800"
                    }`}
                  >
                    Deduct Qty (-)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Quantity Delta *</label>
                <input 
                  type="number"
                  required
                  min={1}
                  value={adjustQty || ""}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
              >
                Apply Inventory Modification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Create Purchase Order
              </h3>
              <button 
                onClick={() => setShowAddOrderModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Supplier Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Apex Med Distributors"
                  value={orderSupplier}
                  onChange={(e) => setOrderSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Medicine SKU Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Metformin 850mg"
                  value={orderMedName}
                  onChange={(e) => setOrderMedName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Order Qty *</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Supplier Unit Price (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    min={0.1}
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs font-mono flex justify-between text-slate-400">
                <span>Total Procure Cost</span>
                <span className="font-bold text-emerald-400">₹{(orderQty * orderPrice).toFixed(2)}</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
              >
                Dispatch Purchase Order
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

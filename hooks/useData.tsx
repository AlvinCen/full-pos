import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Product, Sale, KdsOrder, KdsOrderStatus, Category, Unit, BilliardTable, Session, PricelistPackage, TableStatus, SessionStatus, FnbOrderItem, Outlet, RoundingMethod, PricingUnit, Shift, CashMovement, ShiftStatus, CashMovementType, User, PaymentMethod, SaleStatus, AuditLog, AuditLogAction } from '../types';
import { PRODUCTS, initialSales, CATEGORIES, UNITS, BILLIARD_TABLES, PRICELIST_PACKAGES, OUTLETS, initialShifts, initialCashMovements, initialAuditLogs } from '../constants';
import { useAuth } from './useAuth';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  kdsOrders: KdsOrder[];
  categories: Category[];
  units: Unit[];
  outlet: Outlet;
  addSale: (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date' | 'shiftId' | 'status'>) => Sale;
  voidSale: (saleId: string, reason: string) => void;
  updateKdsOrderStatus: (orderId: string, status: KdsOrderStatus) => void;
  updateKdsItemStatus: (orderId: string, itemId: string, status: KdsOrderStatus) => void;
  getProductById: (id: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getUnitById: (id: string) => Unit | undefined;
  addProduct: (productData: Omit<Product, 'id'>) => { success: boolean, message?: string };
  updateProduct: (updatedProduct: Product) => { success: boolean, message?: string };
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => { success: boolean; message?: string };
  addUnit: (name: string, precision: number) => void;
  updateUnit: (id: string, name: string, precision: number) => void;
  deleteUnit: (id: string) => { success: boolean; message?: string };
  updateOutlet: (updatedData: Partial<Outlet>) => void;
  // Billiard
  billiardTables: BilliardTable[];
  sessions: Session[];
  pricelistPackages: PricelistPackage[];
  addPricelistPackage: (pkg: Omit<PricelistPackage, 'id'>) => void;
  updatePricelistPackage: (pkg: PricelistPackage) => void;
  deletePricelistPackage: (id: string) => void;
  addBilliardTable: (tableData: Omit<BilliardTable, 'id' | 'status' | 'currentSessionId'>) => { success: boolean, message?: string };
  updateBilliardTable: (table: Omit<BilliardTable, 'status' | 'currentSessionId'>) => { success: boolean, message?: string };
  deleteBilliardTable: (id: string) => { success: boolean, message?: string };
  startBilliardSession: (tableId: string, packageId: string) => void;
  pauseBilliardSession: (sessionId: string) => void;
  resumeBilliardSession: (sessionId: string) => void;
  stopBilliardSession: (sessionId: string) => Session;
  addFnbToSession: (sessionId: string, product: Product, qty: number) => void;
  // Shifts
  shifts: Shift[];
  cashMovements: CashMovement[];
  activeShift: Shift | null;
  startShift: (startCash: number) => Shift;
  endShift: (endCash: number, notes: string) => Shift;
  addCashMovement: (type: CashMovementType, amount: number, notes: string) => void;
  getShiftCashMovements: (shiftId: string) => CashMovement[];
  getShiftSales: (shiftId: string) => Sale[];
  // Audit Logs
  auditLogs: AuditLog[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const calculateSessionBill = (session: Session, currentTime: number): Partial<Session> => {
    if (session.status === SessionStatus.ENDED || !session.packageSnapshot) return {};

    const pkg = session.packageSnapshot;

    let currentPauseDuration = 0;
    if(session.status === SessionStatus.PAUSED && session.pauseTime) {
        currentPauseDuration = currentTime - session.pauseTime;
    }
    const durationMs = currentTime - session.startTime - session.totalPauseDuration - currentPauseDuration;
    const durationMinutes = Math.max(0, durationMs / 60000);

    let timeCharge = 0;
    
    // Apply grace period
    let billableMinutes = Math.max(0, durationMinutes - pkg.graceMinutes);
    
    if (billableMinutes > 0) {
        // Apply minimum billing time
        billableMinutes = Math.max(billableMinutes, pkg.minBillMinutes);

        // Apply rounding
        let roundedMinutes = billableMinutes;
        switch (pkg.rounding) {
            case RoundingMethod.UP_5:
                roundedMinutes = Math.ceil(billableMinutes / 5) * 5;
                break;
            case RoundingMethod.UP_10:
                roundedMinutes = Math.ceil(billableMinutes / 10) * 10;
                break;
            case RoundingMethod.UP_15:
                roundedMinutes = Math.ceil(billableMinutes / 15) * 15;
                break;
        }

        // Calculate units based on rounded minutes
        let billableUnits = 0;
        switch (pkg.unit) {
            case PricingUnit.PER_MINUTE:
                billableUnits = roundedMinutes;
                break;
            case PricingUnit.PER_15_MINUTES:
                billableUnits = roundedMinutes / 15;
                break;
            case PricingUnit.PER_HOUR:
                billableUnits = roundedMinutes / 60;
                break;
        }
        
        timeCharge = billableUnits * pkg.pricePerUnit;
    }

    const fnbCharge = session.fnbItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    return {
        durationMs,
        timeCharge,
        fnbCharge,
        totalCharge: timeCharge + fnbCharge,
    };
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [kdsOrders, setKdsOrders] = useState<KdsOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [units, setUnits] = useState<Unit[]>(UNITS);
  const [outlet, setOutlet] = useState<Outlet>(OUTLETS[0]);
  // Billiard State
  const [billiardTables, setBilliardTables] = useState<BilliardTable[]>(BILLIARD_TABLES);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pricelistPackages, setPricelistPackages] = useState<PricelistPackage[]>(PRICELIST_PACKAGES);
  // Shift State
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(initialCashMovements);
  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  const addAuditLog = useCallback((action: AuditLogAction, details: string, entityId?: string) => {
    if (!user) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      userId: user.id,
      userName: user.name,
      action,
      details,
      entityId,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [user]);


  // Billiard Real-time Update Timer
  useEffect(() => {
    const timer = setInterval(() => {
        const now = Date.now();
        
        setSessions(prevSessions => prevSessions.map(session => {
            if (session.status !== SessionStatus.RUNNING && session.status !== SessionStatus.PAUSED) {
                return session;
            }
            const updatedBill = calculateSessionBill(session, now);
            return { ...session, ...updatedBill };
        }));
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);
  
  // Active Shift Memoization
  const activeShift = useMemo(() => {
    const openShift = shifts.find(s => s.status === ShiftStatus.OPEN);
    if (!openShift) return null;

    const shiftSales = sales.filter(sale => sale.shiftId === openShift.id);
    const shiftMovements = cashMovements.filter(cm => cm.shiftId === openShift.id);

    const cashSales = shiftSales.filter(s => s.paymentMethod === PaymentMethod.CASH).reduce((sum, s) => sum + s.total, 0);
    const qrisSales = shiftSales.filter(s => s.paymentMethod === PaymentMethod.QRIS).reduce((sum, s) => sum + s.total, 0);
    const transferSales = shiftSales.filter(s => s.paymentMethod === PaymentMethod.TRANSFER).reduce((sum, s) => sum + s.total, 0);
    const cashIn = shiftMovements.filter(cm => cm.type === CashMovementType.IN).reduce((sum, cm) => sum + cm.amount, 0);
    const cashOut = shiftMovements.filter(cm => cm.type === CashMovementType.OUT).reduce((sum, cm) => sum + cm.amount, 0);

    return {
        ...openShift,
        cashSales,
        qrisSales,
        transferSales,
        totalSales: cashSales + qrisSales + transferSales,
        cashIn,
        cashOut,
        expectedCash: openShift.startCash + cashSales + cashIn - cashOut,
    };
  }, [shifts, sales, cashMovements]);


  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);
  const getCategoryById = useCallback((id: string) => categories.find(c => c.id === id), [categories]);
  const getUnitById = useCallback((id: string) => units.find(u => u.id === id), [units]);
  
  const addProduct = useCallback((productData: Omit<Product, 'id'>): { success: boolean, message?: string } => {
    if (products.some(p => p.sku.toLowerCase() === productData.sku.toLowerCase())) {
      return { success: false, message: 'A product with this SKU already exists.' };
    }
    if (products.some(p => p.name.toLowerCase() === productData.name.toLowerCase())) {
      return { success: false, message: 'A product with this name already exists.' };
    }
    if (productData.price < 0 || productData.cost < 0 || productData.stock < 0 || productData.minStock < 0) {
      return { success: false, message: 'Price, cost, and stock values cannot be negative.' };
    }
    if (!categories.some(c => c.id === productData.categoryId)) return { success: false, message: 'Invalid category selected.' };
    if (!units.some(u => u.id === productData.unitId)) return { success: false, message: 'Invalid unit selected.' };

    const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
    addAuditLog(AuditLogAction.PRODUCT_CREATE, `Created product: ${newProduct.name} (SKU: ${newProduct.sku})`, newProduct.id);
    return { success: true };
  }, [products, categories, units, addAuditLog]);

  const updateProduct = useCallback((updatedProduct: Product): { success: boolean, message?: string } => {
    if (products.some(p => p.id !== updatedProduct.id && p.sku.toLowerCase() === updatedProduct.sku.toLowerCase())) {
      return { success: false, message: 'A product with this SKU already exists.' };
    }
    if (products.some(p => p.id !== updatedProduct.id && p.name.toLowerCase() === updatedProduct.name.toLowerCase())) {
      return { success: false, message: 'A product with this name already exists.' };
    }
    if (updatedProduct.price < 0 || updatedProduct.cost < 0 || updatedProduct.stock < 0 || updatedProduct.minStock < 0) {
      return { success: false, message: 'Price, cost, and stock values cannot be negative.' };
    }
    
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addAuditLog(AuditLogAction.PRODUCT_UPDATE, `Updated product: ${updatedProduct.name} (SKU: ${updatedProduct.sku})`, updatedProduct.id);
    return { success: true };
  }, [products, addAuditLog]);

  const addCategory = useCallback((name: string) => {
      const newCategory = { id: `cat-${Date.now()}`, name };
      setCategories(prev => [...prev, newCategory]);
      addAuditLog(AuditLogAction.CATEGORY_CREATE, `Created category: ${name}`, newCategory.id);
  }, [addAuditLog]);
  
  const updateCategory = useCallback((id: string, name: string) => {
      setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name } : cat));
      addAuditLog(AuditLogAction.CATEGORY_UPDATE, `Updated category to name: ${name}`, id);
  }, [addAuditLog]);
  
  const deleteCategory = useCallback((id: string): { success: boolean, message?: string } => {
      if (products.some(p => p.categoryId === id)) return { success: false, message: 'Cannot delete category in use.' };
      const categoryToDelete = categories.find(c => c.id === id);
      if (categoryToDelete) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        addAuditLog(AuditLogAction.CATEGORY_DELETE, `Deleted category: ${categoryToDelete.name}`, id);
      }
      return { success: true };
  }, [products, categories, addAuditLog]);
  
  const addUnit = useCallback((name: string, precision: number) => {
      const newUnit = { id: `unit-${Date.now()}`, name, precision };
      setUnits(prev => [...prev, newUnit]);
      addAuditLog(AuditLogAction.UNIT_CREATE, `Created unit: ${name}`, newUnit.id);
  }, [addAuditLog]);
  
  const updateUnit = useCallback((id: string, name: string, precision: number) => {
      setUnits(prev => prev.map(u => u.id === id ? { ...u, name, precision } : u));
      addAuditLog(AuditLogAction.UNIT_UPDATE, `Updated unit to name: ${name}`, id);
  }, [addAuditLog]);

  const deleteUnit = useCallback((id: string): { success: boolean, message?: string } => {
      if (products.some(p => p.unitId === id)) return { success: false, message: 'Cannot delete unit in use.' };
      const unitToDelete = units.find(u => u.id === id);
      if (unitToDelete) {
        setUnits(prev => prev.filter(u => u.id !== id));
        addAuditLog(AuditLogAction.UNIT_DELETE, `Deleted unit: ${unitToDelete.name}`, id);
      }
      return { success: true };
  }, [products, units, addAuditLog]);

  const updateOutlet = useCallback((updatedData: Partial<Outlet>) => {
    setOutlet(prev => ({...prev, ...updatedData}));
  }, []);

  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date' | 'shiftId' | 'status'>): Sale => {
    if (!activeShift) {
        throw new Error("Cannot make a sale without an active shift.");
    }
    const newSale: Sale = { ...saleData, id: `sale-${Date.now()}`, invoiceNo: `INV-${String(sales.length + 1).padStart(4, '0')}`, date: new Date().toISOString(), shiftId: activeShift.id, status: SaleStatus.COMPLETED };
    setSales(prev => [...prev, newSale]);
    setProducts(prevProducts => {
      const newProducts = [...prevProducts];
      newSale.items.forEach(item => {
        const productIndex = newProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) newProducts[productIndex].stock -= item.qty;
      });
      return newProducts;
    });
    const kitchenItems = newSale.items.filter(item => getProductById(item.productId)?.isKitchen);
    if (kitchenItems.length > 0) {
      const newKdsOrder: KdsOrder = {
        id: `kds-${Date.now()}`, saleId: newSale.id, saleInvoiceNo: newSale.invoiceNo, status: KdsOrderStatus.NEW, createdAt: new Date().toISOString(),
        items: kitchenItems.map(item => ({ id: `kds-item-${item.id}`, kdsOrderId: `kds-${Date.now()}`, productId: item.productId, qty: item.qty, status: KdsOrderStatus.NEW })),
      };
      setKdsOrders(prev => [...prev, newKdsOrder]);
    }
    return newSale;
  }, [sales, getProductById, activeShift]);
  
  const voidSale = useCallback((saleId: string, reason: string) => {
    const saleToVoid = sales.find(s => s.id === saleId);
    if (!saleToVoid || saleToVoid.status !== SaleStatus.COMPLETED) {
        throw new Error("Sale cannot be voided.");
    }

    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: SaleStatus.VOIDED, notes: `Voided: ${reason}` } : s));
    
    // Add stock back
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        saleToVoid.items.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                newProducts[productIndex].stock += item.qty;
            }
        });
        return newProducts;
    });

    addAuditLog(AuditLogAction.SALE_VOID, `Voided sale ${saleToVoid.invoiceNo}. Reason: ${reason}`, saleId);

}, [sales, addAuditLog]);


  const updateKdsOrderStatus = useCallback((orderId: string, status: KdsOrderStatus) => setKdsOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, items: o.items.map(i => ({...i, status})) } : o)), []);
  const updateKdsItemStatus = useCallback((orderId: string, itemId: string, status: KdsOrderStatus) => {
     setKdsOrders(prev => prev.map(o => {
       if (o.id !== orderId) return o;
       const newItems = o.items.map(item => item.id === itemId ? { ...item, status } : item);
       const allReady = newItems.every(i => i.status === KdsOrderStatus.READY);
       return { ...o, items: newItems, status: allReady ? KdsOrderStatus.READY : o.status };
     }));
  }, []);

  // --- Billiard Functions Impl ---
    const addPricelistPackage = useCallback((pkg: Omit<PricelistPackage, 'id'>) => {
        const newPackage: PricelistPackage = { ...pkg, id: `pkg-${Date.now()}`};
        setPricelistPackages(prev => [...prev, newPackage]);
    }, []);
    const updatePricelistPackage = useCallback((pkg: PricelistPackage) => {
        setPricelistPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
    }, []);
    const deletePricelistPackage = useCallback((id: string) => {
        setPricelistPackages(prev => prev.filter(p => p.id !== id));
    }, []);

    const addBilliardTable = useCallback((tableData: Omit<BilliardTable, 'id' | 'status' | 'currentSessionId'>): { success: boolean, message?: string } => {
        if (billiardTables.some(t => t.name.toLowerCase() === tableData.name.toLowerCase())) {
            return { success: false, message: 'A table with this name already exists.' };
        }
        const newTable: BilliardTable = {
            ...tableData,
            id: `table-${Date.now()}`,
            status: TableStatus.FREE,
        };
        setBilliardTables(prev => [...prev, newTable]);
        return { success: true };
    }, [billiardTables]);
    
    const updateBilliardTable = useCallback((table: Omit<BilliardTable, 'status' | 'currentSessionId'>): { success: boolean, message?: string } => {
        if (billiardTables.some(t => t.id !== table.id && t.name.toLowerCase() === table.name.toLowerCase())) {
            return { success: false, message: 'A table with this name already exists.' };
        }
        setBilliardTables(prev => prev.map(t => t.id === table.id ? { ...t, ...table } : t));
        return { success: true };
    }, [billiardTables]);
      
    const deleteBilliardTable = useCallback((id: string): { success: boolean, message?: string } => {
        const table = billiardTables.find(t => t.id === id);
        if (table && table.status !== TableStatus.FREE) {
            return { success: false, message: 'Cannot delete a table that is currently in use.' };
        }
        setBilliardTables(prev => prev.filter(t => t.id !== id));
        return { success: true };
    }, [billiardTables]);

  const startBilliardSession = useCallback((tableId: string, packageId: string) => {
    const table = billiardTables.find(t => t.id === tableId);
    const pkg = pricelistPackages.find(p => p.id === packageId);
    if (!table || !pkg || table.status !== TableStatus.FREE) return;

    const newSession: Session = {
        id: `session-${Date.now()}`,
        tableId,
        tableName: table.name,
        startTime: Date.now(),
        totalPauseDuration: 0,
        packageSnapshot: { ...pkg },
        fnbItems: [],
        status: SessionStatus.RUNNING,
        durationMs: 0, timeCharge: 0, fnbCharge: 0, totalCharge: 0,
    };
    setSessions(prev => [...prev, newSession]);
    setBilliardTables(prev => prev.map(t => t.id === tableId ? { ...t, status: TableStatus.RUNNING, currentSessionId: newSession.id } : t));
  }, [billiardTables, pricelistPackages]);
  
  const pauseBilliardSession = useCallback((sessionId: string) => {
      setSessions(prev => prev.map(s => s.id === sessionId && s.status === SessionStatus.RUNNING ? {...s, status: SessionStatus.PAUSED, pauseTime: Date.now()} : s));
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          setBilliardTables(prev => prev.map(t => t.id === session.tableId ? {...t, status: TableStatus.PAUSED} : t));
      }
  }, [sessions]);

  const resumeBilliardSession = useCallback((sessionId: string) => {
      setSessions(prev => prev.map(s => {
          if (s.id === sessionId && s.status === SessionStatus.PAUSED && s.pauseTime) {
              const pauseDuration = Date.now() - s.pauseTime;
              return { ...s, status: SessionStatus.RUNNING, pauseTime: undefined, totalPauseDuration: s.totalPauseDuration + pauseDuration };
          }
          return s;
      }));
      const session = sessions.find(s => s.id === sessionId);
      if(session) {
          setBilliardTables(prev => prev.map(t => t.id === session.tableId ? {...t, status: TableStatus.RUNNING} : t));
      }
  }, [sessions]);

  const stopBilliardSession = useCallback((sessionId: string): Session => {
      const sessionToEnd = sessions.find(s => s.id === sessionId);
      if (!sessionToEnd) throw new Error("Session not found");

      const finalBill = calculateSessionBill(sessionToEnd, Date.now());

      const finalSession: Session = { ...sessionToEnd, ...finalBill, status: SessionStatus.ENDED, endTime: Date.now() };

      setSessions(prev => prev.map(s => s.id === sessionId ? finalSession : s));
      setBilliardTables(prev => prev.map(t => t.id === finalSession.tableId ? { ...t, status: TableStatus.FREE, currentSessionId: undefined } : t));
      return finalSession;
  }, [sessions]);
  
  const addFnbToSession = useCallback((sessionId: string, product: Product, qty: number) => {
      setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s;
          
          const existingItem = s.fnbItems.find(item => item.productId === product.id);
          let newFnbItems: FnbOrderItem[];

          if (existingItem) {
              newFnbItems = s.fnbItems.map(item => item.productId === product.id ? {...item, qty: item.qty + qty} : item);
          } else {
              newFnbItems = [...s.fnbItems, { id: `fnb-${Date.now()}`, productId: product.id, name: product.name, qty, price: product.price }];
          }
          return { ...s, fnbItems: newFnbItems };
      }))
  }, []);

  // --- Shift Functions ---
  const startShift = useCallback((startCash: number): Shift => {
    if (activeShift) {
        throw new Error("Another shift is already active.");
    }
    if (!user) { throw new Error("User not found to start shift."); }

    const newShift: Shift = {
        id: `shift-${Date.now()}`,
        outletId: user.outletId || 'outlet-1',
        userId: user.id,
        userName: user.name,
        status: ShiftStatus.OPEN,
        startTime: Date.now(),
        startCash,
        cashSales: 0,
        qrisSales: 0,
        transferSales: 0,
        totalSales: 0,
        cashIn: 0,
        cashOut: 0,
        expectedCash: startCash,
    };
    setShifts(prev => [...prev, newShift]);
    addAuditLog(AuditLogAction.SHIFT_START, `Shift started. Opening cash: ${formatCurrency(startCash)}.`, newShift.id);
    return newShift;
  }, [activeShift, user, addAuditLog]);
  
  const endShift = useCallback((endCash: number, notes: string): Shift => {
    if (!activeShift) {
        throw new Error("No active shift to end.");
    }
    const finalShiftState: Shift = {
        ...activeShift,
        status: ShiftStatus.CLOSED,
        endTime: Date.now(),
        endCash,
        notes,
        difference: endCash - activeShift.expectedCash,
    };
    setShifts(prev => prev.map(s => s.id === activeShift.id ? finalShiftState : s));
    addAuditLog(AuditLogAction.SHIFT_END, `Shift ended. Expected: ${formatCurrency(activeShift.expectedCash)}, Counted: ${formatCurrency(endCash)}, Difference: ${formatCurrency(finalShiftState.difference || 0)}. Notes: "${notes || 'N/A'}"`, activeShift.id);
    return finalShiftState;
  }, [activeShift, addAuditLog]);
  
  const addCashMovement = useCallback((type: CashMovementType, amount: number, notes: string) => {
    if (!activeShift) {
        throw new Error("No active shift for cash movement.");
    }
    const newMovement: CashMovement = {
        id: `cm-${Date.now()}`,
        shiftId: activeShift.id,
        type,
        amount,
        notes,
        timestamp: Date.now(),
    };
    setCashMovements(prev => [...prev, newMovement]);
  }, [activeShift]);

  const getShiftCashMovements = useCallback((shiftId: string) => {
    return cashMovements.filter(cm => cm.shiftId === shiftId);
  }, [cashMovements]);

  const getShiftSales = useCallback((shiftId: string) => {
    return sales.filter(s => s.shiftId === shiftId);
  }, [sales]);


  return (
    <DataContext.Provider value={{ products, sales, kdsOrders, categories, units, outlet, addSale, voidSale, updateKdsOrderStatus, updateKdsItemStatus, getProductById, getCategoryById, getUnitById, addProduct, updateProduct, addCategory, updateCategory, deleteCategory, addUnit, updateUnit, deleteUnit, updateOutlet, billiardTables, sessions, pricelistPackages, addPricelistPackage, updatePricelistPackage, deletePricelistPackage, addBilliardTable, updateBilliardTable, deleteBilliardTable, startBilliardSession, pauseBilliardSession, resumeBilliardSession, stopBilliardSession, addFnbToSession, shifts, cashMovements, activeShift, startShift, endShift, addCashMovement, getShiftCashMovements, getShiftSales, auditLogs }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
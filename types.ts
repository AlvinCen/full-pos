export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  outletId?: string;
  isActive: boolean;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  taxPercent: number;
  receiptHeader: string;
  receiptFooter: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  precision: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name:string;
  categoryId: string;
  unitId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  isKitchen: boolean;
  isFnb?: boolean; // For Billiards F&B Menu
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  RECEIVED = 'RECEIVED'
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  qty: number;
  cost: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  outletId: string;
  date: string;
  total: number;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  QRIS = 'QRIS'
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  qty: number;
  price: number;
  discount: number;
}

export interface Sale {
  id: string;
  outletId: string;
  userId: string;
  shiftId: string; // Link sale to a shift
  customerId?: string;
  invoiceNo: string;
  date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paid: number;
  change: number;
  items: SaleItem[];
}

export enum KdsOrderStatus {
    NEW = 'NEW',
    ACCEPTED = 'ACCEPTED',
    COOKING = 'COOKING',
    READY = 'READY',
    SERVED = 'SERVED',
    CANCELLED = 'CANCELLED'
}

export interface KdsItem {
    id: string;
    kdsOrderId: string;
    productId: string;
    qty: number;
    status: KdsOrderStatus;
}

export interface KdsOrder {
    id: string;
    saleId: string;
    saleInvoiceNo: string;
    status: KdsOrderStatus;
    createdAt: string;
    items: KdsItem[];
}

// --- Billiard System Types ---

export enum BilliardTableType {
    POOL = 'POOL',
    SNOOKER = 'SNOOKER',
    VIP = 'VIP',
}

export enum PricingUnit {
    PER_MINUTE = 'PER_MINUTE',
    PER_15_MINUTES = 'PER_15_MINUTES',
    PER_HOUR = 'PER_HOUR',
}

export enum RoundingMethod {
    NONE = 'NONE',
    UP_5 = 'UP_5',
    UP_10 = 'UP_10',
    UP_15 = 'UP_15',
}

export interface PricelistPackage {
    id: string;
    name: string;
    tableType: BilliardTableType;
    unit: PricingUnit;
    pricePerUnit: number;
    rounding: RoundingMethod;
    graceMinutes: number;
    minBillMinutes: number;
    isActive: boolean;
}

export enum TableStatus {
    FREE = 'FREE',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
}

export interface BilliardTable {
    id: string;
    name: string;
    tableType: BilliardTableType;
    group?: string;
    isActive: boolean;
    status: TableStatus;
    currentSessionId?: string;
}

export enum SessionStatus {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    ENDED = 'ENDED'
}

export interface FnbOrderItem {
    id: string;
    productId: string;
    name: string;
    qty: number;
    price: number;
}

export interface Session {
    id: string;
    tableId: string;
    tableName: string;
    startTime: number; // timestamp
    endTime?: number; // timestamp
    pauseTime?: number; // timestamp of when pause started
    totalPauseDuration: number; // in milliseconds
    packageSnapshot: PricelistPackage;
    fnbItems: FnbOrderItem[];
    status: SessionStatus;
    // Calculated fields, updated in real-time
    durationMs: number;
    timeCharge: number;
    fnbCharge: number;
    totalCharge: number;
}

// --- Cashier Shift Types ---

export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CashMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

export interface CashMovement {
  id: string;
  shiftId: string;
  type: CashMovementType;
  amount: number;
  notes: string;
  timestamp: number;
}

export interface Shift {
  id: string;
  outletId: string;
  userId: string;
  userName: string;
  status: ShiftStatus;
  startTime: number;
  endTime?: number;
  startCash: number;
  endCash?: number;
  
  // Calculated fields
  cashSales: number;
  qrisSales: number;
  transferSales: number;
  totalSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  difference?: number;
  
  notes?: string;
}
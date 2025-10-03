import { User, UserRole, Outlet, Category, Unit, Product, Purchase, PurchaseStatus, Sale, PaymentMethod, BilliardTable, TableStatus, BilliardTableType, PricelistPackage, PricingUnit, RoundingMethod, Shift, CashMovement } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'Admin Rekber', email: 'admin@rekber.id', passwordHash: 'admin123', role: UserRole.ADMIN, isActive: true, outletId: 'outlet-1' },
  { id: 'user-2', name: 'Buyer Test', email: 'buyer@test.com', passwordHash: 'buyer123', role: UserRole.USER, isActive: true, outletId: 'outlet-1' },
  { id: 'user-3', name: 'Seller Test', email: 'seller@test.com', passwordHash: 'seller123', role: UserRole.USER, isActive: true, outletId: 'outlet-1' },
  { id: 'user-4', name: 'Kasir Demo', email: 'kasir@demo.local', passwordHash: 'kasir123', role: UserRole.USER, isActive: true, outletId: 'outlet-1' },
];

export const OUTLETS: Outlet[] = [
  {
    id: 'outlet-1',
    name: 'Demo Outlet',
    address: '123 Main Street, Jakarta',
    phone: '081234567890',
    taxPercent: 10,
    receiptHeader: 'Thank you for your purchase!',
    receiptFooter: 'Please come again.',
  }
];

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Hot Coffee' },
  { id: 'cat-2', name: 'Iced Coffee' },
  { id: 'cat-3', name: 'Non-Coffee' },
  { id: 'cat-4', name: 'Pastries' },
  { id: 'cat-5', name: 'Main Course' },
  { id: 'cat-6', name: 'Snacks' },
];

export const UNITS: Unit[] = [
  { id: 'unit-1', name: 'pcs', precision: 0 },
  { id: 'unit-2', name: 'kg', precision: 2 },
  { id: 'unit-3', name: 'box', precision: 0 },
  { id: 'unit-4', name: 'ml', precision: 0 },
];

export const PRODUCTS: Product[] = [
    // Hot Coffee
    { id: 'prod-1', sku: 'HCF-001', barcode: '899000000001', name: 'Espresso', categoryId: 'cat-1', unitId: 'unit-1', price: 20000, cost: 5000, stock: 100, minStock: 10, isActive: true, isKitchen: false, isFnb: true },
    { id: 'prod-2', sku: 'HCF-002', barcode: '899000000002', name: 'Americano', categoryId: 'cat-1', unitId: 'unit-1', price: 25000, cost: 6000, stock: 100, minStock: 10, isActive: true, isKitchen: false, isFnb: true },
    { id: 'prod-3', sku: 'HCF-003', barcode: '899000000003', name: 'Latte', categoryId: 'cat-1', unitId: 'unit-1', price: 30000, cost: 8000, stock: 100, minStock: 10, isActive: true, isKitchen: false, isFnb: true },
    // Iced Coffee
    { id: 'prod-4', sku: 'ICF-001', barcode: '899000000004', name: 'Iced Americano', categoryId: 'cat-2', unitId: 'unit-1', price: 27000, cost: 6500, stock: 80, minStock: 15, isActive: true, isKitchen: false, isFnb: true },
    { id: 'prod-5', sku: 'ICF-002', barcode: '899000000005', name: 'Iced Latte', categoryId: 'cat-2', unitId: 'unit-1', price: 32000, cost: 8500, stock: 80, minStock: 15, isActive: true, isKitchen: false, isFnb: true },
    // Non-Coffee
    { id: 'prod-6', sku: 'NCF-001', barcode: '899000000006', name: 'Matcha Latte', categoryId: 'cat-3', unitId: 'unit-1', price: 35000, cost: 10000, stock: 50, minStock: 10, isActive: true, isKitchen: false, isFnb: true },
    { id: 'prod-7', sku: 'NCF-002', barcode: '899000000007', name: 'Mineral Water', categoryId: 'cat-3', unitId: 'unit-1', price: 10000, cost: 3000, stock: 200, minStock: 50, isActive: true, isKitchen: false, isFnb: true },
    // Pastries
    { id: 'prod-8', sku: 'PST-001', barcode: '899000000008', name: 'Croissant', categoryId: 'cat-4', unitId: 'unit-1', price: 22000, cost: 9000, stock: 40, minStock: 5, isActive: true, isKitchen: true, isFnb: true },
    { id: 'prod-9', sku: 'PST-002', barcode: '899000000009', name: 'Pain au Chocolat', categoryId: 'cat-4', unitId: 'unit-1', price: 25000, cost: 11000, stock: 40, minStock: 5, isActive: true, isKitchen: true, isFnb: true },
    // Main Course
    { id: 'prod-10', sku: 'MNC-001', barcode: '899000000010', name: 'Nasi Goreng', categoryId: 'cat-5', unitId: 'unit-1', price: 45000, cost: 15000, stock: 30, minStock: 5, isActive: true, isKitchen: true, isFnb: true },
    { id: 'prod-11', sku: 'MNC-002', barcode: '899000000011', name: 'Spaghetti Carbonara', categoryId: 'cat-5', unitId: 'unit-1', price: 55000, cost: 20000, stock: 25, minStock: 5, isActive: true, isKitchen: true, isFnb: true },
    // Snacks
    { id: 'prod-12', sku: 'SNK-001', barcode: '899000000012', name: 'French Fries', categoryId: 'cat-6', unitId: 'unit-1', price: 28000, cost: 12000, stock: 60, minStock: 10, isActive: true, isKitchen: true, isFnb: true },
];

export const initialPurchases: Purchase[] = [
    {
        id: 'purch-1', supplierId: 'supp-1', outletId: 'outlet-1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: PurchaseStatus.RECEIVED, total: 500000,
        items: [{ id: 'pi-1', purchaseId: 'purch-1', productId: 'prod-1', qty: 100, cost: 5000 }]
    },
    {
        id: 'purch-2', supplierId: 'supp-2', outletId: 'outlet-1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: PurchaseStatus.RECEIVED, total: 900000,
        items: [{ id: 'pi-2', purchaseId: 'purch-2', productId: 'prod-8', qty: 100, cost: 9000 }]
    }
];

export const initialSales: Sale[] = [
    {
        id: 'sale-1', outletId: 'outlet-1', userId: 'user-4', shiftId: 'shift-0', invoiceNo: 'INV-0001', date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), subtotal: 55000, discount: 0, tax: 5500, total: 60500, paymentMethod: PaymentMethod.CASH, paid: 70000, change: 9500,
        items: [
            { id: 'si-1', saleId: 'sale-1', productId: 'prod-2', qty: 1, price: 25000, discount: 0 },
            { id: 'si-2', saleId: 'sale-1', productId: 'prod-3', qty: 1, price: 30000, discount: 0 }
        ]
    },
    {
        id: 'sale-2', outletId: 'outlet-1', userId: 'user-4', shiftId: 'shift-0', invoiceNo: 'INV-0002', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), subtotal: 100000, discount: 10000, tax: 9000, total: 99000, paymentMethod: PaymentMethod.QRIS, paid: 99000, change: 0,
        items: [
            { id: 'si-3', saleId: 'sale-2', productId: 'prod-10', qty: 2, price: 45000, discount: 0 },
            { id: 'si-4', saleId: 'sale-2', productId: 'prod-7', qty: 1, price: 10000, discount: 0 }
        ]
    }
];

// --- Billiard System Data ---

export const BILLIARD_TABLES: BilliardTable[] = [
    // 4 VIP
    { id: 'table-1', name: 'VIP 1', status: TableStatus.FREE, tableType: BilliardTableType.VIP, group: 'VIP Area', isActive: true },
    { id: 'table-2', name: 'VIP 2', status: TableStatus.FREE, tableType: BilliardTableType.VIP, group: 'VIP Area', isActive: true },
    { id: 'table-3', name: 'VIP 3', status: TableStatus.FREE, tableType: BilliardTableType.VIP, group: 'VIP Area', isActive: true },
    { id: 'table-4', name: 'VIP 4', status: TableStatus.FREE, tableType: BilliardTableType.VIP, group: 'VIP Area', isActive: false },
    // 2 SNOOKER
    { id: 'table-5', name: 'Snooker 1', status: TableStatus.FREE, tableType: BilliardTableType.SNOOKER, group: 'Pro Zone', isActive: true },
    { id: 'table-6', name: 'Snooker 2', status: TableStatus.FREE, tableType: BilliardTableType.SNOOKER, group: 'Pro Zone', isActive: true },
    // 6 POOL
    { id: 'table-7', name: 'Table 7', status: TableStatus.FREE, tableType: BilliardTableType.POOL, group: 'Main Hall', isActive: true },
    { id: 'table-8', name: 'Table 8', status: TableStatus.FREE, tableType: BilliardTableType.POOL, group: 'Main Hall', isActive: true },
    { id: 'table-9', name: 'Table 9', status: TableStatus.FREE, tableType: BilliardTableType.POOL, group: 'Main Hall', isActive: true },
    { id: 'table-10', name: 'Table 10', status: TableStatus.FREE, tableType: BilliardTableType.POOL, group: 'Balcony', isActive: true },
    { id: 'table-11', name: 'Table 11', status: TableStatus.FREE, tableType: BilliardTableType.POOL, group: 'Balcony', isActive: true },
    { id: 'table-12', name: 'Table 12', status: TableStatus.FREE, tableType: BilliardTableType.POOL, group: 'Balcony', isActive: true },
];

export const PRICELIST_PACKAGES: PricelistPackage[] = [
    {
        id: 'pkg-1',
        name: 'Regular Pool - Per Hour',
        tableType: BilliardTableType.POOL,
        unit: PricingUnit.PER_HOUR,
        pricePerUnit: 50000,
        rounding: RoundingMethod.UP_15,
        graceMinutes: 2,
        minBillMinutes: 30,
        isActive: true,
    },
    {
        id: 'pkg-2',
        name: 'VIP Experience - Per Hour',
        tableType: BilliardTableType.VIP,
        unit: PricingUnit.PER_HOUR,
        pricePerUnit: 75000,
        rounding: RoundingMethod.UP_10,
        graceMinutes: 0,
        minBillMinutes: 60,
        isActive: true,
    },
    {
        id: 'pkg-3',
        name: 'Snooker Pro - Per Minute',
        tableType: BilliardTableType.SNOOKER,
        unit: PricingUnit.PER_MINUTE,
        pricePerUnit: 1000,
        rounding: RoundingMethod.NONE,
        graceMinutes: 1,
        minBillMinutes: 20,
        isActive: true,
    },
     {
        id: 'pkg-4',
        name: 'Happy Hour Pool (Inactive)',
        tableType: BilliardTableType.POOL,
        unit: PricingUnit.PER_HOUR,
        pricePerUnit: 35000,
        rounding: RoundingMethod.UP_15,
        graceMinutes: 2,
        minBillMinutes: 30,
        isActive: false,
    },
];


// --- Cashier Shift Data ---
export const initialShifts: Shift[] = [];
export const initialCashMovements: CashMovement[] = [];
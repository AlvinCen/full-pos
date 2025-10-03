import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
// FIX: Add 'import process from "process"' to provide correct type definitions for the global process object.
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', permissions: ['all'] },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: { name: 'CASHIER', permissions: ['pos:create', 'shifts:manage'] },
  });
  
  const buyerRole = await prisma.role.upsert({
    where: { name: 'BUYER' },
    update: {},
    create: { name: 'BUYER', permissions: [] },
  });
  
  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER', permissions: [] },
  });

  console.log('Roles created/verified.');

  // Create Outlet
  const demoOutlet = await prisma.outlet.upsert({
    where: { id: 'outlet-1' },
    update: {},
    create: {
      id: 'outlet-1',
      name: 'Demo Outlet',
      address: '123 Main Street, Jakarta',
      phone: '081234567890',
      taxPercent: 10,
      receiptHeader: 'Thank you for your purchase!',
      receiptFooter: 'Please come again.',
      timezone: 'Asia/Jakarta',
    },
  });

  console.log('Outlet created/verified.');

  // Create Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const buyerPasswordHash = await bcrypt.hash('buyer123', 10);
  const sellerPasswordHash = await bcrypt.hash('seller123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@rekber.id' },
    update: {},
    create: {
      name: 'Admin Rekber',
      email: 'admin@rekber.id',
      passwordHash: passwordHash,
      roleId: adminRole.id,
      outletId: demoOutlet.id,
      isActive: true,
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      name: 'Buyer Test',
      email: 'buyer@test.com',
      passwordHash: buyerPasswordHash,
      roleId: buyerRole.id,
      outletId: demoOutlet.id,
      isActive: true,
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      name: 'Seller Test',
      email: 'seller@test.com',
      passwordHash: sellerPasswordHash,
      roleId: sellerRole.id,
      outletId: demoOutlet.id,
      isActive: true,
    },
  });

  console.log('Users created/verified.');

  // Seed Master Data
  const categories = ['Hot Coffee', 'Iced Coffee', 'Non-Coffee', 'Pastries', 'Main Course', 'Snacks'];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { name: cat }, update: {}, create: { name: cat } });
  }

  const units = [{ name: 'pcs', precision: 0 }, { name: 'kg', precision: 2 }, { name: 'box', precision: 0 }, { name: 'ml', precision: 0 }];
  for (const unit of units) {
    await prisma.unit.upsert({ where: { name: unit.name }, update: {}, create: unit });
  }

  console.log('Master data (Categories, Units) seeded.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
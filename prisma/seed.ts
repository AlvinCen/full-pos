import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import process from 'process';

const prisma = new PrismaClient();

const PERMISSIONS = [
    // Special permission for admin
    'all',
    // Sales and POS
    'sale:create',
    'sale:read',
    'sale:void',
    'sale:refund',
    // Shifts
    'shift:open',
    'shift:close',
    'shift:cashInOut',
    // Reports
    'report:view',
    // Settings
    'settings:edit',
    // Inventory
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'inventory:adjust',
    'inventory:receive',
];

async function main() {
  console.log('Start seeding...');
  
  // Clean up previous RBAC data
  await prisma.rolePermission.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});

  // --- Permissions ---
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm },
    });
  }
  const allPermissions = await prisma.permission.findMany();
  console.log('Permissions created.');

  // --- Roles ---
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN' } });
  const managerRole = await prisma.role.create({ data: { name: 'MANAGER' } });
  const cashierRole = await prisma.role.create({ data: { name: 'CASHIER' } });

  // --- Assign Permissions to Roles ---
  const getPermId = (name: string) => allPermissions.find(p => p.name === name)!.id;

  // Admin gets 'all'
  await prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: getPermId('all') } });

  // Manager gets most permissions
  const managerPerms = PERMISSIONS.filter(p => p !== 'all');
  for (const permName of managerPerms) {
    await prisma.rolePermission.create({ data: { roleId: managerRole.id, permissionId: getPermId(permName) } });
  }
  
  // Cashier gets limited permissions
  const cashierPerms = ['sale:create', 'sale:read', 'shift:open', 'shift:close', 'shift:cashInOut'];
  for (const permName of cashierPerms) {
    await prisma.rolePermission.create({ data: { roleId: cashierRole.id, permissionId: getPermId(permName) } });
  }
  console.log('Roles and permissions linked.');

  // --- Outlet ---
  const demoOutlet = await prisma.outlet.upsert({ where: { id: 'outlet-1' }, update: {}, create: { id: 'outlet-1', name: 'Demo Outlet' } });

  // --- Users ---
  const adminPass = await bcrypt.hash('admin123', 10);
  const managerPass = await bcrypt.hash('manager123', 10);
  const cashierPass = await bcrypt.hash('cashier123', 10);

  const adminUser = await prisma.user.upsert({ where: { email: 'admin@demo.local' }, update: { passwordHash: adminPass }, create: { name: 'Admin User', email: 'admin@demo.local', passwordHash: adminPass, outletId: demoOutlet.id } });
  const managerUser = await prisma.user.upsert({ where: { email: 'manager@demo.local' }, update: { passwordHash: managerPass }, create: { name: 'Manager User', email: 'manager@demo.local', passwordHash: managerPass, outletId: demoOutlet.id } });
  const cashierUser = await prisma.user.upsert({ where: { email: 'cashier@demo.local' }, update: { passwordHash: cashierPass }, create: { name: 'Cashier User', email: 'cashier@demo.local', passwordHash: cashierPass, outletId: demoOutlet.id } });

  // --- Assign Roles to Users ---
  await prisma.userRole.create({ data: { userId: adminUser.id, roleId: adminRole.id } });
  await prisma.userRole.create({ data: { userId: managerUser.id, roleId: managerRole.id } });
  await prisma.userRole.create({ data: { userId: cashierUser.id, roleId: cashierRole.id } });
  console.log('Users created and roles assigned.');

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

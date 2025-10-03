import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, StockMovementType, SaleStatus } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { authMiddleware, requirePermission } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'POS Server is running!' });
});

// --- Auth Routes ---
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        roles: { 
          include: { 
            role: { 
              include: { 
                permissions: { 
                  include: { 
                    permission: true 
                  } 
                } 
              } 
            } 
          } 
        } 
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const permissions = [...new Set(user.roles.flatMap(ur => ur.role.permissions.map(p => p.permission.name)))];

    const { passwordHash, roles, ...userWithoutPassword } = user;

    res.json({ user: { ...userWithoutPassword, permissions } });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: Request, res: Response) => {
  // The user object with permissions is already attached by the middleware
  res.json({ user: req.user });
});


// --- Sales Routes ---
app.get('/api/sales', authMiddleware, requirePermission('sale:read'), async (req: Request, res: Response) => {
    try {
        const sales = await prisma.sale.findMany({
            orderBy: { date: 'desc' },
            include: { user: { select: { name: true } } }
        });
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Failed to fetch sales' });
    }
});

app.get('/api/sales/:id', authMiddleware, requirePermission('sale:read'), async (req: Request, res: Response) => {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: req.params.id },
            include: { 
                items: { include: { product: true } },
                return: true 
            }
        });
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({ message: 'Failed to fetch sale' });
    }
});

// --- Returns Routes ---
const createReturnSchema = z.object({
    saleId: z.string().cuid(),
    userId: z.string().cuid(),
    reason: z.string().min(3),
    items: z.array(z.object({
        productId: z.string().cuid(),
        quantity: z.number().positive(),
    })).min(1),
});

app.post('/api/returns', authMiddleware, requirePermission('sale:refund'), async (req: Request, res: Response) => {
    try {
        const { saleId, reason, items } = createReturnSchema.parse(req.body);
        const userId = req.user!.id; // Get user from middleware

        const newReturn = await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({ where: { id: saleId }, include: { items: true } });
            if (!sale) throw new Error('Sale not found.');
            if (sale.status !== SaleStatus.COMPLETED) throw new Error('Only completed sales can be returned.');

            const returnResult = await tx.return.create({
                data: {
                    saleId,
                    userId,
                    reason,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        }))
                    }
                }
            });

            const stockMovements = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity, // Positive quantity for returns
                type: StockMovementType.RETURN,
                reference: returnResult.id,
            }));

            await tx.stockMovement.createMany({ data: stockMovements });

            const originalItemCount = sale.items.reduce((sum, item) => sum + item.qty, 0);
            const returnedItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

            const newSaleStatus = originalItemCount === returnedItemCount ? SaleStatus.FULLY_RETURNED : SaleStatus.PARTIALLY_RETURNED;

            await tx.sale.update({
                where: { id: saleId },
                data: { status: newSaleStatus }
            });

            await tx.auditLog.create({
              data: {
                userId: userId,
                action: 'SALE_RETURN',
                details: `Return processed for sale ${sale.invoiceNo}. Reason: ${reason}`,
                entityId: returnResult.id
              }
            });

            return returnResult;
        });

        res.status(201).json(newReturn);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Return creation error:', error);
        res.status(500).json({ message: (error as Error).message || 'Internal server error' });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

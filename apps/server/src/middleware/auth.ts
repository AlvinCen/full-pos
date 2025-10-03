import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend the Express Request type to include our user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        permissions: string[];
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const permissions = [
      ...new Set(user.roles.flatMap(ur => ur.role.permissions.map(p => p.permission.name))),
    ];

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      permissions,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const hasPermission = user.permissions.includes('all') || user.permissions.includes(requiredPermission);

    // Simple wildcard check
    const hasWildcardPermission = user.permissions.some(p => {
        if (!p.endsWith(':*')) return false;
        const prefix = p.slice(0, -2); // e.g., "sale" from "sale:*"
        return requiredPermission.startsWith(prefix);
    });

    if (hasPermission || hasWildcardPermission) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have the required permission' });
    }
  };
};

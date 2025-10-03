'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import ProcessReturnModal from '@/components/dashboard/ProcessReturnModal';
import PermissionGuard from '@/components/auth/PermissionGuard';

type Sale = {
  id: string;
  invoiceNo: string;
  date: string;
  total: number;
  paymentMethod: string;
  status: 'COMPLETED' | 'VOIDED' | 'PARTIALLY_RETURNED' | 'FULLY_RETURNED';
  user: { name: string };
};

export default function SalesReportPage() {
  return (
    <PermissionGuard permission="report:view">
      <SalesReportContent />
    </PermissionGuard>
  )
}

function SalesReportContent() {
  const [returnModalSale, setReturnModalSale] = useState<Sale | null>(null);
  const { hasPermission } = useAuth();

  const { data: sales, isLoading, error } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: api.getSales,
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID');

  const getStatusVariant = (status: Sale['status']) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'VOIDED': return 'destructive';
      case 'PARTIALLY_RETURNED':
      case 'FULLY_RETURNED':
        return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Sales Report</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading sales...</p>}
          {error && <p className="text-red-500">Failed to load sales: {(error as Error).message}</p>}
          {sales && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>{sale.user.name}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusVariant(sale.status) as any}>{sale.status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                    <TableCell className="text-right">
                      {sale.status === 'COMPLETED' && hasPermission('sale:refund') && (
                        <Button variant="outline" size="sm" onClick={() => setReturnModalSale(sale)}>
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {returnModalSale && (
        <ProcessReturnModal
          sale={returnModalSale}
          onClose={() => setReturnModalSale(null)}
        />
      )}
    </div>
  );
}
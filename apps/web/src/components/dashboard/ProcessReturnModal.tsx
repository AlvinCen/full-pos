'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthProvider';
import { api } from '@/lib/api';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

interface SaleItem {
  id: string;
  productId: string;
  qty: number;
  price: number;
  product: { name: string };
}

interface SaleDetails {
  id: string;
  invoiceNo: string;
  items: SaleItem[];
}

interface ProcessReturnModalProps {
  sale: { id: string; invoiceNo: string };
  onClose: () => void;
}

interface ReturnItem {
  productId: string;
  quantity: number;
  name: string;
  maxQuantity: number;
}

export default function ProcessReturnModal({ sale, onClose }: ProcessReturnModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [returnItems, setReturnItems] = useState<Record<string, ReturnItem>>({});
  const [reason, setReason] = useState('');

  const { data: saleDetails, isLoading } = useQuery<SaleDetails>({
    queryKey: ['sale', sale.id],
    queryFn: () => api.getSaleById(sale.id),
    enabled: !!sale.id,
    onSuccess: (data) => {
      const initialReturnItems = data.items.reduce((acc, item) => {
        acc[item.productId] = {
          productId: item.productId,
          quantity: 0,
          name: item.product.name,
          maxQuantity: item.qty,
        };
        return acc;
      }, {} as Record<string, ReturnItem>);
      setReturnItems(initialReturnItems);
    }
  });

  const returnMutation = useMutation({
    mutationFn: api.createReturn,
    onSuccess: () => {
      alert('Return processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', sale.id] });
      onClose();
    },
    onError: (error) => {
      alert(`Failed to process return: ${error.message}`);
    }
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    const item = returnItems[productId];
    if (quantity >= 0 && quantity <= item.maxQuantity) {
      setReturnItems(prev => ({
        ...prev,
        [productId]: { ...item, quantity }
      }));
    }
  };

  const itemsToReturn = useMemo(() => {
    return Object.values(returnItems).filter(item => item.quantity > 0);
  }, [returnItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in.");
      return;
    }
    if (itemsToReturn.length === 0) {
      alert("Please select at least one item to return.");
      return;
    }
    if (!reason.trim()) {
      alert("Please provide a reason for the return.");
      return;
    }
    
    returnMutation.mutate({
      saleId: sale.id,
      reason: reason.trim(),
// FIX: Avoid destructuring to help TypeScript correctly infer types from the array.
      items: itemsToReturn.map(item => ({ productId: item.productId, quantity: item.quantity })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Process Return for Sale {sale.invoiceNo}</CardTitle>
            <CardDescription>Select items and quantities to return to inventory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <p>Loading sale items...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Original Qty</TableHead>
                    <TableHead className="w-[120px]">Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(returnItems).map((item: ReturnItem) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.maxQuantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 0)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div>
              <Label htmlFor="reason">Reason for Return</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Customer changed mind, wrong item"
                className="mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={returnMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={itemsToReturn.length === 0 || returnMutation.isPending}>
              {returnMutation.isPending ? 'Processing...' : 'Confirm Return'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { Sale } from '../types';
import { useData } from '../hooks/useData';
import { Button } from './ui/Button';

interface ReceiptProps {
  sale: Sale;
  onBack: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, onBack }) => {
  const { getProductById } = useData();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically trigger print dialog
    window.print();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <>
      <div className="fixed top-4 left-4 z-50 print:hidden">
        <Button onClick={onBack}>Back to POS</Button>
        <Button onClick={() => window.print()} className="ml-2">Print Again</Button>
      </div>
      <div ref={receiptRef} className="bg-white text-black font-mono max-w-sm mx-auto p-4 print:mx-0 print:p-0">
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .receipt-container, .receipt-container * {
                visibility: visible;
              }
              .receipt-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
            @page {
              size: 80mm auto;
              margin: 2mm;
            }
          `}
        </style>
        <div className="receipt-container text-xs leading-5">
            <div className="text-center mb-2">
                <h2 className="text-base font-bold">Demo Outlet</h2>
                <p>123 Main Street, Jakarta</p>
                <p>Tel: 081234567890</p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <div>
                <p>Invoice: {sale.invoiceNo}</p>
                <p>Date: {formatDate(sale.date)}</p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <div>
                {sale.items.map(item => {
                    const product = getProductById(item.productId);
                    return (
                        <div key={item.id} className="grid grid-cols-12 gap-1">
                            <div className="col-span-12">{product?.name || 'Unknown Product'}</div>
                            <div className="col-span-2 text-right">{item.qty} x</div>
                            <div className="col-span-5">{formatCurrency(item.price)}</div>
                            <div className="col-span-5 text-right">{formatCurrency(item.qty * item.price)}</div>
                        </div>
                    );
                })}
            </div>
            <hr className="border-dashed border-black my-2" />
            <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax (10%):</span><span>{formatCurrency(sale.tax)}</span></div>
                <div className="flex justify-between font-bold"><span>Total:</span><span>{formatCurrency(sale.total)}</span></div>
            </div>
            <hr className="border-dashed border-black my-2" />
            <div className="space-y-1">
                <div className="flex justify-between"><span>Payment:</span><span>{sale.paymentMethod}</span></div>
                <div className="flex justify-between"><span>Paid:</span><span>{formatCurrency(sale.paid)}</span></div>
                <div className="flex justify-between"><span>Change:</span><span>{formatCurrency(sale.change)}</span></div>
            </div>
            <div className="text-center mt-4">
                <p>Thank you for your purchase!</p>
                <p>Please come again.</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;

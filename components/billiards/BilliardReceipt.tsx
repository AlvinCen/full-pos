
import React, { useEffect, useRef } from 'react';
import { Session } from '../../types';
import { Button } from '../ui/Button';

interface BilliardReceiptProps {
  session: Session;
  onBack: () => void;
}

const BilliardReceipt: React.FC<BilliardReceiptProps> = ({ session, onBack }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically trigger print dialog
    window.print();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50 print:hidden">
        <Button onClick={onBack}>Back to Floor</Button>
        <Button onClick={() => window.print()} className="ml-2">Print Again</Button>
      </div>
      <div ref={receiptRef} className="bg-white text-black font-mono max-w-sm mx-auto p-4 print:mx-0 print:p-0">
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              .receipt-container, .receipt-container * { visibility: visible; }
              .receipt-container { position: absolute; left: 0; top: 0; width: 100%; }
            }
            @page { size: 80mm auto; margin: 2mm; }
          `}
        </style>
        <div className="receipt-container text-xs leading-5">
            <div className="text-center mb-2">
                <h2 className="text-base font-bold">Demo Outlet - Billiards</h2>
                <p>123 Main Street, Jakarta</p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <div>
                <p>Table: {session.tableName}</p>
                <p>Start: {formatDate(session.startTime)}</p>
                <p>End:   {session.endTime ? formatDate(session.endTime) : 'N/A'}</p>
                <p>Duration: {formatDuration(session.durationMs)}</p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <div>
                <div className="grid grid-cols-12 gap-1 font-semibold">
                    <div className="col-span-8">Time Charge</div>
                    <div className="col-span-4 text-right">{formatCurrency(session.timeCharge)}</div>
                </div>
                 <div className="text-gray-600 text-[10px] pl-2">({session.packageSnapshot.name})</div>
            </div>
            
            {session.fnbItems.length > 0 && (
                <>
                    <hr className="border-dashed border-black my-2" />
                    <p className="font-semibold">Food & Beverages:</p>
                    {session.fnbItems.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-1">
                            <div className="col-span-12">{item.name}</div>
                            <div className="col-span-2 text-right">{item.qty} x</div>
                            <div className="col-span-5">{formatCurrency(item.price)}</div>
                            <div className="col-span-5 text-right">{formatCurrency(item.qty * item.price)}</div>
                        </div>
                    ))}
                    <div className="flex justify-between font-semibold mt-1">
                        <span>F&B Subtotal:</span>
                        <span>{formatCurrency(session.fnbCharge)}</span>
                    </div>
                </>
            )}

            <hr className="border-dashed border-black my-2" />
            <div className="space-y-1">
                <div className="flex justify-between font-bold text-base"><span>Total:</span><span>{formatCurrency(session.totalCharge)}</span></div>
            </div>
            <div className="text-center mt-4">
                <p>Thank you for playing!</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default BilliardReceipt;

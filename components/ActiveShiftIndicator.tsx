import React from 'react';
import { useData } from '../hooks/useData';
import { Card } from './ui/Card';

const ActiveShiftIndicator: React.FC = () => {
    const { activeShift } = useData();

    if (!activeShift) {
        return null;
    }

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    return (
        <Card className="mb-6 bg-slate-800/50">
            <div className="p-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <p className="text-sm text-green-400 font-semibold">SHIFT ACTIVE</p>
                    <p className="text-white">Cashier: <span className="font-bold">{activeShift.userName}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Expected Cash in Drawer</p>
                    <p className="text-lg font-bold text-white font-mono">{formatCurrency(activeShift.expectedCash)}</p>
                </div>
            </div>
        </Card>
    );
};

export default ActiveShiftIndicator;

import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Shift } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface EndShiftModalProps {
  shift: Shift;
  onClose: () => void;
}

const EndShiftModal: React.FC<EndShiftModalProps> = ({ shift, onClose }) => {
    const { endShift } = useData();
    const [countedCash, setCountedCash] = useState(0);
    const [notes, setNotes] = useState('');

    const difference = useMemo(() => countedCash - shift.expectedCash, [countedCash, shift.expectedCash]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            endShift(countedCash, notes);
            onClose();
        } catch (error) {
            alert((error as Error).message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>End Shift & Cash Reconciliation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-800 p-4 rounded-lg space-y-2">
                            <h3 className="font-semibold text-white mb-2">Shift Summary</h3>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Starting Cash:</span> <span className="font-mono text-white">{formatCurrency(shift.startCash)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Cash Sales:</span> <span className="font-mono text-white">{formatCurrency(shift.cashSales)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Cash In:</span> <span className="font-mono text-green-400">{formatCurrency(shift.cashIn)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Cash Out:</span> <span className="font-mono text-red-400">{formatCurrency(shift.cashOut)}</span></div>
                            <hr className="border-slate-700 !my-3"/>
                            <div className="flex justify-between font-bold"><span className="text-white">Expected in Drawer:</span> <span className="font-mono text-indigo-400">{formatCurrency(shift.expectedCash)}</span></div>
                        </div>
                        <div>
                            <label htmlFor="countedCash" className="text-sm font-medium text-slate-300">Counted Cash Amount</label>
                            <Input 
                                id="countedCash"
                                type="number"
                                value={countedCash}
                                onChange={(e) => setCountedCash(Number(e.target.value))}
                                required
                                autoFocus
                                className="mt-2 text-lg text-right"
                            />
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span>Difference (Over/Short):</span>
                            <span className={`font-mono ${difference === 0 ? 'text-white' : difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(difference)}
                            </span>
                        </div>
                         <div>
                            <label htmlFor="notes" className="text-sm font-medium text-slate-300">Notes (Optional)</label>
                            <Input 
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-2"
                                placeholder="e.g., small discrepancy due to rounding"
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="destructive">Confirm & End Shift</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default EndShiftModal;

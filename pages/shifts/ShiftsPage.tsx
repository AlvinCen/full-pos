import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Shift, CashMovementType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import StartShiftModal from '../../components/shifts/StartShiftModal';
import EndShiftModal from '../../components/shifts/EndShiftModal';
import CashMovementModal from '../../components/shifts/CashMovementModal';

const ShiftsPage: React.FC = () => {
    const { activeShift, shifts, getShiftCashMovements, getShiftSales } = useData();
    const { user } = useAuth();
    
    const [isStartModalOpen, setStartModalOpen] = useState(false);
    const [isEndModalOpen, setEndModalOpen] = useState(false);
    const [isCashModalOpen, setCashModalOpen] = useState(false);
    const [cashModalType, setCashModalType] = useState<CashMovementType>(CashMovementType.IN);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    const formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString('id-ID');

    const closedShifts = shifts.filter(s => s.status === 'CLOSED').sort((a,b) => (b.endTime || 0) - (a.endTime || 0));

    const handleCashMovement = (type: CashMovementType) => {
        setCashModalType(type);
        setCashModalOpen(true);
    };

    const ActiveShiftCard: React.FC<{shift: Shift}> = ({ shift }) => {
        const movements = getShiftCashMovements(shift.id);

        return (
            <Card className="mb-6">
                <CardHeader className="bg-slate-800/50">
                    <div className="flex justify-between items-center">
                        <CardTitle>Current Active Shift</CardTitle>
                        <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-900 text-green-300">OPEN</span>
                    </div>
                    <p className="text-sm text-slate-400">Started by {shift.userName} at {formatDateTime(shift.startTime)}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Starting Cash</p>
                        <p className="text-2xl font-bold font-mono text-white">{formatCurrency(shift.startCash)}</p>
                    </div>
                     <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Cash Sales</p>
                        <p className="text-2xl font-bold font-mono text-white">{formatCurrency(shift.cashSales)}</p>
                    </div>
                     <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Cash In / Out</p>
                        <p className="text-2xl font-bold font-mono">
                            <span className="text-green-400">{formatCurrency(shift.cashIn)}</span> / <span className="text-red-400">{formatCurrency(shift.cashOut)}</span>
                        </p>
                    </div>
                     <div className="bg-slate-800 p-4 rounded-lg border-2 border-indigo-500">
                        <p className="text-sm text-slate-400">Expected in Drawer</p>
                        <p className="text-2xl font-bold font-mono text-indigo-400">{formatCurrency(shift.expectedCash)}</p>
                    </div>
                </CardContent>
                <CardContent>
                     <h4 className="font-semibold text-white mb-2">Cash Movements</h4>
                     <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {movements.length > 0 ? movements.map(m => (
                            <div key={m.id} className="flex justify-between p-2 bg-slate-800 rounded">
                                <div>
                                    <span className={`font-semibold ${m.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>{m.type}</span>
                                    <span className="text-slate-300 ml-4">{m.notes}</span>
                                </div>
                                <span className="font-mono text-white">{formatCurrency(m.amount)}</span>
                            </div>
                        )) : <p className="text-slate-500 text-sm text-center">No cash movements recorded.</p>}
                     </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-2">
                         <Button variant="secondary" onClick={() => handleCashMovement(CashMovementType.IN)}>Cash In</Button>
                         <Button variant="secondary" onClick={() => handleCashMovement(CashMovementType.OUT)}>Cash Out</Button>
                    </div>
                    <Button variant="destructive" onClick={() => setEndModalOpen(true)}>End Shift</Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Cashier Shifts</h1>
                {!activeShift && user && <Button onClick={() => setStartModalOpen(true)}>Start New Shift</Button>}
            </div>

            {activeShift ? <ActiveShiftCard shift={activeShift} /> : (
                <Card className="text-center p-8">
                    <CardTitle>No Active Shift</CardTitle>
                    <CardContent className="mt-4">
                        <p className="text-slate-400">Start a new shift to begin making sales.</p>
                    </CardContent>
                </Card>
            )}

             <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Shift History</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                                <tr>
                                <th scope="col" className="px-6 py-3">Cashier</th>
                                <th scope="col" className="px-6 py-3">Start Time</th>
                                <th scope="col" className="px-6 py-3">End Time</th>
                                <th scope="col" className="px-6 py-3 text-right">Total Sales</th>
                                <th scope="col" className="px-6 py-3 text-right">Difference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closedShifts.map((shift) => (
                                <tr key={shift.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-200">{shift.userName}</td>
                                    <td className="px-6 py-4">{formatDateTime(shift.startTime)}</td>
                                    <td className="px-6 py-4">{shift.endTime ? formatDateTime(shift.endTime) : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right font-mono">{formatCurrency(shift.totalSales)}</td>
                                    <td className={`px-6 py-4 text-right font-mono font-semibold ${shift.difference === 0 ? 'text-white' : shift.difference! > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(shift.difference || 0)}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
             </Card>

            {isStartModalOpen && <StartShiftModal onClose={() => setStartModalOpen(false)} />}
            {isEndModalOpen && activeShift && <EndShiftModal shift={activeShift} onClose={() => setEndModalOpen(false)} />}
            {isCashModalOpen && <CashMovementModal type={cashModalType} onClose={() => setCashModalOpen(false)} />}

        </div>
    );
};

export default ShiftsPage;
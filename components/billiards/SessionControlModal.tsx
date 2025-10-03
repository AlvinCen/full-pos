
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { BilliardTable, Session, TableStatus, SessionStatus, Product } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { PauseIcon, PlayIcon, StopIcon } from '../icons/Icons';
import BilliardReceipt from './BilliardReceipt';

interface SessionControlModalProps {
  table: BilliardTable;
  session: Session | null;
  onClose: () => void;
}

const SessionControlModal: React.FC<SessionControlModalProps> = ({ table, session, onClose }) => {
    const { products, pricelistPackages, startBilliardSession, pauseBilliardSession, resumeBilliardSession, stopBilliardSession, addFnbToSession } = useData();
    const [finalizedSession, setFinalizedSession] = useState<Session | null>(null);
    const [fnbSearchTerm, setFnbSearchTerm] = useState('');
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');

    const availablePackages = useMemo(() => {
        return pricelistPackages.filter(p => p.tableType === table.tableType && p.isActive);
    }, [pricelistPackages, table.tableType]);
    
    useEffect(() => {
        if (availablePackages.length > 0 && !selectedPackageId) {
            setSelectedPackageId(availablePackages[0].id);
        }
    }, [availablePackages, selectedPackageId]);

    const fnbMenu = useMemo(() => products.filter(p => p.isFnb), [products]);
    const filteredFnbMenu = useMemo(() => {
        if (!fnbSearchTerm) return [];
        return fnbMenu.filter(p => p.name.toLowerCase().includes(fnbSearchTerm.toLowerCase())).slice(0, 5);
    }, [fnbMenu, fnbSearchTerm]);

    const handleStart = () => {
        if (selectedPackageId) {
            startBilliardSession(table.id, selectedPackageId);
        } else {
            alert('Please select a package to start the session.');
        }
    };
    
    const handleStop = () => {
        if (session) {
            const finalSession = stopBilliardSession(session.id);
            setFinalizedSession(finalSession);
        }
    };

    const handleAddFnb = (product: Product) => {
        if (session) {
            addFnbToSession(session.id, product, 1);
            setFnbSearchTerm('');
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
    const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('id-ID');

    if (finalizedSession) {
        return <BilliardReceipt session={finalizedSession} onBack={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl flex flex-col max-h-[90vh]">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Manage {table.name}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>&times;</Button>
                </CardHeader>
                
                {table.status === TableStatus.FREE && (
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-8">
                        <p className="text-lg text-slate-400 mb-6">{table.name} is currently free.</p>
                        {availablePackages.length > 0 ? (
                            <div className="w-full max-w-xs space-y-4">
                                <div>
                                    <label htmlFor="packageSelect" className="text-sm font-medium text-slate-300 block mb-2 text-left">Select a Package</label>
                                    <Select id="packageSelect" value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)}>
                                        {availablePackages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name} ({formatCurrency(pkg.pricePerUnit)}/{pkg.unit.split('_')[1].toLowerCase()})</option>
                                        ))}
                                    </Select>
                                </div>
                                <Button size="lg" className="w-full" onClick={handleStart} disabled={!selectedPackageId}>Start New Session</Button>
                            </div>
                        ) : (
                            <p className="text-amber-400">No active packages available for this table type ({table.tableType}).</p>
                        )}
                    </CardContent>
                )}

                {session && (table.status === TableStatus.RUNNING || table.status === TableStatus.PAUSED) && (
                    <>
                        <CardContent className="flex-grow overflow-y-auto space-y-6">
                            {/* Session Info */}
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">Session Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-slate-400">Start Time:</span> <span className="text-white font-medium">{formatTime(session.startTime)}</span></div>
                                    <div><span className="text-slate-400">Status:</span> <span className={`font-semibold ${session.status === SessionStatus.PAUSED ? 'text-yellow-400' : 'text-blue-400'}`}>{session.status}</span></div>
                                    <div><span className="text-slate-400">Package:</span> <span className="text-white font-medium">{session.packageSnapshot.name}</span></div>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="text-slate-400 text-sm">Duration</p>
                                    <p className="text-4xl font-mono font-bold text-white">{formatDuration(session.durationMs)}</p>
                                </div>
                            </div>
                            
                             {/* Bill Summary */}
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">Current Bill</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-slate-400">Time Charge:</span> <span className="font-mono text-white">{formatCurrency(session.timeCharge)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-400">F&B Charge:</span> <span className="font-mono text-white">{formatCurrency(session.fnbCharge)}</span></div>
                                    <hr className="border-slate-700 my-1"/>
                                    <div className="flex justify-between text-lg font-bold"><span className="text-white">Total:</span> <span className="font-mono text-indigo-400">{formatCurrency(session.totalCharge)}</span></div>
                                </div>
                            </div>

                            {/* F&B Section */}
                            <div>
                                <h4 className="font-semibold text-white mb-2">Food & Beverage</h4>
                                <div className="relative">
                                    <Input 
                                        placeholder="Search for F&B items..." 
                                        value={fnbSearchTerm} 
                                        onChange={e => setFnbSearchTerm(e.target.value)}
                                    />
                                    {filteredFnbMenu.length > 0 && (
                                        <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-md mt-1 z-10 shadow-lg">
                                            {filteredFnbMenu.map(prod => (
                                                <div key={prod.id} onClick={() => handleAddFnb(prod)} className="p-3 hover:bg-slate-800 cursor-pointer flex justify-between">
                                                    <span>{prod.name}</span>
                                                    <span>{formatCurrency(prod.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                    {session.fnbItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                                            <span className="text-sm">{item.qty}x {item.name}</span>
                                            <span className="text-sm font-mono">{formatCurrency(item.qty * item.price)}</span>
                                        </div>
                                    ))}
                                    {session.fnbItems.length === 0 && <p className="text-slate-500 text-sm text-center p-2">No F&B items added.</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-shrink-0 flex justify-between items-center gap-2">
                            <div>
                                {session.status === SessionStatus.RUNNING && <Button variant="secondary" onClick={() => pauseBilliardSession(session.id)}><PauseIcon/><span className="ml-2">Pause</span></Button>}
                                {session.status === SessionStatus.PAUSED && <Button variant="secondary" onClick={() => resumeBilliardSession(session.id)}><PlayIcon/><span className="ml-2">Resume</span></Button>}
                            </div>
                            <Button variant="destructive" size="lg" onClick={handleStop}><StopIcon/><span className="ml-2">Stop & Pay</span></Button>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
};

export default SessionControlModal;


import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { BilliardTable, TableStatus, Session, SessionStatus } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import SessionControlModal from '../../components/billiards/SessionControlModal';
import { Button } from '../../components/ui/Button';
import { HistoryIcon } from '../../components/icons/Icons';

const FloorPage: React.FC = () => {
    const { billiardTables, sessions } = useData();
    const [selectedTable, setSelectedTable] = useState<BilliardTable | null>(null);
    const navigate = useNavigate();

    const activeSessions = useMemo(() => {
        const map = new Map<string, Session>();
        sessions.forEach(s => {
            if (s.status === SessionStatus.RUNNING || s.status === SessionStatus.PAUSED) {
                map.set(s.tableId, s);
            }
        });
        return map;
    }, [sessions]);

    const activeTables = useMemo(() => {
        return billiardTables.filter(t => t.isActive);
    }, [billiardTables]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const getStatusStyles = (status: TableStatus) => {
        switch (status) {
            case TableStatus.FREE: return 'bg-green-500/20 border-green-500/50 hover:border-green-400';
            case TableStatus.RUNNING: return 'bg-blue-500/20 border-blue-500/50 hover:border-blue-400 animate-pulse';
            case TableStatus.PAUSED: return 'bg-yellow-500/20 border-yellow-500/50 hover:border-yellow-400';
            default: return 'bg-slate-800 border-slate-700';
        }
    };

    const handleTableClick = (table: BilliardTable) => {
        setSelectedTable(table);
    };

    const handleCloseModal = () => {
        setSelectedTable(null);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Billiards Floor</h1>
                <Button variant="secondary" onClick={() => navigate('/billiards/history')}>
                    <HistoryIcon />
                    <span className="ml-2">View Session History</span>
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {activeTables.map(table => {
                    const session = activeSessions.get(table.id);
                    return (
                        <Card 
                            key={table.id}
                            className={`cursor-pointer transition-all duration-300 ${getStatusStyles(table.status)}`}
                            onClick={() => handleTableClick(table)}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                                <h3 className="text-xl font-bold text-white">{table.name}</h3>
                                <p className="text-sm font-semibold mt-1">{table.status}</p>
                                {session && (
                                    <div className="mt-4 text-xs">
                                        <p className="font-mono text-lg">{formatDuration(session.durationMs)}</p>
                                        <p className="font-semibold text-base text-indigo-400 mt-1">{formatCurrency(session.totalCharge || 0)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selectedTable && (
                <SessionControlModal
                    table={selectedTable}
                    session={activeSessions.get(selectedTable.id) || null}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default FloorPage;
import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { USERS } from '../../constants';
import { AuditLogAction } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const AuditLogPage: React.FC = () => {
    const { auditLogs } = useData();

    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedUser, setSelectedUser] = useState('ALL');
    const [selectedAction, setSelectedAction] = useState('ALL');

    const filteredLogs = useMemo(() => {
        const start = new Date(startDate.replace(/-/g, '/'));
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate.replace(/-/g, '/'));
        end.setHours(23, 59, 59, 999);

        return auditLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            if (logDate < start || logDate > end) return false;
            if (selectedUser !== 'ALL' && log.userId !== selectedUser) return false;
            if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
            return true;
        });
    }, [auditLogs, startDate, endDate, selectedUser, selectedAction]);

    const formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const getActionBadgeColor = (action: AuditLogAction) => {
        if (action.startsWith('SHIFT')) return 'bg-blue-900 text-blue-300';
        if (action.startsWith('SALE')) return 'bg-red-900 text-red-300';
        if (action.includes('CREATE')) return 'bg-green-900 text-green-300';
        if (action.includes('UPDATE')) return 'bg-yellow-900 text-yellow-300';
        if (action.includes('DELETE')) return 'bg-purple-900 text-purple-300';
        return 'bg-slate-700 text-slate-300';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Audit Log</h1>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <CardTitle>Filter Logs</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <Select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-auto md:w-40">
                                <option value="ALL">All Users</option>
                                {USERS.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </Select>
                            <Select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} className="w-auto md:w-48">
                                <option value="ALL">All Actions</option>
                                {Object.values(AuditLogAction).map(action => <option key={action} value={action}>{action.replace('_', ' ')}</option>)}
                            </Select>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-auto md:w-36"/>
                            <span className="hidden md:inline">to</span>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-auto md:w-36"/>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Timestamp</th>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                    <th scope="col" className="px-6 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                                        <td className="px-6 py-4 font-medium text-slate-200">{log.userName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{log.details}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-500">No audit logs found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuditLogPage;

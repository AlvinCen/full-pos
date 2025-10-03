
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { Session, SessionStatus, BilliardTableType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

const SessionHistoryPage: React.FC = () => {
  const { sessions, billiardTables, pricelistPackages } = useData();
  const navigate = useNavigate();
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedTableType, setSelectedTableType] = useState('ALL');
  const [selectedPackageId, setSelectedPackageId] = useState('ALL');

  const filteredSessions = useMemo(() => {
    const tableTypeMap = new Map(billiardTables.map(t => [t.name, t.tableType]));

    const endedSessions = sessions.filter(s => s.status === SessionStatus.ENDED && s.endTime).sort((a, b) => (b.endTime ?? 0) - (a.endTime ?? 0));

    if (!startDate || !endDate) return endedSessions;
    
    const start = new Date(startDate.replace(/-/g, '/'));
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate.replace(/-/g, '/'));
    end.setHours(23, 59, 59, 999);

    return endedSessions.filter(session => {
      if (!session.endTime) return false;
      const sessionEndDate = new Date(session.endTime);
      if(sessionEndDate < start || sessionEndDate > end) {
        return false;
      }

      if (selectedTableType !== 'ALL') {
          const tableType = tableTypeMap.get(session.tableName);
          if (tableType !== selectedTableType) {
              return false;
          }
      }

      if (selectedPackageId !== 'ALL') {
          if (session.packageSnapshot.id !== selectedPackageId) {
              return false;
          }
      }
      
      return true;
    });
  }, [sessions, startDate, endDate, selectedTableType, selectedPackageId, billiardTables]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Billiard Session History</h1>
        <Button variant="secondary" onClick={() => navigate('/billiards')}>Back to Floor</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <CardTitle>Filter Sessions</CardTitle>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Select value={selectedTableType} onChange={e => setSelectedTableType(e.target.value)} className="w-auto md:w-36">
                  <option value="ALL">All Types</option>
                  {Object.values(BilliardTableType).map(type => (
                      <option key={type} value={type}>{type}</option>
                  ))}
              </Select>
              <Select value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)} className="w-auto md:w-48">
                  <option value="ALL">All Packages</option>
                  {pricelistPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
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
                  <th scope="col" className="px-6 py-3">Table</th>
                  <th scope="col" className="px-6 py-3">Package</th>
                  <th scope="col" className="px-6 py-3">Start Time</th>
                  <th scope="col" className="px-6 py-3">End Time</th>
                  <th scope="col" className="px-6 py-3">Duration</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Charge</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-200">{session.tableName}</td>
                    <td className="px-6 py-4">{session.packageSnapshot.name}</td>
                    <td className="px-6 py-4">{formatDateTime(session.startTime)}</td>
                    <td className="px-6 py-4">{session.endTime ? formatDateTime(session.endTime) : 'N/A'}</td>
                    <td className="px-6 py-4 font-mono">{formatDuration(session.durationMs)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-white">{formatCurrency(session.totalCharge)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No ended sessions found for the selected period.</td>
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

export default SessionHistoryPage;

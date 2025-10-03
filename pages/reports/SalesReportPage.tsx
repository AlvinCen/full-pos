import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import BarChart from '../../components/BarChart';
import { Button } from '../../components/ui/Button';
import { Sale, SaleStatus } from '../../types';

const VoidSaleModal: React.FC<{
  sale: Sale;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}> = ({ sale, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    } else {
      alert("A reason is required to void a sale.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Void Sale {sale.invoiceNo}</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="voidReason" className="text-sm font-medium text-slate-300">Reason for Voiding</label>
            <Input
              id="voidReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              autoFocus
              className="mt-2"
              placeholder="e.g., Customer cancellation, wrong order"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="destructive">Confirm Void</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};


const SalesReportPage: React.FC = () => {
  const { sales, voidSale } = useData();
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate.replace(/-/g, '/'));
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate.replace(/-/g, '/'));
    end.setHours(23, 59, 59, 999);

    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, startDate, endDate]);

  const chartData = useMemo(() => {
    const dailySales = new Map<string, number>();
    filteredSales.forEach(sale => {
        if (sale.status !== SaleStatus.COMPLETED) return;

        const saleDate = new Date(sale.date);
        const year = saleDate.getFullYear();
        const month = String(saleDate.getMonth() + 1).padStart(2, '0');
        const day = String(saleDate.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;

        const currentTotal = dailySales.get(localDateString) || 0;
        dailySales.set(localDateString, currentTotal + sale.total);
    });

    const data: { date: string, total: number }[] = [];
    if (!startDate || !endDate) return data;

    let currentDate = new Date(startDate.replace(/-/g, '/'));
    const finalDate = new Date(endDate.replace(/-/g, '/'));

    while(currentDate <= finalDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        data.push({
            date: dateString,
            total: dailySales.get(dateString) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
}, [filteredSales, startDate, endDate]);

  const totalRevenue = useMemo(() => {
      return filteredSales
        .filter(sale => sale.status === SaleStatus.COMPLETED)
        .reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID');

  const handleConfirmVoid = (reason: string) => {
    if (voidingSale) {
        voidSale(voidingSale.id, reason);
        setVoidingSale(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ["Invoice #", "Date", "Items", "Payment Method", "Subtotal", "Tax", "Total", "Status"];
    const csvRows = [headers.join(',')];

    filteredSales.forEach(sale => {
        const row = [
            sale.invoiceNo,
            `"${formatDate(sale.date)}"`,
            sale.items.reduce((sum, item) => sum + item.qty, 0),
            sale.paymentMethod,
            sale.subtotal,
            sale.tax,
            sale.total,
            sale.status,
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Sales Report</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Revenue Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <CardTitle>Sales Data</CardTitle>
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36"/>
                    <span>to</span>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36"/>
                    <Button variant="secondary" onClick={handleExportCSV}>Export to CSV</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Invoice #</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Items</th>
                  <th scope="col" className="px-6 py-3">Payment</th>
                  <th scope="col" className="px-6 py-3 text-right">Total</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? filteredSales.map((sale) => (
                  <tr key={sale.id} className={`border-b border-slate-800 ${sale.status === SaleStatus.VOIDED ? 'bg-slate-800/30 text-slate-500 line-through' : 'hover:bg-slate-800/50'}`}>
                    <td className="px-6 py-4 font-medium text-slate-200">{sale.invoiceNo}</td>
                    <td className="px-6 py-4">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4">{sale.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                    <td className="px-6 py-4">{sale.paymentMethod}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${sale.status !== SaleStatus.VOIDED && 'text-white'}`}>{formatCurrency(sale.total)}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            sale.status === SaleStatus.COMPLETED ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                            {sale.status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        {sale.status === SaleStatus.COMPLETED && (
                            <Button variant="destructive" size="sm" onClick={() => setVoidingSale(sale)}>Void</Button>
                        )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">No sales found for the selected period.</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-white bg-slate-800">
                    <td colSpan={6} className="px-6 py-3 text-right text-lg">Total Revenue (Completed Sales)</td>
                    <td className="px-6 py-3 text-right text-lg">{formatCurrency(totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {voidingSale && (
        <VoidSaleModal sale={voidingSale} onClose={() => setVoidingSale(null)} onConfirm={handleConfirmVoid} />
      )}
    </div>
  );
};

export default SalesReportPage;
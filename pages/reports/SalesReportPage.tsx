import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import BarChart from '../../components/BarChart';
import { Button } from '../../components/ui/Button';

const SalesReportPage: React.FC = () => {
  const { sales } = useData();
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const filteredSales = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    // Using .replace() for cross-browser compatibility on parsing 'YYYY-MM-DD' as local time
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
      return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID');

  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ["Invoice #", "Date", "Items", "Payment Method", "Subtotal", "Tax", "Total"];
    const csvRows = [headers.join(',')];

    filteredSales.forEach(sale => {
        const row = [
            sale.invoiceNo,
            `"${formatDate(sale.date)}"`, // Enclose date in quotes to handle potential commas
            sale.items.reduce((sum, item) => sum + item.qty, 0),
            sale.paymentMethod,
            sale.subtotal,
            sale.tax,
            sale.total,
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
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-200">{sale.invoiceNo}</td>
                    <td className="px-6 py-4">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4">{sale.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                    <td className="px-6 py-4">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 text-right font-semibold text-white">{formatCurrency(sale.total)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">No sales found for the selected period.</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-white bg-slate-800">
                    <td colSpan={4} className="px-6 py-3 text-right text-lg">Total Revenue</td>
                    <td className="px-6 py-3 text-right text-lg">{formatCurrency(totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReportPage;
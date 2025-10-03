
import React from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { sales, products } = useData();

    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(s => s.date.startsWith(today));
    const totalRevenueToday = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
    const lowStockProducts = products.filter(p => p.stock < p.minStock);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Welcome back, {user?.name}!</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-indigo-400">{formatCurrency(totalRevenueToday)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-teal-400">{todaysSales.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-amber-400">{lowStockProducts.length}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Low Stock Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                      {lowStockProducts.length > 0 ? (
                          <ul className="divide-y divide-slate-800">
                              {lowStockProducts.map(p => (
                                  <li key={p.id} className="py-3 flex justify-between items-center">
                                      <span className="text-slate-300">{p.name}</span>
                                      <span className="font-semibold text-red-500">Stock: {p.stock} (Min: {p.minStock})</span>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <p className="text-slate-400">No products are low on stock.</p>
                      )}
                  </CardContent>
              </Card>
            </div>
        </div>
    );
};

export default DashboardPage;

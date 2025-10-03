
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const PurchasesPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Purchases</h1>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Purchase management feature is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasesPage;

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { useData } from '../../hooks/useData';
import { Outlet } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const OutletSettingsPage: React.FC = () => {
    const { outlet, updateOutlet } = useData();
    const [formData, setFormData] = useState<Outlet | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
  
    useEffect(() => {
      setFormData(outlet);
    }, [outlet]);
    
    if (!formData) {
        return <div>Loading...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => prev ? {
          ...prev,
          [name]: name === 'taxPercent' ? Number(value) : value,
      } : null);
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData) return;

      setIsLoading(true);
      setIsSuccess(false);
      
      // Simulate API call
      setTimeout(() => {
          updateOutlet(formData);
          setIsLoading(false);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000); // Hide success message after 2s
      }, 500);
    };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
      <Card>
        <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Outlet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-slate-300 block mb-2">Outlet Name</label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label htmlFor="phone" className="text-sm font-medium text-slate-300 block mb-2">Phone</label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                </div>
                <div>
                    <label htmlFor="address" className="text-sm font-medium text-slate-300 block mb-2">Address</label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="taxPercent" className="text-sm font-medium text-slate-300 block mb-2">Default Sales Tax (%)</label>
                        <Input id="taxPercent" name="taxPercent" type="number" value={formData.taxPercent} onChange={handleChange} required min="0" step="0.01" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="receiptHeader" className="text-sm font-medium text-slate-300 block mb-2">Receipt Header</label>
                        <Input id="receiptHeader" name="receiptHeader" value={formData.receiptHeader} onChange={handleChange} />
                    </div>
                     <div>
                        <label htmlFor="receiptFooter" className="text-sm font-medium text-slate-300 block mb-2">Receipt Footer</label>
                        <Input id="receiptFooter" name="receiptFooter" value={formData.receiptFooter} onChange={handleChange} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                {isSuccess ? <p className="text-sm text-green-400">Settings saved successfully!</p> : <div />}
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Settings'}</Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default OutletSettingsPage;
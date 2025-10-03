
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PricelistPackage, BilliardTableType, PricingUnit, RoundingMethod } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { PlusIcon, TrashIcon, EditIcon } from '../../components/icons/Icons';

const PricelistModal: React.FC<{
  pkg: PricelistPackage | null;
  onClose: () => void;
  onSave: (pkg: Omit<PricelistPackage, 'id'> | PricelistPackage) => void;
}> = ({ pkg, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<PricelistPackage, 'id'>>({
    name: pkg?.name || '',
    tableType: pkg?.tableType || BilliardTableType.POOL,
    unit: pkg?.unit || PricingUnit.PER_HOUR,
    pricePerUnit: pkg?.pricePerUnit || 0,
    rounding: pkg?.rounding || RoundingMethod.NONE,
    graceMinutes: pkg?.graceMinutes || 0,
    minBillMinutes: pkg?.minBillMinutes || 0,
    isActive: pkg?.isActive === undefined ? true : pkg.isActive,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumeric = ['pricePerUnit', 'graceMinutes', 'minBillMinutes'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pkg) {
        onSave({ ...formData, id: pkg.id });
    } else {
        onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{pkg ? 'Edit Package' : 'Add New Package'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Package Name</label>
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Table Type</label>
                    <Select name="tableType" value={formData.tableType} onChange={handleChange}>
                        {Object.values(BilliardTableType).map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Pricing Unit</label>
                    <Select name="unit" value={formData.unit} onChange={handleChange}>
                        {Object.values(PricingUnit).map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
                    </Select>
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Price Per Unit</label>
                    <Input name="pricePerUnit" type="number" min="0" value={formData.pricePerUnit} onChange={handleChange} required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Rounding</label>
                    <Select name="rounding" value={formData.rounding} onChange={handleChange}>
                        {Object.values(RoundingMethod).map(r => <option key={r} value={r}>{r.replace('UP_', 'UP ')}</option>)}
                    </Select>
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Grace (mins)</label>
                    <Input name="graceMinutes" type="number" min="0" value={formData.graceMinutes} onChange={handleChange} required />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Min Bill (mins)</label>
                    <Input name="minBillMinutes" type="number" min="0" value={formData.minBillMinutes} onChange={handleChange} required />
                </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
                <Switch id="isActive" checked={formData.isActive} onChange={(c) => setFormData(p => ({...p, isActive: c}))} />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Package is Active</label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Package</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const PricelistPage: React.FC = () => {
    const { pricelistPackages, addPricelistPackage, updatePricelistPackage, deletePricelistPackage } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PricelistPackage | null>(null);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    const handleAddNew = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (pkg: PricelistPackage) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            deletePricelistPackage(id);
        }
    };
    
    const handleSave = (pkg: Omit<PricelistPackage, 'id'> | PricelistPackage) => {
        if ('id' in pkg) {
            updatePricelistPackage(pkg);
        } else {
            addPricelistPackage(pkg);
        }
        setIsModalOpen(false);
        setEditingPackage(null);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Billiard Pricelist</h1>
                <Button onClick={handleAddNew}>
                    <PlusIcon />
                    <span className="ml-2">Add New Package</span>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                                <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Table Type</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricelistPackages.map((pkg) => (
                                <tr key={pkg.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-200">{pkg.name}</td>
                                    <td className="px-6 py-4">{pkg.tableType}</td>
                                    <td className="px-6 py-4">{formatCurrency(pkg.pricePerUnit)} / {pkg.unit.split('_')[1]}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${pkg.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                            {pkg.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}><EditIcon /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-900/50" onClick={() => handleDelete(pkg.id)}><TrashIcon /></Button>
                                        </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && <PricelistModal pkg={editingPackage} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default PricelistPage;

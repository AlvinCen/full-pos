
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { BilliardTable, BilliardTableType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';

interface TableModalProps {
  table: BilliardTable | null;
  onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ table, onClose }) => {
  const { addBilliardTable, updateBilliardTable } = useData();

  const [formData, setFormData] = useState({
    name: table?.name || '',
    tableType: table?.tableType || BilliardTableType.POOL,
    group: table?.group || '',
    isActive: table?.isActive === undefined ? true : table.isActive,
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
        setError('Table name/number is required.');
        return;
    }

    let result;
    if (table) {
        // Editing existing table
        result = updateBilliardTable({ ...formData, id: table.id });
    } else {
        // Adding new table
        result = addBilliardTable(formData);
    }

    if (result.success) {
        onClose();
    } else {
        setError(result.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{table ? 'Edit Billiard Table' : 'Add New Billiard Table'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Table Name / Number</label>
                <Input name="name" value={formData.name} onChange={handleChange} required autoFocus />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Table Type</label>
                    <Select name="tableType" value={formData.tableType} onChange={handleChange}>
                        {Object.values(BilliardTableType).map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Group (Optional)</label>
                    <Input name="group" value={formData.group} onChange={handleChange} placeholder="e.g., VIP Area"/>
                </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
                <Switch id="isActive" checked={formData.isActive} onChange={(c) => setFormData(p => ({...p, isActive: c}))} />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Is Active (Available for play)</label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Table</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TableModal;

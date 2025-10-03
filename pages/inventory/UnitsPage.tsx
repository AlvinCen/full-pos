import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { Unit } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PlusIcon, TrashIcon, EditIcon } from '../../components/icons/Icons';

const UnitModal: React.FC<{
  unit: Unit | null;
  onClose: () => void;
  onSave: (id: string | null, name: string, precision: number) => void;
}> = ({ unit, onClose, onSave }) => {
  const [name, setName] = useState(unit?.name || '');
  const [precision, setPrecision] = useState(unit?.precision || 0);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(unit?.id || null, name.trim(), Math.max(0, precision));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{unit ? 'Edit Unit' : 'Add New Unit'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label htmlFor="unitName" className="text-sm font-medium text-slate-300">Unit Name</label>
                <Input 
                  id="unitName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="mt-2"
                />
            </div>
             <div>
                <label htmlFor="precision" className="text-sm font-medium text-slate-300">Precision (Decimal Places)</label>
                <Input 
                  id="precision"
                  type="number"
                  value={precision}
                  onChange={(e) => setPrecision(parseInt(e.target.value, 10))}
                  required
                  min="0"
                  max="4"
                  step="1"
                  className="mt-2"
                />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const UnitsPage: React.FC = () => {
    const { units, addUnit, updateUnit, deleteUnit } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const handleAddNew = () => {
        setEditingUnit(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
            const result = deleteUnit(id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };
    
    const handleSave = (id: string | null, name: string, precision: number) => {
        if (id) {
            updateUnit(id, name, precision);
        } else {
            addUnit(name, precision);
        }
        setIsModalOpen(false);
        setEditingUnit(null);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Units of Measurement</h1>
                <Button onClick={handleAddNew}>
                    <PlusIcon />
                    <span className="ml-2">Add New Unit</span>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    {units.length > 0 ? (
                        <ul className="divide-y divide-slate-800">
                            {units.map(unit => (
                                <li key={unit.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50">
                                    <div>
                                        <p className="text-slate-200">{unit.name}</p>
                                        <p className="text-xs text-slate-400">Precision: {unit.precision} decimal places</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)} aria-label={`Edit ${unit.name}`}><EditIcon /></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-900/50" onClick={() => handleDelete(unit.id)} aria-label={`Delete ${unit.name}`}><TrashIcon /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 text-center p-8">No units found. Add one to get started.</p>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && <UnitModal unit={editingUnit} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default UnitsPage;
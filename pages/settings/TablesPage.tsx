
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { BilliardTable, UserRole } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlusIcon, TrashIcon, EditIcon } from '../../components/icons/Icons';
import TableModal from '../../components/settings/TableModal';

const TablesPage: React.FC = () => {
    const { billiardTables, deleteBilliardTable } = useData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<BilliardTable | null>(null);

    const isAdmin = user?.role === UserRole.ADMIN;

    const handleAddNew = () => {
        setEditingTable(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (table: BilliardTable) => {
        setEditingTable(table);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this table? This cannot be undone.')) {
            const result = deleteBilliardTable(id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Manage Billiard Tables</h1>
                {isAdmin && (
                    <Button onClick={handleAddNew}>
                        <PlusIcon />
                        <span className="ml-2">Add New Table</span>
                    </Button>
                )}
            </div>
            <Card>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Table Name/Number</th>
                                    <th scope="col" className="px-6 py-3">Type</th>
                                    <th scope="col" className="px-6 py-3">Group</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    {isAdmin && <th scope="col" className="px-6 py-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {billiardTables.map((table) => (
                                <tr key={table.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-200">{table.name}</td>
                                    <td className="px-6 py-4">{table.tableType}</td>
                                    <td className="px-6 py-4">{table.group || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${table.isActive ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                            {table.isActive ? 'Active' : 'Maintenance'}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(table)}><EditIcon /></Button>
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-900/50" onClick={() => handleDelete(table.id)}><TrashIcon /></Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && <TableModal table={editingTable} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default TablesPage;

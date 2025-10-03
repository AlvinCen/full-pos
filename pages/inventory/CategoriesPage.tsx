import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { Category } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PlusIcon, TrashIcon, EditIcon } from '../../components/icons/Icons';

const CategoryModal: React.FC<{
  category: Category | null;
  onClose: () => void;
  onSave: (id: string | null, name: string) => void;
}> = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(category?.id || null, name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="categoryName" className="text-sm font-medium text-slate-300">Category Name</label>
            <Input 
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="mt-2"
            />
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

const CategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            const result = deleteCategory(id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };
    
    const handleSave = (id: string | null, name: string) => {
        if (id) {
            updateCategory(id, name);
        } else {
            addCategory(name);
        }
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Product Categories</h1>
                <Button onClick={handleAddNew}>
                    <PlusIcon />
                    <span className="ml-2">Add New Category</span>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    {categories.length > 0 ? (
                        <ul className="divide-y divide-slate-800">
                            {categories.map(cat => (
                                <li key={cat.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50">
                                    <span className="text-slate-200">{cat.name}</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)} aria-label={`Edit ${cat.name}`}><EditIcon /></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-900/50" onClick={() => handleDelete(cat.id)} aria-label={`Delete ${cat.name}`}><TrashIcon /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 text-center p-8">No categories found. Add one to get started.</p>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && <CategoryModal category={editingCategory} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default CategoriesPage;
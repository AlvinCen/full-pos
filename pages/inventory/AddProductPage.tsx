import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { Product } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';

const AddProductPage: React.FC = () => {
    const navigate = useNavigate();
    const { addProduct, categories, units } = useData();

    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '',
        sku: '',
        barcode: '',
        categoryId: '',
        unitId: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 0,
        isKitchen: false,
        isFnb: false,
        isActive: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['price', 'cost', 'stock', 'minStock'].includes(name);
        
        setFormData(prev => ({
            ...prev,
            [name]: isNumeric ? parseFloat(value) || 0 : value
        }));
    };

    const handleSwitchChange = (name: keyof Omit<Product, 'id'>, checked: boolean) => {
         setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.categoryId) {
            setError('Please select a category.');
            setIsLoading(false);
            return;
        }
        if (!formData.unitId) {
            setError('Please select a unit.');
            setIsLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            const result = addProduct(formData);
            setIsLoading(false);
            if (result.success) {
                navigate(`/inventory/products`);
            } else {
                setError(result.message || 'An unknown error occurred.');
            }
        }, 500);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Add New Product</h1>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-slate-300 block mb-2">Product Name</label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="sku" className="text-sm font-medium text-slate-300 block mb-2">SKU (Stock Keeping Unit)</label>
                                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="barcode" className="text-sm font-medium text-slate-300 block mb-2">Barcode (Optional)</label>
                                <Input id="barcode" name="barcode" value={formData.barcode || ''} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="categoryId" className="text-sm font-medium text-slate-300 block mb-2">Category</label>
                                <Select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="unitId" className="text-sm font-medium text-slate-300 block mb-2">Unit</label>
                                <Select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} required>
                                     <option value="" disabled>Select a unit</option>
                                    {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label htmlFor="price" className="text-sm font-medium text-slate-300 block mb-2">Selling Price</label>
                                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required min="0" step="any" />
                            </div>
                            <div>
                                <label htmlFor="cost" className="text-sm font-medium text-slate-300 block mb-2">Cost Price</label>
                                <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} required min="0" step="any" />
                            </div>
                            <div>
                                <label htmlFor="stock" className="text-sm font-medium text-slate-300 block mb-2">Initial Stock</label>
                                <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" />
                            </div>
                             <div>
                                <label htmlFor="minStock" className="text-sm font-medium text-slate-300 block mb-2">Minimum Stock Alert</label>
                                <Input id="minStock" name="minStock" type="number" value={formData.minStock} onChange={handleChange} required min="0" />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <Switch id="isKitchen" checked={formData.isKitchen} onChange={(c) => handleSwitchChange('isKitchen', c)} />
                                <label htmlFor="isKitchen" className="text-sm font-medium text-slate-300">Is Kitchen Item?</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch id="isFnb" checked={formData.isFnb} onChange={(c) => handleSwitchChange('isFnb', c)} />
                                <label htmlFor="isFnb" className="text-sm font-medium text-slate-300">Is F&B Item? (for Billiards)</label>
                            </div>
                             <div className="flex items-center gap-3">
                                <Switch id="isActive" checked={formData.isActive} onChange={(c) => handleSwitchChange('isActive', c)} />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Is Active?</label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {error && <p className="text-sm text-red-500 mr-auto">{error}</p>}
                        <Button type="button" variant="secondary" onClick={() => navigate(`/inventory/products`)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Product'}</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default AddProductPage;
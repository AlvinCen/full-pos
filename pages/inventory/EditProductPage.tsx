import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { Product } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';

const EditProductPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { getProductById, updateProduct, categories, units } = useData();

    const [formData, setFormData] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (productId) {
            const product = getProductById(productId);
            if (product) {
                setFormData(product);
            }
        }
    }, [productId, getProductById]);

    if (!formData) {
        return <div className="text-center text-slate-400">Loading product data...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = ['price', 'cost', 'stock', 'minStock'].includes(name);
        
        setFormData(prev => prev ? {
            ...prev,
            [name]: isNumeric ? parseFloat(value) : value
        } : null);
    };

    const handleSwitchChange = (name: keyof Product, checked: boolean) => {
         setFormData(prev => prev ? {
            ...prev,
            [name]: checked
        } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
                updateProduct(formData);
                setIsLoading(false);
                navigate(`/inventory/products/${productId}`);
            }, 500);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Edit: {formData.name}</h1>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-slate-300 block mb-2">Product Name</label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="sku" className="text-sm font-medium text-slate-300 block mb-2">SKU</label>
                                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="categoryId" className="text-sm font-medium text-slate-300 block mb-2">Category</label>
                                <Select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="unitId" className="text-sm font-medium text-slate-300 block mb-2">Unit</label>
                                <Select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange}>
                                    {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label htmlFor="price" className="text-sm font-medium text-slate-300 block mb-2">Selling Price</label>
                                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="cost" className="text-sm font-medium text-slate-300 block mb-2">Cost Price</label>
                                <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="stock" className="text-sm font-medium text-slate-300 block mb-2">Stock</label>
                                <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
                            </div>
                             <div>
                                <label htmlFor="minStock" className="text-sm font-medium text-slate-300 block mb-2">Min Stock</label>
                                <Input id="minStock" name="minStock" type="number" value={formData.minStock} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <Switch id="isKitchen" checked={formData.isKitchen} onChange={(c) => handleSwitchChange('isKitchen', c)} />
                                <label htmlFor="isKitchen" className="text-sm font-medium text-slate-300">Is Kitchen Item?</label>
                            </div>
                             <div className="flex items-center gap-3">
                                <Switch id="isActive" checked={formData.isActive} onChange={(c) => handleSwitchChange('isActive', c)} />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Is Active?</label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => navigate(`/inventory/products/${productId}`)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default EditProductPage;
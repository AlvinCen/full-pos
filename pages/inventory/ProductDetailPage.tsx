
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { getProductById, getCategoryById, getUnitById } = useData();

    if (!productId) {
        return <div className="text-center text-slate-400">Product ID not provided.</div>;
    }

    const product = getProductById(productId);

    if (!product) {
        return <div className="text-center text-slate-400">Product not found.</div>;
    }

    const category = getCategoryById(product.categoryId);
    const unit = getUnitById(product.unitId);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white truncate">{product.name}</h1>
                <div>
                    <Button variant="secondary" onClick={() => navigate('/inventory/products')}>Back to List</Button>
                    <Button className="ml-2" onClick={() => navigate(`/inventory/products/${productId}/edit`)}>Edit Product</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">SKU</dt>
                                <dd className="mt-1 text-base text-white">{product.sku}</dd>
                            </div>
                            <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">Barcode</dt>
                                <dd className="mt-1 text-base text-white">{product.barcode || 'N/A'}</dd>
                            </div>
                            <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">Category</dt>
                                <dd className="mt-1 text-base text-white">{category?.name || 'N/A'}</dd>
                            </div>
                            <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">Unit</dt>
                                <dd className="mt-1 text-base text-white">{unit?.name || 'N/A'}</dd>
                            </div>
                             <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">Kitchen Item</dt>
                                <dd className="mt-1 text-base text-white">{product.isKitchen ? 'Yes' : 'No'}</dd>
                            </div>
                             <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">F&B Item (for Billiards)</dt>
                                <dd className="mt-1 text-base text-white">{product.isFnb ? 'Yes' : 'No'}</dd>
                            </div>
                             <div className="border-b border-slate-800 py-2">
                                <dt className="text-sm font-medium text-slate-400">Status</dt>
                                <dd className="mt-1 text-base">
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-slate-400">Cost Price</span>
                                <span className="font-semibold text-white">{formatCurrency(product.cost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Selling Price</span>
                                <span className="font-semibold text-white">{formatCurrency(product.price)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Stock on Hand</span>
                                <span className={`font-bold text-xl ${product.stock < product.minStock ? 'text-red-500' : 'text-green-500'}`}>{product.stock}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-slate-400">Minimum Stock</span>
                                <span className="font-semibold text-white">{product.minStock}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

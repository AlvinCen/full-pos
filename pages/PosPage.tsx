import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Product, Sale, SaleItem, PaymentMethod } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PlusIcon, MinusIcon, TrashIcon } from '../components/icons/Icons';
import Receipt from '../components/Receipt';

interface CartItem extends SaleItem {
    product: Product;
    discountInput: string;
}

const PosPage: React.FC = () => {
    const { products, addSale, outlet, activeShift } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [amountPaid, setAmountPaid] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeShift) {
            barcodeInputRef.current?.focus();
        }
    }, [activeShift]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const addToCart = useCallback((product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            } else {
                return [...prevCart, { id: `si-${Date.now()}`, saleId: '', productId: product.id, qty: 1, price: product.price, discount: 0, discountInput: '', product }];
            }
        });
    }, []);

    const updateCartQty = (productId: string, newQty: number) => {
        setCart(prevCart => {
            if (newQty <= 0) {
                return prevCart.filter(item => item.productId !== productId);
            }
            return prevCart.map(item =>
                item.productId === productId ? { ...item, qty: newQty } : item
            );
        });
    };

    const handleDiscountChange = (productId: string, value: string) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.productId === productId) {
                    let calculatedDiscount = 0;
                    const itemTotal = item.price * item.qty;
    
                    if (value.endsWith('%')) {
                        const percentage = parseFloat(value.slice(0, -1));
                        if (!isNaN(percentage)) {
                            calculatedDiscount = (itemTotal * percentage) / 100;
                        }
                    } else {
                        const amount = parseFloat(value);
                        if (!isNaN(amount)) {
                            calculatedDiscount = amount;
                        }
                    }
    
                    calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, itemTotal));
    
                    return { ...item, discountInput: value, discount: calculatedDiscount };
                }
                return item;
            });
        });
    };

    const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const scannedBarcode = e.currentTarget.value.trim();
            if (scannedBarcode) {
                const product = products.find(p => p.barcode === scannedBarcode);
                if (product) {
                    addToCart(product);
                } else {
                    alert('Product not found!');
                }
                e.currentTarget.value = '';
                setSearchTerm('');
            }
        }
    };
    
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.qty, 0), [cart]);
    const totalDiscount = useMemo(() => cart.reduce((acc, item) => acc + item.discount, 0), [cart]);
    const taxableAmount = useMemo(() => subtotal - totalDiscount, [subtotal, totalDiscount]);
    const tax = useMemo(() => taxableAmount * (outlet.taxPercent / 100), [taxableAmount, outlet.taxPercent]);
    const total = useMemo(() => taxableAmount + tax, [taxableAmount, tax]);
    const change = useMemo(() => amountPaid - total, [amountPaid, total]);

    const handlePayment = () => {
        if (!user || !activeShift) return;
        if (cart.length === 0) return;
        
        const sale = addSale({
            outletId: user.outletId || 'outlet-1',
            userId: user.id,
            subtotal,
            discount: totalDiscount,
            tax,
            total,
            paymentMethod,
            paid: amountPaid,
            change: change > 0 ? change : 0,
            items: cart.map(({ product, discountInput, ...saleItem }) => saleItem),
        });

        setLastSale(sale);
        setShowPaymentModal(false);
        setCart([]);
        setAmountPaid(0);
        setShowReceipt(true);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    if (showReceipt && lastSale) {
        return <Receipt sale={lastSale} onBack={() => {
            setShowReceipt(false);
            setLastSale(null);
        }} />;
    }

    if (!activeShift) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>No Active Shift</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400 mb-6">You must start a new shift before you can make any sales.</p>
                        <Button onClick={() => navigate('/shifts')}>Go to Shifts Page</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8.5rem)]">
            {/* Product List */}
            <div className="lg:col-span-2 h-full flex flex-col">
                <Card className="flex-shrink-0">
                    <CardContent className="p-4">
                         <Input
                            ref={barcodeInputRef}
                            placeholder="Scan barcode or search product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleBarcodeScan}
                        />
                    </CardContent>
                </Card>
                <div className="flex-grow overflow-y-auto mt-4 pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="cursor-pointer hover:border-indigo-500 transition-all" onClick={() => addToCart(product)}>
                                <div className="aspect-square bg-slate-800 rounded-t-2xl flex items-center justify-center">
                                    <span className="text-3xl">{product.name.charAt(0)}</span>
                                </div>
                                <div className="p-3 text-center">
                                    <p className="font-semibold text-sm truncate text-white">{product.name}</p>
                                    <p className="text-xs text-slate-400">{formatCurrency(product.price)}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart */}
            <div className="h-full flex flex-col">
                <Card className="flex-grow flex flex-col">
                    <CardHeader>
                        <CardTitle>Current Order</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto pr-2">
                        {cart.length === 0 ? (
                            <p className="text-slate-400 text-center mt-8">Cart is empty</p>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.productId} className="bg-slate-800/50 p-3 rounded-lg">
                                        <div className="flex items-start">
                                            <div className="flex-grow">
                                                <p className="font-semibold text-sm text-white">{item.product.name}</p>
                                                <p className="text-xs text-slate-400">{formatCurrency(item.price)} x {item.qty} = {formatCurrency(item.price * item.qty)}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <Button variant="ghost" size="sm" onClick={() => updateCartQty(item.productId, item.qty - 1)}><MinusIcon /></Button>
                                                <span className="w-8 text-center text-sm">{item.qty}</span>
                                                <Button variant="ghost" size="sm" onClick={() => updateCartQty(item.productId, item.qty + 1)}><PlusIcon /></Button>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-red-500 ml-1" onClick={() => updateCartQty(item.productId, 0)}><TrashIcon /></Button>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Discount (% or amount)"
                                                className="h-8 text-xs flex-grow"
                                                value={item.discountInput}
                                                onChange={(e) => handleDiscountChange(item.productId, e.target.value)}
                                            />
                                            {item.discount > 0 && (
                                                <span className="text-xs text-red-400 whitespace-nowrap">- {formatCurrency(item.discount)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t border-slate-800 space-y-2">
                         <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                         <div className="flex justify-between text-sm text-red-400"><span>Discount</span><span>- {formatCurrency(totalDiscount)}</span></div>
                         <div className="flex justify-between text-sm"><span>Tax ({outlet.taxPercent}%)</span><span>{formatCurrency(tax)}</span></div>
                         <div className="flex justify-between font-bold text-lg text-white"><span>Total</span><span>{formatCurrency(total)}</span></div>
                         <Button className="w-full mt-4" size="lg" disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)}>
                            Pay
                         </Button>
                    </div>
                </Card>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h3 className="text-3xl font-bold text-center text-white">{formatCurrency(total)}</h3>
                            <div>
                                <label className="text-sm font-medium">Payment Method</label>
                                <div className="flex gap-2 mt-2">
                                    {(Object.keys(PaymentMethod) as Array<keyof typeof PaymentMethod>).map(key => (
                                         <Button key={key} variant={paymentMethod === PaymentMethod[key] ? 'primary' : 'secondary'} onClick={() => setPaymentMethod(PaymentMethod[key])} className="flex-1">
                                            {PaymentMethod[key]}
                                         </Button>
                                    ))}
                                </div>
                            </div>
                            {paymentMethod === PaymentMethod.CASH && (
                                <div>
                                    <label htmlFor="amountPaid" className="text-sm font-medium">Amount Paid</label>
                                    <Input
                                        id="amountPaid"
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                                        className="mt-2 text-lg text-right"
                                        autoFocus
                                    />
                                     <div className="mt-2 flex justify-between text-sm">
                                        <span>Change</span>
                                        <span className={change < 0 ? 'text-red-400' : 'text-green-400'}>{formatCurrency(change)}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                             <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                             <Button onClick={handlePayment} disabled={paymentMethod === PaymentMethod.CASH && amountPaid < total}>Confirm Payment</Button>
                        </CardFooter>
                    </Card>
                 </div>
            )}
        </div>
    );
};

export default PosPage;
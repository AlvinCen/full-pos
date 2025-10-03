
import React, { useEffect } from 'react';
import { useData } from '../hooks/useData';
import { KdsOrder, KdsOrderStatus } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const KdsPage: React.FC = () => {
    const { kdsOrders, updateKdsOrderStatus, updateKdsItemStatus, getProductById } = useData();
    
    // Simulate kitchen accepting new orders automatically
    useEffect(() => {
        const interval = setInterval(() => {
            const newOrder = kdsOrders.find(o => o.status === KdsOrderStatus.NEW);
            if (newOrder) {
                updateKdsOrderStatus(newOrder.id, KdsOrderStatus.ACCEPTED);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [kdsOrders, updateKdsOrderStatus]);


    const getStatusColor = (status: KdsOrderStatus) => {
        switch (status) {
            case KdsOrderStatus.NEW: return 'bg-blue-600';
            case KdsOrderStatus.ACCEPTED: return 'bg-yellow-600';
            case KdsOrderStatus.COOKING: return 'bg-orange-600';
            case KdsOrderStatus.READY: return 'bg-green-600';
            case KdsOrderStatus.SERVED: return 'bg-gray-700';
            case KdsOrderStatus.CANCELLED: return 'bg-red-700';
            default: return 'bg-slate-700';
        }
    };

    const handleItemClick = (orderId: string, itemId: string, currentStatus: KdsOrderStatus) => {
        let nextStatus = currentStatus;
        if (currentStatus === KdsOrderStatus.ACCEPTED || currentStatus === KdsOrderStatus.NEW) {
            nextStatus = KdsOrderStatus.COOKING;
        } else if (currentStatus === KdsOrderStatus.COOKING) {
            nextStatus = KdsOrderStatus.READY;
        }
        updateKdsItemStatus(orderId, itemId, nextStatus);
    };

    const handleOrderReady = (order: KdsOrder) => {
        updateKdsOrderStatus(order.id, KdsOrderStatus.READY);
    };
    
    const handleOrderServed = (order: KdsOrder) => {
        updateKdsOrderStatus(order.id, KdsOrderStatus.SERVED);
    };

    const activeOrders = kdsOrders.filter(o => o.status !== KdsOrderStatus.SERVED && o.status !== KdsOrderStatus.CANCELLED);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Kitchen Display System</h1>
            {activeOrders.length === 0 ? (
                 <div className="flex items-center justify-center h-96">
                    <p className="text-slate-400 text-lg">No active kitchen orders.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeOrders.map(order => (
                    <Card key={order.id} className={`flex flex-col border-2 ${getStatusColor(order.status).replace('bg-','border-')}`}>
                        <CardHeader className={`flex flex-row items-center justify-between p-4 ${getStatusColor(order.status)}`}>
                            <CardTitle className="text-white">Order {order.saleInvoiceNo.split('-')[1]}</CardTitle>
                            <span className="text-sm font-semibold px-2 py-1 rounded bg-black bg-opacity-20 text-white">{order.status}</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 flex-grow">
                            {order.items.map(item => {
                                const product = getProductById(item.productId);
                                return (
                                    <div 
                                      key={item.id} 
                                      onClick={() => handleItemClick(order.id, item.id, item.status)}
                                      className={`flex items-center p-2 rounded-lg cursor-pointer ${item.status === KdsOrderStatus.READY ? 'bg-green-900/50' : 'bg-slate-800'}`}
                                    >
                                        <span className="font-bold text-lg mr-4">{item.qty}x</span>
                                        <span className="flex-grow">{product?.name || 'Unknown'}</span>
                                        <span className="text-xs font-mono">{item.status}</span>
                                    </div>
                                );
                            })}
                        </CardContent>
                        <div className="p-4 border-t border-slate-800">
                           {order.status !== KdsOrderStatus.READY && <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleOrderReady(order)} >Mark as Ready</Button>}
                           {order.status === KdsOrderStatus.READY && <Button className="w-full" onClick={() => handleOrderServed(order)}>Mark as Served</Button>}
                        </div>
                    </Card>
                ))}
            </div>
            )}
        </div>
    );
};

export default KdsPage;

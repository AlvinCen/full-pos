'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, LogOut, Menu, X, ShoppingCart, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';

const NavItem: React.FC<{ href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void; }> = ({ href, icon, children, onClick }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} onClick={onClick} className={`flex items-center p-3 my-1 rounded-lg transition-colors text-slate-300 hover:bg-slate-700 ${isActive ? 'bg-slate-700 text-white' : ''}`}>
            {icon}
            <span className="ml-4 font-medium">{children}</span>
        </Link>
    );
}

const Sidebar: React.FC<{ onLinkClick: () => void }> = ({ onLinkClick }) => {
    const { logout, hasPermission } = useAuth();

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-white text-center">POS v2</h1>
            </div>
            <nav className="flex-1 p-4">
                <NavItem href="/dashboard" icon={<Home size={24} />} onClick={onLinkClick}>Dashboard</NavItem>
                {hasPermission('sale:create') && <NavItem href="/dashboard/pos" icon={<ShoppingCart size={24} />} onClick={onLinkClick}>POS</NavItem>}
                {hasPermission('report:view') && <NavItem href="/dashboard/reports/sales" icon={<BarChart2 size={24} />} onClick={onLinkClick}>Sales Report</NavItem>}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button onClick={logout} className="flex items-center p-3 w-full rounded-lg transition-colors text-slate-300 hover:bg-slate-700">
                    <LogOut size={24} />
                    <span className="ml-4 font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; 
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-300">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar onLinkClick={() => { }} />
            </div>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 flex transition-transform transform md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onLinkClick={() => setSidebarOpen(false)} />
                <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>
            </div>

            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-300 hover:text-white">
                        <Menu />
                    </button>
                    <span className="text-lg font-semibold text-white">POS</span>
                    <span></span>
                </header>

                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

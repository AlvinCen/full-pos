
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeIcon, ShoppingCartIcon, KitchenIcon, InventoryIcon, ReportIcon, SettingsIcon, LogoutIcon, MenuIcon, XIcon, BoxIcon, TagIcon, ChevronDownIcon, ScaleIcon, BilliardsIcon } from './icons/Icons';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center p-3 my-1 rounded-lg transition-colors text-slate-300 hover:bg-slate-700 ${isActive ? 'bg-slate-700 text-white' : ''}`
    }
  >
    {icon}
    <span className="ml-4 font-medium">{children}</span>
  </NavLink>
);

const SubNavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center p-2 my-1 rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-200 w-full ${isActive ? 'bg-slate-800 text-white' : ''}`
    }
  >
    {icon}
    <span className="ml-3 font-medium text-sm">{children}</span>
  </NavLink>
);

const CollapsibleNavItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  paths: string[];
}> = ({ icon, title, children, paths }) => {
  const location = useLocation();
  const isParentActive = paths.some(path => location.pathname.startsWith(path));
  const [isOpen, setIsOpen] = useState(isParentActive);

  useEffect(() => {
    if (isParentActive) {
      setIsOpen(true);
    }
  }, [isParentActive]);
  
  return (
    <div className="my-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-700 ${isParentActive ? 'bg-slate-700 text-white' : ''}`}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-4 font-medium">{title}</span>
        </div>
        <ChevronDownIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pt-1 pl-8 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};


const Sidebar: React.FC<{onLinkClick: () => void}> = ({ onLinkClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLinkClick();
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white text-center">POS</h1>
      </div>
      <nav className="flex-1 p-4">
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={onLinkClick}>Dashboard</NavItem>
        <NavItem to="/pos" icon={<ShoppingCartIcon />} onClick={onLinkClick}>POS</NavItem>
        <NavItem to="/kds" icon={<KitchenIcon />} onClick={onLinkClick}>KDS</NavItem>
        <NavItem to="/billiards" icon={<BilliardsIcon />} onClick={onLinkClick}>Billiards</NavItem>
        <CollapsibleNavItem 
            icon={<InventoryIcon />} 
            title="Inventory"
            paths={['/inventory/products', '/inventory/categories', '/inventory/units']}
        >
            <SubNavItem to="/inventory/products" icon={<BoxIcon />} onClick={onLinkClick}>Products</SubNavItem>
            <SubNavItem to="/inventory/categories" icon={<TagIcon />} onClick={onLinkClick}>Categories</SubNavItem>
            <SubNavItem to="/inventory/units" icon={<ScaleIcon />} onClick={onLinkClick}>Units</SubNavItem>
        </CollapsibleNavItem>
        <NavItem to="/reports/sales" icon={<ReportIcon />} onClick={onLinkClick}>Reports</NavItem>
        <CollapsibleNavItem 
            icon={<SettingsIcon />} 
            title="Settings"
            paths={['/settings/outlet', '/settings/pricelist', '/settings/tables']}
        >
            <SubNavItem to="/settings/outlet" icon={<BoxIcon />} onClick={onLinkClick}>Outlet</SubNavItem>
            <SubNavItem to="/settings/pricelist" icon={<TagIcon />} onClick={onLinkClick}>Billiard Pricelist</SubNavItem>
            <SubNavItem to="/settings/tables" icon={<BilliardsIcon />} onClick={onLinkClick}>Billiard Tables</SubNavItem>
        </CollapsibleNavItem>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center p-3 w-full rounded-lg transition-colors text-slate-300 hover:bg-slate-700">
          <LogoutIcon />
          <span className="ml-4 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};


const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar onLinkClick={() => {}}/>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 flex transition-transform transform md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onLinkClick={() => setSidebarOpen(false)} />
        <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>
      </div>
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
           <button onClick={() => setSidebarOpen(true)} className="text-slate-300 hover:text-white">
             <MenuIcon />
           </button>
            <span className="text-lg font-semibold text-white">POS</span>
            <span></span>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
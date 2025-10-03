import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PosPage from './pages/PosPage';
import KdsPage from './pages/KdsPage';
import ProductsPage from './pages/inventory/ProductsPage';
import AddProductPage from './pages/inventory/AddProductPage';
import ProductDetailPage from './pages/inventory/ProductDetailPage';
import EditProductPage from './pages/inventory/EditProductPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import UnitsPage from './pages/inventory/UnitsPage';
import PurchasesPage from './pages/purchases/PurchasesPage';
import SalesReportPage from './pages/reports/SalesReportPage';
import OutletSettingsPage from './pages/settings/OutletSettingsPage';
import FloorPage from './pages/billiards/FloorPage';
import SessionHistoryPage from './pages/billiards/SessionHistoryPage';
import PricelistPage from './pages/settings/PricelistPage';
import TablesPage from './pages/settings/TablesPage';
import ShiftsPage from './pages/shifts/ShiftsPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<PosPage />} />
        <Route path="kds" element={<KdsPage />} />
        <Route path="billiards" element={<FloorPage />} />
        <Route path="billiards/history" element={<SessionHistoryPage />} />
        <Route path="shifts" element={<ShiftsPage />} />
        <Route path="inventory/products" element={<ProductsPage />} />
        <Route path="inventory/products/new" element={<AddProductPage />} />
        <Route path="inventory/products/:productId" element={<ProductDetailPage />} />
        <Route path="inventory/products/:productId/edit" element={<EditProductPage />} />
        <Route path="inventory/categories" element={<CategoriesPage />} />
        <Route path="inventory/units" element={<UnitsPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="reports/sales" element={<SalesReportPage />} />
        <Route path="settings/outlet" element={<OutletSettingsPage />} />
        <Route path="settings/pricelist" element={<PricelistPage />} />
        <Route path="settings/tables" element={<TablesPage />} />
      </Route>
      <Route path="*" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
    </Routes>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
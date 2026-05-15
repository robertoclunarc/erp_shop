import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UserListPage } from '../pages/users/UserListPage';
import { BranchListPage } from '../pages/branches/BranchListPage';
import { CashRegisterPage } from '../pages/cash/CashRegisterPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { SaleListPage } from '../pages/sales/SaleListPage';
import { NewSalePage } from '../pages/sales/NewSalePage';
import { PurchaseListPage } from '../pages/purchases/PurchaseListPage';
import { SalesReportPage } from '../pages/reports/SalesReportPage';
import { ServiceListPage } from '../pages/services/ServiceListPage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { NewPurchasePage } from '../pages/purchases/NewPurchasePage';
import { SaleDetailPage } from '../pages/sales/SaleDetailPage';

import { SalesRangeReportPage } from '../pages/reports/SalesRangeReportPage';
import { InventoryReportPage } from '../pages/reports/InventoryReportPage';
import { CashRegisterReportPage } from '../pages/reports/CashRegisterReportPage';
import { SalesFilteredReportPage } from '../pages/reports/SalesFilteredReportPage';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: number[] }> = ({ children, roles }) => {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !hasPermission(roles)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<PrivateRoute roles={[1]}><UserListPage /></PrivateRoute>} />
        <Route path="branches" element={<PrivateRoute roles={[1]}><BranchListPage /></PrivateRoute>} />
        <Route path="cash/register" element={<PrivateRoute roles={[1,2]}><CashRegisterPage /></PrivateRoute>} />
        <Route path="products" element={<PrivateRoute roles={[1,2,3]}><ProductListPage /></PrivateRoute>} />
        <Route path="services" element={<PrivateRoute roles={[1, 2, 3]}><ServiceListPage /></PrivateRoute>} />
        <Route path="sales" element={<PrivateRoute roles={[1,2,3]}><SaleListPage /></PrivateRoute>} />
        <Route path="sales/new" element={<PrivateRoute roles={[1,2,3]}><NewSalePage /></PrivateRoute>} />
        <Route path="sales/:id" element={<PrivateRoute roles={[1,2,3]}><SaleDetailPage /></PrivateRoute>} />
        <Route path="purchases/new" element={<PrivateRoute roles={[1,2]}><NewPurchasePage /></PrivateRoute>} />
        <Route path="purchases" element={<PrivateRoute roles={[1,2]}><PurchaseListPage /></PrivateRoute>} />
        <Route path="reports/sales" element={<PrivateRoute roles={[1,2]}><SalesReportPage /></PrivateRoute>} />
        <Route path="reports/sales-range" element={<PrivateRoute roles={[1,2]}><SalesRangeReportPage /></PrivateRoute>} />
        <Route path="reports/inventory" element={<PrivateRoute roles={[1,2]}><InventoryReportPage /></PrivateRoute>} />
        <Route path="reports/cash-register" element={<PrivateRoute roles={[1,2]}><CashRegisterReportPage /></PrivateRoute>} />
        <Route path="reports/sales-filtered" element={<PrivateRoute roles={[1,2]}><SalesFilteredReportPage /></PrivateRoute>} />
      </Route>
    </Routes>
  </BrowserRouter>
);
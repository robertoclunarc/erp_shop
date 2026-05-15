import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  //IconButton,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer/*, LineChart, Line, PieChart, Pie, Cell*/ } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { reportService } from '../../api/reportService';

interface DashboardStats {
  totalSales: number;
  salesCount: number;
  avgTicket: number;
  totalExpenses: number;
  cashDifference: number;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: number; color: string }> = ({ title, value, icon, trend, color }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, #1e293b 100%)`, border: `1px solid ${color}30` }}>
    <CardContent>      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>          
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          {trend !== undefined && (            
            <Box sx={{ display: 'flex', alignItems: 'center',  gap:0.5, mt:0.5 }}>
              {trend >= 0 ? <TrendingUp fontSize="small" sx={{ color: 'success.main' }} /> : <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />}
              <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}20` }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useBranchFilter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesByDay, setSalesByDay] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (selectedBranch === null) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [salesByDayRes, topProductsRes, cashStatusRes] = await Promise.all([
          reportService.getSalesByDay({ branch_id: selectedBranch, limit: 30 }),
          reportService.getTopProducts({ branch_id: selectedBranch, limit: 5 }),
          reportService.getCashStatus({ branch_id: selectedBranch }),
        ]);
        setSalesByDay(salesByDayRes);
        setTopProducts(topProductsRes);
        const totalSales = salesByDayRes.reduce((acc: number, day: any) => acc + day.total_amount, 0);
        const salesCount = salesByDayRes.reduce((acc: number, day: any) => acc + day.total_sales, 0);
        setStats({
          totalSales,
          salesCount,
          avgTicket: salesCount > 0 ? totalSales / salesCount : 0,
          totalExpenses: cashStatusRes.total_expense || 0,
          cashDifference: cashStatusRes.difference || 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedBranch]);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Bienvenido, {user?.full_name}</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Ventas Totales" value={`$${stats?.totalSales.toLocaleString() || 0}`} icon={<AttachMoney />} trend={12.4} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Transacciones" value={stats?.salesCount.toLocaleString() || '0'} icon={<ShoppingCart />} trend={40.9} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Ticket Promedio" value={`$${stats?.avgTicket.toLocaleString() || 0}`} icon={<People />} trend={84.7} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Gastos Totales" value={`$${stats?.totalExpenses.toLocaleString() || 0}`} icon={<Inventory />} trend={23.6} color="#ef4444" />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Ventas Diarias</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Legend />
                  <Bar dataKey="total_amount" name="Ventas ($)" fill="#3b82f6" />
                  <Bar dataKey="total_sales" name="N° Transacciones" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Productos</Typography>
              {topProducts.map((product: any, idx: number) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #334155' }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{product.total_sold} unidades</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>${product.total_revenue}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
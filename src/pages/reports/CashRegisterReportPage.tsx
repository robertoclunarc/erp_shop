import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, /*Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,*/ Chip } from '@mui/material';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { reportService } from '../../api/reportService';

export const CashRegisterReportPage: React.FC = () => {
  const { selectedBranch } = useBranchFilter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedBranch) {
      fetchData();
    }
  }, [selectedBranch]);

  const fetchData = async () => {
    try {
      const result = await reportService.getSalesByCashRegister({ branch_id: selectedBranch! });
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Resumen de Cajas por Sucursal</Typography>
      <Grid container spacing={3}>
        {data.map((caja) => (
          <Grid size={{ xs: 12, md: 6 }} key={caja.cash_register_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Caja #{caja.cash_register_id} - {caja.status === 'open' ? 'Abierta' : 'Cerrada'}
                </Typography>
                <Chip label={caja.status} color={caja.status === 'open' ? 'success' : 'default'} size="small" sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Apertura:</Typography>
                  <Typography variant="body2">${caja.opening_amount}</Typography>
                </Box>
                {caja.closing_amount && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">Cierre:</Typography>
                    <Typography variant="body2">${caja.closing_amount}</Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Diferencia:</Typography>
                  <Typography variant="body2" color={caja.difference >= 0 ? 'success.main' : 'error.main'}>
                    ${Number(caja.difference || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Total ingresos:</Typography>
                  <Typography variant="body2">${Number(caja.total_income || 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Total egresos:</Typography>
                  <Typography variant="body2">${Number(caja.total_expense || 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Abierta por:</Typography>
                  <Typography variant="body2">{caja.opened_by_name}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Fecha apertura:</Typography>
                  <Typography variant="body2">{new Date(caja.opened_at).toLocaleString()}</Typography>
                </Box>
                {caja.closed_at && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">Cerrada por:</Typography>
                    <Typography variant="body2">{caja.closed_by_name}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
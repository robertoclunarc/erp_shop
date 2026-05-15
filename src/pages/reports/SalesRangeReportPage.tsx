import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  //Chip,
} from '@mui/material';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { reportService } from '../../api/reportService';

export const SalesRangeReportPage: React.FC = () => {
  const { selectedBranch } = useBranchFilter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!selectedBranch || !startDate || !endDate) return;
    setLoading(true);
    try {
      const result = await reportService.getSalesByRange({
        branch_id: selectedBranch,
        start_date: startDate,
        end_date: endDate,
      });
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totals = data.reduce(
    (acc, day) => ({
      total_sales: acc.total_sales + day.total_sales,
      total_amount: acc.total_amount + day.total_amount,
      cash: acc.cash + (day.cash_amount || 0),
      card: acc.card + (day.card_amount || 0),
      transfer: acc.transfer + (day.transfer_amount || 0),
    }),
    { total_sales: 0, total_amount: 0, cash: 0, card: 0, transfer: 0 }
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reporte de Ventas por Rango de Fechas
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Fecha inicio"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Fecha fin"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar'}
          </Button>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Resumen total</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">Total ventas</Typography>
              <Typography variant="h6">{totals.total_sales}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">Monto total</Typography>
              <Typography variant="h6">${Number(totals.total_amount).toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Typography variant="body2" color="text.secondary">Efectivo</Typography>
              <Typography variant="body2">${Number(totals.cash).toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Typography variant="body2" color="text.secondary">Tarjeta</Typography>
              <Typography variant="body2">${Number(totals.card).toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Typography variant="body2" color="text.secondary">Transferencia</Typography>
              <Typography variant="body2">${Number(totals.transfer).toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">N° Ventas</TableCell>
              <TableCell align="right">Total ($)</TableCell>
              <TableCell align="right">Efectivo</TableCell>
              <TableCell align="right">Tarjeta</TableCell>
              <TableCell align="right">Transferencia</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.date}>
                <TableCell>{row.date}</TableCell>
                <TableCell align="right">{row.total_sales}</TableCell>
                <TableCell align="right">${Number(row.total_amount).toFixed(2)}</TableCell>
                <TableCell align="right">${Number(row.cash_amount || 0).toFixed(2)}</TableCell>
                <TableCell align="right">${Number(row.card_amount || 0).toFixed(2)}</TableCell>
                <TableCell align="right">${Number(row.transfer_amount || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay datos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
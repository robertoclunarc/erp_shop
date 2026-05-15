import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Chip,
  Autocomplete,
} from '@mui/material';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { reportService } from '../../api/reportService';
import { productService, Product } from '../../api/productService';
import { serviceService, Service } from '../../api/serviceService';

export const SalesFilteredReportPage: React.FC = () => {
  const { selectedBranch } = useBranchFilter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBranch) {
      loadProductsAndServices();
    }
  }, [selectedBranch]);

  const loadProductsAndServices = async () => {
    try {
      const [prodRes, servRes] = await Promise.all([
        productService.list(selectedBranch!),
        serviceService.list(),
      ]);
      setProducts(prodRes.data);
      setServices(servRes);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!selectedBranch || !startDate || !endDate) return;
    setLoading(true);
    try {
      const result = await reportService.getSalesWithFilters({
        branch_id: selectedBranch,
        start_date: startDate,
        end_date: endDate,
        product_id: selectedProduct?.id,
        service_id: selectedService?.id,
      });
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totals = data.reduce(
    (acc, row) => ({
      quantity: acc.quantity + row.quantity,
      total: acc.total + row.total,
    }),
    { quantity: 0, total: 0 }
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reporte de Ventas con Filtros
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Fecha inicio"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Fecha fin"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Autocomplete
            options={products}
            getOptionLabel={(option) => `${option.name} (${option.sku || ''})`}
            value={selectedProduct}
            onChange={(_, newValue) => setSelectedProduct(newValue)}
            renderInput={(params) => <TextField {...params} label="Filtrar por producto" />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Autocomplete
            options={services}
            getOptionLabel={(option) => option.name}
            value={selectedService}
            onChange={(_, newValue) => setSelectedService(newValue)}
            renderInput={(params) => <TextField {...params} label="Filtrar por servicio" />}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar'}
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Venta</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Item</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Precio unit.</TableCell>
              <TableCell align="right">Descuento</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.sale_number}</TableCell>
                <TableCell>{new Date(row.sale_date).toLocaleString()}</TableCell>
                <TableCell>{row.user_name}</TableCell>
                <TableCell>{row.customer_name || 'Consumidor final'}</TableCell>
                <TableCell>
                  <Chip label={row.item_type} size="small" color={row.item_type === 'product' ? 'primary' : 'secondary'} />
                </TableCell>
                <TableCell>{row.item_name}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">${Number(row.unit_price)}</TableCell>
                <TableCell align="right">${Number(row.discount)}</TableCell>
                <TableCell align="right">${Number(row.total)}</TableCell>
                <TableCell>{row.payment_method}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={row.status === 'completed' ? 'success' : 'error'} size="small" />
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={12} align="center">No hay ventas en el rango seleccionado</TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell colSpan={6} align="right"><strong>Totales:</strong></TableCell>
              <TableCell align="right"><strong>{totals.quantity}</strong></TableCell>
              <TableCell colSpan={2}></TableCell>
              <TableCell align="right"><strong>${Number(totals.total)}</strong></TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    </Box>
  );
};
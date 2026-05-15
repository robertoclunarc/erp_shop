import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import { ArrowBack, Print/*, Receipt*/ } from '@mui/icons-material';
import { saleService, SaleWithDetails } from '../../api/saleService';

export const SaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<SaleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSale();
    }
  }, [id]);

  const fetchSale = async () => {
    try {
      const data = await saleService.getById(Number(id));
      setSale(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Cargando...</Typography>;
  if (!sale) return <Typography>Venta no encontrada</Typography>;

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/sales')}>
          Volver
        </Button>
        <Typography variant="h4">Detalle de Venta #{sale.sale_number}</Typography>
        <Button startIcon={<Print />} onClick={() => window.print()}>
          Imprimir
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Información general */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de la venta
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">N° Venta:</Typography>
                <Typography variant="body2">{sale.sale_number}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                <Typography variant="body2">{new Date(sale.sale_date).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Vendedor:</Typography>
                <Typography variant="body2">{sale.user_name || `ID: ${sale.user_id}`}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                <Typography variant="body2">{sale.customer_name || 'Consumidor final'}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                <Chip
                  label={sale.status}
                  color={sale.status === 'completed' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen financiero */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen financiero
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                <Typography variant="body2">${Number(sale.subtotal).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Descuento:</Typography>
                <Typography variant="body2">${Number(sale.discount).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Impuesto:</Typography>
                <Typography variant="body2">${Number(sale.tax).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Total:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ${typeof sale.total === 'number' ? sale.total.toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" color="text.secondary">Método de pago:</Typography>
                <Typography variant="body2">{sale.payment_method}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detalle de items */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productos y servicios
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio unitario</TableCell>
                      <TableCell align="right">Descuento</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sale.details.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.item_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.item_type === 'product' ? `SKU: ${item.sku}` : 'Servicio'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${Number(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell align="right">${Number(item.discount).toFixed(2)}</TableCell>
                        <TableCell align="right">${Number(item.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {sale.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Notas:</Typography>
                  <Typography variant="body2">{sale.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
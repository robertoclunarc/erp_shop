import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Autocomplete,
  Alert,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material'; // Eliminado 'Add' no usado
import { useNavigate } from 'react-router-dom';
import { saleService, CreateSaleData } from '../../api/saleService';
import { productService, Product } from '../../api/productService';
import { serviceService, Service } from '../../api/serviceService';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { cashService } from '../../api/cashService';

interface CartItem {
  id: number;
  item_type: 'product' | 'service';
  item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export const NewSalePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranchFilter();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [error, setError] = useState('');
  const [cashOpen, setCashOpen] = useState(false);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      const [prod, serv] = await Promise.all([
        (await productService.list(selectedBranch)).data,
        serviceService.list(),
      ]);
      setProducts(prod);
      setServices(serv);
    } catch (err) {
      console.error('Error loading data', err);
    }
  }, [selectedBranch]);

  const checkCashStatus = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      const status = await cashService.getStatus(selectedBranch);
      if (!status.open) {
        setError('No hay caja abierta. No se pueden registrar ventas.');
        setCashOpen(false);
      } else {
        setCashOpen(true);
        setError('');
      }
    } catch (err) {
      setError('Error al verificar estado de caja');
      setCashOpen(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadData();
    checkCashStatus();
  }, [loadData, checkCashStatus]);

  const addItem = (type: 'product' | 'service', item: Product | Service) => {
    const price = type === 'product' ? (item as Product).sale_price : (item as Service).price;
    const newItem: CartItem = {
      id: Date.now(),
      item_type: type,
      item_id: item.id,
      name: item.name,
      quantity: 1,
      unit_price: price,
      discount: 0,
      total: price,
    };
    setItems([...items, newItem]);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].total =
      newItems[index].unit_price * quantity * (1 - newItems[index].discount / 100);
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  const total = subtotal - discount + tax;

  const handleSubmit = async () => {
    if (!cashOpen) {
      setError('Caja cerrada, no se puede registrar la venta');
      return;
    }
    if (items.length === 0) {
      setError('Agregue al menos un producto o servicio');
      return;
    }

    try {
      const saleData: CreateSaleData = {
        branch_id: selectedBranch!,
        payment_method: paymentMethod as 'cash' | 'card' | 'transfer' | 'mixed',
        discount,
        tax,
        items: items.map((i) => ({
          item_type: i.item_type,
          item_id: i.item_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
          total: i.total,
        })),
        notes: '',
      };
      await saleService.create(saleData);
      navigate('/sales');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar venta');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nueva Venta
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Productos / Servicios</Typography>
              <Autocomplete
                freeSolo
                options={[
                  ...products.map((p) => ({
                    label: p.name,
                    type: 'product' as const,
                    data: p,
                  })),
                  ...services.map((s) => ({
                    label: s.name,
                    type: 'service' as const,
                    data: s,
                  })),
                ]}
                renderInput={(params) => (
                  <TextField {...params} label="Buscar..." fullWidth margin="normal" />
                )}
                onChange={(_, value) => {
                  if (value && typeof value !== 'string') {
                    addItem(value.type, value.data);
                  }
                }}
              />
              {items.map((item, idx) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Box sx={{ flex: 2 }}>{item.name}</Box>
                  <Box sx={{ flex: 1 }}>${item.unit_price}</Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>${item.total}</Box>
                  <IconButton color="error" onClick={() => removeItem(idx)}>
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Resumen</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </Box>
                <TextField
                    label="Descuento"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    slotProps={{
                        input: {
                        endAdornment: <InputAdornment position="end">$</InputAdornment>,
                        },
                    }}
                />
                <TextField
                    label="Impuesto"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    slotProps={{
                        input: {
                        endAdornment: <InputAdornment position="end">$</InputAdornment>,
                        },
                    }}
                />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontWeight: 'bold' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </Box>
              <TextField
                select
                fullWidth
                label="Método de pago"
                margin="normal"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
              </TextField>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleSubmit}
                disabled={items.length === 0 || !cashOpen}
                sx={{ mt: 2 }}
              >
                Registrar Venta
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
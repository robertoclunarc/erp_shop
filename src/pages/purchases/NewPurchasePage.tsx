import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper, 
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { purchaseService, CreatePurchaseData, PurchaseDetail } from '../../api/purchaseService';
import { productService, Product } from '../../api/productService';
import { supplierService, Supplier } from '../../api/supplierService';
import { useBranchFilter } from '../../hooks/useBranchFilter';
//import { useAuth } from '../../hooks/useAuth';
import { cashService } from '../../api/cashService';

interface CartItem extends PurchaseDetail {
  id: number;
  product_name: string;
  sku: string;
  unit_price: number;
}

export const NewPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranchFilter();
  //const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cashOpen, setCashOpen] = useState(true);

  // Verificar caja abierta
  useEffect(() => {
    const checkCash = async () => {
      if (selectedBranch) {
        const status = await cashService.getStatus(selectedBranch);
        if (!status.open) {
          setError('No hay caja abierta. No se pueden registrar compras.');
          setCashOpen(false);
        } else {
          setCashOpen(true);
          setError('');
        }
      }
    };
    checkCash();
  }, [selectedBranch]);

  // Cargar proveedores y productos
  useEffect(() => {
    if (selectedBranch) {
      loadSuppliers();
      loadProducts();
    }
  }, [selectedBranch]);

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.list();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.list(selectedBranch!);
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addProductToCart = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.product_id === product.id);
    const unitPrice = Number(product.purchase_price); // asegurar número
    if (existingIndex !== -1) {
        const updatedCart = [...cart];
        updatedCart[existingIndex].quantity += 1;
        updatedCart[existingIndex].total = unitPrice * updatedCart[existingIndex].quantity;
        setCart(updatedCart);
    } else {
        const newItem: CartItem = {
        id: Date.now(),
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || '',
        quantity: 1,
        unit_price: unitPrice,
        total: unitPrice,
        };
        setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    newCart[index].total = newCart[index].unit_price * quantity;
    setCart(newCart);
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const total = subtotal - discount + tax;

  const handleSubmit = async () => {
    if (!cashOpen) {
      setError('Caja cerrada, no se puede registrar la compra');
      return;
    }
    if (!selectedSupplier) {
      setError('Seleccione un proveedor');
      return;
    }
    if (cart.length === 0) {
      setError('Agregue al menos un producto');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const purchaseData: CreatePurchaseData = {
        supplier_id: selectedSupplier.id,
        branch_id: selectedBranch!,
        payment_method: paymentMethod as 'cash' | 'card' | 'transfer',
        discount,
        tax,
        notes: notes || undefined,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
      };
      await purchaseService.create(purchaseData);
      navigate('/purchases');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nueva Compra
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Columna izquierda: selección de proveedor y productos */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proveedor
              </Typography>
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.name}
                value={selectedSupplier}
                onChange={(_, newValue) => setSelectedSupplier(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Buscar proveedor" fullWidth />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productos
              </Typography>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.name} (${option.sku || 'sin SKU'})`}
                onChange={(_, product) => {
                  if (product) addProductToCart(product);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Buscar producto" fullWidth />
                )}
              />
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product_name}
                          <Typography variant="caption" color="text.secondary">                          
                            {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">${(Number(item.unit_price)).toFixed(2)}</TableCell>
                        <TableCell align="right">
                            <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                                slotProps={{
                                    input: {
                                    inputProps: { min: 1 }
                                    }
                                }}
                                sx={{ width: 80 }}
                            />
                        </TableCell>
                        <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton color="error" size="small" onClick={() => removeItem(idx)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {cart.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay productos agregados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha: resumen y pago */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Compra
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </Box>
              <TextField
                label="Descuento"
                type="number"
                fullWidth
                size="small"
                margin="dense"
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
                size="small"
                margin="dense"
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
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={2}
                margin="normal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleSubmit}
                disabled={cart.length === 0 || !selectedSupplier || !cashOpen || loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Registrando...' : 'Registrar Compra'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
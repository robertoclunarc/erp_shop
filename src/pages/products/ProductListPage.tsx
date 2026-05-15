import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataTable } from '../../components/tables/DataTable';
import { productService } from '../../api/productService';
import { useBranchFilter } from '../../hooks/useBranchFilter';

export const ProductListPage: React.FC = () => {
  const { selectedBranch } = useBranchFilter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category_id: '',
    purchase_price: '',
    sale_price: '',
    min_stock: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedBranch) {
      fetchProducts();
      fetchCategories();
    }
  }, [selectedBranch]);

  const fetchProducts = async () => {
    try {
      const response = await productService.list(selectedBranch!);
      const productsList = response.data;     
      setProducts(productsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.listCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (product?: any) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        sku: product.sku || '',
        category_id: product.category_id.toString(),
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        min_stock: product.min_stock,
      });
    } else {
      setEditing(null);
      setForm({ name: '', sku: '', category_id: '', purchase_price: '', sale_price: '', min_stock: 0 });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, category_id: parseInt(form.category_id), purchase_price: parseFloat(form.purchase_price), sale_price: parseFloat(form.sale_price), min_stock: Number(form.min_stock) };
      if (editing) {
        await productService.update(editing.id, payload);
      } else {
        await productService.create(payload);
      }
      fetchProducts();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (product: any) => {
    if (window.confirm(`¿Eliminar producto ${product.name}?`)) {
      await productService.delete(product.id);
      fetchProducts();
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'sale_price', headerName: 'Precio venta', width: 120, renderCell: (row: any) => `$${row.sale_price}` },
    { field: 'current_stock', headerName: 'Stock global', width: 120 },
    { field: 'min_stock', headerName: 'Stock mínimo', width: 120 },
  ];

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
    setError('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nuevo Producto</Button>
      </Box>
      <DataTable rows={products} columns={columns} loading={loading} onEdit={handleOpen} onDelete={handleDelete} />
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField fullWidth label="Nombre" margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth label="SKU" margin="normal" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <TextField select fullWidth label="Categoría" margin="normal" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((cat: any) => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Precio compra" type="number" margin="normal" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
          <TextField fullWidth label="Precio venta" type="number" margin="normal" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
          <TextField fullWidth label="Stock mínimo" type="number" margin="normal" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
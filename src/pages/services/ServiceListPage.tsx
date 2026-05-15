import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataTable, Column } from '../../components/tables/DataTable';
import { serviceService, Service, CreateServiceData } from '../../api/serviceService';
import { productService, Category } from '../../api/productService'; // Reutilizamos categorías

export const ServiceListPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<CreateServiceData & { status?: string }>({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    category_id: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.list();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.listCategories();
      // Filtrar categorías que permitan servicios (type = 'service' o 'both')
      const serviceCategories = data.filter(cat => cat.type === 'service' || cat.type === 'both');
      setCategories(serviceCategories);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        category_id: service.category_id,
        status: service.status,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration_minutes: 30,
        price: 0,
        category_id: categories.length > 0 ? categories[0].id : 0,
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingService) {
        await serviceService.update(editingService.id, formData);
      } else {
        await serviceService.create(formData);
      }
      fetchServices();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar servicio');
    }
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm(`¿Eliminar el servicio "${service.name}"?`)) {
      await serviceService.delete(service.id);
      fetchServices();
    }
  };

  const columns: Column<Service>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    {
      field: 'category_name',
      headerName: 'Categoría',
      width: 150,
      renderCell: (row) => row.category_name || '-',
    },
    {
      field: 'duration_minutes',
      headerName: 'Duración (min)',
      width: 130,
      renderCell: (row) => `${row.duration_minutes} min`,
    },
    {
      field: 'price',
      headerName: 'Precio',
      width: 120,
      renderCell: (row) => `$${row.price}`,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (row) => (
        <Chip
          label={row.status === 'active' ? 'Activo' : 'Inactivo'}
          color={row.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Typography variant="h4">Servicios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo Servicio
        </Button>
      </Box>

      <DataTable
        rows={services}
        columns={columns}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Descripción"
            margin="normal"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Categoría"
            margin="normal"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Duración (minutos)"
            type="number"
            margin="normal"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
            slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }}
          />
          <TextField
            fullWidth
            label="Precio"
            type="number"
            margin="normal"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
            required
          />
          {editingService && (
            <TextField
              select
              fullWidth
              label="Estado"
              margin="normal"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="inactive">Inactivo</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
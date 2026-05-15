import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, MenuItem } from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataTable } from '../../components/tables/DataTable';
import { branchService, Branch } from '../../api/branchService';

export const BranchListPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',  // ← agregado status
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchService.list();
      setBranches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (branch?: Branch) => {
    if (branch) {
      setEditing(branch);
      setForm({
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        status: branch.status,
      });
    } else {
      setEditing(null);
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await branchService.update(editing.id, form);
      } else {
        await branchService.create(form);  // Ahora form tiene 'status'
      }
      fetchBranches();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (window.confirm(`¿Eliminar sucursal ${branch.name}?`)) {
      await branchService.delete(branch.id);
      fetchBranches();
    }
  };

  const columns: { field: keyof Branch; headerName: string; width: number; renderCell?: (row: Branch) => string }[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'address', headerName: 'Dirección', width: 250 },
    { field: 'phone', headerName: 'Teléfono', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (row: Branch) => (row.status === 'active' ? 'Activo' : 'Inactivo'),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Sucursales</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nueva Sucursal
        </Button>
      </Box>
      <DataTable
        rows={branches}
        columns={columns}
        loading={loading}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Sucursal' : 'Nueva Sucursal'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Dirección"
            margin="normal"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <TextField
            fullWidth
            label="Teléfono"
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Estado"
            margin="normal"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
          >
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
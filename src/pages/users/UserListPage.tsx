import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,  
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import { Add, /*Edit, Delete, Visibility*/ } from '@mui/icons-material';
import { DataTable, Column } from '../../components/tables/DataTable';
import { userService } from '../../api/userService';
import { branchService } from '../../api/branchService';
//import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/user.types';

export const UserListPage: React.FC = () => {
  //const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role_id: 3,
    branches: [] as number[],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.list();
      //console.log('Fetched users:', data);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.list();
      setBranches(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDialog = (user?: User) => {
    //console.log('Editing user:', user);
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        password: '',
        role_id: user.role_id,
        branches: user.branches || [],
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role_id: 3,
        branches: [],
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
      } else {
        await userService.create(formData);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`¿Eliminar usuario ${user.username}?`)) {
      await userService.delete(user.id);
      fetchUsers();
    }
  };

  const columns: Column<User>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Usuario', width: 150 },
    { field: 'full_name', headerName: 'Nombre completo', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'role_id',
      headerName: 'Rol',
      width: 120,
      renderCell: (row: User) => {
        const roles: Record<number, string> = { 1: 'ADMIN', 2: 'GERENTE', 3: 'EMPLEADO' };
        return <Chip label={roles[row.role_id]} color={row.role_id === 1 ? 'error' : row.role_id === 2 ? 'warning' : 'info'} size="small" />;
      },
    },
    { field: 'status', headerName: 'Estado', width: 100 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Usuarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo Usuario
        </Button>
      </Box>
      <DataTable
        rows={users}
        columns={columns}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Usuario" margin="normal" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
          <TextField fullWidth label="Email" margin="normal" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField fullWidth label="Nombre completo" margin="normal" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          {!editingUser && <TextField fullWidth label="Contraseña" type="password" margin="normal" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />}
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select value={formData.role_id} label="Rol" onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}>
              <MenuItem value={1}>ADMIN</MenuItem>
              <MenuItem value={2}>GERENTE</MenuItem>
              <MenuItem value={3}>EMPLEADO</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Sucursales</InputLabel>
            <Select multiple value={formData.branches} label="Sucursales" onChange={(e) => setFormData({ ...formData, branches: e.target.value as number[] })}>
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
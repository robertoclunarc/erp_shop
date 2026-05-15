import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Purchase, purchaseService } from '../../api/purchaseService';
import { useBranchFilter } from '../../hooks/useBranchFilter';

export const PurchaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranchFilter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedBranch) {
      fetchPurchases();
    }
  }, [selectedBranch]);

  const fetchPurchases = async () => {
    try {
      const data = await purchaseService.list({ branch_id: selectedBranch! });
      setPurchases(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setNewStatus(purchase.status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPurchase) return;
    try {
      await purchaseService.update(selectedPurchase.id, { status: newStatus });
      fetchPurchases(); // refrescar lista
      setStatusDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const columns: Column<Purchase>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'purchase_number', headerName: 'N° Compra', width: 150 },
    { field: 'purchase_date', headerName: 'Fecha', width: 180, renderCell: (row: any) => new Date(row.purchase_date).toLocaleString() },
    { field: 'supplier_name', headerName: 'Proveedor', width: 200 },
    { field: 'total', headerName: 'Total', width: 120, renderCell: (row: any) => `$${row.total}` },
    {
      field: 'status',
      headerName: 'Estado',
      width: 60,
      renderCell: (row: any) => <Chip label={row.status} color={row.status === 'completed' ? 'success' : 'error'} size="small" />,
    }
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Compras</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/purchases/new')}>Nueva Compra</Button>
      </Box>
      <DataTable rows={purchases} columns={columns} loading={loading} onChangeStatus={handleOpenStatusDialog} />
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Cambiar estado de compra #{selectedPurchase?.purchase_number}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Estado</InputLabel>
            <Select value={newStatus} label="Estado" onChange={(e) => setNewStatus(e.target.value)}>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="completed">Completada</MenuItem>
              <MenuItem value="paid">Pagada</MenuItem>
              <MenuItem value="cancelled">Anulada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>Actualizar</Button>
        </DialogActions>
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
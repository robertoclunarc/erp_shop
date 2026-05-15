import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { Visibility, Receipt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../../components/tables/DataTable';
import { saleService, Sale } from '../../api/saleService';
import { useBranchFilter } from '../../hooks/useBranchFilter';

export const SaleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranchFilter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      const data = await saleService.list({ branch_id: selectedBranch });
      setSales(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const columns: Column<Sale>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'sale_number', headerName: 'N° Venta', width: 150 },
    {
      field: 'sale_date',
      headerName: 'Fecha',
      width: 180,
      renderCell: (row) => new Date(row.sale_date).toLocaleString(),
    },
    { field: 'user_name', headerName: 'Vendedor', width: 150 },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (row) => `$${row.total}`,
    },
    { field: 'payment_method', headerName: 'Pago', width: 120 },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (row) => (
        <Chip
          label={row.status}
          color={row.status === 'completed' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (row) => (
        <Tooltip title="Ver detalle">
          <IconButton size="small" onClick={() => navigate(`/sales/${row.id}`)}>
            <Visibility />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Ventas</Typography>
        <Button
          variant="contained"
          startIcon={<Receipt />}
          onClick={() => navigate('/sales/new')}
        >
          Nueva Venta
        </Button>
      </Box>
      <DataTable rows={sales} columns={columns} loading={loading} />
    </Box>
  );
};
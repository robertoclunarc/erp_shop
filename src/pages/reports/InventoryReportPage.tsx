import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip, CircularProgress } from '@mui/material';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { reportService } from '../../api/reportService';

export const InventoryReportPage: React.FC = () => {
  const { selectedBranch } = useBranchFilter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedBranch) {
      fetchData();
    }
  }, [selectedBranch]);

  const fetchData = async () => {
    try {
      const result = await reportService.getInventoryStatus({ branch_id: selectedBranch! });
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Estado de Inventario</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Stock actual</TableCell>
              <TableCell align="right">Stock mínimo</TableCell>
              <TableCell align="right">Pérdidas totales</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell align="right">{product.current_stock}</TableCell>
                <TableCell align="right">{product.min_stock}</TableCell>
                <TableCell align="right">{product.total_losses || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={product.stock_status}
                    color={product.stock_status === 'CRITICAL' ? 'error' : product.stock_status === 'LOW' ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
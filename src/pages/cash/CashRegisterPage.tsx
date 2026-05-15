import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Alert, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { cashService } from '../../api/cashService';

export const CashRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useBranchFilter();
  const [status, setStatus] = useState<{ open: boolean; cashRegister: any }>({ open: false, cashRegister: null });
  const [movements, setMovements] = useState<any[]>([]);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (selectedBranch) {
      loadStatus();
    }
  }, [selectedBranch]);

  const loadStatus = async () => {
    try {
      const data = await cashService.getStatus(selectedBranch!);
      setStatus(data);
      if (data.open && data.cashRegister) {
        const moves = await cashService.getMovements(data.cashRegister.id);
        setMovements(moves);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async () => {
    try {
      await cashService.open({ branch_id: selectedBranch!, opening_amount: parseFloat(openingAmount), opened_by: user!.id });
      setMessage({ type: 'success', text: 'Caja abierta correctamente' });
      loadStatus();
      setOpeningAmount('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al abrir caja' });
    }
  };

  const handleClose = async () => {
    try {
      await cashService.close(status.cashRegister.id, parseFloat(closingAmount));
      setMessage({ type: 'success', text: 'Caja cerrada correctamente' });
      loadStatus();
      setClosingAmount('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al cerrar caja' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Control de Caja</Typography>
      {message && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Estado Actual</Typography>
              <Chip label={status.open ? 'Caja ABIERTA' : 'Caja CERRADA'} color={status.open ? 'success' : 'error'} sx={{ mb: 2 }} />
              {status.open && status.cashRegister && (
                <>
                  <Typography variant="body2">Apertura: ${status.cashRegister.opening_amount}</Typography>
                  <Typography variant="body2">Fecha apertura: {new Date(status.cashRegister.opened_at).toLocaleString()}</Typography>
                </>
              )}
              <Box sx={{ mt: 2 }}>
                {!status.open ? (
                  <>
                    <TextField label="Monto inicial" type="number" fullWidth value={openingAmount} onChange={(e) => setOpeningAmount(e.target.value)} sx={{ mb: 2 }} />
                    <Button variant="contained" onClick={handleOpen} disabled={!openingAmount}>Abrir Caja</Button>
                  </>
                ) : (
                  <>
                    <TextField label="Monto de cierre" type="number" fullWidth value={closingAmount} onChange={(e) => setClosingAmount(e.target.value)} sx={{ mb: 2 }} />
                    <Button variant="contained" color="warning" onClick={handleClose} disabled={!closingAmount}>Cerrar Caja</Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Últimos Movimientos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Concepto</TableCell>
                    <TableCell align="right">Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.slice(0, 10).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                      <TableCell>{m.concept}</TableCell>
                      <TableCell align="right" sx={{ color: m.movement_type === 'INGRESO' ? 'success.main' : 'error.main' }}>
                        {m.movement_type === 'INGRESO' ? '+' : '-'} ${m.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportService } from '../../api/reportService';
import { useBranchFilter } from '../../hooks/useBranchFilter';

export const SalesReportPage: React.FC = () => {
  const { selectedBranch } = useBranchFilter();
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  const fetchReport = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      const res = await reportService.getSalesByDay({
        branch_id: selectedBranch,
        start_date: startDate,
        end_date: endDate,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    }
  }, [selectedBranch, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reporte de Ventas</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Fecha inicio"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Fecha fin"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Agrupar por</InputLabel>
            <Select
              value={groupBy}
              label="Agrupar por"
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <MenuItem value="day">Día</MenuItem>
              <MenuItem value="month">Mes</MenuItem>
              <MenuItem value="year">Año</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button variant="contained" onClick={fetchReport}>
            Actualizar
          </Button>
        </Grid>
      </Grid>
      <Card>
        <CardContent>
          <Typography variant="h6">Ventas diarias</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_amount" name="Monto ($)" fill="#3b82f6" />
              <Bar dataKey="total_sales" name="N° Ventas" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
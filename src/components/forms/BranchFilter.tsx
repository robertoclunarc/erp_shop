import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useBranchFilter } from '../../hooks/useBranchFilter';

export const BranchFilter: React.FC = () => {
  const { selectedBranch, setSelectedBranch, availableBranches } = useBranchFilter();

  if (availableBranches.length <= 1) {
    return null; // No mostrar filtro si solo hay una sucursal
  }

  return (
    <Box sx={{ minWidth: 200, mx: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Sucursal</InputLabel>
        <Select
          value={selectedBranch ?? ''}
          label="Sucursal"
          onChange={(e) => setSelectedBranch(e.target.value as number)}
        >
          {availableBranches.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
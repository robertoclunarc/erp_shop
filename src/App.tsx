import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthProvider';

import { ThemeContextProvider, useThemeContext } from './contexts/ThemeContext';
import { BranchProvider } from './contexts/BranchContext';
import { AppRouter } from './router/AppRouter';

const ThemedApp: React.FC = () => {
  const { theme } = useThemeContext();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <BranchProvider>
              <AppRouter />
            </BranchProvider>
          </AuthProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export const App: React.FC = () => (
  <ThemeContextProvider>
    <ThemedApp />
  </ThemeContextProvider>
);
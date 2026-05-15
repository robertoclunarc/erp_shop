import React, { useState } from 'react';

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    if (loading) return;

    setLoading(true);

    try {
      await login(username, password);

      navigate('/dashboard');

    } catch (err: any) {

      console.error(err);

      setError(
        err?.response?.data?.error ||
        'Credenciales inválidas'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">

        <Paper elevation={3} sx={{ p: 4 }}>

          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Shop ERP
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Sistema de gestión multi-sucursal
          </Typography>

          {
            error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )
          }

          <form
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
          >

            <TextField
              fullWidth
              label="Usuario"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              margin="normal"
              required
            />

            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {
                loading
                  ? <CircularProgress size={24} />
                  : 'Iniciar Sesión'
              }
            </Button>

          </form>

        </Paper>

      </Container>
    </Box>
  );
};
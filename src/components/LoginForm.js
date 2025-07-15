import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import axios from 'axios';

const LoginForm = ({ onAuthSuccess, onSwitchToRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const BACKEND_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError('Usuario y contraseña son requeridos');
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
    console.log('LOGIN DATA:', formData); // <-- Aquí agregas el log
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      username: formData.username,
      password: formData.password
    });

      console.log('RESPUESTA LOGIN:', response.data); // <-- Depura la respuesta

      if (response.data.data?.access_token) {
        const authData = {
          token: response.data.data.access_token,
          user: response.data.data.user
        };
        onAuthSuccess(authData);
      } else if (response.data.access_token) {
        const authData = {
          token: response.data.access_token,
          user: response.data.user
        };
        onAuthSuccess(authData);
      } else {
        setError('No se recibió token de autenticación');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom color="primary">
        Iniciar Sesión
      </Typography>

      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Accede a tu sistema de inventario
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Contraseña"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            'Iniciar Sesión'
          )}
        </Button>

        <Box textAlign="center">
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿No tienes cuenta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToRegister}
              sx={{ cursor: 'pointer' }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;

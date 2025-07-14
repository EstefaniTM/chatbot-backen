import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box,
  IconButton 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import LoginForm from './LoginForm';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = ({ open, onClose }) => {
  const { login } = useAuth();

  const handleAuthSuccess = (authData) => {
    login(authData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 0
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Botón de cerrar - siempre disponible */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Solo el formulario de login */}
        <LoginForm 
          onAuthSuccess={handleAuthSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthForm;
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import UserHeader from './components/UserHeader';
import FileManager from './components/FileManager';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

// Componente principal de la aplicación autenticada
const AuthenticatedApp = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <UserHeader user={user} onLogout={logout} />
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <FileManager />
      </Box>
    </>
  );
};

// Componente principal de la aplicación
const AppContent = () => {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  return <AuthForm onAuthSuccess={login} />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

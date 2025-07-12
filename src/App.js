import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UserHeader from './components/UserHeader';
import ChatbotInterface from './components/ChatbotInterface';
import FilesPage from './components/FilesPage';
import AuthForm from './components/AuthForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f8fafc',
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
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// Componente principal de la aplicación con navegación
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState('login');
  const [currentPage, setCurrentPage] = useState('chat'); // 'chat', 'files', 'settings'
  const [inventoryData, setInventoryData] = useState([]);

  // Si no está autenticado, no abrir automáticamente el diálogo
  // El usuario puede navegar y usar el chat sin autenticación
  // Solo se abrirá el diálogo cuando haga clic en "Iniciar Sesión" o "Registrarse"
  useEffect(() => {
    // No hacer nada automáticamente, dejar que el usuario decida
  }, [isAuthenticated]);

  const handleOpenAuth = (tab = 'login') => {
    setAuthDialogTab(tab);
    setAuthDialogOpen(true);
  };

  const handleCloseAuth = () => {
    // Permitir cerrar el diálogo sin requerir autenticación
    setAuthDialogOpen(false);
  };

  const handleNavigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleFileLoaded = (data, headers, fileName) => {
    setInventoryData(data);
    console.log('Archivo cargado:', { data, headers, fileName });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'files':
        return (
          <FilesPage
            onFileLoaded={handleFileLoaded}
          />
        );
      case 'settings':
        return (
          <Box sx={{ p: 3 }}>
            <h2>Configuración</h2>
            <p>Página de configuración en desarrollo...</p>
          </Box>
        );
      default:
        return (
          <ChatbotInterface 
            inventoryData={inventoryData}
            onNavigateToFiles={() => setCurrentPage('files')}
          />
        );
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header principal - Siempre visible */}
      <UserHeader 
        onOpenAuth={handleOpenAuth}
        onNavigateTo={handleNavigateTo}
        currentPage={currentPage}
      />
      
      {/* Contenido principal - Siempre visible */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {renderCurrentPage()}
        </Box>
      </Container>

      {/* Dialog de autenticación - Solo se abre cuando se hace clic en login/registro */}
      <AuthForm
        open={authDialogOpen}
        onClose={handleCloseAuth}
        initialTab={authDialogTab}
      />
    </Box>
  );
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

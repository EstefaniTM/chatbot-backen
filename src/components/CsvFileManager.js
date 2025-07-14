import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DeleteSweep as DeleteMultipleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { csvService } from '../services/csvService';
import { useAuth } from '../contexts/AuthContext';

const CsvFileManager = () => {
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar archivos CSV al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadCsvFiles();
    }
  }, [isAuthenticated]);

  const loadCsvFiles = async () => {
    setLoading(true);
    try {
      const response = await csvService.getAllCsvFiles();
      setFiles(response.data.data || []);
    } catch (error) {
      showSnackbar('Error cargando archivos CSV', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteSingle = async () => {
    if (!fileToDelete) return;

    try {
      await csvService.deleteCsvFile(fileToDelete._id);
      showSnackbar('Archivo eliminado exitosamente');
      loadCsvFiles();
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      showSnackbar('Error eliminando archivo', 'error');
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const response = await csvService.deleteMultipleCsvFiles(selectedFiles);
      showSnackbar(response.message);
      loadCsvFiles();
      setMultiDeleteDialogOpen(false);
      setSelectedFiles([]);
    } catch (error) {
      showSnackbar('Error eliminando archivos', 'error');
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file._id));
    }
  };

  const openDeleteDialog = (file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const openMultiDeleteDialog = () => {
    setMultiDeleteDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Por favor, inicia sesión para gestionar archivos CSV
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Archivos CSV
      </Typography>

      {/* Controles superiores */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadCsvFiles}
            disabled={loading}
          >
            Actualizar
          </Button>
          {selectedFiles.length > 0 && (
            <Button
              startIcon={<DeleteMultipleIcon />}
              color="error"
              onClick={openMultiDeleteDialog}
              sx={{ ml: 1 }}
            >
              Eliminar Seleccionados ({selectedFiles.length})
            </Button>
          )}
        </Box>
        
        {files.length > 0 && (
          <Button onClick={handleSelectAll}>
            {selectedFiles.length === files.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
          </Button>
        )}
      </Box>

      {/* Lista de archivos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            {files.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No hay archivos CSV disponibles
              </Typography>
            ) : (
              <List>
                {files.map((file) => (
                  <ListItem key={file._id} divider>
                    <Checkbox
                      checked={selectedFiles.includes(file._id)}
                      onChange={() => handleSelectFile(file._id)}
                    />
                    <ListItemText
                      primary={file.originalname}
                      secondary={`Subido: ${new Date(file.uploadedAt).toLocaleDateString()} | Estado: ${file.status}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => openDeleteDialog(file)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de eliminación individual */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar el archivo "{fileToDelete?.originalname}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. El archivo se eliminará permanentemente.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteSingle} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación múltiple */}
      <Dialog open={multiDeleteDialogOpen} onClose={() => setMultiDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación Múltiple</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar {selectedFiles.length} archivo(s) seleccionado(s)?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. Los archivos se eliminarán permanentemente.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMultiDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteMultiple} color="error" variant="contained">
            Eliminar {selectedFiles.length} archivo(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CsvFileManager;

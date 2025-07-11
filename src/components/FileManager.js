import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  TableChart as TableIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import ChatbotInterface from './ChatbotInterface';
import Papa from 'papaparse';

const FileManager = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  // Cargar archivos guardados al iniciar
  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('csvFiles') || '[]');
    setCsvFiles(savedFiles);
  }, []);

  // Guardar archivos en localStorage
  const saveFilesToStorage = (files) => {
    localStorage.setItem('csvFiles', JSON.stringify(files));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0];
            const rows = results.data.slice(1).map((row, index) => {
              const rowObject = { id: index };
              headers.forEach((header, i) => {
                rowObject[header] = row[i];
              });
              return rowObject;
            });

            const newFile = {
              id: Date.now(),
              name: file.name,
              uploadDate: new Date().toISOString(),
              rowCount: rows.length,
              headers: headers,
              data: rows,
            };

            const updatedFiles = [...csvFiles, newFile];
            setCsvFiles(updatedFiles);
            saveFilesToStorage(updatedFiles);
          }
        },
        header: false,
        skipEmptyLines: true,
      });
    }
  };

  const handleDeleteFile = (fileId) => {
    const updatedFiles = csvFiles.filter(file => file.id !== fileId);
    setCsvFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
  };

  const handleOpenChat = (file) => {
    setSelectedFile(file);
    setShowChat(true);
  };

  const handlePreviewFile = (file) => {
    setPreviewData(file.data.slice(0, 10)); // Mostrar solo las primeras 10 filas
    setShowPreview(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showChat && selectedFile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header del chat */}
        <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FileIcon color="primary" />
              <Typography variant="h6">{selectedFile.name}</Typography>
              <Chip 
                label={`${selectedFile.rowCount} productos`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
            <Button 
              variant="outlined" 
              onClick={() => setShowChat(false)}
            >
              ← Volver al menú
            </Button>
          </Box>
        </Paper>
        
        {/* Chat interface */}
        <Box sx={{ flex: 1 }}>
          <ChatbotInterface preloadedData={selectedFile.data} fileName={selectedFile.name} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestor de Inventarios CSV
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Carga y gestiona tus archivos CSV de inventario. Selecciona un archivo para chatear con tu asistente de IA.
        </Typography>
      </Box>

      {/* Upload Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <UploadIcon color="primary" />
          <Typography variant="h6">Cargar nuevo archivo CSV</Typography>
        </Box>
        <input
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            size="large"
          >
            Seleccionar archivo CSV
          </Button>
        </label>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* Files Grid */}
      {csvFiles.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay archivos CSV cargados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carga tu primer archivo CSV para comenzar a usar el asistente de inventario
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Archivos CSV ({csvFiles.length})
          </Typography>
          <Grid container spacing={3}>
            {csvFiles.map((file) => (
              <Grid item xs={12} sm={6} md={4} key={file.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <FileIcon color="primary" />
                      <Typography variant="h6" component="div" noWrap>
                        {file.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Subido: {formatDate(file.uploadDate)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={`${file.rowCount} productos`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${file.headers.length} columnas`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Columnas: {file.headers.slice(0, 3).join(', ')}
                      {file.headers.length > 3 && '...'}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<ChatIcon />}
                      onClick={() => handleOpenChat(file)}
                      variant="contained"
                    >
                      Chatear
                    </Button>
                    <Button
                      size="small"
                      startIcon={<TableIcon />}
                      onClick={() => handlePreviewFile(file)}
                    >
                      Vista previa
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Vista previa del archivo</DialogTitle>
        <DialogContent>
          {previewData.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).filter(key => key !== 'id').map((header) => (
                      <th key={header} style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px', 
                        backgroundColor: '#f5f5f5',
                        textAlign: 'left'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.entries(row).filter(([key]) => key !== 'id').map(([key, value]) => (
                        <td key={key} style={{ 
                          border: '1px solid #ddd', 
                          padding: '8px' 
                        }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManager;

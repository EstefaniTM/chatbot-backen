import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  CircularProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  TableChart as TableIcon,
  Description as FileIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import ChatbotInterface from './ChatbotInterface';

const API_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads';

const FileManager = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedCsvIds, setSelectedCsvIds] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileModalData, setFileModalData] = useState([]);
  const [fileModalFile, setFileModalFile] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Mostrar archivo completo en modal
  const handleShowFile = async (file) => {
    try {
      const response = await axios.get(`${API_URL}/${file.filename}`);
      setFileModalData(response.data || []);
      setFileModalFile(file);
      setShowFileModal(true);
    } catch (error) {
      console.error('Error mostrando archivo', error);
    }
  };

  // Cargar archivos desde el backend al iniciar
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoadingFiles(true);
        const response = await axios.get(API_URL);
        console.log('Archivos recibidos:', response.data);
        // Mostrar los datos recibidos en consola para depuración
        console.log('Datos completos recibidos del backend:', JSON.stringify(response.data, null, 2));
        setCsvFiles(response.data);
      } catch (error) {
        console.error('Error cargando archivos desde el backend', error);
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
  }, []);

  // Subir archivo al backend
  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'text/csv') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('originalname', file.name);
    formData.append('uploadedBy', 'usuario@ejemplo.com'); // <-- pon aquí el usuario real si lo tienes
    try {
      setLoadingFiles(true);
      await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const response = await axios.get(API_URL);
      console.log('Archivos después de subir:', response.data);
      setCsvFiles(response.data);
    } catch (error) {
      console.error('Error subiendo archivo', error);
    } finally {
      setLoadingFiles(false);
    }
  }
};

  // Eliminar archivo del backend
  const handleDeleteFile = async (filename) => {
    try {
      setLoadingFiles(true);
      // Buscar el id del archivo por filename
      const file = csvFiles.find(f => f.filename === filename);
      if (!file || !file._id) throw new Error('No se encontró el id del archivo');
      await axios.post(`${API_URL}/delete-many`, { ids: [file._id] });
      setCsvFiles(csvFiles.filter(f => f._id !== file._id));
      setSelectedCsvIds(selectedCsvIds.filter(id => id !== file._id));
    } catch (error) {
      console.error('Error eliminando archivo', error);
    } finally {
      setLoadingFiles(false);
    }
  // Eliminar múltiples archivos seleccionados
  const handleDeleteSelected = async () => {
    if (selectedCsvIds.length === 0) return;
    try {
      setLoadingFiles(true);
      await axios.post(`${API_URL}/delete-many`, { ids: selectedCsvIds });
      setCsvFiles(csvFiles.filter(f => !selectedCsvIds.includes(f._id)));
      setSelectedCsvIds([]);
    } catch (error) {
      console.error('Error eliminando archivos seleccionados', error);
    } finally {
      setLoadingFiles(false);
    }
  };
  };

  // Abrir chat con archivo seleccionado
  const handleOpenChat = async (file) => {
    try {
      setLoadingChat(true);
      const response = await axios.get(`${API_URL}/${file.filename}`);
      console.log('Datos para chat:', response.data);
      setSelectedFile({
        ...file,
        data: response.data || [],
      });
      setShowChat(true);
    } catch (error) {
      console.error('Error obteniendo datos del archivo', error);
    } finally {
      setLoadingChat(false);
    }
  };

  // Vista previa del archivo
  const handlePreviewFile = async (file) => {
    try {
      const response = await axios.get(`${API_URL}/${file.filename}`);
      setPreviewData(response.data?.slice(0, 10) || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error obteniendo datos para vista previa', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar chat si está activo
  if (showChat && selectedFile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FileIcon color="primary" />
              <Typography variant="h6">{selectedFile.originalname}</Typography>
              <Chip 
                label={`Estado: ${selectedFile.status}`} 
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
        <Box sx={{ flex: 1 }}>
          <ChatbotInterface preloadedData={selectedFile.data} fileName={selectedFile.originalname} />
        </Box>
      </Box>
    );
  }

  // Renderizar gestor de archivos
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestor de Inventarios CSV
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Carga y gestiona tus archivos CSV de inventario. Selecciona un archivo para chatear con tu asistente de IA.
        </Typography>
      </Box>

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

      {loadingFiles ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : csvFiles.length === 0 ? (
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
            {/* Botón para eliminar seleccionados */}
            <Grid item xs={12} sx={{ mb: 2 }}>
              {selectedCsvIds.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  sx={{ mb: 2 }}
                >
                  Eliminar seleccionados ({selectedCsvIds.length})
                </Button>
              )}
            </Grid>
            {csvFiles.map((file) => (
              <Grid item xs={12} sm={6} lg={4} key={file.filename}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <FileIcon color="primary" />
                      <Typography variant="h6" component="div" noWrap>
                        {file.originalname}
                      </Typography>
                      <Checkbox
                        checked={selectedCsvIds.includes(file._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedCsvIds(ids => [...ids, file._id]);
                          } else {
                            setSelectedCsvIds(ids => ids.filter(id => id !== file._id));
                          }
                        }}
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estado: {file.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subido por: {file.uploadedBy}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={loadingChat ? <CircularProgress size={20} color="inherit" /> : <ChatIcon />}
                      onClick={() => handleOpenChat(file)}
                      disabled={loadingChat}
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
                      color="primary"
                      onClick={() => handleShowFile(file)}
                      aria-label="Ver archivo"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFile(file.filename)}
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

      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Vista previa del archivo</DialogTitle>
        <DialogContent>
          {previewData.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(previewData[0] || {}).map((header) => (
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
                      {Object.entries(row).map(([key, value]) => (
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
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para ver archivo completo */}
      <Dialog
        open={showFileModal}
        onClose={() => setShowFileModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Archivo completo: {fileModalFile?.originalname}</DialogTitle>
        <DialogContent>
          {fileModalData.length > 0 ? (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(fileModalData[0] || {}).map((header) => (
                      <th key={header} style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        backgroundColor: '#e0e0e0',
                        textAlign: 'left',
                        position: 'sticky',
                        top: 0
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileModalData.map((row, index) => (
                    <tr key={index}>
                      {Object.entries(row).map(([key, value]) => (
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
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {fileModalFile && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowFileModal(false);
                setTimeout(() => {
                  setSelectedFile({
                    ...fileModalFile,
                    data: fileModalData,
                  });
                  setShowChat(true);
                }, 200);
              }}
            >
              Usar en el chat
            </Button>
          )}
          <Button onClick={() => setShowFileModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManager;
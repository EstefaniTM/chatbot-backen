import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Search,
  FilePresent,
  Delete,
  Visibility,
  CheckCircle,
  Error as ErrorIcon,
  TableChart,
  DateRange,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import Papa from 'papaparse';

const FilesPage = ({ onFileLoaded }) => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (fileList) => {
    setUploading(true);
    setError('');

    fileList.forEach((file) => {
      if (file.type !== 'text/csv') {
        setError('Solo se permiten archivos CSV');
        setUploading(false);
        return;
      }

      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        status: 'processing',
        data: null,
        headers: null,
        error: null
      };

      setFiles(prev => [fileObj, ...prev]);

      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id 
                ? { ...f, status: 'error', error: 'Error al procesar el archivo CSV' }
                : f
            ));
          } else {
            const headers = results.data[0];
            const rows = results.data.slice(1).filter(row => row.some(cell => cell)).map((row, index) => {
              const rowObject = { id: index };
              headers.forEach((header, i) => {
                rowObject[header] = row[i] || '';
              });
              return rowObject;
            });

            setFiles(prev => prev.map(f => 
              f.id === fileObj.id 
                ? { ...f, status: 'success', data: rows, headers: headers, rowCount: rows.length }
                : f
            ));
          }
          setUploading(false);
        },
        header: false,
        skipEmptyLines: true,
        error: (error) => {
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'error', error: error.message }
              : f
          ));
          setUploading(false);
        }
      });
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const loadFileToChat = (file) => {
    onFileLoaded(file.data, file.headers);
    // Opcional: mostrar confirmación o redirigir al chat
  };

  const previewFile = (file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const successfulFiles = filteredFiles.filter(f => f.status === 'success');
  const columns = selectedFile?.headers?.map(header => ({
    field: header,
    headerName: header.charAt(0).toUpperCase() + header.slice(1),
    width: 150,
    flex: 1,
  })) || [];

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header de la página */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          📁 Mis Archivos CSV
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tus archivos de inventario, carga nuevos CSV y accede a tu historial.
        </Typography>
      </Box>

      {/* Sección de carga */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          Cargar nuevo archivo CSV
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper
          sx={{
            p: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Arrastra archivos CSV aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Formatos soportados: .csv (máximo 10MB)
          </Typography>
          <Button variant="contained" startIcon={<CloudUpload />}>
            Seleccionar Archivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Paper>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Procesando archivos...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </Paper>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar archivos por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <Chip 
          label={`${successfulFiles.length} archivo${successfulFiles.length !== 1 ? 's' : ''}`} 
          color="primary" 
        />
      </Box>

      {/* Lista de archivos */}
      {filteredFiles.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <FilePresent sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No se encontraron archivos' : 'No tienes archivos cargados'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Carga tu primer archivo CSV para comenzar'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                    {file.status === 'success' ? (
                      <CheckCircle color="success" />
                    ) : file.status === 'error' ? (
                      <ErrorIcon color="error" />
                    ) : (
                      <FilePresent color="primary" />
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      size="small"
                      label={formatDate(file.uploadDate)}
                      icon={<DateRange />}
                      variant="outlined"
                    />
                    {file.status === 'success' && (
                      <Chip
                        size="small"
                        label={`${file.rowCount} filas`}
                        color="success"
                      />
                    )}
                  </Box>

                  {file.status === 'error' && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {file.error}
                    </Alert>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {file.status === 'success' && (
                      <>
                        <IconButton 
                          size="small" 
                          onClick={() => previewFile(file)}
                          title="Vista previa"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => loadFileToChat(file)}
                          title="Usar en chat"
                        >
                          <TableChart />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => removeFile(file.id)}
                    color="error"
                    title="Eliminar"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de vista previa */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Vista previa: {selectedFile?.name}
            </Typography>
            <Chip 
              label={`${selectedFile?.rowCount || 0} filas`} 
              color="primary" 
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFile?.data ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={selectedFile.data}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </Box>
          ) : (
            <Typography>No hay datos para mostrar</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Cerrar
          </Button>
          {selectedFile?.status === 'success' && (
            <Button 
              variant="contained" 
              onClick={() => {
                loadFileToChat(selectedFile);
                setPreviewOpen(false);
              }}
              startIcon={<TableChart />}
            >
              Usar en Chat
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilesPage;

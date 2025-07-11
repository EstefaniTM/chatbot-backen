import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Papa from 'papaparse';

const ChatbotInterface = ({ preloadedData = null, fileName = '' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: preloadedData 
        ? `¡Hola! He cargado tu archivo "${fileName}" con ${preloadedData.length} productos. Puedes preguntarme sobre cantidades, productos específicos, o pedirme que muestre la tabla completa.`
        : '¡Hola! Soy tu asistente de inventario. Puedes cargar un archivo CSV con tu inventario y luego preguntarme sobre productos, cantidades, etc.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inventoryData, setInventoryData] = useState(preloadedData || []);
  const [showTable, setShowTable] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // URL de tu backend - ajusta según tu configuración
  const BACKEND_URL = 'http://localhost:3008/api/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            // Asumiendo que la primera fila contiene los headers
            const headers = results.data[0];
            const rows = results.data.slice(1).map((row, index) => {
              const rowObject = { id: index };
              headers.forEach((header, i) => {
                rowObject[header] = row[i];
              });
              return rowObject;
            });
            
            setInventoryData(rows);
            
            const botMessage = {
              id: Date.now(),
              text: `¡Perfecto! He cargado ${rows.length} productos a tu inventario. Ahora puedes preguntarme cosas como "¿cuántas pastillas me quedan?" o "mostrar tabla de inventario".`,
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
          }
        },
        header: false,
        skipEmptyLines: true,
      });
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Verificar si es un comando local antes de enviar al backend
      if (currentInput.toLowerCase().includes('mostrar tabla') || 
          currentInput.toLowerCase().includes('ver inventario')) {
        setShowTable(true);
        const botMessage = {
          id: Date.now() + 1,
          text: 'Aquí tienes tu inventario completo. Haz clic en el botón "Ver Tabla" que aparece abajo.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
        setIsTyping(false);
        return;
      }

      // Buscar en inventario local si hay datos cargados
      if (inventoryData.length > 0) {
        const searchResults = searchInventory(currentInput);
        if (searchResults) {
          const botMessage = {
            id: Date.now() + 1,
            text: searchResults,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prevMessages => [...prevMessages, botMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Enviar al backend si no se procesó localmente
      const response = await axios.post(BACKEND_URL, {
        message: currentInput,
        inventoryData: inventoryData, // Enviar datos de inventario al backend
        userId: 'user-123',
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message || response.data.response || 'Lo siento, no pude procesar tu mensaje.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, ocurrió un error. Asegúrate de que el backend esté funcionando.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const searchInventory = (query) => {
    if (!inventoryData.length) return null;

    const lowercaseQuery = query.toLowerCase();
    
    // Buscar productos específicos
    const matchingProducts = inventoryData.filter(item => {
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(lowercaseQuery)
      );
    });

    if (matchingProducts.length > 0) {
      if (lowercaseQuery.includes('cuánto') || lowercaseQuery.includes('cantidad')) {
        const product = matchingProducts[0];
        const quantityField = Object.keys(product).find(key => 
          key.toLowerCase().includes('cantidad') || 
          key.toLowerCase().includes('stock') ||
          key.toLowerCase().includes('qty')
        );
        
        if (quantityField) {
          return `Tienes ${product[quantityField]} unidades de ${product[Object.keys(product)[1]] || 'ese producto'}.`;
        }
      }
      
      return `Encontré ${matchingProducts.length} producto(s) relacionado(s). El primero es: ${JSON.stringify(matchingProducts[0], null, 2)}`;
    }

    return null;
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Preparar columnas para la tabla (usando las keys del primer objeto)
  const columns = inventoryData.length > 0 
    ? Object.keys(inventoryData[0])
        .filter(key => key !== 'id')
        .map(key => ({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1),
          width: 150,
          flex: 1,
        }))
    : [];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con botones de acción */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {!preloadedData && (
              <>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mr: 2 }}
                >
                  Cargar CSV
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </>
            )}
            {preloadedData && (
              <Typography variant="h6" color="primary">
                📄 {fileName}
              </Typography>
            )}
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            {inventoryData.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<TableIcon />}
                onClick={() => setShowTable(true)}
              >
                Ver Tabla ({inventoryData.length} productos)
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Área de mensajes */}
      <Paper 
        elevation={1} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              {message.sender === 'bot' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              
              <Box sx={{ maxWidth: '70%' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {formatTimestamp(message.timestamp)}
                </Typography>
              </Box>

              {message.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          ))}

          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <BotIcon fontSize="small" />
              </Avatar>
              <Chip label="Escribiendo..." size="small" />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        <Divider />
        
        {/* Input area */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pregúntame sobre tu inventario..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
          />
          <IconButton 
            color="primary" 
            onClick={sendMessage}
            disabled={input.trim() === ''}
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Dialog para mostrar la tabla */}
      <Dialog 
        open={showTable} 
        onClose={() => setShowTable(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Inventario Completo
        </DialogTitle>
        <DialogContent>
          {inventoryData.length > 0 ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={inventoryData}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </Box>
          ) : (
            <Typography>No hay datos de inventario cargados.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTable(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatbotInterface;

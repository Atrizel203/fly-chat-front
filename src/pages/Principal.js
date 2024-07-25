import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Avatar, Typography, List, ListItem, ListItemText, ListItemAvatar, IconButton, Divider, Paper } from '@mui/material';
import { Search, MoreVert, Delete } from '@mui/icons-material';
import MarkMesser from '../images/Logo.webp'; // Ruta a tu imagen local
import PagoFicticioModal from '../components/PagoFicticioModal';
import chatBackground from '../images/fondoapp.webp';

const Principal = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ws, setWs] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchUsers = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    const response = await fetch(`http://localhost:3360/api/users?userId=${user.id}`);
    const data = await response.json();
    const otherUsers = data.filter(u => u.id !== user.id);
    setUsers(otherUsers);
    setFilteredUsers(otherUsers);
  };

  const fetchMessages = async (userId) => {
    const response = await fetch(`http://localhost:3360/api/messages/user/${userId}`);
    const data = await response.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3360');
    setWs(socket);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'delete') {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== message.id));
      } else {
        if (message.destinatario_id === currentUser.id || message.remitente_id === currentUser.id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [currentUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '' && selectedUser) {
      const message = {
        remitente_id: currentUser.id,
        destinatario_id: selectedUser.id,
        mensaje: inputValue,
        fecha_envio: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      try {
        const response = await fetch('http://localhost:3360/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });

        if (response.ok) {
          console.log('Message sent to API');
          setInputValue('');
        } else {
          console.error('Error sending message to API:', await response.text());
        }
      } catch (error) {
        console.error('Error sending message to API:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) {
      console.error('Message ID is invalid');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3360/api/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Message deleted');
      } else {
        console.error('Error deleting message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const renderMessage = (message, index) => (
    message && (
      <Box key={index} display="flex" flexDirection="column" alignItems={message.remitente_id === currentUser.id ? 'flex-end' : 'flex-start'} mb={2}>
        <Typography variant="body2" color="textSecondary">{message.remitente_id === currentUser.id ? 'Tú' : selectedUser?.nombre}</Typography>
        <Box display="flex" alignItems="center">
          <Box bgcolor={message.remitente_id === currentUser.id ? "primary.main" : "secondary.main"} color="white" p={2} borderRadius={2} maxWidth="80%">
            {message.mensaje}
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>{new Date(message.fecha_envio).toLocaleTimeString()}</Typography>
          <IconButton onClick={() => handleDeleteMessage(message.id)}>
            <Delete />
          </IconButton>
        </Box>
      </Box>
    )
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setFilteredUsers(users.filter(user => user.nombre.toLowerCase().includes(value.toLowerCase())));
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: '25%', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ padding: 2, borderBottom: '1px solid #ccc' }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Busca Mensajes o Usuarios"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <Search />
              ),
            }}
          />
        </Box>
        <List>
          {filteredUsers.map((user) => (
            <ListItem button key={user.id} onClick={() => handleSelectUser(user)}>
              <ListItemAvatar>
                <Avatar src={MarkMesser} />
              </ListItemAvatar>
              <ListItemText primary={user.nombre} />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>12 min</Typography>
            </ListItem>
          ))}
          <Divider />
        </List>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundImage: `url(${chatBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Box sx={{ padding: 2, borderBottom: '1px solid #ccc', display: 'flex', alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">{selectedUser ? selectedUser.nombre : 'Seleccione un usuario'}</Typography>
          <IconButton>
            <MoreVert />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, padding: 2, overflowY: 'auto' }}>
          {messages.map(renderMessage)}
        </Box>
        <Box sx={{ padding: 2, borderTop: '1px solid #ccc', display: 'flex' }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
            Enviar
          </Button>
        </Box>
      </Box>
      <Box sx={{ width: '20%', padding: 2 }}>
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
          <Typography variant="h6" gutterBottom>Información del Usuario</Typography>
          <Typography variant="body1"><strong>Nombre:</strong> {currentUser?.nombre}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {currentUser?.email}</Typography>
        </Paper>
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
          <Typography variant="h6" gutterBottom>Contactos Recientes</Typography>
          <List>
            {filteredUsers.map((user) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Avatar src={MarkMesser} />
                </ListItemAvatar>
                <ListItemText primary={user.nombre} />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>Promociones</Typography>
          <Typography variant="body1">
            Aprovecha nuestras ofertas especiales en servicios de mensajería.
          </Typography>
        </Paper>
      </Box>
      <Button variant="contained" color="primary" onClick={handleOpenPaymentModal} sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        Realizar Pago 
      </Button>
      <PagoFicticioModal open={isPaymentModalOpen} handleClose={handleClosePaymentModal} userId={currentUser?.id} />
    </Container>
  );
};

export default Principal;

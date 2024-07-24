import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Avatar, Typography, List, ListItem, ListItemText, ListItemAvatar, IconButton, Divider } from '@mui/material';
import { Search, MoreVert, Delete } from '@mui/icons-material';
import MarkMesser from '../images/Logo.webp'; // Ruta a tu imagen local

const Principal = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ws, setWs] = useState(null);

  const fetchUsers = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    const response = await fetch(`http://localhost:3000/api/users?userId=${user.id}`);
    const data = await response.json();
    const otherUsers = data.filter(u => u.id !== user.id);
    setUsers(otherUsers);
    setFilteredUsers(otherUsers);
  };

  const fetchMessages = async (userId) => {
    const response = await fetch(`http://localhost:3000/api/messages/user/${userId}`);
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
    const socket = new WebSocket('ws://localhost:3000');
    setWs(socket);

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Si event.data es un string, se puede parsear directamente
        try {
          const message = JSON.parse(event.data);
          if (message && message.remitente_id && message.destinatario_id) {
            if (message.remitente_id === currentUser.id || message.destinatario_id === currentUser.id) {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          }
        } catch (e) {
          console.error('Error processing message:', e);
        }
      } else {
        // Si event.data no es un string, usar FileReader para leerlo como texto
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const message = JSON.parse(reader.result);
            if (message && message.remitente_id && message.destinatario_id) {
              if (message.remitente_id === currentUser.id || message.destinatario_id === currentUser.id) {
                setMessages((prevMessages) => [...prevMessages, message]);
              }
            }
          } catch (e) {
            console.error('Error processing message:', e);
          }
        };
        reader.readAsText(new Blob([event.data]));
      }
    };

    return () => {
      socket.close();
    };
  }, [currentUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '' && selectedUser && ws) {
      const message = {
        remitente_id: currentUser.id,
        destinatario_id: selectedUser.id,
        mensaje: inputValue,
        fecha_envio: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formato adecuado para MySQL
      };

      // Enviar el mensaje a través de WebSocket
      ws.send(JSON.stringify(message));

      // Limpia el campo de entrada de texto
      setInputValue('');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
      } else {
        console.error('Error deleting message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const renderMessage = (message, index) => (
    message && (
      <Box key={index} display="flex" flexDirection="column" alignItems="flex-start" mb={2}>
        <Typography variant="body2" color="textSecondary">{message.remitente_id === currentUser.id ? 'Tú' : selectedUser?.nombre}</Typography>
        <Box display="flex" alignItems="center">
          <Box bgcolor="primary.main" color="white" p={2} borderRadius={2} maxWidth="80%">
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
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ padding: 2, borderBottom: '1px solid #ccc', display: 'flex', alignItems:"center", justifyContent:"space-between" }}>
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
    </Container>
  );
};

export default Principal;

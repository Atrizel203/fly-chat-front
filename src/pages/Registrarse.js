import * as React from 'react';
import { useState } from 'react';
import { Avatar, Button, CssBaseline, TextField, Grid, Box, Typography, Container, createTheme, ThemeProvider, Paper } from '@mui/material';
import registerImage from '../images/Logo.webp';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function Registrarse() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3360/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: `${firstName}`, email, password, fecha_registro: new Date() }),
      });

      if (response.ok) {
        navigate('./');
      } else {
        console.error('Registro fallido');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Paper elevation={6} sx={{ display: 'flex', borderRadius: 2, marginTop: "100px"}}>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  backgroundImage: `url(${registerImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '100%',
                  borderRadius: '4px 0 0 4px'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  margin: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                 
                </Avatar>
                <Typography component="h1" variant="h5">
                  Registro
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                      <TextField
                        autoComplete="given-name"
                        name="firstName"
                        required
                        fullWidth
                        id="firstName"
                        label="Nombre"
                        autoFocus
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Dirección de Email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Grid>
                
                  </Grid>
                  <a href='/'><Button 
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Registrarse
                  </Button></a>
                  <Grid container justifyContent="flex-end">
                    <Grid item>
                      <a href='/' variant="body2">
                        ¿Ya tienes una cuenta? Inicia sesión
                      </a>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

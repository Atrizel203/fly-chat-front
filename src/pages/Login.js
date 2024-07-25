import * as React from 'react';
import { useState } from 'react';
import { Avatar, Button, CssBaseline, TextField, FormControlLabel, Checkbox, Link, Grid, Box, Typography, Container, createTheme, ThemeProvider, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import  loginImage  from '../images/Logo.webp'

const defaultTheme = createTheme();

export default function IniciarSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3360/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user)); // Guardar el usuario en localStorage
        navigate('/principal');
      } else {
        console.error('Inicio de sesión fallido');
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
                  backgroundImage: `url(${loginImage})`,
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
                  Inicio de Sesión
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Dirección de Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Recordarme"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Grid container>
                    <Grid item>
                      <Link href="./Registrarse" variant="body2">
                        {"¿No tienes una cuenta? Regístrate"}
                      </Link>
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

import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, Select, FormControl, InputLabel, Box, Typography } from '@mui/material';

const PagoFicticioModal = ({ open, handleClose, userId }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [message, setMessage] = useState('');

  const handlePayment = async () => {
    try {
      const response = await fetch('http://localhost:3360/api/fake-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          paymentMethod,
        }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error al procesar el pago ');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Pago</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Cantidad"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Metodo de Pago</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="Tarjeta de Crédito">Tarjeta de Crédito</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Transferencia Bancaria">Transferencia Bancaria</MenuItem>
            </Select>
          </FormControl>
          {message && (
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handlePayment} variant="contained" color="primary">
          Pagar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PagoFicticioModal;

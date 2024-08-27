import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  CircularProgress,
  Snackbar,
  Alert 
} from '@mui/material';
import { db, auth } from '../firebaseConfig';
import { addDoc, collection, Timestamp } from "firebase/firestore";
import BackButton from './BackButton'; // Ajusta la ruta según la ubicación del componente
import { useNavigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import MenuBar from './MenuBar'; // Importa el MenuBar
import SubmitButton from './SubmitButton';

export default function StudentForm() {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [plan, setPlan] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [healthInfo, setHealthInfo] = useState('');
  const [trainingStartDate, setTrainingStartDate] = useState('');
  const [trainingFrequency, setTrainingFrequency] = useState('');
  const [trainingHistory, setTrainingHistory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [trainerNotes, setTrainerNotes] = useState('');
  const [goalsAndPreferences, setGoalsAndPreferences] = useState('');

  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el "loading"
  const [openSnackbar, setOpenSnackbar] = useState(false); // Estado para controlar la visibilidad del Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Estado para el mensaje del Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Estado para el tipo de mensaje (éxito o error)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Mostrar el indicador de carga

    try {
      console.log("Intentando guardar los datos en Firestore...");
      await addDoc(collection(db, "students"), {
        name,
        idNumber,
        phone,
        dob,
        plan,
        email,
        address,
        height,
        weight,
        healthInfo,
        trainingStartDate,
        trainingFrequency,
        trainingHistory,
        paymentMethod,
        paymentStatus,
        renewalDate,
        trainerNotes,
        goalsAndPreferences,
        registrationDate: Timestamp.now() // Establecer automáticamente la fecha de registro
      });
      console.log("Datos guardados exitosamente.");
      setSnackbarMessage('Alumno registrado correctamente');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setIsLoading(false);
      navigate('/student-list');
    } catch (error) {
      console.error('Error al registrar al alumno: ', error);
      setSnackbarMessage('Hubo un error al registrar el alumno.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrar Alumno
          </Typography>

          {/* Datos Personales */}
          <Box sx={{ width: '100%', marginBottom: '24px' }}>
            <Typography variant="h6" gutterBottom>Datos Personales</Typography>
            <TextField
              label="Nombre y Apellido"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Cédula de Identidad"
              variant="outlined"
              fullWidth
              margin="normal"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
            <TextField
              label="Número de Teléfono"
              variant="outlined"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Plan Seleccionado"
              variant="outlined"
              fullWidth
              margin="normal"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              required
            />
            <TextField
              label="Correo Electrónico"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Dirección"
              variant="outlined"
              fullWidth
              margin="normal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Box>

          {/* Datos de Salud */}
          <Box sx={{ width: '100%', marginBottom: '24px' }}>
            <Typography variant="h6" gutterBottom>Datos de Salud</Typography>
            <TextField
              label="Estatura (cm)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <TextField
              label="Peso (kg)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <TextField
              label="Información de Salud"
              variant="outlined"
              fullWidth
              margin="normal"
              value={healthInfo}
              onChange={(e) => setHealthInfo(e.target.value)}
              multiline
              rows={4}
            />
          </Box>

          {/* Objetivos y Preferencias */}
          <Box sx={{ width: '100%', marginBottom: '24px' }}>
            <Typography variant="h6" gutterBottom>Objetivos y Preferencias</Typography>
            <TextField
              label="Objetivos y Preferencias"
              variant="outlined"
              fullWidth
              margin="normal"
              value={goalsAndPreferences}
              onChange={(e) => setGoalsAndPreferences(e.target.value)}
              multiline
              rows={4}
            />
          </Box>

          {/* Historial de Entrenamiento */}
          <Box sx={{ width: '100%', marginBottom: '24px' }}>
            <Typography variant="h6" gutterBottom>Historial de Entrenamiento</Typography>
            <TextField
              label="Fecha de Inicio"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={trainingStartDate}
              onChange={(e) => setTrainingStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Frecuencia de Entrenamiento (sesiones por semana)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={trainingFrequency}
              onChange={(e) => setTrainingFrequency(e.target.value)}
            />
            <TextField
              label="Historial de Rutinas"
              variant="outlined"
              fullWidth
              margin="normal"
              value={trainingHistory}
              onChange={(e) => setTrainingHistory(e.target.value)}
              multiline
              rows={4}
            />
          </Box>

          {/* Datos de Pago */}
          <Box sx={{ width: '100%', marginBottom: '24px' }}>
            <Typography variant="h6" gutterBottom>Datos de Pago</Typography>
            <TextField
              label="Método de Pago Preferido"
              variant="outlined"
              fullWidth
              margin="normal"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <TextField
              label="Estado de Pago"
              variant="outlined"
              fullWidth
              margin="normal"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            />
            <TextField
              label="Fecha de Renovación del Plan"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          {/* Notas Adicionales */}
          <Box sx={{ width: '100%', marginBottom: '24px' }}>
            <Typography variant="h6" gutterBottom>Notas Adicionales</Typography>
            <TextField
              label="Notas del Entrenador"
              variant="outlined"
              fullWidth
              margin="normal"
              value={trainerNotes}
              onChange={(e) => setTrainerNotes(e.target.value)}
              multiline
              rows={4}
            />
          </Box>

          <Box sx={{ position: 'relative', width: '100%' }}>
            <SubmitButton label='Registrar'/>
            {isLoading && (
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  marginTop: '-12px', 
                  marginLeft: '-12px' 
                }} 
              />
            )}
            <BackButton/>
          </Box>

          {/* Snackbar para mostrar mensajes de éxito o error */}
          <Snackbar 
            open={openSnackbar} 
            autoHideDuration={6000} 
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </main>
    </div>
  );
}

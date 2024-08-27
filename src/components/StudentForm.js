import React, { useState, useEffect } from 'react';
import { Container, TextField, MenuItem, Typography, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { db, auth } from '../firebaseConfig';
import { getDoc, getDocs, doc, collection, addDoc, Timestamp } from 'firebase/firestore';
import BackButton from './BackButton';
import { useNavigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import MenuBar from './MenuBar';
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
  const [trainerId, setTrainerId] = useState(''); // Para almacenar el ID del entrenador
  const [trainers, setTrainers] = useState([]); // Lista de entrenadores para el dropdown

  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const trainerList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.userType === 'entrenador');
      setTrainers(trainerList);
    };

    const setTrainerForLoggedInUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.userType === 'entrenador') {
            setTrainerId(currentUser.uid); // Asignar el ID del entrenador logueado
          }
        }
      }
    };

    fetchTrainers();
    setTrainerForLoggedInUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
        trainerId, // Relacionar al estudiante con el entrenador
        registrationDate: Timestamp.now()
      });

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
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrar Alumno
          </Typography>

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

            {auth.currentUser && trainerId && (
              <Typography variant="h6" gutterBottom>
                Entrenador: {trainers.find(trainer => trainer.id === trainerId)?.name || 'No Asignado'}
              </Typography>
            )}

            {auth.currentUser && !trainerId && (
              <TextField
                label="Entrenador"
                variant="outlined"
                fullWidth
                margin="normal"
                select
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                required
              >
                {trainers.map(trainer => (
                  <MenuItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>

          {/* Otros campos omitidos por brevedad */}
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

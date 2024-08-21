import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Toolbar, Box, IconButton } from '@mui/material';
import { AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function EditStudent() {
  const { id } = useParams();
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

  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      const docRef = doc(db, "students", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const student = docSnap.data();
        setName(student.name || '');
        setIdNumber(student.idNumber || '');
        setPhone(student.phone || '');
        setDob(student.dob || '');
        setPlan(student.plan || '');
        setEmail(student.email || '');
        setAddress(student.address || '');
        setHeight(student.height || '');
        setWeight(student.weight || '');
        setHealthInfo(student.healthInfo || '');
        setTrainingStartDate(student.trainingStartDate || '');
        setTrainingFrequency(student.trainingFrequency || '');
        setTrainingHistory(student.trainingHistory || '');
        setPaymentMethod(student.paymentMethod || '');
        setPaymentStatus(student.paymentStatus || '');
        setRenewalDate(student.renewalDate || '');
        setTrainerNotes(student.trainerNotes || '');
        setGoalsAndPreferences(student.goalsAndPreferences || '');
      } else {
        console.error("No such document!");
      }
    };

    fetchStudent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const studentRef = doc(db, "students", id);
      await updateDoc(studentRef, {
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
      });
      alert('Alumno actualizado correctamente');
      navigate('/student-list');
    } catch (error) {
      console.error('Error al actualizar al alumno: ', error);
      alert('Hubo un error al actualizar el alumno.');
    }
  };

  const handleBackToList = () => {
    navigate('/student-list');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/students">
          <ListItemText primary="Registrar Alumno" />
        </ListItem>
        <ListItem button component={Link} to="/student-list">
          <ListItemText primary="Lista de Alumnos" />
        </ListItem>
        <ListItem button component={Link} to="/exercise-list">
          <ListItemText primary="Lista de Ejercicios" />
        </ListItem>
        <ListItem button component={Link} to="/routine-list">
          <ListItemText primary="Lista de Rutinas" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton 
            color="inherit" 
            aria-label="open drawer" 
            edge="start" 
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Editar Alumno
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Mejora el rendimiento en dispositivos móviles
        }}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      <main style={{ flexGrow: 1, padding: theme.spacing(3), marginLeft: isLargeScreen ? 0 : 0 }}>
        <Toolbar />
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Editar Alumno
          </Typography>

          {/* Datos Personales */}
          <Box sx={{ width: '100%', marginBottom: theme.spacing(3) }}>
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
          <Box sx={{ width: '100%', marginBottom: theme.spacing(3) }}>
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
          <Box sx={{ width: '100%', marginBottom: theme.spacing(3) }}>
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
          <Box sx={{ width: '100%', marginBottom: theme.spacing(3) }}>
            <Typography variant="h6" gutterBottom>Historial de Entrenamiento</Typography>
            <TextField
              label="Fecha de Inicio de Entrenamiento"
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
          <Box sx={{ width: '100%', marginBottom: theme.spacing(3) }}>
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
          <Box sx={{ width: '100%', marginBottom: theme.spacing(3) }}>
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

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
            <Button variant="contained" color="primary" type="submit">
              Actualizar
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleBackToList}>
              Volver a la lista
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Box, CssBaseline, useTheme, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import MenuBar from '../common/MenuBar'; // Importa el MenuBar
import BackButton from '../common/BackButton';
import SubmitButton from '../common/SubmitButton';

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
  const [trainerId, setTrainerId] = useState('');
  const [userType, setUserType] = useState('');
  const [trainers, setTrainers] = useState([]);

  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchUserTypeAndTrainers = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);

          if (userData.userType === 'entrenador') {
            setTrainerId(user.uid);
          } else if (userData.userType === 'administrador') {
            const trainersSnapshot = await getDocs(collection(db, 'users'));
            const trainersList = trainersSnapshot.docs
              .filter((doc) => doc.data().userType === 'entrenador')
              .map((doc) => ({ id: doc.id, ...doc.data() }));
            setTrainers(trainersList);
          }
        }
      }
    };

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
        setTrainerId(student.trainerId || '');
      } else {
        console.error("No such document!");
      }
    };

    fetchUserTypeAndTrainers();
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
        trainerId,
      });
      alert('Alumno actualizado correctamente');
      navigate('/student-list');
    } catch (error) {
      console.error('Error al actualizar al alumno: ', error);
      alert('Hubo un error al actualizar el alumno.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
      <main style={{ flexGrow: 1, padding: theme.spacing(3), paddingTop: '70px' }}>
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

            {/* Selección de Entrenador */}
            {userType === 'administrador' && (
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

            {userType === 'entrenador' && (
              <TextField
                label="Entrenador"
                variant="outlined"
                fullWidth
                margin="normal"
                value={auth.currentUser.displayName || 'Entrenador'}
                disabled
              />
            )}
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

          <Box sx={{ width: '100%', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
            <SubmitButton />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

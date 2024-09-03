import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Box, MenuItem, CssBaseline, FormControl, InputLabel, Select } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import MenuBar from '../common/MenuBar';
import BackButton from '../common/BackButton';
import SubmitButton from '../common/SubmitButton';
import { useTheme } from '@mui/material/styles';

export default function ExerciseForm() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [videoLink, setVideoLink] = useState(''); // Nuevo estado para el enlace del video
  const [trainerId, setTrainerId] = useState(''); // Estado para el entrenador
  const [trainers, setTrainers] = useState([]); // Estado para la lista de entrenadores
  const [userType, setUserType] = useState(''); // Estado para el tipo de usuario
  const [isEditMode, setIsEditMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);
          if (userData.userType === 'entrenador') {
            setTrainerId(user.uid); // Si es entrenador, establecer su ID por defecto
          }
        }
      }
    };

    const fetchExercise = async () => {
      if (id) {
        setIsEditMode(true);
        const docRef = doc(db, 'exercises', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setDescription(data.description);
          setMuscleGroup(data.muscleGroup);
          setVideoLink(data.videoLink || '');
          setTrainerId(data.trainerId || ''); // Cargar el ID del entrenador si existe
        } else {
          alert('El ejercicio no existe.');
          navigate('/exercise-list');
        }
      }
    };

    const fetchTrainers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const trainerList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.userType === 'entrenador');
      setTrainers(trainerList);
    };

    fetchUserData();
    fetchExercise();
    fetchTrainers();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const exerciseData = {
      name,
      description,
      muscleGroup,
      videoLink,
      trainerId, // Guardar el ID del entrenador
    };

    try {
      if (isEditMode) {
        const docRef = doc(db, 'exercises', id);
        await updateDoc(docRef, exerciseData);
        alert('Ejercicio actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'exercises'), exerciseData);
        alert('Ejercicio registrado exitosamente');
      }
      navigate('/exercise-list');
    } catch (error) {
      console.error('Error al guardar el ejercicio: ', error);
      alert('Hubo un error al guardar el ejercicio.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode ? 'Editar Ejercicio' : 'Registrar Ejercicio'}
          </Typography>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Descripción"
            variant="outlined"
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <TextField
            label="Grupo Muscular"
            variant="outlined"
            fullWidth
            select
            margin="normal"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
          >
            <MenuItem value="Pecho">Pecho</MenuItem>
            <MenuItem value="Espalda">Espalda</MenuItem>
            <MenuItem value="Brazos">Brazos</MenuItem>
            <MenuItem value="Hombros">Hombros</MenuItem>
            <MenuItem value="Abdomen">Abdomen</MenuItem>
            <MenuItem value="Piernas">Piernas</MenuItem>
            <MenuItem value="Glúteos">Glúteos</MenuItem>
            <MenuItem value="Gemelos">Gemelos</MenuItem>
          </TextField>
          <TextField
            label="Enlace del Video de Demostración"
            variant="outlined"
            fullWidth
            margin="normal"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />

          {userType === 'administrador' ? (
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="trainer-select-label">Entrenador</InputLabel>
              <Select
                labelId="trainer-select-label"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                label="Entrenador"
              >
                {trainers.map(trainer => (
                  <MenuItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Entrenador"
              variant="outlined"
              fullWidth
              margin="normal"
              value={trainers.find(trainer => trainer.id === trainerId)?.name || ''}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          )}

          <Box sx={{ marginTop: 3 }}>
            <SubmitButton label={isEditMode ? 'Actualizar Ejercicio' : 'Agregar Ejercicio'} />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

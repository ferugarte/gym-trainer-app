import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Box, MenuItem, CssBaseline } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
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
          setVideoLink(data.videoLink || ''); // Cargar el enlace del video si existe
        } else {
          alert('El ejercicio no existe.');
          navigate('/exercise-list');
        }
      }
    };

    fetchExercise();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const exerciseData = {
      name,
      description,
      muscleGroup,
      videoLink, // Guardar el enlace del video
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

          <Box sx={{ marginTop: 3 }}>
            <SubmitButton label={isEditMode ? 'Actualizar Ejercicio' : 'Agregar Ejercicio'} />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

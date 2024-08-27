import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Box, Checkbox, FormControlLabel, FormGroup, Select, MenuItem, InputLabel, FormControl, CssBaseline } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import MenuBar from './MenuBar';
import BackButton from './BackButton';
import SubmitButton from './SubmitButton';

export default function EditRoutine() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [userType, setUserType] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [trainers, setTrainers] = useState([]); // Lista de entrenadores para admin
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);
          setTrainerId(user.uid);
        }
      }
    };

    const fetchRoutine = async () => {
      const docRef = doc(db, "routines", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const routine = docSnap.data();
        setName(routine.name);
        setSelectedExercises(routine.exercises || []);
        setTrainerId(routine.trainerId || '');
      } else {
        console.error("No se encontró la rutina.");
      }
    };

    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exerciseList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExercises(exerciseList);
      filterExercises(exerciseList);
    };

    const fetchTrainers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const trainerList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.userType === 'entrenador');
      setTrainers(trainerList);
    };

    fetchUserData();
    fetchRoutine();
    fetchExercises();
    if (userType === 'administrador') {
      fetchTrainers();
    }
  }, [id, userType]);

  useEffect(() => {
    filterExercises(exercises);
  }, [muscleGroupFilter, genderFilter, exercises]);

  const filterExercises = (exerciseList) => {
    let filtered = exerciseList;

    if (muscleGroupFilter) {
      filtered = filtered.filter(exercise => exercise.muscleGroup === muscleGroupFilter);
    }

    if (genderFilter) {
      filtered = filtered.filter(exercise => exercise.gender === genderFilter);
    }

    if (userType !== 'administrador') {
      filtered = filtered.filter(exercise => exercise.trainerId === trainerId);
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prevSelected =>
      prevSelected.includes(exerciseId)
        ? prevSelected.filter(id => id !== exerciseId)
        : [...prevSelected, exerciseId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const routineRef = doc(db, "routines", id);
      await updateDoc(routineRef, {
        name,
        exercises: selectedExercises,
        trainerId, // Guardar el ID del entrenador
      });
      alert('Rutina actualizada correctamente');
      navigate('/routine-list');
    } catch (error) {
      console.error('Error al actualizar la rutina: ', error);
      alert('Hubo un error al actualizar la rutina.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: theme.spacing(3), paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Editar Rutina
          </Typography>

          <TextField
            label="Nombre de la Rutina"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {userType === 'administrador' && (
            <FormControl fullWidth margin="normal">
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
          )}

          <Typography variant="h6" component="h2" gutterBottom>
            Filtrar Ejercicios
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel id="muscle-group-filter-label">Filtrar por Grupo Muscular</InputLabel>
            <Select
              labelId="muscle-group-filter-label"
              value={muscleGroupFilter}
              onChange={(e) => setMuscleGroupFilter(e.target.value)}
              label="Filtrar por Grupo Muscular"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pecho">Pecho</MenuItem>
              <MenuItem value="Espalda">Espalda</MenuItem>
              <MenuItem value="Brazos">Brazos</MenuItem>
              <MenuItem value="Hombros">Hombros</MenuItem>
              <MenuItem value="Abdomen">Abdomen</MenuItem>
              <MenuItem value="Piernas">Piernas</MenuItem>
              <MenuItem value="Glúteos">Glúteos</MenuItem>
              <MenuItem value="Gemelos">Gemelos</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-filter-label">Filtrar por Género</InputLabel>
            <Select
              labelId="gender-filter-label"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              label="Filtrar por Género"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Hombre">Hombre</MenuItem>
              <MenuItem value="Mujer">Mujer</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" component="h2" gutterBottom>
            Seleccionar Ejercicios
          </Typography>

          <FormGroup>
            {filteredExercises.map((exercise) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedExercises.includes(exercise.id)}
                    onChange={() => handleExerciseToggle(exercise.id)}
                    name={exercise.name}
                  />
                }
                label={`${exercise.name} - ${exercise.description} (${exercise.series} series, ${exercise.repetitions} reps)`}
                key={exercise.id}
              />
            ))}
          </FormGroup>

          <Box sx={{ marginTop: theme.spacing(3) }}>
            <SubmitButton/>
            <BackButton/>
          </Box>
        </Container>
      </main>
    </div>
  );
}

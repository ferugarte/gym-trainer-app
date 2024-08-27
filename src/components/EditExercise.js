import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Box, CssBaseline, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import MenuBar from './MenuBar';
import BackButton from './BackButton';
import SubmitButton from './SubmitButton';
import { useTheme } from '@mui/material/styles'; // Importar el tema

export default function EditExercise() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [level, setLevel] = useState('');
  const [weight, setWeight] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [userType, setUserType] = useState('');
  const [trainers, setTrainers] = useState([]);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercise = async () => {
      const docRef = doc(db, 'exercises', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setDescription(data.description);
        setSeries(data.series);
        setRepetitions(data.repetitions);
        setMuscleGroup(data.muscleGroup);
        setLevel(data.level);
        setWeight(data.weight);
        setTrainerId(data.trainerId || '');
      } else {
        alert('El ejercicio no existe.');
        navigate('/exercise-list');
      }
    };

    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);
          if (userData.userType === 'entrenador') {
            setTrainerId(currentUser.uid); // Establece el ID del entrenador logueado
          }
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

    fetchExercise();
    fetchUserData();
    fetchTrainers();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, 'exercises', id);
      await updateDoc(docRef, {
        name,
        description,
        series: Number(series), 
        repetitions: Number(repetitions), 
        muscleGroup,
        level,
        weight,
        trainerId, // Actualizar el ID del entrenador
      });
      alert('Ejercicio actualizado exitosamente');
      navigate('/exercise-list');
    } catch (error) {
      console.error('Error al actualizar el ejercicio: ', error);
      alert('Hubo un error al actualizar el ejercicio.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: theme.spacing(3), paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" component="h1" gutterBottom>
            Editar Ejercicio
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
            label="Cantidad de Series"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            required
          />
          <TextField
            label="Cantidad de Repeticiones"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            value={repetitions}
            onChange={(e) => setRepetitions(e.target.value)}
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
            label="Nivel"
            variant="outlined"
            fullWidth
            select
            margin="normal"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
          >
            <MenuItem value="principiante">Principiante</MenuItem>
            <MenuItem value="basico">Básico</MenuItem>
            <MenuItem value="intermedio">Intermedio</MenuItem>
            <MenuItem value="avanzado">Avanzado</MenuItem>
            <MenuItem value="profesional">Profesional</MenuItem>
          </TextField>
          <TextField
            label="Peso"
            variant="outlined"
            fullWidth
            select
            margin="normal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          >
            <MenuItem value="Liviano">Liviano</MenuItem>
            <MenuItem value="Moderado">Moderado</MenuItem>
            <MenuItem value="Moderado a Pesado">Moderado a Pesado</MenuItem>
            <MenuItem value="Pesado">Pesado</MenuItem>
          </TextField>

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

          <Box sx={{ marginTop: 3 }}>
            <SubmitButton />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

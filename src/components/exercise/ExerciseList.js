import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, TextField, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CssBaseline } from '@mui/material';
import { collection, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import MenuBar from '../common/MenuBar';
import BackButton from '../common/BackButton';
import AddDataButton from '../common/AddDataButton';
import { useTheme } from '@mui/material/styles'; 

export default function ExerciseList() {
  const theme = useTheme();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [userType, setUserType] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const navigate = useNavigate();

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

    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exerciseList = await Promise.all(querySnapshot.docs.map(async (exerciseDoc) => {
        const exerciseData = exerciseDoc.data();
        let trainerName = 'N/A';

        if (exerciseData.trainerId) {
          const trainerDoc = await getDoc(doc(db, 'users', exerciseData.trainerId));
          if (trainerDoc.exists()) {
            trainerName = trainerDoc.data().name;
          }
        }

        return {
          id: exerciseDoc.id,
          ...exerciseData,
          trainerName
        };
      }));
      setExercises(exerciseList);
      filterExercises(exerciseList, nameFilter, muscleGroupFilter, userType, trainerId);
    };

    fetchUserData();
    fetchExercises();
  }, [nameFilter, muscleGroupFilter, userType, trainerId]);

  const filterExercises = (exerciseList, nameFilter, muscleGroupFilter, userType, trainerId) => {
    const filtered = exerciseList.filter(exercise => {
      const matchesFilters = 
        (nameFilter === '' || exercise.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
        (muscleGroupFilter === '' || exercise.muscleGroup === muscleGroupFilter);
      
      const matchesTrainer = userType === 'administrador' || exercise.trainerId === trainerId;

      return matchesFilters && matchesTrainer;
    });
    setFilteredExercises(filtered);
  };

  const handleEdit = (id) => {
    navigate(`/edit-exercise/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este ejercicio?")) {
      try {
        await deleteDoc(doc(db, 'exercises', id));
        alert('Ejercicio eliminado exitosamente');
        setExercises(exercises.filter(exercise => exercise.id !== id));
        filterExercises(exercises, nameFilter, muscleGroupFilter, userType, trainerId);
      } catch (error) {
        console.error("Error al eliminar el ejercicio: ", error);
        alert('Hubo un error al eliminar el ejercicio.');
      }
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container>
          <Typography variant="h4" component="h1" gutterBottom>
            Lista de Ejercicios
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
            <TextField
              label="Filtrar por Nombre"
              variant="outlined"
              fullWidth
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            <TextField
              label="Filtrar por Grupo Muscular"
              variant="outlined"
              fullWidth
              select
              value={muscleGroupFilter}
              onChange={(e) => setMuscleGroupFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {/* Opciones de grupo muscular */}
              <MenuItem value="Pecho">Pecho</MenuItem>
              <MenuItem value="Espalda">Espalda</MenuItem>
              <MenuItem value="Brazos">Brazos</MenuItem>
              <MenuItem value="Hombros">Hombros</MenuItem>
              <MenuItem value="Abdomen">Abdomen</MenuItem>
              <MenuItem value="Piernas">Piernas</MenuItem>
              <MenuItem value="Glúteos">Glúteos</MenuItem>
              <MenuItem value="Gemelos">Gemelos</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Grupo Muscular</TableCell>
                  {userType === 'administrador' && <TableCell>Entrenador</TableCell>} {/* Columna solo visible para administradores */}
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>{exercise.name}</TableCell>
                    <TableCell>{exercise.muscleGroup}</TableCell>
                    {userType === 'administrador' && <TableCell>{exercise.trainerName}</TableCell>}
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(exercise.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(exercise.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ width: '100%', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
            <AddDataButton label="Agregar Ejercicio" path="/add-exercise" />
            <BackButton/>
          </Box>
        </Container>
      </main>
    </div>
  );
}

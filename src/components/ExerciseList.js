import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Table, TableBody, TableCell, useTheme, TableContainer, TableHead, TableRow, Paper, Box, TextField, MenuItem, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CssBaseline } from '@mui/material';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar'; // Importa el MenuBar
import BackButton from './BackButton';
import AddDataButton from './AddDataButton';

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exerciseList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExercises(exerciseList);
      setFilteredExercises(exerciseList);
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [nameFilter, muscleGroupFilter, levelFilter]);

  const filterExercises = () => {
    const filtered = exercises.filter(exercise => {
      return (
        (nameFilter === '' || exercise.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
        (muscleGroupFilter === '' || exercise.muscleGroup === muscleGroupFilter) &&
        (levelFilter === '' || exercise.level === levelFilter)
      );
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
            filterExercises();
        } catch (error) {
            console.error("Error al eliminar el ejercicio: ", error);
            alert('Hubo un error al eliminar el ejercicio.');
        }
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
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
              label="Filtrar por Nivel"
              variant="outlined"
              fullWidth
              select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="principiante">Principiante</MenuItem>
              <MenuItem value="basico">Básico</MenuItem>
              <MenuItem value="intermedio">Intermedio</MenuItem>
              <MenuItem value="avanzado">Avanzado</MenuItem>
              <MenuItem value="profesional">Profesional</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Grupo Muscular</TableCell>
                  <TableCell>Nivel</TableCell>
                  <TableCell>Peso</TableCell> {/* Nueva columna para el peso */}
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>{exercise.name}</TableCell>
                    <TableCell>{exercise.muscleGroup}</TableCell>
                    <TableCell>{exercise.level}</TableCell>
                    <TableCell>{exercise.weight}</TableCell> {/* Mostrar el peso */}
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
          {/* Botón de Agregar Ejercicio */}
          <Box sx={{ width: '100%', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
            <AddDataButton label="Agregar Ejercicio" path="/add-exercise" />
            <BackButton/>
          </Box>
        </Container>
      </main>
    </div>
  );
}

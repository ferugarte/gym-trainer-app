// src/components/EditRoutine.js
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Toolbar, Box, Checkbox, FormControlLabel, IconButton, FormGroup, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function EditRoutine() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchRoutine = async () => {
      const docRef = doc(db, "routines", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const routine = docSnap.data();
        setName(routine.name);
        setSelectedExercises(routine.exercises || []);
      } else {
        console.error("No such document!");
      }
    };

    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exerciseList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExercises(exerciseList);
      setFilteredExercises(exerciseList);
    };

    fetchRoutine();
    fetchExercises();
  }, [id]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = exercises;

      if (muscleGroupFilter) {
        filtered = filtered.filter(exercise => exercise.muscleGroup === muscleGroupFilter);
      }

      if (genderFilter) {
        filtered = filtered.filter(exercise => exercise.gender === genderFilter);
      }

      setFilteredExercises(filtered);
    };

    applyFilters();
  }, [muscleGroupFilter, genderFilter, exercises]);

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
      });
      alert('Rutina actualizada correctamente');
      navigate('/routine-list');
    } catch (error) {
      console.error('Error al actualizar la rutina: ', error);
      alert('Hubo un error al actualizar la rutina.');
    }
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
            Editar Rutina
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
                label={`${exercise.name} - ${exercise.description} (${exercise.sets} series, ${exercise.reps} reps)`}
                key={exercise.id}
              />
            ))}
          </FormGroup>

          <Box sx={{ marginTop: theme.spacing(3) }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Actualizar Rutina
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
}

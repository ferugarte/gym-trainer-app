import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, MenuItem, Box, Toolbar, AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function EditExercise() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [level, setLevel] = useState('');
  const [weight, setWeight] = useState(''); // Nuevo campo para el peso
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        setWeight(data.weight); // Obtener el valor del peso
      } else {
        alert('El ejercicio no existe.');
        navigate('/exercise-list');
      }
    };

    fetchExercise();
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
        weight, // Actualizar el valor del peso
      });
      alert('Ejercicio actualizado exitosamente');
      navigate('/exercise-list');
    } catch (error) {
      console.error('Error al actualizar el ejercicio: ', error);
      alert('Hubo un error al actualizar el ejercicio.');
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
          <MenuIcon 
            color="inherit" 
            aria-label="open drawer" 
            edge="start" 
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          />
          <Typography variant="h6" noWrap>
            Editar Ejercicio
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
          <Box sx={{ marginTop: 3 }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Actualizar
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
}

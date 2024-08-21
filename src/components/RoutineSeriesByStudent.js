// src/components/RoutineSeriesByStudent.js
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Toolbar, Box, MenuItem, Select, InputLabel, FormControl, IconButton, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';


export default function RoutineSeriesByStudent() {
  const orderedDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const { studentId, seriesId } = useParams(); // studentId for identifying the student, seriesId for editing a specific series
  const [seriesName, setSeriesName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [days, setDays] = useState({
    Lunes: '',
    Martes: '',
    Miercoles: '',
    Jueves: '',
    Viernes: '',
    Sabado: '',
    Domingo: '',
  });
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'routines'));
      const exerciseList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExercises(exerciseList);
    };

    const fetchSeries = async () => {
      if (seriesId) {
        const docRef = doc(db, `students/${studentId}/routineSeries`, seriesId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const seriesData = docSnap.data();
          setSeriesName(seriesData.name);
          setDays(seriesData.days);
          setEndDate(seriesData.endDate);
        }
      }
    };

    fetchExercises();
    fetchSeries();
  }, [seriesId, studentId]);

  const handleDayChange = (day, routineId) => {
    setDays(prevDays => ({
      ...prevDays,
      [day]: routineId,
    }));
  };

  const handleBack = () => {
    navigate(-1); // Navegar hacia atrás
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (seriesId) {
        const seriesRef = doc(db, `students/${studentId}/routineSeries`, seriesId);
        await updateDoc(seriesRef, {
          name: seriesName,
          days,
          endDate,
        });
        alert('Serie de Rutinas actualizada correctamente');
      } else {
        await addDoc(collection(db, `students/${studentId}/routineSeries`), {
          name: seriesName,
          days,
          endDate,
        });
        alert('Serie de Rutinas agregada correctamente');
      }
      navigate(`/student-list`);
    } catch (error) {
      console.error('Error al guardar la Serie de Rutinas: ', error);
      alert('Hubo un error al guardar la Serie de Rutinas.');
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
            {seriesId ? 'Editar Serie de Rutinas' : 'Agregar Serie de Rutinas'}
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
            {seriesId ? 'Editar Serie de Rutinas' : 'Agregar Serie de Rutinas'}
          </Typography>

          <TextField
            label="Nombre de la Serie"
            variant="outlined"
            fullWidth
            margin="normal"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
            required
          />

          <Typography variant="h6" component="h2" gutterBottom>
            Asignar Rutinas a Días de la Semana
          </Typography>

          {orderedDays.map((day) => (
            <FormControl fullWidth margin="normal" key={day}>
              <InputLabel id={`${day}-label`}>{day}</InputLabel>
              <Select
                labelId={`${day}-label`}
                value={days[day] || ""}
                onChange={(e) => handleDayChange(day, e.target.value)}
                label={day}
              >
                <MenuItem value="">Libre</MenuItem>
                {exercises.map((exercise) => (
                  <MenuItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          <TextField
            label="Fecha de Vencimiento"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              {seriesId ? 'Actualizar Serie' : 'Agregar Serie'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleBack}>
              Volver a la Lista
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
}

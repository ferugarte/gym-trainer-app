import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MenuBar from './MenuBar'; // Importa el MenuBar
import { CssBaseline } from '@mui/material';

export default function RoutineSeriesByStudent() {
  const orderedDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const { studentId, seriesId } = useParams(); // studentId for identifying the student, seriesId for editing a specific series
  const [seriesName, setSeriesName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [days, setDays] = useState({
    Lunes: '',
    Martes: '',
    Miércoles: '',
    Jueves: '',
    Viernes: '',
    Sábado: '',
    Domingo: '',
  });
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

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

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
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

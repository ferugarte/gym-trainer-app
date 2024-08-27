import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton, Divider, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { db } from '../firebaseConfig';
import MenuBar from './MenuBar';
import { CssBaseline } from '@mui/material';
import BackButton from './BackButton';

export default function RoutineByDay() {
  const { studentId, seriesId } = useParams();
  const [routineSeries, setRoutineSeries] = useState({});
  const [routines, setRoutines] = useState({});
  const [studentData, setStudentData] = useState({});
  const [exercises, setExercises] = useState({});
  const daysOfWeek = [
    { key: 'Lunes', label: 'Lunes' },
    { key: 'Martes', label: 'Martes' },
    { key: 'Miercoles', label: 'Miércoles' },
    { key: 'Jueves', label: 'Jueves' },
    { key: 'Viernes', label: 'Viernes' },
    { key: 'Sabado', label: 'Sábado' },
    { key: 'Domingo', label: 'Domingo' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener la serie de rutinas
        const docRef = doc(db, `students/${studentId}/routineSeries`, seriesId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const seriesData = docSnap.data();
          setRoutineSeries(seriesData);

          // Obtener los IDs de las rutinas asociadas a cada día
          const routineIds = Object.values(seriesData.days || {});
          const routinesMap = {};

          for (const routineId of routineIds) {
            if (routineId) {
              const routineDoc = await getDoc(doc(db, 'routines', routineId));
              if (routineDoc.exists()) {
                routinesMap[routineId] = routineDoc.data();
              }
            }
          }
          setRoutines(routinesMap);
        } else {
          console.error("No se encontró la serie de rutinas");
        }

        // Obtener los datos del estudiante
        const studentDocRef = doc(db, 'students', studentId);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          setStudentData(studentDocSnap.data());
        } else {
          console.error("No se encontró el documento del alumno");
        }

        // Obtener los ejercicios
        const exercisesQuerySnapshot = await getDocs(collection(db, 'exercises'));
        const exercisesMap = {};
        exercisesQuerySnapshot.forEach((exerciseDoc) => {
          exercisesMap[exerciseDoc.id] = exerciseDoc.data();
        });
        setExercises(exercisesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [studentId, seriesId]);

  const formatRoutine = (routineId) => {
    const routine = routines[routineId];
    if (!routine || !Array.isArray(routine.exercises)) {
      return "Formato de rutina no válido";
    }
    return routine.exercises.map(exerciseId => {
      const exercise = exercises[exerciseId];
      if (!exercise) return ``;
      return `${exercise.name}\n${exercise.series} series x ${exercise.repetitions} reps\n${exercise.weight}`;
    }).join('\n\n');
  };

  const handleSendWhatsApp = (day, routineId) => {
    const formattedRoutine = formatRoutine(routineId);
    const message = `Hola ${studentData.name}, esta es tu rutina para el día ${day}:\n\n${formattedRoutine}`;
    const whatsappURL = `https://wa.me/${studentData.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Rutinas por Día para {studentData.name} ({studentData.idNumber})
          </Typography>
          <List>
            {daysOfWeek.map((day) => {
              const routineId = routineSeries.days ? routineSeries.days[day.key] : null;
              if (routineId) {
                return (
                  <React.Fragment key={day.key}>
                    <ListItem alignItems="flex-start">
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {day.label}
                          </Typography>
                        } 
                        secondary={
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                            {formatRoutine(routineId)}
                          </Typography>
                        } 
                      />
                      <IconButton color="primary" onClick={() => handleSendWhatsApp(day.label, routineId)}>
                        <WhatsAppIcon />
                      </IconButton>
                    </ListItem>
                    <Divider sx={{ my: 2 }} /> {/* Espaciador con una línea */}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </List>
          <BackButton />
        </Container>
      </main>
    </div>
  );
}
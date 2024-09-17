import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton, Box, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore'; // Para agregar el token
import { db } from '../../firebaseConfig';
import MenuBar from '../common/MenuBar';
import CssBaseline from '@mui/material/CssBaseline';
import BackButton from '../common/BackButton';
import { v4 as uuidv4 } from 'uuid'; // Utiliza el paquete uuid para generar tokens únicos

export default function RoutineExerciseList() {
  const { routineId } = useParams();
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState({});
  const [studentData, setStudentData] = useState(null);
  const [token, setToken] = useState(null); // Guardar el token generado aquí
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const routineRef = doc(db, 'routines', routineId);
        const routineDoc = await getDoc(routineRef);
        if (routineDoc.exists()) {
          setRoutine(routineDoc.data());
          const studentId = routineDoc.data().studentId;
          if (studentId) {
            const studentRef = doc(db, 'students', studentId);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists()) {
              setStudentData(studentDoc.data());
            } else {
              console.error("No se encontró el documento del estudiante.");
            }
          } else {
            console.error("studentId no está definido en la rutina.");
          }
        } else {
          console.error("No se encontró la rutina.");
          navigate(-1); // Regresar si no se encuentra la rutina
        }
      } catch (error) {
        console.error("Error al obtener la rutina o el estudiante:", error);
      }
    };

    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exercises'));
        const exerciseMap = {};
        querySnapshot.forEach((doc) => {
          exerciseMap[doc.id] = {
            name: doc.data().name,
            videoLink: doc.data().videoLink || '',
          }; // Mapear ID de ejercicio a su nombre y enlace de video
        });
        setExercises(exerciseMap);
      } catch (error) {
        console.error("Error al obtener los ejercicios:", error);
      }
    };

    const generateAndStoreToken = async () => {
      const newToken = uuidv4();
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 12); // Expira en 12 horas

      try {
        await addDoc(collection(db, 'tokens'), {
          routineId,
          token: newToken,
          expirationDate
        });
        setToken(newToken); // Guardar el token en el estado
      } catch (error) {
        console.error('Error al generar el token:', error);
      }
    };

    fetchRoutine();
    fetchExercises();

    if (!token) {
      generateAndStoreToken(); // Generar el token solo una vez al cargar la página
    }
  }, [routineId, navigate, token]);

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const formatRoutineForDay = (exercisesList) => {
    return exercisesList
      .map((exercise, index) => {
        const exerciseData = exercises[exercise.exerciseId];
  
        // Verificar si los datos del ejercicio existen
        if (!exerciseData) {
          console.warn(`El ejercicio con ID ${exercise.exerciseId} no se encontró.`);
          return `${index + 1}. Ejercicio no disponible\nInformación no disponible`;
        }
  
        const { name, videoLink } = exerciseData;
        const { series, repetitions, weight } = exercise;
  
        return `${index + 1}. ${name || 'Nombre no disponible'}\n${series} series de ${repetitions} repeticiones\nPeso: ${weight}\n${videoLink ? `Ver video: ${videoLink}` : ''}`;
      })
      .join('\n\n');
  };
  

  const handleSendWhatsApp = (day, exercisesList) => {
    if (!studentData) {
      console.error('Datos del estudiante no disponibles.');
      return;
    }
  
    if (!routine) {
      console.error('Datos de la rutina no disponibles.');
      return;
    }
  
    if (!token) {
      console.error('Token no disponible.');
      return;
    }
  
    // Formatear la rutina para el día específico
    const formattedRoutine = formatRoutineForDay(exercisesList);
  
    // Generar enlace del temporizador con el token
    const timerLink = `${window.location.origin}/training-timer/${routineId}/${day}?token=${token}`;
  
    // Construir el mensaje
    const message = `Hola ${studentData.name}, esta es tu rutina para el día ${day}:\n\n${formattedRoutine}\n\nPuedes ver los detalles de tu entrenamiento aquí: ${timerLink}`;
  
    // Construir URL de WhatsApp con el mensaje
    const whatsappURL = `https://wa.me/${studentData.phone}?text=${encodeURIComponent(message)}`;
  
    // Abrir la URL de WhatsApp en una nueva pestaña
    window.open(whatsappURL, '_blank');
  };
  

  const handleStartTimer = (day) => {
    if (token) {
      // Redirigir a la pantalla del temporizador con el token almacenado
      navigate(`/training-timer/${routineId}/${day}?token=${token}`);
    } else {
      console.error('Token no disponible.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Ejercicios de la Rutina
          </Typography>

          {routine && (
            <Paper sx={{ padding: 2 }}>
              {daysOfWeek
                .filter(day => routine.routineByDay[day]) // Filtrar solo los días que tienen ejercicios cargados
                .map(day => (
                  <Accordion key={day} sx={{ marginBottom: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${day}-content`}
                      id={`${day}-header`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="h6">{day}</Typography>
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que el Accordion se expanda/cierre al hacer clic en el botón de WhatsApp
                              handleSendWhatsApp(day, routine.routineByDay[day]);
                            }}
                          >
                            <WhatsAppIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que el Accordion se expanda/cierre al hacer clic en el botón de temporizador
                              handleStartTimer(day);
                            }}
                          >
                            <TimerIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {routine.routineByDay[day].map((exercise, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={exercises[exercise.exerciseId] ? exercises[exercise.exerciseId].name : 'Ejercicio no disponible'}
                              secondary={exercises[exercise.exerciseId] 
                                ? `Series: ${exercise.series}, Repeticiones: ${exercise.repetitions}, Peso: ${exercise.weight}\n${exercises[exercise.exerciseId].videoLink ? `Ver video: ${exercises[exercise.exerciseId].videoLink}` : ''}`
                                : 'Información no disponible'}
                            />
                          </ListItem>                        
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Paper>
          )}

          <Box sx={{ marginTop: 3, justifyContent: 'center' }}>
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

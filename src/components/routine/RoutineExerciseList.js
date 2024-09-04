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

    fetchRoutine();
    fetchExercises();
  }, [routineId, navigate]);

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const formatRoutineForDay = (exercisesList) => {
    return exercisesList.map((exercise, index) => {
      const exerciseData = exercises[exercise.exerciseId];
      return `${index + 1}. ${exerciseData.name}\n${exercise.series} series de ${exercise.repetitions} repeticiones\nPeso: ${exercise.weight}\n${exerciseData.videoLink ? `Ver video: ${exerciseData.videoLink}` : ''}`;
    }).join('\n\n');
  };

  // Generar y almacenar el token
  const generateToken = async (routineId, day) => {
    const token = uuidv4();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 12); // Expira en 12 horas

    try {
      await addDoc(collection(db, 'tokens'), {
        routineId,
        day,
        token,
        expirationDate
      });

      return token;
    } catch (error) {
      console.error('Error al generar el token:', error);
      return null;
    }
  };

  const handleSendWhatsApp = async (day, exercisesList) => {
    if (studentData && routine) {
      const formattedRoutine = formatRoutineForDay(exercisesList);

      // Generar el token antes de enviar el mensaje de WhatsApp
      const token = await generateToken(routineId, day);
      if (!token) {
        alert('Hubo un error al generar el enlace de acceso.');
        return;
      }

      const timerLink = `${window.location.origin}/training-timer/${routineId}/${day}?token=${token}`; // Incluir el token en el enlace
      const message = `Hola ${studentData.name}, esta es tu rutina para el día ${day}:\n\n${formattedRoutine}\n\nPuedes ver los detalles de tu entrenamiento aquí: ${timerLink}`;
      const whatsappURL = `https://wa.me/${studentData.phone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappURL, '_blank');
    } else {
      console.error('Faltan datos para enviar el mensaje por WhatsApp.');
    }
  };

  // Manejar el clic del temporizador y generar el token
  const handleStartTimer = async (day, exercisesList) => {
    // Generar el token antes de redirigir al temporizador
    const token = await generateToken(routineId, day);
    if (!token) {
      alert('Hubo un error al generar el enlace de acceso.');
      return;
    }

    // Redirigir a la pantalla del temporizador con el token
    navigate(`/training-timer/${routineId}/${day}?token=${token}`);
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
                              handleStartTimer(day, routine.routineByDay[day]);
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
                              primary={exercises[exercise.exerciseId].name} // Mostrando el nombre del ejercicio
                              secondary={`Series: ${exercise.series}, Repeticiones: ${exercise.repetitions}, Peso: ${exercise.weight}\n${exercises[exercise.exerciseId].videoLink ? `Ver video: ${exercises[exercise.exerciseId].videoLink}` : ''}`}
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

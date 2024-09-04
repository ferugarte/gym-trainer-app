import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Box, AppBar, Toolbar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import dayjs from 'dayjs';

const TrainingTimer = () => {
  const { routineId, day } = useParams();
  const [exercises, setExercises] = useState({});
  const [routine, setRoutine] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [time, setTime] = useState(60); // Tiempo por defecto en segundos (1 minuto)
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchRoutine = async () => {
      const routineRef = doc(db, 'routines', routineId);
      const routineDoc = await getDoc(routineRef);
      if (routineDoc.exists()) {
        const routineData = routineDoc.data();
        setRoutine(routineData);

        const expirationDate = routineData.expirationDate.toDate();
        const currentDate = new Date();

        if (currentDate > expirationDate) {
          setIsExpired(true); // El enlace ha expirado
        } else {
          const studentId = routineData.studentId;
          const studentRef = doc(db, 'students', studentId);
          const studentDoc = await getDoc(studentRef);
          setStudentData(studentDoc.data());
        }
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
          };
        });
        setExercises(exerciseMap);
      } catch (error) {
        console.error("Error al obtener los ejercicios:", error);
      }
    };

    fetchRoutine();
    fetchExercises();
  }, [routineId]);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setTimeout(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      audioRef.current.play();
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [time, isRunning]);

  const handleStartTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleResumeTimer = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getTimerColor = () => {
    return time <= 10 ? 'red' : 'green';
  };

  const formatRoutineForDay = (exercisesList) => {
    return exercisesList.map((exercise, index) => {
      const exerciseData = exercises[exercise.exerciseId];
  
      if (!exerciseData) {
        console.warn(`El ejercicio con ID ${exercise.exerciseId} no se encontró.`);
        return {
          name: 'Ejercicio no disponible',
          details: 'Información no disponible'
        };
      }
  
      const { name, videoLink } = exerciseData;
      const { series, repetitions, weight } = exercise;
  
      return {
        name: name || 'Nombre no disponible',
        details: `${series} series de ${repetitions} repeticiones\nPeso: ${weight}\n${videoLink ? `Ver video: ${videoLink}` : ''}`
      };
    });
  };
  

  if (isExpired) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          ❌ El enlace ha expirado
        </Typography>
      </Container>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#900C3F' }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            Gym Trainer App
          </Typography>
        </Toolbar>
      </AppBar>
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            ⏱️ Temporizador para {studentData?.name || 'Alumno'}
          </Typography>

          {/* Temporizador */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Tiempo Restante
            </Typography>
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                color: getTimerColor(),
                fontWeight: 'bold',
                border: '4px solid',
                borderColor: getTimerColor(),
                padding: '20px',
                borderRadius: '8px',
              }}
            >
              {formatTime(time)}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {[1, 2, 3, 4].map((minute) => (
                <Button
                  key={minute}
                  variant={minute * 60 === time ? 'contained' : 'outlined'}
                  onClick={() => setTime(minute * 60)}
                >
                  {minute} Min
                </Button>
              ))}
            </Box>

            {!isRunning ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartTimer}
              >
                Play
              </Button>
            ) : isPaused ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleResumeTimer}
              >
                Resume
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PauseIcon />}
                onClick={handlePauseTimer}
              >
                Pausa
              </Button>
            )}

            <audio ref={audioRef}>
              <source src="https://www.soundjay.com/buttons/sounds/beep-09.mp3" type="audio/wav" />
              Tu navegador no soporta el sonido de alarma.
            </audio>
          </Box>

          {/* Rutina de Entrenamiento */}
          {routine && routine.routineByDay[day] && (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                🏋️‍♂️ Rutina para el día {day}
              </Typography>
              <List>
                {formatRoutineForDay(routine.routineByDay[day]).map((exercise, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={exercise.name}
                      secondary={exercise.details}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Container>
      </main>
    </div>
  );
};

export default TrainingTimer;

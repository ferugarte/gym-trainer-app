import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import MenuBar from '../common/MenuBar';
import CssBaseline from '@mui/material/CssBaseline';

const TrainingTimer = () => {
  const { routineId, day } = useParams();
  const location = useLocation();
  const [exercises, setExercises] = useState({});
  const [routine, setRoutine] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token'); // Obtiene el token de la URL

  useEffect(() => {
    const validateToken = async () => {
      const q = query(collection(db, 'tokens'), where('token', '==', token), where('routineId', '==', routineId), where('day', '==', day));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setIsValid(false);
      } else {
        const tokenDoc = querySnapshot.docs[0].data();
        const now = new Date();
        if (tokenDoc.expirationDate.toDate() >= now) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      }
    };

    validateToken();

    const fetchRoutine = async () => {
      const routineRef = doc(db, 'routines', routineId);
      const routineDoc = await getDoc(routineRef);
      if (routineDoc.exists()) {
        setRoutine(routineDoc.data());
        const studentId = routineDoc.data().studentId;
        const studentRef = doc(db, 'students', studentId);
        const studentDoc = await getDoc(studentRef);
        setStudentData(studentDoc.data());
      }
    };

    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exerciseMap = {};
      querySnapshot.forEach((doc) => {
        exerciseMap[doc.id] = {
          name: doc.data().name,
          videoLink: doc.data().videoLink || '',
        };
      });
      setExercises(exerciseMap);
    };

    fetchRoutine();
    fetchExercises();
  }, [routineId, day, token]);

  if (!isValid) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          El enlace ha expirado o es inválido.
        </Typography>
      </Container>
    );
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatRoutineForDay = (exercisesList) => {
    return exercisesList.map((exercise, index) => {
      const exerciseData = exercises[exercise.exerciseId];
      return {
        name: exerciseData.name,
        details: `${exercise.series} series de ${exercise.repetitions} repeticiones\nPeso: ${exercise.weight}\n${exerciseData.videoLink ? `Ver video: ${exerciseData.videoLink}` : ''}`
      };
    });
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            ⏱️ Temporizador para {studentData?.name || 'Alumno'}
          </Typography>

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

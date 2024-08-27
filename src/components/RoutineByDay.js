import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { db } from '../firebaseConfig';
import MenuBar from './MenuBar';
import { CssBaseline } from '@mui/material';
import BackButton from './BackButton';

export default function RoutineByDay() {
  const { studentId, seriesId } = useParams();
  const [routineSeries, setRoutineSeries] = useState({});
  const [studentData, setStudentData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutineSeries = async () => {
      const docRef = doc(db, `students/${studentId}/routineSeries`, seriesId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRoutineSeries(docSnap.data());
      } else {
        console.error("No se encontró la serie de rutinas");
      }
    };

    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudentData(docSnap.data());
      } else {
        console.error("No se encontró el documento del alumno");
      }
    };

    fetchRoutineSeries();
    fetchStudentData();
  }, [studentId, seriesId]);

  const daysOfWeek = [
    { key: 'Lunes', label: 'Lunes' },
    { key: 'Martes', label: 'Martes' },
    { key: 'Miercoles', label: 'Miércoles' },
    { key: 'Jueves', label: 'Jueves' },
    { key: 'Viernes', label: 'Viernes' },
    { key: 'Sabado', label: 'Sábado' },
    { key: 'Domingo', label: 'Domingo' },
  ];

  const handleSendWhatsApp = (day, routine) => {
    const message = `Hola ${studentData.name}, esta es tu rutina para el día ${day}:\n\n${routine}`;
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
              const routine = routineSeries.days ? routineSeries.days[day.key] : null;
              if (routine) {
                return (
                  <ListItem key={day.key}>
                    <ListItemText primary={day.label} secondary={routine} />
                    <IconButton color="primary" onClick={() => handleSendWhatsApp(day.label, routine)}>
                      <WhatsAppIcon />
                    </IconButton>
                  </ListItem>
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

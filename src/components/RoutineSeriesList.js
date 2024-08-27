import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MenuBar from './MenuBar'; // Importa el MenuBar
import { CssBaseline } from '@mui/material';
import BackButton from './BackButton';

export default function RoutineSeriesList() {
  const { studentId } = useParams(); // Obtener el ID del alumno desde la URL
  const [studentData, setStudentData] = useState({});
  const [routineSeries, setRoutineSeries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutineSeries = async () => {
      const querySnapshot = await getDocs(collection(db, `students/${studentId}/routineSeries`));
      const seriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutineSeries(seriesList);
    };

    fetchRoutineSeries();
  }, [studentId]);

  useEffect(() => {
    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudentData(docSnap.data());
      } else {
        console.error("No se encontró el documento del alumno");
      }
    };
  
    fetchStudentData();
  }, [studentId]);

  const handleEdit = (seriesId) => {
    navigate(`/assign-routine-series/${studentId}/${seriesId}`);
  };

  const handleBackToList = () => {
    navigate('/student-list');
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Series de Rutinas para {studentData.name} ({studentData.idNumber})
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre de la Serie</TableCell>
                  <TableCell>Fecha de Vencimiento</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routineSeries.map((series) => (
                  <TableRow key={series.id}>
                    <TableCell>{series.name}</TableCell>
                    <TableCell>{series.endDate}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(series.id)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <BackButton/>
          </Box>
        </Container>
      </main>
    </div>
  );
}

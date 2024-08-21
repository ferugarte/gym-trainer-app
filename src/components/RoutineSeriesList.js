// src/components/RoutineSeriesList.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, Box, Button } from '@mui/material';
import { AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function RoutineSeriesList() {
  const { studentId } = useParams(); // Obtener el ID del alumno desde la URL
  const [studentData, setStudentData] = useState({});
  const [routineSeries, setRoutineSeries] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

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
            Series de Rutinas de Alumno
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
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
            <Button variant="outlined" color="secondary" onClick={handleBackToList}>
              Volver a la lista
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
}

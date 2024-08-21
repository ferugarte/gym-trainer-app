// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';
import { AppBar, Toolbar, Drawer, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function Dashboard() {
  const [latestStudents, setLatestStudents] = useState([]);
  const [upcomingSeries, setUpcomingSeries] = useState([]);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchLatestStudents = async () => {
      const studentsQuery = query(collection(db, 'students'), orderBy('registrationDate', 'desc'), limit(5));
      const querySnapshot = await getDocs(studentsQuery);
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registrationDate: doc.data().registrationDate.toDate().toLocaleDateString('es-ES'), // Formatear la fecha
      }));
      console.log("Últimos alumnos inscriptos: ", students); // Log para depuración
      setLatestStudents(students);
    };

    const fetchUpcomingSeries = async () => {
        try {
            const series = [];
            const studentsSnapshot = await getDocs(collection(db, 'students'));
            
            for (const studentDoc of studentsSnapshot.docs) {
                const studentData = studentDoc.data();
                console.log("Estudiante ID: ", studentDoc.id); // Verificar que estamos accediendo correctamente a los estudiantes
    
                // Acceder a la subcolección de series de rutinas usando el studentId
                const routineSeriesRef = collection(db, `students/${studentDoc.id}/routineSeries`);
                
                // Asegurarse de que la referencia tiene documentos antes de hacer la consulta
                const seriesSnapshot = await getDocs(routineSeriesRef);
    
                if (!seriesSnapshot.empty) {
                    seriesSnapshot.forEach((doc) => {
                        let endDate;
                        
                        // Verificar el tipo de dato de endDate
                        if (doc.data().endDate instanceof Timestamp) {
                            endDate = doc.data().endDate.toDate();
                        } else if (typeof doc.data().endDate === 'string' || typeof doc.data().endDate === 'number') {
                            endDate = new Date(doc.data().endDate);
                        } else {
                            console.error('Tipo de dato desconocido para endDate:', doc.data().endDate);
                            return;
                        }
    
                        const today = new Date();
                        
                        // Filtrar por las que aún no han vencido
                        if (endDate >= today) {
                            console.log("Serie de rutina obtenida: ", doc.data());
                            series.push({
                                id: doc.id,
                                ...doc.data(),
                                endDate: endDate.toLocaleDateString('es-ES'),
                                studentName: studentData.name, // Nombre del alumno
                                studentCedula: studentData.idNumber, // Cédula del alumno
                                studentId: studentDoc.id, // Para referencia adicional
                            });
                        }
                    });
                } else {
                    console.log(`No se encontraron series de rutinas para el estudiante ID: ${studentDoc.id}`);
                }
            }
    
            series.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            console.log("Series de rutinas ordenadas: ", series);
            setUpcomingSeries(series.slice(0, 5)); // Limitar a las próximas 5 series
        } catch (error) {
            console.error("Error al obtener las series de rutinas: ", error);
        }
    };
        

    fetchLatestStudents();
    fetchUpcomingSeries();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
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

  const chartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Alumnos Inscritos',
        data: [10, 20, 15, 30, 25, 40],
        fill: false,
        borderColor: '#42A5F5',
      },
      {
        label: 'Series de Rutinas Creadas',
        data: [5, 15, 10, 25, 20, 35],
        fill: false,
        borderColor: '#66BB6A',
      },
    ],
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <MenuIcon 
            color="inherit" 
            aria-label="open drawer" 
            edge="start" 
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          />
          <Typography variant="h6" noWrap>
            Dashboard
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
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ padding: theme.spacing(2) }}>
                <Typography variant="h6">Últimos 5 Alumnos Inscriptos</Typography>
                <List>
                  {latestStudents.map((student) => (
                    <ListItem key={student.id}>
                      <ListItemText
                        primary={student.name}
                        secondary={`Fecha de inscripción: ${student.registrationDate}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ padding: theme.spacing(2) }}>
                    <Typography variant="h6">Próximas 5 Series de Rutinas a Vencer</Typography>
                    <List>
                        {upcomingSeries.map((series) => (
                            <ListItem key={series.id}>
                                <ListItemText
                                    primary={`${series.studentName} (${series.studentCedula}) - ${series.name}`}
                                    secondary={`Vencimiento: ${series.endDate}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ padding: theme.spacing(2) }}>
                <Typography variant="h6">Gráficos</Typography>
                <Line data={chartData} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}

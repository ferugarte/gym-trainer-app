import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, CssBaseline, AppBar, Toolbar, Drawer, useTheme, useMediaQuery, List, ListItem, ListItemText } from '@mui/material'; // Asegúrate de importar List, ListItem y ListItemText
import MenuIcon from '@mui/icons-material/Menu';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import MenuBar from './common/MenuBar'; // Importa MenuBar.js

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
        registrationDate: doc.data().registrationDate.toDate().toLocaleDateString('es-ES'),
      }));
      setLatestStudents(students);
    };

    const fetchUpcomingSeries = async () => {
      // Lógica para obtener las próximas series de rutinas
    };

    fetchLatestStudents();
    fetchUpcomingSeries();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

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
      <MenuBar /> {/* Coloca el MenuBar aquí */}
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

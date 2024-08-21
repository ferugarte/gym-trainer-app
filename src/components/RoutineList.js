// src/components/RoutineList.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Toolbar, Box } from '@mui/material';
import { AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../firebaseConfig';

export default function RoutineList() {
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      const querySnapshot = await getDocs(collection(db, 'routines'));
      const routineList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutines(routineList);
      setFilteredRoutines(routineList);
    };

    fetchRoutines();
  }, []);

  useEffect(() => {
    setFilteredRoutines(
      routines.filter(routine =>
        (routine.name?.toLowerCase() || '').includes(nameFilter.toLowerCase())
      )
    );
  }, [nameFilter, routines]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDeleteRoutine = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta rutina?")) {
        try {
            await deleteDoc(doc(db, 'routines', id));
            alert('Rutina eliminada exitosamente');
            // Opcional: Actualizar la lista de rutinas para reflejar los cambios
            setRoutines(routines.filter(routine => routine.id !== id));
        } catch (error) {
            console.error("Error al eliminar la rutina: ", error);
            alert('Hubo un error al eliminar la rutina.');
        }
    }
};


  const handleEdit = (id) => {
    navigate(`/edit-routine/${id}`);
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
            Lista de Rutinas
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
            Lista de Rutinas
          </Typography>

          <TextField
            label="Filtrar por Nombre"
            variant="outlined"
            margin="normal"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            fullWidth
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoutines.map((routine) => (
                  <TableRow key={routine.id}>
                    <TableCell>{routine.name}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(routine.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDeleteRoutine(routine.id)}>
                          <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ marginTop: theme.spacing(3) }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/add-routine')}>
              Agregar Rutina
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
}

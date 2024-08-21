// src/components/StudentList.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar } from '@mui/material';
import { AppBar, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List'; // Importación para el ícono de lista
import AddIcon from '@mui/icons-material/Add'; // Importación para el ícono de agregar
import { Link, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentList);
      setFilteredStudents(studentList);
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    setFilteredStudents(
      students.filter(student =>
        (student.name?.toLowerCase() || '').includes(nameFilter.toLowerCase())
      )
    );
  }, [nameFilter, students]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleEdit = (id) => {
    navigate(`/edit-student/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
        try {
            await deleteDoc(doc(db, 'students', id));
            alert('Alumno eliminado exitosamente');
            // Opcional: Actualizar la lista de alumnos para reflejar los cambios
            setStudents(students.filter(student => student.id !== id));
        } catch (error) {
            console.error("Error al eliminar el alumno: ", error);
            alert('Hubo un error al eliminar al alumno.');
        }
    }
};

  const handleAddRoutineSeries = (studentId) => {
    navigate(`/assign-routine-series/${studentId}`);
  };

  const handleViewRoutineSeries = (studentId) => {
    navigate(`/routine-series-list/${studentId}`);
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
            Lista de Alumnos
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
            Lista de Alumnos
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Cédula</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.cedula}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(student.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleAddRoutineSeries(student.id)}>
                        <AddIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleViewRoutineSeries(student.id)}>
                        <ListIcon /> {/* Botón para ver la lista de series de rutinas */}
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(student.id)}>
                          <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </main>
    </div>
  );
}

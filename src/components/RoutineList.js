import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MenuBar from './MenuBar'; // Importa el MenuBar
import { CssBaseline } from '@mui/material';
import BackButton from './BackButton';
import AddDataButton from './AddDataButton';

export default function RoutineList() {
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const navigate = useNavigate();

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

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
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
          <Box sx={{ marginTop: 3, justifyContent: 'center' }}>
            <AddDataButton label="Agregar Rutina" path="/add-routine" />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import MenuBar from './MenuBar';
import { CssBaseline } from '@mui/material';
import BackButton from './BackButton';
import AddDataButton from './AddDataButton';

export default function RoutineList() {
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [userType, setUserType] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);
          setTrainerId(user.uid);
        }
      }
    };

    const fetchRoutines = async () => {
      const querySnapshot = await getDocs(collection(db, 'routines'));
      const routineList = await Promise.all(
        querySnapshot.docs.map(async routineDoc => {
          const data = routineDoc.data();
          let trainerName = 'N/A';
          if (data.trainerId) {
            const trainerDoc = await getDoc(doc(db, 'users', data.trainerId));
            if (trainerDoc.exists()) {
              trainerName = trainerDoc.data().name;
            }
          }
          return {
            id: routineDoc.id,
            ...data,
            trainerName
          };
        })
      );
      setRoutines(routineList);
      filterRoutines(routineList, nameFilter, userType, trainerId);
    };

    fetchUserData();
    fetchRoutines();
  }, [nameFilter, userType, trainerId]);

  const filterRoutines = (routineList, nameFilter, userType, trainerId) => {
    const filtered = routineList.filter(routine => {
      const matchesName = (routine.name?.toLowerCase() || '').includes(nameFilter.toLowerCase());
      const matchesTrainer = userType === 'administrador' || routine.trainerId === trainerId;
      return matchesName && matchesTrainer;
    });
    setFilteredRoutines(filtered);
  };

  const handleDeleteRoutine = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta rutina?")) {
      try {
        await deleteDoc(doc(db, 'routines', id));
        alert('Rutina eliminada exitosamente');
        setRoutines(routines.filter(routine => routine.id !== id));
        filterRoutines(routines, nameFilter, userType, trainerId);
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
      <MenuBar />
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
                  {userType === 'administrador' && <TableCell>Entrenador</TableCell>} {/* Columna solo visible para administradores */}
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoutines.map((routine) => (
                  <TableRow key={routine.id}>
                    <TableCell>{routine.name}</TableCell>
                    {userType === 'administrador' && <TableCell>{routine.trainerName}</TableCell>}
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

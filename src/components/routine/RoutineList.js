import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import MenuBar from '../common/MenuBar';
import CssBaseline from '@mui/material/CssBaseline';
import BackButton from '../common/BackButton';
import AddDataButton from '../common/AddDataButton';

export default function RoutineList() {
  const { studentId } = useParams();
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
      const routinesRef = collection(db, 'routines');
      const q = query(routinesRef, where("studentId", "==", studentId)); 
      const querySnapshot = await getDocs(q);
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
  }, [studentId, nameFilter, userType, trainerId]);

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
    navigate(`/routine-form/${id}`);
  };

  const handleViewExercises = (id) => {
    navigate(`/routine-exercise-list/${id}`);
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
                  {userType === 'administrador' && <TableCell>Entrenador</TableCell>}
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoutines.map((routine) => (
                  <TableRow key={routine.id}>
                    <TableCell>{routine.name}</TableCell>
                    {userType === 'administrador' && <TableCell>{routine.trainerName}</TableCell>}
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => handleEdit(routine.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="secondary" onClick={() => handleDeleteRoutine(routine.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Ejercicios">
                        <IconButton color="primary" onClick={() => handleViewExercises(routine.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ marginTop: 3, justifyContent: 'center' }}>
            <AddDataButton label="Agregar Rutina" path={`/routine-form?studentId=${studentId}`} />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BackButton from '../common/BackButton';
import ListIcon from '@mui/icons-material/List'; 
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { CssBaseline } from '@mui/material';
import MenuBar from '../common/MenuBar';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().userType);
        }
      }
    };

    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentList = await Promise.all(querySnapshot.docs.map(async (studentDoc) => {
        const studentData = studentDoc.data();
        let trainerName = '';

        if (studentData.trainerId) {
          const trainerDoc = await getDoc(doc(db, 'users', studentData.trainerId));
          if (trainerDoc.exists()) {
            trainerName = trainerDoc.data().name;
          }
        }

        return {
          id: studentDoc.id,
          ...studentData,
          trainerName,
        };
      }));

      setStudents(studentList);
      setFilteredStudents(studentList);
    };

    fetchUserType();
    fetchStudents();
  }, []);

  useEffect(() => {
    setFilteredStudents(
      students.filter(student =>
        (student.name?.toLowerCase() || '').includes(nameFilter.toLowerCase())
      )
    );
  }, [nameFilter, students]);

  const handleEdit = (id) => {
    navigate(`/edit-student/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
      try {
        await deleteDoc(doc(db, 'students', id));
        alert('Alumno eliminado exitosamente');
        setStudents(students.filter(student => student.id !== id));
      } catch (error) {
        console.error("Error al eliminar el alumno: ", error);
        alert('Hubo un error al eliminar al alumno.');
      }
    }
  };

  const handleAddRoutine = (studentId) => {
    navigate(`/add-routine/${studentId}`);
  };

  const handleViewRoutines = (studentId) => {
    navigate(`/routine-list/${studentId}`);
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
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
                  {userType === 'administrador' && <TableCell>Entrenador</TableCell>}
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.idNumber}</TableCell>
                    {userType === 'administrador' && <TableCell>{student.trainerName}</TableCell>}
                    <TableCell>
                      <Tooltip title="Editar Alumno">
                        <IconButton color="primary" onClick={() => handleEdit(student.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Agregar Rutina">
                        <IconButton color="primary" onClick={() => handleAddRoutine(student.id)}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Rutinas">
                        <IconButton color="primary" onClick={() => handleViewRoutines(student.id)}>
                          <ListIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Alumno">
                        <IconButton color="secondary" onClick={() => handleDelete(student.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>    
          <BackButton />
        </Container>
      </main>
    </div>
  );
}

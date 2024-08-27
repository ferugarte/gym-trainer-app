import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Box 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BackButton from './BackButton'; // Ajusta la ruta según la ubicación del componente
import ListIcon from '@mui/icons-material/List'; 
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CssBaseline } from '@mui/material';
import MenuBar from './MenuBar'; // Importa el MenuBar

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const navigate = useNavigate();

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

  const handleAddRoutineSeries = (studentId) => {
    navigate(`/assign-routine-series/${studentId}`);
  };

  const handleViewRoutineSeries = (studentId) => {
    navigate(`/routine-series-list/${studentId}`);
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar /> {/* Coloca el MenuBar aquí */}
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
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.idNumber}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(student.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleAddRoutineSeries(student.id)}>
                        <AddIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleViewRoutineSeries(student.id)}>
                        <ListIcon />
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
            <BackButton />
        </Container>
      </main>
    </div>
  );
}

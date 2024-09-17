import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CssBaseline
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { db, auth } from '../../firebaseConfig';
import MenuBar from '../common/MenuBar';
import BackButton from '../common/BackButton';
import SubmitButton from '../common/SubmitButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function RoutineForm() {
  const { id, studentId } = useParams();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [trainerId, setTrainerId] = useState('');
  const [userType, setUserType] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [expirationDate, setExpirationDate] = useState(dayjs());
  const [openDayDialog, setOpenDayDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [routineByDay, setRoutineByDay] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();

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

    const fetchRoutine = async () => {
      if (id) {
        const docRef = doc(db, "routines", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const routine = docSnap.data();
          setName(routine.name);
          setTrainerId(routine.trainerId || '');
          setRoutineByDay(routine.routineByDay || {});
          setExpirationDate(routine.expirationDate ? dayjs(routine.expirationDate.toDate()) : dayjs());
        } else {
          console.error("No se encontró la rutina.");
        }
      }
    };

    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exerciseList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExercises(exerciseList);
    };

    const fetchTrainers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const trainerList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.userType === 'entrenador');
      setTrainers(trainerList);
    };

    fetchUserData();
    fetchRoutine();
    fetchExercises();
    if (userType === 'administrador') {
      fetchTrainers();
    }
  }, [id, userType]);

  const handleOpenDayDialog = () => {
    if (selectedDay) {
      setOpenDayDialog(true);
    } else {
      alert("Por favor, selecciona un día para editar.");
    }
  };

  const handleCloseDayDialog = () => {
    setOpenDayDialog(false);
    setSelectedDay('');
  };

  const handleAddExercise = () => {
    setRoutineByDay((prevState) => ({
      ...prevState,
      [selectedDay]: [
        ...(prevState[selectedDay] || []),
        { muscleGroup: '', exerciseId: '', series: '', repetitions: '', weight: '' },
      ],
    }));
  };

  const handleDayExerciseChange = (index, field, value) => {
    if (field === 'delete') {
      setRoutineByDay((prevState) => {
        const updatedDay = prevState[selectedDay].filter((_, i) => i !== index);
        return { ...prevState, [selectedDay]: updatedDay };
      });
    } else {
      setRoutineByDay((prevState) => ({
        ...prevState,
        [selectedDay]: prevState[selectedDay].map((exercise, i) =>
          i === index ? { ...exercise, [field]: value } : exercise
        ),
      }));
    }
  };

  const handleAccordionChange = (index) => (event, isExpanded) => {
    if (!isExpanded) {
      setRoutineByDay((prevState) => {
        const updatedDay = [...prevState[selectedDay]];
        const exerciseId = updatedDay[index]?.exerciseId;
        if (exerciseId) {
          updatedDay[index].name = exercises.find(ex => ex.id === exerciseId)?.name || "Nuevo Ejercicio";
        }
        return { ...prevState, [selectedDay]: updatedDay };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        const routineRef = doc(db, "routines", id);
        await updateDoc(routineRef, {
          name,
          trainerId,
          expirationDate: expirationDate.toDate(),
          routineByDay,
        });
        alert('Rutina actualizada correctamente');
      } else {
        await addDoc(collection(db, "routines"), {
          name,
          trainerId,
          expirationDate: expirationDate.toDate(),
          routineByDay,
          studentId,
          createdAt: new Date(),
        });
        alert('Rutina creada correctamente');
      }

      if (studentId) {
        navigate(`/routine-list/${studentId}`);
      } else {
        console.error('studentId está indefinido. No se puede redirigir a la lista.');
        alert('Hubo un problema al redirigir. Por favor, inténtalo de nuevo.');
      }

    } catch (error) {
      console.error('Error al guardar la rutina: ', error);
      alert('Hubo un error al guardar la rutina.');
    }
  };

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: theme.spacing(3), paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {id ? 'Editar Rutina Semanal' : 'Agregar Rutina Semanal'}
          </Typography>

          <TextField
            label="Nombre de la Rutina Semanal"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {userType === 'administrador' && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="trainer-select-label">Entrenador</InputLabel>
              <Select
                labelId="trainer-select-label"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                label="Entrenador"
                required
              >
                {trainers.map(trainer => (
                  <MenuItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Fecha de Vencimiento"
            type="date"
            fullWidth
            margin="normal"
            value={expirationDate.format('YYYY-MM-DD')}
            onChange={(e) => setExpirationDate(dayjs(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <Box sx={{ width: '100%', marginTop: 2 }}>
            <Typography variant="body1" gutterBottom>
              Seleccione el día de la semana y luego "Editar" para modificar los ejercicios.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="day-select-label">Día de la Semana</InputLabel>
                <Select
                  labelId="day-select-label"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  label="Día de la Semana"
                >
                  {daysOfWeek.map(day => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleOpenDayDialog} sx={{ marginLeft: 2 }}>
                Editar
              </Button>
            </Box>
          </Box>

          <Dialog open={openDayDialog} onClose={handleCloseDayDialog} fullWidth maxWidth="sm">
            <DialogTitle>Ejercicios para {selectedDay}</DialogTitle>
            <DialogContent>
              {routineByDay[selectedDay]?.map((exercise, index) => (
                <Accordion 
                  key={index} 
                  sx={{ marginBottom: 2 }}
                  onChange={handleAccordionChange(index)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Typography>
                      {exercise.exerciseId
                        ? exercises.find(ex => ex.id === exercise.exerciseId)?.name || "Nuevo Ejercicio"
                        : "Nuevo Ejercicio"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id={`muscle-group-${index}`}>Grupo Muscular</InputLabel>
                      <Select
                        labelId={`muscle-group-${index}`}
                        value={exercise.muscleGroup}
                        onChange={(e) => handleDayExerciseChange(index, 'muscleGroup', e.target.value)}
                        label="Grupo Muscular"
                        required
                      >
                        <MenuItem value="Pecho">Pecho</MenuItem>
                        <MenuItem value="Espalda">Espalda</MenuItem>
                        <MenuItem value="Brazos">Brazos</MenuItem>
                        <MenuItem value="Hombros">Hombros</MenuItem>
                        <MenuItem value="Abdomen">Abdomen</MenuItem>
                        <MenuItem value="Piernas">Piernas</MenuItem>
                        <MenuItem value="Glúteos">Glúteos</MenuItem>
                        <MenuItem value="Gemelos">Gemelos</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id={`exercise-${index}`}>Ejercicio</InputLabel>
                      <Select
                        labelId={`exercise-${index}`}
                        value={exercise.exerciseId}
                        onChange={(e) => handleDayExerciseChange(index, 'exerciseId', e.target.value)}
                        label="Ejercicio"
                        required
                      >
                        {exercises
                          .filter((ex) => ex.muscleGroup === exercise.muscleGroup)
                          .map((ex) => (
                            <MenuItem key={ex.id} value={ex.id}>
                              {ex.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Series"
                      variant="outlined"
                      type="number"
                      value={exercise.series}
                      onChange={(e) => handleDayExerciseChange(index, 'series', e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                    />

                    <TextField
                      label="Repeticiones"
                      variant="outlined"
                      type="number"
                      value={exercise.repetitions}
                      onChange={(e) => handleDayExerciseChange(index, 'repetitions', e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                    />

                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id={`weight-${index}`}>Peso</InputLabel>
                      <Select
                        labelId={`weight-${index}`}
                        value={exercise.weight}
                        onChange={(e) => handleDayExerciseChange(index, 'weight', e.target.value)}
                        label="Peso"
                        required
                      >
                        <MenuItem value="Liviano">Liviano</MenuItem>
                        <MenuItem value="Moderado">Moderado</MenuItem>
                        <MenuItem value="Moderado a Pesado">Moderado a Pesado</MenuItem>
                        <MenuItem value="Pesado">Pesado</MenuItem>
                      </Select>
                    </FormControl>

                    <IconButton
                      color="error"
                      onClick={() => handleDayExerciseChange(index, 'delete')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Button startIcon={<AddIcon />} onClick={handleAddExercise}>
                Agregar Ejercicio
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDayDialog} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ marginTop: theme.spacing(3) }}>
            <SubmitButton />
            <BackButton />
          </Box>
        </Container>
      </main>
    </div>
  );
}

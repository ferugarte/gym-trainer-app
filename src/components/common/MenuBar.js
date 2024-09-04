import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Box,
  Modal,
  Fade,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const MenuBar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [instructivoOpen, setInstructivoOpen] = useState(false); // Estado para abrir/cerrar el modal del instructivo

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);
          setUserName(userData.name);
          setUserPhoto(user.photoURL || ''); // Obtener la foto de usuario si está disponible
        }
      }
    };

    fetchUserInfo();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  const handleInstructivoOpen = () => {
    setInstructivoOpen(true);
  };

  const handleInstructivoClose = () => {
    setInstructivoOpen(false);
  };

  const adminMenu = (
    <>
      <ListItem button component={Link} to="/dashboard">
        <ListItemText primary="🏠 Dashboard" />
      </ListItem>
      <ListItem button component={Link} to="/students">
        <ListItemText primary="🧑‍🎓 Registrar Alumno" />
      </ListItem>
      <ListItem button component={Link} to="/student-list">
        <ListItemText primary="📋 Lista de Alumnos" />
      </ListItem>
      <ListItem button component={Link} to="/exercise-list">
        <ListItemText primary="🏋️ Lista de Ejercicios" />
      </ListItem>
      <ListItem button component={Link} to="/user-list">
        <ListItemText primary="👥 Lista de Usuarios" />
      </ListItem>
      <ListItem button onClick={handleInstructivoOpen}> {/* Botón para abrir el modal del instructivo */}
        <ListItemText primary="📚 Instructivo" />
      </ListItem>
    </>
  );

  const trainerMenu = (
    <>
      <ListItem button component={Link} to="/students">
        <ListItemText primary="🧑‍🎓 Registrar Alumno" />
      </ListItem>
      <ListItem button component={Link} to="/student-list">
        <ListItemText primary="📋 Lista de Alumnos" />
      </ListItem>
      <ListItem button component={Link} to="/exercise-list">
        <ListItemText primary="🏋️ Lista de Ejercicios" />
      </ListItem>
      <ListItem button onClick={handleInstructivoOpen}> {/* Botón para abrir el modal del instructivo */}
        <ListItemText primary="📚 Instructivo" />
      </ListItem>
    </>
  );

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {userType === 'administrador' ? adminMenu : trainerMenu}
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="🚪 Log Off" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: '#900C3F' }}>
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
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Gym Trainer App
          </Typography>
          {isLargeScreen && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {userPhoto && <Avatar src={userPhoto} alt={userName} sx={{ mr: 2 }} />}
              <Typography variant="body1" sx={{ mr: 2 }}>
                {userName} ({userType})
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                🚪 Log Off
              </Button>
            </Box>
          )}
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

      {/* Modal para el instructivo */}
      <Modal
        open={instructivoOpen}
        onClose={handleInstructivoClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={instructivoOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              overflowY: 'auto',
              maxHeight: '90vh',
            }}
          >
            {/* Botón de cierre en la esquina superior derecha */}
            <IconButton
              aria-label="close"
              onClick={handleInstructivoClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h4" component="h1" gutterBottom>
              📚 Instructivo de Uso de la Aplicación de Entrenamiento
            </Typography>

            {/* Accordion para cada sección del instructivo */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="agregar-ejercicios-content"
                id="agregar-ejercicios-header"
              >
                <Typography variant="h6">🏋️ 1. Agregar Ejercicios</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Los ejercicios son la base de las rutinas, y deben ser creados antes de que puedas asignarlos a los alumnos.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Inicia sesión en la aplicación con tus credenciales de administrador o entrenador.</li>
                    <li>Desde el menú principal, selecciona "Lista de Ejercicios".</li>
                    <li>Haz clic en "Agregar Ejercicio".</li>
                    <li>Completa los campos del formulario con el nombre, descripción, grupo muscular, enlace del video y selecciona el entrenador.</li>
                    <li>Haz clic en "Agregar Ejercicio" para guardar el ejercicio.</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="listar-editar-ejercicios-content"
                id="listar-editar-ejercicios-header"
              >
                <Typography variant="h6">📝 2. Listar y Editar Ejercicios</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Desde el menú principal, selecciona "Lista de Ejercicios" para listar y editar los ejercicios.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Desde el menú principal, selecciona "Lista de Ejercicios".</li>
                    <li>Para editar un ejercicio, haz clic en el ícono de edición junto al ejercicio que deseas modificar.</li>
                    <li>Actualiza la información en el formulario y haz clic en "Actualizar Ejercicio".</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="registrar-alumnos-content"
                id="registrar-alumnos-header"
              >
                <Typography variant="h6">🧑‍🎓 3. Registrar Alumnos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Agrega nuevos alumnos al sistema para asignarles rutinas personalizadas.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Desde el menú principal, selecciona "Registrar Alumno".</li>
                    <li>Completa los campos del formulario con los datos del alumno.</li>
                    <li>Haz clic en "Registrar Alumno" para guardar el nuevo alumno.</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="listar-editar-alumnos-content"
                id="listar-editar-alumnos-header"
              >
                <Typography variant="h6">📋 4. Listar y Editar Alumnos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Desde el menú principal, selecciona "Lista de Alumnos" para listar y editar los datos de los alumnos.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Desde el menú principal, selecciona "Lista de Alumnos".</li>
                    <li>Para editar un alumno, haz clic en el ícono de edición junto al alumno que deseas modificar.</li>
                    <li>Actualiza la información en el formulario y haz clic en "Actualizar Alumno".</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="crear-rutinas-content"
                id="crear-rutinas-header"
              >
                <Typography variant="h6">🗓️ 5. Crear Rutinas para Alumnos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Crea rutinas personalizadas para cada alumno, asignando ejercicios específicos a los días de la semana.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Desde la "Lista de Alumnos", haz clic en "Agregar Rutina" junto al alumno deseado.</li>
                    <li>Completa los campos del formulario de rutina con el nombre, fecha de vencimiento y entrenador.</li>
                    <li>Selecciona el día de la semana y haz clic en "Editar" para agregar los ejercicios para ese día.</li>
                    <li>Repite el proceso para otros días de la semana si es necesario.</li>
                    <li>Haz clic en "Guardar Rutina".</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="listar-editar-rutinas-content"
                id="listar-editar-rutinas-header"
              >
                <Typography variant="h6">📝 6. Listar y Editar Rutinas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Desde el menú principal, selecciona "Lista de Rutinas" para listar y editar las rutinas asignadas a los alumnos.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Desde el menú principal, selecciona "Lista de Rutinas".</li>
                    <li>Para editar una rutina, haz clic en el ícono de edición junto a la rutina que deseas modificar.</li>
                    <li>Actualiza la información en el formulario y haz clic en "Actualizar Rutina".</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="visualizar-ejercicios-content"
                id="visualizar-ejercicios-header"
              >
                <Typography variant="h6">👁️ 7. Visualizar Ejercicios en Rutinas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Visualiza y envía por WhatsApp los ejercicios asignados a cada día de la semana.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Desde la "Lista de Rutinas", haz clic en "Ver Ejercicios" junto a la rutina deseada.</li>
                    <li>Selecciona el día de la semana que deseas visualizar.</li>
                    <li>Puedes enviar la rutina diaria al alumno por WhatsApp haciendo clic en el ícono de WhatsApp.</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default MenuBar;

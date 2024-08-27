// src/components/MenuBar.js
import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, CssBaseline, useTheme, useMediaQuery, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

const MenuBar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="Log Off" />
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
            <Button color="inherit" onClick={handleLogout}>
              Log Off
            </Button>
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
    </>
  );
};

export default MenuBar;

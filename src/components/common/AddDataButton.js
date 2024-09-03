import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AddDataButton({ label = "Agregar Ejercicio", path = "/add-exercise", fullWidth = true }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <Button 
      variant="contained" 
      color="primary" 
      onClick={handleClick} 
      fullWidth={fullWidth}
      sx={{
        backgroundColor: '#900C3F',
        '&:hover': {
          backgroundColor: '#750A32', // Un tono más oscuro al hacer hover
        }
      }}
    >
      {label}
    </Button>
  );
}

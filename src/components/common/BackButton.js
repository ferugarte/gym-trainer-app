import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton({ label = "Volver Atrás" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Volver a la página anterior
  };

  return (
    <Button 
      variant="outlined" 
      startIcon={<ArrowBackIcon />}
      fullWidth  
      onClick={handleBack}
      sx={{ 
        mt: 2,  // Espacio hacia arriba (equivalente a marginTop)
        mb: 2,  // Espacio hacia abajo (equivalente a marginBottom)
        color: '#900C3F',
        borderColor: '#900C3F',
        '&:hover': {
          borderColor: '#750A32', // Un tono más oscuro al hacer hover
          backgroundColor: 'rgba(144, 12, 63, 0.04)', // Fondo con transparencia al hacer hover
        }
      }}
    >
      {label}
    </Button>
  );
}

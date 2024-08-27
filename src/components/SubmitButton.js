import React, { useState } from 'react';
import { Button } from '@mui/material';

export default function SubmitButton({ label = "Actualizar", fullWidth = true }) {
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el "loading"

  return (
    <Button 
      variant="contained" 
      color="primary" 
      type="submit" 
      fullWidth={fullWidth} 
      disabled={isLoading}
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

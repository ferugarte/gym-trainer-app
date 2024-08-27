import React from 'react';
import { IconButton } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SendWhatsAppButton({ seriesId, studentPhone }) {

  const constructRoutineMessage = (exercises) => {
    if (!exercises || exercises.length === 0) {
      return 'No hay ejercicios asignados en esta serie de rutinas.';
    }

    return exercises.map(exercise => {
      const { name, sets, reps } = exercise;
      return `${name} (${sets || 'undefined'} series, ${reps || 'undefined'} reps)`;
    }).join('\n');
  };

  const handleSendWhatsApp = async () => {
    try {
      // Obtener detalles de la rutina usando el ID
      const routineRef = doc(db, 'routines', seriesId);
      const routineDoc = await getDoc(routineRef);

      if (routineDoc.exists()) {
        const routineData = routineDoc.data();
        const message = `*Rutina de Ejercicios*\n\n${constructRoutineMessage(routineData.exercises)}`;
        const whatsappURL = `https://api.whatsapp.com/send?phone=${studentPhone}&text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, '_blank');
      } else {
        console.error("No se encontró la rutina.");
        alert('No se encontró la rutina.');
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert('Hubo un error al enviar el mensaje.');
    }
  };

  return (
    <IconButton color="primary" onClick={handleSendWhatsApp}>
      <WhatsAppIcon />
    </IconButton>
  );
}

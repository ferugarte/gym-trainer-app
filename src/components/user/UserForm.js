import React, { useState, useEffect } from 'react';
import { Container, TextField, MenuItem, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import SubmitButton from '../common/SubmitButton';
import { CssBaseline } from '@mui/material';
import MenuBar from '../common/MenuBar';
import BackButton from '../common/BackButton';

export default function UserForm() {
  const { userId } = useParams(); // Obtiene el ID del usuario desde la URL si está presente
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gym, setGym] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const cities = ["Asunción", "Ciudad del Este", "Encarnación", "Luque", "San Lorenzo"];

  // Cargar los datos del usuario existente si estamos en modo edición
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name);
          setEmail(userData.email);
          setUserType(userData.userType);
          if (userData.userType === 'entrenador') {
            setPhoneNumber(userData.phoneNumber || '');
            setGym(userData.gym || '');
            setCity(userData.city || '');
          }
        } else {
          console.error("No se encontró el usuario.");
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uid;
      if (userId) {
        // Modo edición: actualizar el usuario existente
        uid = userId;
        await setDoc(doc(db, 'users', uid), {
          name,
          email,
          // Solo actualiza la contraseña si se ha cambiado
          ...(password && { password }),
          userType,
          phoneNumber: userType === 'entrenador' ? phoneNumber : null,
          gym: userType === 'entrenador' ? gym : null,
          city: userType === 'entrenador' ? city : null,
        });
        alert('Usuario actualizado correctamente');
      } else {
        // Modo agregar: crear un nuevo usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        await setDoc(doc(db, 'users', uid), {
          name,
          email,
          userType,
          phoneNumber: userType === 'entrenador' ? phoneNumber : null,
          gym: userType === 'entrenador' ? gym : null,
          city: userType === 'entrenador' ? city : null,
        });
        alert('Usuario agregado correctamente');
      }

      navigate('/user-list');
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Hubo un error al guardar el usuario.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar />
      <main style={{ flexGrow: 1, padding: '24px', paddingTop: '70px' }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {userId ? 'Editar Usuario' : 'Registrar Usuario'}
          </Typography>
          <TextField
            label="Nombre y Apellido"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!userId} // Solo requerido al agregar un nuevo usuario
          />
          <TextField
            label="Tipo de Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="entrenador">Entrenador</MenuItem>
            <MenuItem value="alumno">Alumno</MenuItem>
          </TextField>

          {userType === 'entrenador' && (
            <>
              <TextField
                label="Número de Teléfono"
                variant="outlined"
                fullWidth
                margin="normal"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <TextField
                label="Gimnasio"
                variant="outlined"
                fullWidth
                margin="normal"
                value={gym}
                onChange={(e) => setGym(e.target.value)}
                required
              />
              <TextField
                label="Ciudad"
                variant="outlined"
                fullWidth
                margin="normal"
                select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              >
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
          <SubmitButton label={userId ? 'Actualizar Usuario' : 'Registrar Usuario'} />
          <BackButton />
        </Container>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Button, TextField, Container, Typography } from '@mui/material';
import { auth, googleProvider } from '../../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirige a la pantalla principal después del inicio de sesión
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error('Error en el login:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard'); // Navegar a la pantalla principal después del login
    } catch (error) {
      setError("Google sign-in failed. Please try again.");
      console.error('Error en el login con Google:', error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
        Login
      </Button>
      <Typography align="center" margin="normal">or</Typography>
      <Button variant="contained" color="secondary" fullWidth onClick={handleGoogleLogin}>
        Sign in with Google
      </Button>
    </Container>
  );
}

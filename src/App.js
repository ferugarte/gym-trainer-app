// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import EditStudent from './components/EditStudent';
import ExerciseList from './components/ExerciseList';
import AddExercise from './components/AddExercise';
import RoutineList from './components/RoutineList';
import AddRoutine from './components/AddRoutine';
import EditRoutine from './components/EditRoutine';
import EditExercise from './components/EditExercise';
import RoutineSeriesByStudent from './components/RoutineSeriesByStudent';
import RoutineSeriesList from './components/RoutineSeriesList';
import { auth } from './firebaseConfig';

function PrivateRoute({ element: Component, ...rest }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se verifica la autenticación
  }

  return currentUser ? <Component {...rest} /> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute element={Dashboard} />} />
        <Route path="/students" element={<PrivateRoute element={StudentForm} />} />
        <Route path="/student-list" element={<PrivateRoute element={StudentList} />} />
        <Route path="/edit-student/:id" element={<PrivateRoute element={EditStudent} />} />
        <Route path="/exercise-list" element={<PrivateRoute element={ExerciseList} />} />
        <Route path="/add-exercise" element={<PrivateRoute element={AddExercise} />} />
        <Route path="/routine-list" element={<PrivateRoute element={RoutineList} />} />
        <Route path="/add-routine" element={<PrivateRoute element={AddRoutine} />} />
        <Route path="/edit-exercise/:id" element={<PrivateRoute element={EditExercise} />} />
        <Route path="/edit-routine/:id" element={<PrivateRoute element={EditRoutine} />} />
        <Route path="/assign-routine-series/:studentId/:seriesId?" element={<PrivateRoute element={RoutineSeriesByStudent} />} />
        <Route path="/routine-series-list/:studentId" element={<PrivateRoute element={RoutineSeriesList} />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

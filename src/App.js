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
import RoutineByDay from './components/RoutineByDay';
import UserForm from './components/UserForm';
import UserList from './components/UserList';

function PrivateRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se verifica la autenticación
  }

  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/students" 
          element={
            <PrivateRoute>
              <StudentForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/student-list" 
          element={
            <PrivateRoute>
              <StudentList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/edit-student/:id" 
          element={
            <PrivateRoute>
              <EditStudent />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/exercise-list" 
          element={
            <PrivateRoute>
              <ExerciseList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/add-exercise" 
          element={
            <PrivateRoute>
              <AddExercise />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/routine-list" 
          element={
            <PrivateRoute>
              <RoutineList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/add-routine" 
          element={
            <PrivateRoute>
              <AddRoutine />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/edit-exercise/:id" 
          element={
            <PrivateRoute>
              <EditExercise />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/edit-routine/:id" 
          element={
            <PrivateRoute>
              <EditRoutine />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/assign-routine-series/:studentId/:seriesId?" 
          element={
            <PrivateRoute>
              <RoutineSeriesByStudent />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/routine-series-list/:studentId" 
          element={
            <PrivateRoute>
              <RoutineSeriesList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/routine-by-day/:studentId/:seriesId" 
          element={
            <PrivateRoute>
              <RoutineByDay />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/add-user" 
          element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/user-list" 
          element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/edit-user/:userId" 
          element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

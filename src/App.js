import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import StudentForm from './components/student/StudentForm';
import StudentList from './components/student/StudentList';
import EditStudent from './components/student/EditStudent';
import ExerciseList from './components/exercise/ExerciseList';
import RoutineList from './components/routine/RoutineList';
import RoutineForm from './components/routine/RoutineForm';
import ExerciseForm from './components/exercise/ExerciseForm';
import UserList from './components/user/UserList';
import { auth } from './firebaseConfig';
import RoutineExerciseList from './components/routine/RoutineExerciseList';

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
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
        <Route path="/student-list" element={<PrivateRoute><StudentList /></PrivateRoute>} />
        <Route path="/edit-student/:id" element={<PrivateRoute><EditStudent /></PrivateRoute>} />
        <Route path="/exercise-list" element={<PrivateRoute><ExerciseList /></PrivateRoute>} />
        <Route path="/routine-list/:studentId" element={<PrivateRoute><RoutineList /></PrivateRoute>} />
        <Route path="/add-routine/:studentId" element={<PrivateRoute><RoutineForm /></PrivateRoute>} />
        <Route path="/routine-form/:id?" element={<PrivateRoute><RoutineForm /></PrivateRoute>} />
        <Route path="/edit-exercise/:id" element={<PrivateRoute><ExerciseForm /></PrivateRoute>} />
        <Route path="/routine-exercise-list/:routineId" element={<PrivateRoute><RoutineExerciseList /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/add-exercise" element={<PrivateRoute><ExerciseForm /></PrivateRoute>} />
        <Route path="/user-list" element={ <PrivateRoute> <UserList /> </PrivateRoute> } />
      </Routes>
    </Router>
  );
}

export default App;

// src/App.js
import React from 'react';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<StudentForm />} />
        <Route path="/student-list" element={<StudentList />} />
        <Route path="/edit-student/:id" element={<EditStudent />} />
        <Route path="/exercise-list" element={<ExerciseList />} />
        <Route path="/add-exercise" element={<AddExercise />} />
        <Route path="/routine-list" element={<RoutineList />} />
        <Route path="/add-routine" element={<AddRoutine />} />
        <Route path="/edit-exercise/:id" element={<EditExercise />} />
        <Route path="/edit-routine/:id" element={<EditRoutine />} />
        <Route path="/assign-routine-series/:studentId/:seriesId?" element={<RoutineSeriesByStudent />} />
        <Route path="/routine-series-list/:studentId" element={<RoutineSeriesList />} />
        {/* Redirigir la ruta raíz ("/") al Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

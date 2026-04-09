import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import AllTodoLists from "./pages/AllTodoLists.tsx";
import TodoListPage from "./pages/TodoListPage.tsx";
import Calendar from './pages/Calendar.tsx';
import AppLayout from './components/AppLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with layout */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/todoboard" element={<AllTodoLists />} />
            <Route path="/lists/:listId" element={<TodoListPage />} />
          </Route>

          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

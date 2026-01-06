
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medsmart_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('medsmart_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medsmart_user');
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!user ? <AuthPage onLogin={login} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role === UserRole.PATIENT ? <PatientDashboard user={user} onLogout={logout} /> :
              user.role === UserRole.DOCTOR ? <DoctorDashboard user={user} onLogout={logout} /> :
              <AdminDashboard user={user} onLogout={logout} />
            ) : <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;

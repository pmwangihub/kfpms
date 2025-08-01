


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import BeneficiaryList from './components/BeneficiaryList';
import FundList from './components/FundList';
import TransactionList from './components/TransactionList';
import Login from './components/Login';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

/**
 * Main App component with routing and authentication check.
 * @returns {JSX.Element} Router with protected routes
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token);

      if (!token) {
        console.log('No token found.');
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/verify/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Auth success:', response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error.message);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);


  /**
   * ProtectedRoute component to restrict access.
   * @param {object} props
   * @param {React.ReactNode} props.children - Components to render if authenticated
   * @returns {JSX.Element|null}
   */
  const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);

    if (isAuthenticated === null) return null;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };
  return (

    <Router>
      <Navbar setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} />
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute>} />
        <Route
          path="/beneficiaries"
          element={
            <ProtectedRoute>
              <BeneficiaryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/funds"
          element={
            <ProtectedRoute>
              <FundList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>

  );
}

export default App;
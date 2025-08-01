import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import BeneficiaryList from './components/BeneficiaryList';
import FundList from './components/FundList';
import TransactionList from './components/TransactionList';
import Login from './components/Login';
import Profile from './components/Profile';

/**
 * Main App component with routing and authentication check.
 * @returns {JSX.Element} Router with protected routes
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    /**
     * Check if the stored token is valid on app load.
     */
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const response = await axios.get('/api/auth/verify/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        clg
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
   * Protected route component to restrict access.
   * @param {object} props - Component props
   * @param {React.Component} props.component - Component to render
   * @returns {JSX.Element} Component or redirect to login
   */
  const ProtectedRoute = ({ component: Component }) => {
    if (isAuthenticated === null) return null; // Wait for auth check
    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
        <Route path="/beneficiaries" element={<ProtectedRoute component={BeneficiaryList} />} />
        <Route path="/funds" element={<ProtectedRoute component={FundList} />} />
        <Route path="/transactions" element={<ProtectedRoute component={TransactionList} />} />
        <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
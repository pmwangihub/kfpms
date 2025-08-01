import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Login component for user authentication.
 *
 * @param {object} props - Component props
 * @param {Function} props.setIsAuthenticated - Function to set authentication state
 * @returns {JSX.Element} Login form
 */
const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Handle form input changes.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for login.
   *
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/token/', formData);
      localStorage.setItem('token', response.data.access);
      setIsAuthenticated(true);
      setError('');
      navigate('/dashboard'); // Redirect after successful login
    } catch (error) {
      setError(error?.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center">Login</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Enter your username"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Log in to the system"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

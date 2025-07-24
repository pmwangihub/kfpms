import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Navbar component for KFPMS navigation.
 * @returns {JSX.Element} Bootstrap navbar
 */
const Navbar = () => {
  const navigate = useNavigate();

  /**
   * Handle logout by clearing token and redirecting to login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          KFPMS
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="bi bi-house me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/beneficiaries">
                <i className="bi bi-people me-2"></i>Beneficiaries
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/funds">
                <i className="bi bi-wallet me-2"></i>Funds
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/transactions">
                <i className="bi bi-receipt me-2"></i>Transactions
              </Link>
            </li>
          </ul>
          <button className="btn btn-outline-danger ms-auto" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
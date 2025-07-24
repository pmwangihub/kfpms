import React, { useState } from 'react';
import axios from 'axios';
import { queueOperation } from '../sync';

/**
 * BeneficiaryForm component for creating new beneficiaries.
 * @returns {JSX.Element} Form for adding beneficiaries
 */
const BeneficiaryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
  });
  const [status, setStatus] = useState('');

  /**
   * Handle form input changes.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission.
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      age: parseInt(formData.age),
      location: formData.location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (navigator.onLine) {
      try {
        await axios.post('/api/beneficiaries/', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStatus('Beneficiary created successfully');
        setFormData({ name: '', age: '', location: '' });
      } catch (error) {
        console.log(error)
        setStatus('Failed to create beneficiary');
      }
    } else {
      await queueOperation('create', 'Beneficiary', data);
      setStatus('Operation queued for sync');
      setFormData({ name: '', age: '', location: '' });
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title">Add Beneficiary</h3>
        {status && (
          <div className={`alert ${status.includes('Failed') ? 'alert-danger' : 'alert-success'} mb-3`}>
            {status}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="age" className="form-label">Age</label>
            <input
              type="number"
              className="form-control"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Add Beneficiary
          </button>
        </form>
      </div>
    </div>
  );
};

export default BeneficiaryForm;
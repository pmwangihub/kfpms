import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Profile component to view and edit user details.
 * @returns {JSX.Element} User profile form
 */
const Profile = () => {
    const [user, setUser] = useState({ username: '', email: '' });
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [message, setMessage] = useState('');

    /**
     * Fetch user details on component mount.
     */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/auth/profile/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setUser(response.data);
                setFormData(response.data);
            } catch (error) {
                setMessage('Failed to load user details: ' + (error?.response?.data?.detail || error.message));
            }
        };
        fetchUser();
    }, []);

    /**
     * Handle form input changes.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
     */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * Handle form submission to update user details.
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/auth/profile/', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setUser(formData);
            setMessage('Profile updated successfully');
        } catch (error) {
            setMessage('Failed to update profile: ' + (error?.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">User Profile</h1>
            <div className="card">
                <div className="card-body">
                    {message && (
                        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                            {message}
                        </div>
                    )}
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
                                title="Your username"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Your email address"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Save profile changes"
                        >
                            <i className="bi bi-save me-2"></i>Update Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
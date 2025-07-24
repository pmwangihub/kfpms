import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';
import BeneficiaryForm from './BeneficiaryForm';

/**
 * BeneficiaryList component to display beneficiaries with Bootstrap styling.
 * @returns {JSX.Element} Beneficiary table with form and modals
 */
const BeneficiaryList = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [editBeneficiary, setEditBeneficiary] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', age: '', location: '' });
  const [deleteBeneficiary, setDeleteBeneficiary] = useState(null);

  /**
   * Fetch beneficiaries and sync offline data when online.
   */
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (isOnline) {
        try {
          // Auto-sync offline data
          const syncResult = await syncOfflineData();
          if (syncResult.success && syncResult.message !== 'No data to sync') {
            setSyncStatus(syncResult.message);
          }
          const response = await axios.get('/api/beneficiaries/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setBeneficiaries(response.data);
          await db.beneficiaries.clear();
          await db.beneficiaries.bulkPut(response.data);
          if (!syncResult.success) setSyncStatus(syncResult.message);
        } catch (error) {
          console.error('Error fetching beneficiaries:', error);
          setSyncStatus('Failed to fetch data');
        }
      } else {
        const offlineData = await db.beneficiaries.toArray();
        setBeneficiaries(offlineData);
        setSyncStatus('Offline mode: Showing local data');
      }
    };

    fetchBeneficiaries();

    const handleOnline = () => {
      setIsOnline(true);
      fetchBeneficiaries(); // Trigger sync and fetch on online
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * Open edit modal with beneficiary data.
   * @param {object} beneficiary - Beneficiary to edit
   */
  const handleEdit = (beneficiary) => {
    setEditBeneficiary(beneficiary);
    setEditFormData({
      name: beneficiary.name,
      age: beneficiary.age.toString(),
      location: beneficiary.location,
    });
  };

  /**
   * Handle edit form input changes.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  /**
   * Handle edit form submission.
   * @param {React.FormEvent} e - Form submit event
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = {
      id: editBeneficiary.id,
      name: editFormData.name,
      age: parseInt(editFormData.age),
      location: editFormData.location,
      updated_at: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await axios.put(`/api/beneficiaries/${editBeneficiary.id}/`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBeneficiaries(beneficiaries.map((b) => (b.id === editBeneficiary.id ? response.data : b)));
        await db.beneficiaries.put(response.data);
        setSyncStatus('Beneficiary updated successfully');
        setEditBeneficiary(null);
      } catch (error) {
        console.log(error)
        setSyncStatus('Failed to update beneficiary');
      }
    } else {
      await queueOperation('update', 'Beneficiary', data);
      setBeneficiaries(beneficiaries.map((b) => (b.id === editBeneficiary.id ? { ...b, ...data } : b)));
      await db.beneficiaries.put({ ...data });
      setSyncStatus('Operation queued for sync');
      setEditBeneficiary(null);
    }
  };

  /**
   * Open delete confirmation modal.
   * @param {object} beneficiary - Beneficiary to delete
   */
  const handleDelete = (beneficiary) => {
    setDeleteBeneficiary(beneficiary);
  };

  /**
   * Confirm deletion of beneficiary.
   */
  const confirmDelete = async () => {
    if (!deleteBeneficiary) return;

    const data = { id: deleteBeneficiary.id };
    if (isOnline) {
      try {
        await axios.delete(`/api/beneficiaries/${deleteBeneficiary.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBeneficiaries(beneficiaries.filter((b) => b.id !== deleteBeneficiary.id));
        await db.beneficiaries.delete(deleteBeneficiary.id);
        setSyncStatus('Beneficiary deleted successfully');
      } catch (error) {
           console.log(error)
        setSyncStatus('Failed to delete beneficiary');
      }
    } else {
      await queueOperation('delete', 'Beneficiary', data);
      setBeneficiaries(beneficiaries.filter((b) => b.id !== deleteBeneficiary.id));
      await db.beneficiaries.delete(deleteBeneficiary.id);
      setSyncStatus('Operation queued for sync');
    }
    setDeleteBeneficiary(null);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Beneficiaries</h1>
      <BeneficiaryForm />
      {syncStatus && (
        <div className={`alert ${isOnline ? 'alert-info' : 'alert-warning'} mb-3`}>
          {syncStatus}
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Location</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((beneficiary) => (
              <tr key={beneficiary.id}>
                <td>{beneficiary.name}</td>
                <td>{beneficiary.age}</td>
                <td>{beneficiary.location}</td>
                <td>{new Date(beneficiary.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    onClick={() => handleEdit(beneficiary)}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteModal"
                    onClick={() => handleDelete(beneficiary)}
                  >
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">Edit Beneficiary</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
                  <label htmlFor="editName" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editName"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editAge" className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    id="editAge"
                    name="age"
                    value={editFormData.age}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editLocation" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editLocation"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-2"></i>Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete {deleteBeneficiary?.name}?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={confirmDelete}
              >
                <i className="bi bi-trash me-2"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryList;
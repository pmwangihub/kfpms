import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * FundList component to display funds with Bootstrap styling and a form to add/edit funds.
 * @returns {JSX.Element} Fund table with form and modals
 */
const FundList = () => {
  const [funds, setFunds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: '',
  });
  const [editFund, setEditFund] = useState(null);
  const [editFormData, setEditFormData] = useState({ amount: '', source: '', description: '' });
  const [deleteFund, setDeleteFund] = useState(null);

  /**
   * Fetch funds and sync offline data when online.
   */
  useEffect(() => {
    const fetchFunds = async () => {
      if (isOnline) {
        try {
          const syncResult = await syncOfflineData();
          if (syncResult.success && syncResult.message !== 'No data to sync') {
            setSyncStatus(syncResult.message);
          }
          const response = await axios.get('/api/funds/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setFunds(response.data);
          await db.funds.clear();
          await db.funds.bulkPut(response.data);
          if (!syncResult.success) setSyncStatus(syncResult.message);
        } catch (error) {
          console.error('Error fetching funds:', error);
          setSyncStatus('Failed to fetch data');
        }
      } else {
        const offlineData = await db.funds.toArray();
        setFunds(offlineData);
        setSyncStatus('Offline mode: Showing local data');
      }
    };

    fetchFunds();

    const handleOnline = () => {
      setIsOnline(true);
      fetchFunds();
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
   * Handle form input changes for create.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for creating a fund.
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      amount: parseFloat(formData.amount),
      source: formData.source,
      description: formData.description,
      allocated_at: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await axios.post('/api/funds/', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFunds([...funds, response.data]);
        await db.funds.add(response.data);
        setSyncStatus('Fund created successfully');
        setFormData({ amount: '', source: '', description: '' });
      } catch (error) {
        console.log(error)
        setSyncStatus('Failed to create fund');
      }
    } else {
      await queueOperation('create', 'Fund', data);
      setFunds([...funds, { ...data, id: Date.now() }]);
      await db.funds.add({ ...data, id: Date.now() });
      setSyncStatus('Operation queued for sync');
      setFormData({ amount: '', source: '', description: '' });
    }
  };

  /**
   * Open edit modal with fund data.
   * @param {object} fund - Fund to edit
   */
  const handleEdit = (fund) => {
    setEditFund(fund);
    setEditFormData({
      amount: fund.amount.toString(),
      source: fund.source,
      description: fund.description || '',
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
      id: editFund.id,
      amount: parseFloat(editFormData.amount),
      source: editFormData.source,
      description: editFormData.description,
      allocated_at: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await axios.put(`/api/funds/${editFund.id}/`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFunds(funds.map((f) => (f.id === editFund.id ? response.data : f)));
        await db.funds.put(response.data);
        setSyncStatus('Fund updated successfully');
        setEditFund(null);
      } catch (error) {
        console.log(error)
        setSyncStatus('Failed to update fund');
      }
    } else {
      await queueOperation('update', 'Fund', data);
      setFunds(funds.map((f) => (f.id === editFund.id ? { ...f, ...data } : f)));
      await db.funds.put({ ...data });
      setSyncStatus('Operation queued for sync');
      setEditFund(null);
    }
  };

  /**
   * Open delete confirmation modal.
   * @param {object} fund - Fund to delete
   */
  const handleDelete = (fund) => {
    setDeleteFund(fund);
  };

  /**
   * Confirm deletion of fund.
   */
  const confirmDelete = async () => {
    if (!deleteFund) return;

    const data = { id: deleteFund.id };
    if (isOnline) {
      try {
        await axios.delete(`/api/funds/${deleteFund.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFunds(funds.filter((f) => f.id !== deleteFund.id));
        await db.funds.delete(deleteFund.id);
        setSyncStatus('Fund deleted successfully');
      } catch (error) {
        console.log(error)
        setSyncStatus('Failed to delete fund');
      }
    } else {
      await queueOperation('delete', 'Fund', data);
      setFunds(funds.filter((f) => f.id !== deleteFund.id));
      await db.funds.delete(deleteFund.id);
      setSyncStatus('Operation queued for sync');
    }
    setDeleteFund(null);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Funds</h1>
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Add Fund</h3>
          {syncStatus && (
            <div className={`alert ${isOnline ? 'alert-info' : 'alert-warning'} mb-3`}>
              {syncStatus}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="amount" className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="source" className="form-label">Source</label>
              <input
                type="text"
                className="form-control"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Add Fund
            </button>
          </form>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Source</th>
              <th>Description</th>
              <th>Allocated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id}>
                <td>{fund.amount}</td>
                <td>{fund.source}</td>
                <td>{fund.description || 'N/A'}</td>
                <td>{new Date(fund.allocated_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#editFundModal"
                    onClick={() => handleEdit(fund)}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteFundModal"
                    onClick={() => handleDelete(fund)}
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
        id="editFundModal"
        tabIndex="-1"
        aria-labelledby="editFundModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editFundModalLabel">Edit Fund</h5>
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
                  <label htmlFor="editAmount" className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="editAmount"
                    name="amount"
                    value={editFormData.amount}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editSource" className="form-label">Source</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editSource"
                    name="source"
                    value={editFormData.source}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editDescription" className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editDescription"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
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
        id="deleteFundModal"
        tabIndex="-1"
        aria-labelledby="deleteFundModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteFundModalLabel">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the fund from {deleteFund?.source}?
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

export default FundList;
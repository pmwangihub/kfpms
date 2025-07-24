import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * TransactionList component to display transactions with Bootstrap styling, pagination, and export.
 * @returns {JSX.Element} Transaction table with form, modals, pagination, and export
 */
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [formData, setFormData] = useState({
    fund: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });
  const [editTransaction, setEditTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fund: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });
  const [deleteTransaction, setDeleteTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  /**
   * Initialize Bootstrap tooltips
   */
  useEffect(() => {

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);

  /**
   * Fetch transactions and funds, sync offline data when online.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (isOnline) {
        try {
          const syncResult = await syncOfflineData();
          if (syncResult.success && syncResult.message !== 'No data to sync') {
            setSyncStatus(syncResult.message);
          }
          const [transResponse, fundResponse] = await Promise.all([
            axios.get('/api/transactions/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
            axios.get('/api/funds/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
          ]);
          setTransactions(transResponse.data);
          setFunds(fundResponse.data);
          await db.transactions.clear();
          await db.funds.clear();
          await db.transactions.bulkPut(transResponse.data);
          await db.funds.bulkPut(fundResponse.data);
          if (!syncResult.success) setSyncStatus(syncResult.message);
        } catch (error) {
          console.error('Error fetching data:', error?.response?.data || error.message);
          setSyncStatus('Failed to fetch data');
        }
      } else {
        const [offlineTrans, offlineFunds] = await Promise.all([
          db.transactions.toArray(),
          db.funds.toArray(),
        ]);
        setTransactions(offlineTrans);
        setFunds(offlineFunds);
        setSyncStatus('Offline mode: Showing local data');
      }
    };

    fetchData();

    const handleOnline = () => {
      setIsOnline(true);
      fetchData();
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
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for creating a transaction.
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedFund = funds.find((f) => f.id === parseInt(formData.fund));
    if (!selectedFund) {
      setSyncStatus('Invalid fund selected');
      return;
    }
    if (parseFloat(formData.amount) > selectedFund.amount) {
      setSyncStatus(`Transaction amount (${formData.amount}) exceeds fund amount (${selectedFund.amount})`);
      return;
    }
    const data = {
      fund: parseInt(formData.fund),
      amount: parseFloat(formData.amount),
      recipient: formData.recipient,
      status: formData.status,
      date: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await axios.post('/api/transactions/', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTransactions([...transactions, response.data]);
        await db.transactions.add(response.data);
        setSyncStatus('Transaction created successfully');
        setFormData({ fund: '', amount: '', recipient: '', status: 'pending' });
        setCurrentPage(1); // Reset to first page on new transaction
      } catch (error) {
        console.error('Create error:', error?.response?.data || error.message);
        setSyncStatus(
          `Failed to create transaction: ${error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          error.message
          }`
        );
      }
    } else {
      await queueOperation('create', 'Transaction', data);
      setTransactions([...transactions, { ...data, id: Date.now() }]);
      await db.transactions.add({ ...data, id: Date.now() });
      setSyncStatus('Operation queued for sync');
      setFormData({ fund: '', amount: '', recipient: '', status: 'pending' });
      setCurrentPage(1);
    }
  };

  /**
   * Open edit modal with transaction data.
   * @param {object} transaction - Transaction to edit
   */
  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setEditFormData({
      fund: transaction.fund?.toString() || '',
      amount: transaction.amount?.toString() || '',
      recipient: transaction.recipient || '',
      status: transaction.status || 'pending',
    });
  };

  /**
   * Handle edit form input changes.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input change event
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
    const selectedFund = funds.find((f) => f.id === parseInt(editFormData.fund));
    if (!selectedFund) {
      setSyncStatus('Invalid fund selected');
      return;
    }
    if (parseFloat(editFormData.amount) > selectedFund.amount) {
      setSyncStatus(`Transaction amount (${editFormData.amount}) exceeds fund amount (${selectedFund.amount})`);
      return;
    }
    const data = {
      id: editTransaction.id,
      fund: parseInt(editFormData.fund),
      amount: parseFloat(editFormData.amount),
      recipient: editFormData.recipient,
      status: editFormData.status,
      date: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await axios.put(`/api/transactions/${editTransaction.id}/`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTransactions(transactions.map((t) => (t.id === editTransaction.id ? response.data : t)));
        await db.transactions.put(response.data);
        setSyncStatus('Transaction updated successfully');
        setEditTransaction(null);
      } catch (error) {
        console.error('Update error:', error?.response?.data || error.message);
        setSyncStatus(
          `Failed to update transaction: ${error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.fund?.[0] ||
          error.message
          }`
        );
      }
    } else {
      await queueOperation('update', 'Transaction', data);
      setTransactions(transactions.map((t) => (t.id === editTransaction.id ? { ...t, ...data } : t)));
      await db.transactions.put({ ...data });
      setSyncStatus('Operation queued for sync');
      setEditTransaction(null);
    }
  };

  /**
   * Open delete confirmation modal.
   * @param {object} transaction - Transaction to delete
   */
  const handleDelete = (transaction) => {
    setDeleteTransaction(transaction);
  };

  /**
   * Confirm deletion of transaction.
   */
  const confirmDelete = async () => {
    if (!deleteTransaction) return;

    const data = { id: deleteTransaction.id };
    if (isOnline) {
      try {
        await axios.delete(`/api/transactions/${deleteTransaction.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTransactions(transactions.filter((t) => t.id !== deleteTransaction.id));
        await db.transactions.delete(deleteTransaction.id);
        setSyncStatus('Transaction deleted successfully');
        setCurrentPage(1); // Reset to first page if necessary
      } catch (error) {
        console.error('Delete error:', error?.response?.data || error.message);
        setSyncStatus(
          `Failed to delete transaction: ${error?.response?.data?.detail || error.message
          }`
        );
      }
    } else {
      await queueOperation('delete', 'Transaction', data);
      setTransactions(transactions.filter((t) => t.id !== deleteTransaction.id));
      await db.transactions.delete(deleteTransaction.id);
      setSyncStatus('Operation queued for sync');
      setCurrentPage(1);
    }
    setDeleteTransaction(null);
  };

  /**
   * Export transactions to CSV.
   */
  const exportToCSV = () => {
    const headers = ['Fund,Amount,Recipient,Status,Date'];
    const rows = transactions.map((t) => {
      const fundSource = funds.find((f) => f.id === t.fund)?.source || 'N/A';
      return `${fundSource},${t.amount},${t.recipient},${t.status},${new Date(t.date).toLocaleDateString()}`;
    });
    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.csv';
    link.click();
  };

  /**
   * Handle pagination.
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Transactions</h1>
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Add Transaction</h3>
          {syncStatus && (
            <div className={`alert ${isOnline ? 'alert-info' : 'alert-warning'} mb-3`}>
              {syncStatus}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fund" className="form-label">Fund</label>
              <select
                className="form-select"
                id="fund"
                name="fund"
                value={formData.fund}
                onChange={handleChange}
                required
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Select the funding source for the transaction"
              >
                <option value="">Select Fund</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.source} ({fund.amount})
                  </option>
                ))}
              </select>
            </div>
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
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Enter the transaction amount"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="recipient" className="form-label">Recipient</label>
              <input
                type="text"
                className="form-control"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                required
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Enter the recipient's name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                className="form-select"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Select the transaction status"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Add Transaction
            </button>
          </form>
        </div>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={exportToCSV}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Download transactions as CSV"
        >
          <i className="bi bi-download me-2"></i>Export to CSV
        </button>
        <div>
          <span className="me-2">Page {currentPage} of {totalPages}</span>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Fund</th>
              <th>Amount</th>
              <th>Recipient</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{funds.find((f) => f.id === transaction.fund)?.source || 'N/A'}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.recipient}</td>
                <td>{transaction.status}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#editTransactionModal"
                    onClick={() => handleEdit(transaction)}
                    data-bs-placement="top"
                    title="Edit this transaction"
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteTransactionModal"
                    onClick={() => handleDelete(transaction)}
                    data-bs-placement="top"
                    title="Delete this transaction"
                  >
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav aria-label="Transaction pagination">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => paginate(currentPage - 1)}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => paginate(page)}>
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* Edit Modal */}
      <div
        className="modal fade"
        id="editTransactionModal"
        tabIndex="-1"
        aria-labelledby="editTransactionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editTransactionModalLabel">Edit Transaction</h5>
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
                  <label htmlFor="editFund" className="form-label">Fund</label>
                  <select
                    className="form-select"
                    id="editFund"
                    name="fund"
                    value={editFormData.fund}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Fund</option>
                    {funds.map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        {fund.source} ({fund.amount})
                      </option>
                    ))}
                  </select>
                </div>
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
                  <label htmlFor="editRecipient" className="form-label">Recipient</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editRecipient"
                    name="recipient"
                    value={editFormData.recipient}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editStatus" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="editStatus"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
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
        id="deleteTransactionModal"
        tabIndex="-1"
        aria-labelledby="deleteTransactionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteTransactionModalLabel">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the transaction for {deleteTransaction?.recipient}?
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

export default TransactionList;
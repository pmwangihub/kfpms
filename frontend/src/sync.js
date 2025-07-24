import { db } from './db';
import axios from 'axios';

/**
 * Queues an operation for later synchronization with the server.
 * 
 * @param {string} operation - The operation type ('create', 'update', 'delete').
 * @param {string} model - The model name ('Transaction', 'Fund', 'Beneficiary').
 * @param {object} data - The data to sync.
 * @returns {Promise<void>} Resolves when the operation is queued.
 */
export const queueOperation = async (operation, model, data) => {
  // Store operation in IndexedDB with a temporary ID and timestamp
  await db.syncQueue.add({
    id: Date.now(), // Temporary local ID to avoid conflicts
    operation,
    model,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Synchronizes offline data with the server.
 * 
 * Processes queued operations in timestamp order, handling create, update, and delete actions.
 * Detects and skips duplicate IDs to prevent conflicts.
 * 
 * @returns {Promise<{success: boolean, message: string}>} Sync result with status and message.
 */
export const syncOfflineData = async () => {
  // Fetch all queued operations
  const operations = await db.syncQueue.toArray();
  if (operations.length === 0) {
    return { success: true, message: 'No data to sync' };
  }

  const results = [];
  const serverIds = new Set(); // Track server-assigned IDs to detect conflicts

  try {
    // Sort operations by timestamp to process older changes first
    for (const op of operations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))) {
      const { id, operation, model, data } = op;
      let response;

      try {
        if (operation === 'create') {
          // Send create request to server
          response = await axios.post(`/api/${model.toLowerCase()}s/`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          serverIds.add(response.data.id);
          // Replace temporary ID with server ID in local DB
          await db[model.toLowerCase() + 's'].delete(id);
          await db[model.toLowerCase() + 's'].add(response.data);
        } else if (operation === 'update') {
          // Skip if ID already processed to avoid conflicts
          if (serverIds.has(data.id)) {
            results.push({ status: 'skipped', id, error: 'Duplicate ID detected, skipping update' });
            continue;
          }
          // Send update request
          response = await axios.put(`/api/${model.toLowerCase()}s/${data.id}/`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          await db[model.toLowerCase() + 's'].put(response.data);
        } else if (operation === 'delete') {
          // Skip if ID already processed
          if (serverIds.has(data.id)) {
            results.push({ status: 'skipped', id, error: 'Duplicate ID detected, skipping delete' });
            continue;
          }
          // Send delete request
          await axios.delete(`/api/${model.toLowerCase()}s/${data.id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          await db[model.toLowerCase() + 's'].delete(data.id);
        }
        results.push({ status: 'success', id });
        // Remove synced operation from queue
        await db.syncQueue.delete(id);
      } catch (error) {
        // Log and store errors for failed operations
        results.push({ status: 'error', id, error: error?.response?.data || error.message });
      }
    }
    // Return sync result
    return {
      success: results.every((r) => r.status === 'success'),
      message: results.some((r) => r.status === 'error')
        ? `Sync completed with errors: ${results.filter((r) => r.status === 'error').map((r) => r.error).join(', ')}`
        : 'Sync completed successfully',
    };
  } catch (error) {
    return { success: false, message: `Sync failed: ${error.message}` };
  }
};
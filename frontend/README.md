# FIRST STEP: Initialize Vite with React and ADD Basic components

We’ll cover:
1. **Initialize Vite with React (JSX)**
2. **Integrate Bootstrap 5 and Bootstrap Icons via CDN**
3. **Set Up Dexie.js for Offline Storage**
4. **Create a Login Component**
5. **Create a Beneficiary List Component with Sync Button**
6. **Test the Frontend**

This will establish a functional, Bootstrap-styled frontend with authentication and offline support. Let’s get started!

---

### Step 1: Initialize Vite with React (JSX)

#### Objective
Create a new Vite project with the React JavaScript template in the `frontend` directory.

#### Instructions
1. Remove the existing `frontend` contents to start fresh (optional, if you want a clean slate).
2. Initialize a Vite project with the `react` template (JavaScript/JSX).
3. Verify the setup.

#### Commands
```bash
cd C:\Users\peter\Desktop\KFPMS
# Optional: Remove existing frontend contents (backup if needed)
rm -rf frontend/*
cd frontend
npm create vite@latest . -- --template react
npm install
```

**Comments**:
- Uses the `react` template for JavaScript/JSX (not TypeScript).
- Creates the project in the existing `frontend` folder with `.`.
- Installs Vite and React dependencies.

---

### Step 2: Integrate Bootstrap 5 and Bootstrap Icons via CDN

#### Objective
Add Bootstrap 5 and Bootstrap Icons using CDN links for styling, avoiding npm packages.

#### Code (`frontend/index.html`)
Update the `index.html` to include Bootstrap 5 and Bootstrap Icons CDNs:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kwale Feeding Program Management System</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <!-- Bootstrap Icons CDN -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    />
  </head>
  <body>
    <div id="root"></div>
    <!-- Bootstrap 5 JS CDN (includes Popper.js) -->
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
      crossorigin="anonymous"
    ></script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Comments**:
- Added Bootstrap 5 CSS and JS CDNs (v5.3.3) for styling and interactivity.
- Included Bootstrap Icons CDN (v1.11.3) for icon support.
- Placed CDNs in `index.html` to load globally, avoiding npm dependencies.

---

### Step 3: Install Dependencies

#### Objective
Install necessary packages for API communication, routing, and offline storage.

#### Commands
```bash
cd C:\Users\peter\Desktop\KFPMS\frontend
npm install axios react-router-dom dexie
```

**Dependencies**:
- `axios`: For API requests to the Django backend.
- `react-router-dom`: For client-side routing.
- `dexie`: For IndexedDB-based offline storage.

---

### Step 4: Configure Vite for Backend Communication

#### Objective
Set up Vite to proxy API requests to the Django backend (`http://localhost:8000`).

#### Code (`frontend/vite.config.js`)
```javascript
/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Django backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

**Comments**:
- Configures Vite to run on port 5173.
- Proxies `/api` requests to the Django backend, matching `CORS_ALLOWED_ORIGINS` in `settings.py`.
- Uses JSDoc for documentation, aligning with JSX preference.

---

### Step 5: Set Up Dexie.js for Offline Storage

#### Objective
Create a Dexie.js database to store `Beneficiary`, `Fund`, `Transaction`, and `SyncQueue` data locally.

#### Code (`frontend/src/db.js`)
```javascript
import Dexie from 'dexie';

/**
 * Dexie database for offline storage in KFPMS.
 * @class
 */
class KFPMS_Db extends Dexie {
  /**
   * @type {import('dexie').Table} Beneficiaries table
   */
  beneficiaries;
  /**
   * @type {import('dexie').Table} Funds table
   */
  funds;
  /**
   * @type {import('dexie').Table} Transactions table
   */
  transactions;
  /**
   * @type {import('dexie').Table} Sync queue table
   */
  syncQueue;

  constructor() {
    super('KFPMS_DB');
    this.version(1).stores({
      beneficiaries: '++id,name,age,location,created_at,updated_at',
      funds: '++id,amount,source,allocated_at,description',
      transactions: '++id,fund_id,amount,recipient,date,status',
      syncQueue: '++id,action,model_name,timestamp',
    });
  }
}

export const db = new KFPMS_Db();
```

**Comments**:
- Defined a `KFPMS_Db` class with tables for `beneficiaries`, `funds`, `transactions`, and `syncQueue`.
- Used `++id` for auto-incrementing IDs in IndexedDB.
- Added JSDoc comments for clarity, avoiding TypeScript since you prefer JSX.

---

### Step 6: Create a Login Component

#### Objective
Build a Bootstrap-styled login form to authenticate users and store the JWT token.

#### Code (`frontend/src/components/Login.jsx`)
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Login component for user authentication.
 * @returns {JSX.Element} Login form
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Handle login form submission.
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/token/', { username, password });
      localStorage.setItem('token', response.data.access);
      setError('');
      navigate('/beneficiaries');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login to KFPMS</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
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
```

**Comments**:
- Created a Bootstrap-styled login form with a centered card.
- Used `axios` to request a JWT token from `/api/token/`.
- Stored the token in `localStorage` and navigated to `/beneficiaries` on success.
- Included Bootstrap Icons (`bi-box-arrow-in-right`) for the login button.
- Added JSDoc for documentation.

---

### Step 7: Create Beneficiary List Component with Sync Button

#### Objective
Build a Bootstrap-styled component to display beneficiaries, fetch data from the backend or IndexedDB, and include a sync button.

#### Code (`frontend/src/components/BeneficiaryList.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { syncOfflineData } from '../sync';

/**
 * BeneficiaryList component to display beneficiaries with Bootstrap styling.
 * @returns {JSX.Element} Beneficiary table with sync button
 */
const BeneficiaryList = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');

  /**
   * Fetch beneficiaries from API or IndexedDB based on online status.
   */
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (isOnline) {
        try {
          const response = await axios.get('/api/beneficiaries/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setBeneficiaries(response.data);
          // Save to IndexedDB
          await db.beneficiaries.clear();
          await db.beneficiaries.bulkPut(response.data);
          setSyncStatus('');
        } catch (error) {
          console.error('Error fetching beneficiaries:', error);
          setSyncStatus('Failed to fetch data');
        }
      } else {
        // Load from IndexedDB
        const offlineData = await db.beneficiaries.toArray();
        setBeneficiaries(offlineData);
        setSyncStatus('Offline mode: Showing local data');
      }
    };

    fetchBeneficiaries();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * Trigger manual sync of offline data.
   */
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    try {
      await syncOfflineData();
      setSyncStatus('Sync completed successfully');
      // Refresh data
      const response = await axios.get('/api/beneficiaries/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBeneficiaries(response.data);
      await db.beneficiaries.clear();
      await db.beneficiaries.bulkPut(response.data);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Sync failed');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Beneficiaries</h1>
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
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
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((beneficiary) => (
              <tr key={beneficiary.id}>
                <td>{beneficiary.name}</td>
                <td>{beneficiary.age}</td>
                <td>{beneficiary.location}</td>
                <td>{new Date(beneficiary.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BeneficiaryList;
```

**Comments**:
- Used Bootstrap classes (`table-striped`, `btn-primary`) for styling.
- Added a sync button with Bootstrap Icons (`bi-arrow-repeat`).
- Fetched data from `/api/beneficiaries/` when online, or IndexedDB when offline.
- Included `syncStatus` for user feedback.
- Used JSDoc for documentation.

---

### Step 8: Implement Sync Logic

#### Objective
Provide functions to queue offline operations and sync them with `/api/sync/`.

#### Code (`frontend/src/sync.js`)
```javascript
import axios from 'axios';
import { db } from './db';

/**
 * Sync offline changes with the backend when online.
 * @returns {Promise<void>}
 */
export const syncOfflineData = async () => {
  if (!navigator.onLine) {
    console.log('Offline: Cannot sync');
    return;
  }

  try {
    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) {
      console.log('No data to sync');
      return;
    }

    const response = await axios.post('/api/sync/', queue, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.status === 200) {
      const results = response.data.results;
      for (const result of results) {
        if (result.status === 'success') {
          await db.syncQueue.delete(result.entry.id);
        } else {
          console.error('Sync error:', result.error);
        }
      }
      console.log('Sync completed:', results);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

/**
 * Queue an offline operation for later sync.
 * @param {'create' | 'update' | 'delete'} action - The action to perform
 * @param {'Beneficiary' | 'Fund' | 'Transaction'} modelName - The model name
 * @param {object} data - The data to queue
 * @returns {Promise<void>}
 */
export const queueOperation = async (action, modelName, data) => {
  await db.syncQueue.add({
    action,
    model_name: modelName,
    data,
    timestamp: new Date().toISOString(),
  });
};
```

**Comments**:
- Defined `syncOfflineData` to send queued operations to `/api/sync/`.
- Created `queueOperation` to store offline changes in `syncQueue`.
- Used JSDoc for documentation, keeping it lightweight for JSX.

---

### Step 9: Update App with Routing

#### Objective
Set up routing to include `Login` and `BeneficiaryList` components.

#### Code (`frontend/src/App.jsx`)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import BeneficiaryList from './components/BeneficiaryList';
import './App.css';

/**
 * Main App component with routing.
 * @returns {JSX.Element} App with routes
 */
const App = () => {
  return (
    <Router>
      <div className="container-fluid">
        <h1 className="text-center my-4">Kwale Feeding Program Management System</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/beneficiaries" element={<BeneficiaryList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
```

**Comments**:
- Used `react-router-dom` for routing.
- Added Bootstrap classes (`container-fluid`, `text-center`) for layout.
- Included JSDoc for documentation.

---

### Step 10: Testing the Frontend

#### Instructions
1. **Start Django Backend**:
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\backend
   python manage.py runserver
   ```
2. **Start Vite Server**:
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\frontend
   npm run dev
   ```
3. **Test Login**:
   - Visit `http://localhost:5173/`.
   - Log in with `username: peter`, `password: 1234`.
   - Verify redirection to `/beneficiaries` and display of beneficiaries (if any exist from previous tests).
4. **Test Offline Mode**:
   - Disconnect internet, reload `/beneficiaries`, and confirm data loads from IndexedDB.
   - OR simulate offline from developer tools in the browser under Network Tab
   - Queue an operation (via console for now):
     ```javascript
        window.queueOperation('create', 'Beneficiary', {
          name: 'Offline User',
          age: 30,
          location: 'Msambweni',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
     ```
   - Verify the queued operation:
      ```javascript
      window.db.syncQueue.toArray().then(queue => console.log(queue));
      ```
   - Go Online and Sync:
   - Set Network to Online in DevTools.
  - On /beneficiaries, click the “Sync Offline Data” button, or run in the console:
      ```javascript
      window.syncOfflineData().then(() => console.log('Sync done'));
      ```
  - Verify the queue is empty:
     ```javascript
      window.db.syncQueue.toArray().then(queue => console.log(queue));
      ```
   - Check the Django admin (`/admin/api/beneficiary/`) and Notice `'Offline User'` has been added

---

### Updated Folder Structure
```
C:\Users\peter\Desktop\KFPMS
├───backend
│   ├───api
│   │   ├───management
│   │   │   ├───commands
│   │   │   │   ├───__init__.py
│   │   │   │   ├───populate_test_data.py
│   │   │   │   ├───setup_groups.py
│   │   ├───migrations
│   │   │   └───__pycache__
│   │   ├───__pycache__
│   │   ├───__init__.py
│   │   ├───admin.py
│   │   ├───models.py
│   │   ├───permissions.py
│   │   ├───serializers.py
│   │   ├───urls.py
│   │   ├───views.py
│   ├───kfpms_backend
│   │   ├───__pycache__
│   │   ├───__init__.py
│   │   ├───settings.py
│   │   ├───urls.py
│   │   ├───wsgi.py
│   ├───venv
│   ├───manage.py
│   ├───db.sqlite3
│   ├───requirements.txt
└───frontend
    ├───src
    │   ├───components
    │   │   ├───Login.jsx
    │   │   ├───BeneficiaryList.jsx
    │   ├───db.js
    │   ├───sync.js
    │   ├───App.jsx
    │   ├───App.css
    │   ├───main.jsx
    │   ├───index.css
    ├───public
    ├───vite.config.js
    ├───index.html
    ├───package.json
```


# SECOND STEP: Advancing React application


## Advancing Plan
1. **Create `FundList` Component**: Display funds in a Bootstrap table with a form to create funds.
2. **Create `TransactionList` Component**: Display transactions with a form to create transactions.
3. **Add Edit Functionality**: Use Bootstrap modals for editing beneficiaries in `BeneficiaryList`.
4. **Update Navbar**: Add links for `Funds` and `Transactions`.
5. **Test Everything**: Ensure online/offline functionality works for all components.


### Step 1: Create `FundList` Component with Form

#### Objective
Build a `FundList` component to display funds and a form to create new funds, supporting online and offline modes.

#### Code (`frontend/src/components/FundList.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * FundList component to display funds with Bootstrap styling and a form to add funds.
 * @returns {JSX.Element} Fund table with sync button and form
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

  /**
   * Fetch funds from API or IndexedDB based on online status.
   */
  useEffect(() => {
    const fetchFunds = async () => {
      if (isOnline) {
        try {
          const response = await axios.get('/api/funds/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setFunds(response.data);
          await db.funds.clear();
          await db.funds.bulkPut(response.data);
          setSyncStatus('');
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

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * Handle form input changes.
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
        setSyncStatus('Failed to create fund');
      }
    } else {
      await queueOperation('create', 'Fund', data);
      setFunds([...funds, { ...data, id: Date.now() }]); // Temporary ID
      await db.funds.add({ ...data, id: Date.now() });
      setSyncStatus('Operation queued for sync');
      setFormData({ amount: '', source: '', description: '' });
    }
  };

  /**
   * Trigger manual sync of offline data.
   */
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    try {
      await syncOfflineData();
      setSyncStatus('Sync completed successfully');
      const response = await axios.get('/api/funds/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFunds(response.data);
      await db.funds.clear();
      await db.funds.bulkPut(response.data);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Sync failed');
    }
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
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Source</th>
              <th>Description</th>
              <th>Allocated At</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id}>
                <td>{fund.amount}</td>
                <td>{fund.source}</td>
                <td>{fund.description || 'N/A'}</td>
                <td>{new Date(fund.allocated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FundList;
```

**Comments**:
- Displays funds in a Bootstrap table.
- Includes a form for creating funds, with online POST or offline queuing.
- Uses temporary IDs (`Date.now()`) for offline entries, updated on sync.
- Includes JSDoc and Bootstrap Icons (`bi-plus-circle`, `bi-arrow-repeat`).

---

### Step 2: Create `TransactionList` Component with Form

#### Objective
Build a `TransactionList` component to display transactions and a form to create transactions, supporting online/offline modes.

#### Code (`frontend/src/components/TransactionList.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * TransactionList component to display transactions with Bootstrap styling and a form to add transactions.
 * @returns {JSX.Element} Transaction table with sync button and form
 */
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [formData, setFormData] = useState({
    fund_id: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });

  /**
   * Fetch transactions and funds from API or IndexedDB.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (isOnline) {
        try {
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
          await db.transactions.bulkPut(transResponse.data);
          await db.funds.clear();
          await db.funds.bulkPut(fundResponse.data);
          setSyncStatus('');
        } catch (error) {
          console.error('Error fetching data:', error);
          setSyncStatus('Failed to fetch data');
        }
      } else {
        const offlineTrans = await db.transactions.toArray();
        const offlineFunds = await db.funds.toArray();
        setTransactions(offlineTrans);
        setFunds(offlineFunds);
        setSyncStatus('Offline mode: Showing local data');
      }
    };

    fetchData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * Handle form input changes.
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
    const data = {
      fund_id: parseInt(formData.fund_id),
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
        setFormData({ fund_id: '', amount: '', recipient: '', status: 'pending' });
      } catch (error) {
        setSyncStatus('Failed to create transaction');
      }
    } else {
      await queueOperation('create', 'Transaction', data);
      setTransactions([...transactions, { ...data, id: Date.now() }]);
      await db.transactions.add({ ...data, id: Date.now() });
      setSyncStatus('Operation queued for sync');
      setFormData({ fund_id: '', amount: '', recipient: '', status: 'pending' });
    }
  };

  /**
   * Trigger manual sync of offline data.
   */
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    try {
      await syncOfflineData();
      setSyncStatus('Sync completed successfully');
      const response = await axios.get('/api/transactions/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTransactions(response.data);
      await db.transactions.clear();
      await db.transactions.bulkPut(response.data);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Sync failed');
    }
  };

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
              <label htmlFor="fund_id" className="form-label">Fund</label>
              <select
                className="form-select"
                id="fund_id"
                name="fund_id"
                value={formData.fund_id}
                onChange={handleChange}
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
              <label htmlFor="recipient" className="form-label">Recipient</label>
              <input
                type="text"
                className="form-control"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                required
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
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Fund</th>
              <th>Amount</th>
              <th>Recipient</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{funds.find((f) => f.id === transaction.fund_id)?.source || 'N/A'}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.recipient}</td>
                <td>{transaction.status}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
```

**Comments**:
- Displays transactions with a form to select a fund and create transactions.
- Fetches funds for the dropdown and handles online/offline modes.
- Uses Bootstrap Icons and JSDoc.

---

### Step 3: Add Edit Functionality with Bootstrap Modal

#### Objective
Add a modal to `BeneficiaryList` for editing beneficiaries.

#### Code (`frontend/src/components/BeneficiaryList.jsx`)
Update to include an edit modal:
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';
import BeneficiaryForm from './BeneficiaryForm';

/**
 * BeneficiaryList component to display beneficiaries with Bootstrap styling.
 * @returns {JSX.Element} Beneficiary table with sync button and form
 */
const BeneficiaryList = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [editBeneficiary, setEditBeneficiary] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', age: '', location: '' });

  /**
   * Fetch beneficiaries from API or IndexedDB based on online status.
   */
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (isOnline) {
        try {
          const response = await axios.get('/api/beneficiaries/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setBeneficiaries(response.data);
          await db.beneficiaries.clear();
          await db.beneficiaries.bulkPut(response.data);
          setSyncStatus('');
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

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * Trigger manual sync of offline data.
   */
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    try {
      await syncOfflineData();
      setSyncStatus('Sync completed successfully');
      const response = await axios.get('/api/beneficiaries/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBeneficiaries(response.data);
      await db.beneficiaries.clear();
      await db.beneficiaries.bulkPut(response.data);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Sync failed');
    }
  };

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

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Beneficiaries</h1>
      <BeneficiaryForm />
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
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
                    className="btn btn-sm btn-outline-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    onClick={() => handleEdit(beneficiary)}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
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
    </div>
  );
};

export default BeneficiaryList;
```

**Comments**:
- Added an “Edit” button and Bootstrap modal for editing beneficiaries.
- Supports online PUT requests or offline queuing with temporary updates.
- Uses Bootstrap Icons (`bi-pencil`, `bi-save`) and JSDoc.

---

### Step 4: Update Navbar

#### Objective
Add links for `Funds` and `Transactions` to the navbar.

#### Code (`frontend/src/components/Navbar.jsx`)
```javascript
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
        <Link className="navbar-brand" to="/beneficiaries">
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
```

**Comments**:
- Added links for `Funds` and `Transactions` with Bootstrap Icons.
- Kept logout functionality and JSDoc.

---

### Step 5: Update App with New Routes

#### Code (`frontend/src/App.jsx`)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import BeneficiaryList from './components/BeneficiaryList';
import FundList from './components/FundList';
import TransactionList from './components/TransactionList';
import Navbar from './components/Navbar';
import './App.css';

/**
 * Main App component with routing.
 * @returns {JSX.Element} App with routes
 */
const App = () => {
  return (
    <Router>
      <div className="container-fluid">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/beneficiaries" element={<BeneficiaryList />} />
          <Route path="/funds" element={<FundList />} />
          <Route path="/transactions" element={<TransactionList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
```

**Comments**:
- Added routes for `/funds` and `/transactions`.
- Kept Bootstrap `container-fluid` and JSDoc.

---

### Step 6: Testing

#### Instructions
1. **Start Servers** (at 12:42 PM EAT, July 19, 2025):
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\backend
   python manage.py runserver
   ```
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\frontend
   npm run dev
   ```

2. **Test Navigation**:
   - Visit `http://localhost:5173/`, log in with `peter`/`1234`.
   - Use the navbar to navigate to `/beneficiaries`, `/funds`, `/transactions`.

3. **Test Beneficiary CRUD**:
   - On `/beneficiaries`, add a beneficiary (online and offline).
   - Edit a beneficiary using the modal.
   - Sync offline changes and verify in Django admin (`/admin/api/beneficiary/`).

4. **Test Fund and Transaction CRUD**:
   - On `/funds`, add a fund (e.g., Amount: 5000, Source: “NGO Test”).
   - On `/transactions`, add a transaction (select a fund).
   - Test offline mode and sync for both.

5. **Console Test**:
   - Queue an offline fund:
     ```javascript
     window.queueOperation('create', 'Fund', {
       amount: 10000,
       source: 'Test Donor',
       description: 'Offline fund',
       allocated_at: new Date().toISOString(),
     });
     ```
   - Verify and sync as before.

---

### Updated Folder Structure
```
C:\Users\peter\Desktop\KFPMS
├───backend
│   ├───api
│   │   ├───management
│   │   │   ├───commands
│   │   │   │   ├───__init__.py
│   │   │   │   ├───populate_test_data.py
│   │   │   │   ├───setup_groups.py
│   │   ├───migrations
│   │   │   └───__pycache__
│   │   ├───__pycache__
│   │   ├───__init__.py
│   │   ├───admin.py
│   │   ├───models.py
│   │   ├───permissions.py
│   │   ├───serializers.py
│   │   ├───urls.py
│   │   ├───views.py
│   ├───kfpms_backend
│   │   ├───__pycache__
│   │   ├───__init__.py
│   │   ├───settings.py
│   │   ├───urls.py
│   │   ├───wsgi.py
│   ├───venv
│   ├───manage.py
│   ├───db.sqlite3
│   ├───requirements.txt
└───frontend
    ├───src
    │   ├───components
    │   │   ├───Login.jsx
    │   │   ├───BeneficiaryList.jsx
    │   │   ├───BeneficiaryForm.jsx
    │   │   ├───FundList.jsx
    │   │   ├───TransactionList.jsx
    │   │   ├───Navbar.jsx
    │   ├───db.js
    │   ├───sync.js
    │   ├───App.jsx
    │   ├───App.css
    │   ├───main.jsx
    │   ├───index.css
    ├───public
    ├───vite.config.js
    ├───index.html
    ├───package.json
```

---

# THIRD STEP: Add Delete Functionality with Confirmation Modals

We focus on:

1. **Adding Delete Functionality**: Implement delete buttons with Bootstrap confirmation modals for `BeneficiaryList`, `FundList`, and `TransactionList` to complete the CRUD operations, supporting both online and offline modes.
2. **Creating a Dashboard**: Add a `/dashboard` route with Bootstrap cards to display summary statistics (e.g., total beneficiaries, funds, and transactions).
3. **Testing**: Ensure all CRUD operations and the dashboard work online and offline.

This will round out the core functionality while keeping the UI clean and functional with **JSX**, **Bootstrap 5** (via CDN), and **Bootstrap Icons**. I’ll keep the code concise, with **JSDoc** and **comments**, and align with your project structure.

---

### Step 1: Add Delete Functionality with Confirmation Modals

#### Objective
Add delete buttons to `BeneficiaryList`, `FundList`, and `TransactionList`, using Bootstrap modals for confirmation, with support for online DELETE requests or offline queuing.

#### Update `BeneficiaryList` (`frontend/src/components/BeneficiaryList.jsx`)
Add a delete button and confirmation modal:
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';
import BeneficiaryForm from './BeneficiaryForm';

/**
 * BeneficiaryList component to display beneficiaries with Bootstrap styling.
 * @returns {JSX.Element} Beneficiary table with sync button, form, and modals
 */
const BeneficiaryList = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [editBeneficiary, setEditBeneficiary] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', age: '', location: '' });
  const [deleteBeneficiary, setDeleteBeneficiary] = useState(null);

  /**
   * Fetch beneficiaries from API or IndexedDB based on online status.
   */
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (isOnline) {
        try {
          const response = await axios.get('/api/beneficiaries/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setBeneficiaries(response.data);
          await db.beneficiaries.clear();
          await db.beneficiaries.bulkPut(response.data);
          setSyncStatus('');
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

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * Trigger manual sync of offline data.
   */
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    try {
      await syncOfflineData();
      setSyncStatus('Sync completed successfully');
      const response = await axios.get('/api/beneficiaries/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBeneficiaries(response.data);
      await db.beneficiaries.clear();
      await db.beneficiaries.bulkPut(response.data);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Sync failed');
    }
  };

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
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
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
```

**Comments**:
- Added a delete button and Bootstrap confirmation modal.
- Supports online DELETE (`/api/beneficiaries/:id/`) or offline queuing with `queueOperation`.
- Uses Bootstrap Icons (`bi-trash`) and JSDoc.

#### Update `FundList` (`frontend/src/components/FundList.jsx`)
Add delete functionality (similar changes, summarized for brevity):
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * FundList component to display funds with Bootstrap styling and a form to add funds.
 * @returns {JSX.Element} Fund table with sync button, form, and delete modal
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
  const [deleteFund, setDeleteFund] = useState(null);

  // ... (fetchFunds, handleChange, handleSubmit, handleSync unchanged)

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
            {/* ... (form unchanged) */}
          </form>
        </div>
      </div>
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
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
```

**Comments**:
- Added delete button and modal for funds.
- Supports online/offline deletion with queuing.
- Uses unique modal ID (`deleteFundModal`) to avoid conflicts.

#### Update `TransactionList` (`frontend/src/components/TransactionList.jsx`)
Add delete functionality (summarized):
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * TransactionList component to display transactions with Bootstrap styling and a form to add transactions.
 * @returns {JSX.Element} Transaction table with sync button, form, and delete modal
 */
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [formData, setFormData] = useState({
    fund_id: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });
  const [deleteTransaction, setDeleteTransaction] = useState(null);

  // ... (fetchData, handleChange, handleSubmit, handleSync unchanged)

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
      } catch (error) {
        setSyncStatus('Failed to delete transaction');
      }
    } else {
      await queueOperation('delete', 'Transaction', data);
      setTransactions(transactions.filter((t) => t.id !== deleteTransaction.id));
      await db.transactions.delete(deleteTransaction.id);
      setSyncStatus('Operation queued for sync');
    }
    setDeleteTransaction(null);
  };

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
            {/* ... (form unchanged) */}
          </form>
        </div>
      </div>
      <button
        className="btn btn-primary mb-3"
        onClick={handleSync}
        disabled={!isOnline}
      >
        <i className="bi bi-arrow-repeat me-2"></i>Sync Offline Data
      </button>
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
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{funds.find((f) => f.id === transaction.fund_id)?.source || 'N/A'}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.recipient}</td>
                <td>{transaction.status}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteTransactionModal"
                    onClick={() => handleDelete(transaction)}
                  >
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
```

**Comments**:
- Added delete button and modal for transactions.
- Supports online/offline deletion with unique modal ID (`deleteTransactionModal`).

---

### Step 2: Create Dashboard

#### Objective
Add a `/dashboard` route with Bootstrap cards to display summary statistics (total beneficiaries, total funds, total transactions).

#### Code (`frontend/src/components/Dashboard.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';

/**
 * Dashboard component to display summary statistics with Bootstrap cards.
 * @returns {JSX.Element} Dashboard with summary cards
 */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalFunds: 0,
    totalTransactions: 0,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  /**
   * Fetch statistics from API or IndexedDB based on online status.
   */
  useEffect(() => {
    const fetchStats = async () => {
      if (isOnline) {
        try {
          const [benResponse, fundResponse, transResponse] = await Promise.all([
            axios.get('/api/beneficiaries/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
            axios.get('/api/funds/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
            axios.get('/api/transactions/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
          ]);
          const newStats = {
            totalBeneficiaries: benResponse.data.length,
            totalFunds: fundResponse.data.reduce((sum, f) => sum + parseFloat(f.amount), 0),
            totalTransactions: transResponse.data.length,
          };
          setStats(newStats);
          await db.beneficiaries.clear();
          await db.funds.clear();
          await db.transactions.clear();
          await db.beneficiaries.bulkPut(benResponse.data);
          await db.funds.bulkPut(fundResponse.data);
          await db.transactions.bulkPut(transResponse.data);
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      } else {
        const [beneficiaries, funds, transactions] = await Promise.all([
          db.beneficiaries.toArray(),
          db.funds.toArray(),
          db.transactions.toArray(),
        ]);
        setStats({
          totalBeneficiaries: beneficiaries.length,
          totalFunds: funds.reduce((sum, f) => sum + parseFloat(f.amount), 0),
          totalTransactions: transactions.length,
        });
      }
    };

    fetchStats();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people me-2"></i>Total Beneficiaries
              </h5>
              <p className="card-text display-4">{stats.totalBeneficiaries}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-wallet me-2"></i>Total Funds (KES)
              </h5>
              <p className="card-text display-4">{stats.totalFunds.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-receipt me-2"></i>Total Transactions
              </h5>
              <p className="card-text display-4">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

**Comments**:
- Displays total beneficiaries, funds (sum of amounts), and transactions in Bootstrap cards.
- Fetches data online or from IndexedDB offline.
- Uses Bootstrap Icons and JSDoc.

#### Update Navbar (`frontend/src/components/Navbar.jsx`)
Add dashboard link:
```javascript
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
```

**Comments**:
- Added `/dashboard` link with `bi-house` icon.
- Updated brand link to point to dashboard.

#### Update App (`frontend/src/App.jsx`)
Add dashboard route:
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import BeneficiaryList from './components/BeneficiaryList';
import FundList from './components/FundList';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import './App.css';

/**
 * Main App component with routing.
 * @returns {JSX.Element} App with routes
 */
const App = () => {
  return (
    <Router>
      <div className="container-fluid">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/beneficiaries" element={<BeneficiaryList />} />
          <Route path="/funds" element={<FundList />} />
          <Route path="/transactions" element={<TransactionList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
```

**Comments**:
- Added `/dashboard` route.
- Kept JSDoc and Bootstrap `container-fluid`.

---

### Step 3: Testing (at 1:03 PM EAT, July 19, 2025)

#### Instructions
1. **Start Servers**:
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\backend
   python manage.py runserver
   ```
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\frontend
   npm run dev
   ```

2. **Test Dashboard**:
   - Log in at `http://localhost:5173/` with `peter`/`1234`.
   - Navigate to `/dashboard` via navbar.
   - Verify stats (total beneficiaries, funds, transactions) display correctly.
   - Go offline (DevTools > Network > Offline) and confirm stats load from IndexedDB.

3. **Test Delete Functionality**:
   - On `/beneficiaries`, `/funds`, and `/transactions`, test deleting entries online and offline.
   - Use the confirmation modal to delete, then sync offline changes.
   - Verify in Django admin (`/admin/api/beneficiary/`, `/admin/api/fund/`, `/admin/api/transaction/`).

4. **Console Test**:
   - Queue a delete operation offline:
     ```javascript
     window.queueOperation('delete', 'Beneficiary', { id: 1 });
     window.db.syncQueue.toArray().then(queue => console.log(queue));
     ```
   - Go online, click “Sync Offline Data,” and verify.

---

### Updated Folder Structure
```
C:\Users\peter\Desktop\KFPMS
├───backend
│   ├───api
│   │   ├───management
│   │   │   ├───commands
│   │   │   │   ├───__init__.py
│   │   │   │   ├───populate_test_data.py
│   │   │   │   ├───setup_groups.py
│   │   ├───migrations
│   │   │   └───__pycache__
│   │   ├───__pycache__
│   │   ├───__init__.py
│   │   ├───admin.py
│   │   ├───models.py
│   │   ├───permissions.py
│   │   ├───serializers.py
│   │   ├───urls.py
│   │   ├───views.py
│   ├───kfpms_backend
│   │   ├───__pycache__
│   │   ├───__init__.py
│   │   ├───settings.py
│   │   ├───urls.py
│   │   ├───wsgi.py
│   ├───venv
│   ├───manage.py
│   ├───db.sqlite3
│   ├───requirements.txt
└───frontend
    ├───src
    │   ├───components
    │   │   ├───Login.jsx
    │   │   ├───BeneficiaryList.jsx
    │   │   ├───BeneficiaryForm.jsx
    │   │   ├───FundList.jsx
    │   │   ├───TransactionList.jsx
    │   │   ├───Dashboard.jsx
    │   │   ├───Navbar.jsx
    │   ├───db.js
    │   ├───sync.js
    │   ├───App.jsx
    │   ├───App.css
    │   ├───main.jsx
    │   ├───index.css
    ├───public
    ├───vite.config.js
    ├───index.html
    ├───package.json
```

---

# FOURTH STEP: Automation

We will focus on:

1. **Automatic Sync**: Implement automatic synchronization of offline data when the app detects an online status change, enhancing the offline experience.
2. **Edit Modals for Funds and Transactions**: Add edit functionality with Bootstrap modals for `FundList` and `TransactionList` to complete CRUD operations.
3. **Testing**: Ensure all components (Beneficiary, Fund, Transaction, Dashboard) work seamlessly online and offline.

### Step 1: Implement Automatic Sync

#### Objective
Modify `sync.js` and component `useEffect` hooks to automatically sync offline data when the app detects an online status change, removing the need for manual “Sync Offline Data” buttons.

#### Update `sync.js` (`frontend/src/sync.js`)
Ensure `syncOfflineData` is reusable and logs sync results:
```javascript
import axios from 'axios';
import { db } from './db';

/**
 * Sync offline changes with the backend when online.
 * @returns {Promise<void>}
 */
export const syncOfflineData = async () => {
  if (!navigator.onLine) {
    console.log('Offline: Cannot sync');
    return { success: false, message: 'Offline: Cannot sync' };
  }

  try {
    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) {
      console.log('No data to sync');
      return { success: true, message: 'No data to sync' };
    }

    const response = await axios.post('/api/sync/', queue, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.status === 200) {
      const results = response.data.results;
      for (const result of results) {
        if (result.status === 'success') {
          await db.syncQueue.delete(result.entry.id);
        } else {
          console.error('Sync error:', result.error);
        }
      }
      console.log('Sync completed:', results);
      return { success: true, message: 'Sync completed successfully', results };
    }
    return { success: false, message: 'Sync failed: Unexpected response' };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, message: `Sync failed: ${error.message}` };
  }
};

/**
 * Queue an offline operation for later sync.
 * @param {'create' | 'update' | 'delete'} action - The action to perform
 * @param {'Beneficiary' | 'Fund' | 'Transaction'} modelName - The model name
 * @param {object} data - The data to queue
 * @returns {Promise<void>}
 */
export const queueOperation = async (action, modelName, data) => {
  await db.syncQueue.add({
    action,
    model_name: modelName,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Expose for console testing (remove in production)
window.queueOperation = queueOperation;
window.syncOfflineData = syncOfflineData;
```

**Comments**:
- Updated `syncOfflineData` to return an object with `success` and `message` for better feedback.
- No changes to `queueOperation` or global exposure.

#### Update `BeneficiaryList` (`frontend/src/components/BeneficiaryList.jsx`)
Add automatic sync and remove manual sync button:
```javascript
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
```

**Comments**:
- Removed manual sync button; sync now happens automatically in `useEffect` when `isOnline` becomes true.
- Displays sync status via alerts.
- Kept edit and delete functionality unchanged.

#### Update `FundList` (`frontend/src/components/FundList.jsx`)
Apply similar changes (summarized):
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * FundList component to display funds with Bootstrap styling and a form to add funds.
 * @returns {JSX.Element} Fund table with form and delete modal
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

  // ... (handleChange, handleSubmit, handleDelete, confirmDelete unchanged)

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
            {/* ... (form unchanged) */}
          </form>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          {/* ... (table unchanged) */}
        </table>
      </div>
      {/* Delete Confirmation Modal (unchanged) */}
      <div
        className="modal fade"
        id="deleteFundModal"
        tabIndex="-1"
        aria-labelledby="deleteFundModalLabel"
        aria-hidden="true"
      >
        {/* ... (modal unchanged) */}
      </div>
    </div>
  );
};

export default FundList;
```

**Comments**:
- Added automatic sync in `useEffect`.
- Removed manual sync button.
- Kept form and delete modal unchanged.

#### Update `TransactionList` (`frontend/src/components/TransactionList.jsx`)
Apply similar changes (summarized):
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * TransactionList component to display transactions with Bootstrap styling and a form to add transactions.
 * @returns {JSX.Element} Transaction table with form and delete modal
 */
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [formData, setFormData] = useState({
    fund_id: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });
  const [deleteTransaction, setDeleteTransaction] = useState(null);

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
          console.error('Error fetching data:', error);
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

  // ... (handleChange, handleSubmit, handleDelete, confirmDelete unchanged)

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
            {/* ... (form unchanged) */}
          </form>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          {/* ... (table unchanged) */}
        </table>
      </div>
      {/* Delete Confirmation Modal (unchanged) */}
      <div
        className="modal fade"
        id="deleteTransactionModal"
        tabIndex="-1"
        aria-labelledby="deleteTransactionModalLabel"
        aria-hidden="true"
      >
        {/* ... (modal unchanged) */}
      </div>
    </div>
  );
};

export default TransactionList;
```

**Comments**:
- Added automatic sync in `useEffect`.
- Removed manual sync button.

#### Update `Dashboard` (`frontend/src/components/Dashboard.jsx`)
Apply automatic sync:
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { syncOfflineData } from '../sync';

/**
 * Dashboard component to display summary statistics with Bootstrap cards.
 * @returns {JSX.Element} Dashboard with summary cards
 */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalFunds: 0,
    totalTransactions: 0,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');

  /**
   * Fetch statistics and sync offline data when online.
   */
  useEffect(() => {
    const fetchStats = async () => {
      if (isOnline) {
        try {
          const syncResult = await syncOfflineData();
          if (syncResult.success && syncResult.message !== 'No data to sync') {
            setSyncStatus(syncResult.message);
          }
          const [benResponse, fundResponse, transResponse] = await Promise.all([
            axios.get('/api/beneficiaries/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
            axios.get('/api/funds/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
            axios.get('/api/transactions/', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
          ]);
          const newStats = {
            totalBeneficiaries: benResponse.data.length,
            totalFunds: fundResponse.data.reduce((sum, f) => sum + parseFloat(f.amount), 0),
            totalTransactions: transResponse.data.length,
          };
          setStats(newStats);
          await db.beneficiaries.clear();
          await db.funds.clear();
          await db.transactions.clear();
          await db.beneficiaries.bulkPut(benResponse.data);
          await db.funds.bulkPut(fundResponse.data);
          await db.transactions.bulkPut(transResponse.data);
          if (!syncResult.success) setSyncStatus(syncResult.message);
        } catch (error) {
          console.error('Error fetching stats:', error);
          setSyncStatus('Failed to fetch data');
        }
      } else {
        const [beneficiaries, funds, transactions] = await Promise.all([
          db.beneficiaries.toArray(),
          db.funds.toArray(),
          db.transactions.toArray(),
        ]);
        setStats({
          totalBeneficiaries: beneficiaries.length,
          totalFunds: funds.reduce((sum, f) => sum + parseFloat(f.amount), 0),
          totalTransactions: transactions.length,
        });
        setSyncStatus('Offline mode: Showing local data');
      }
    };

    fetchStats();

    const handleOnline = () => {
      setIsOnline(true);
      fetchStats();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      {syncStatus && (
        <div className={`alert ${isOnline ? 'alert-info' : 'alert-warning'} mb-3`}>
          {syncStatus}
        </div>
      )}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people me-2"></i>Total Beneficiaries
              </h5>
              <p className="card-text display-4">{stats.totalBeneficiaries}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-wallet me-2"></i>Total Funds (KES)
              </h5>
              <p className="card-text display-4">{stats.totalFunds.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-receipt me-2"></i>Total Transactions
              </h5>
              <p className="card-text display-4">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

**Comments**:
- Added automatic sync and status alerts.
- No manual sync button needed.

---

### Step 2: Add Edit Modals for Funds and Transactions

#### Update `FundList` (`frontend/src/components/FundList.jsx`)
Add edit modal:
```javascript
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
```

**Comments**:
- Added edit button and modal with unique ID (`editFundModal`).
- Supports online PUT or offline queuing for updates.
- Uses Bootstrap Icons (`bi-pencil`, `bi-save`).

#### Update `TransactionList` (`frontend/src/components/TransactionList.jsx`)
Add edit modal:
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { queueOperation, syncOfflineData } from '../sync';

/**
 * TransactionList component to display transactions with Bootstrap styling and a form to add/edit transactions.
 * @returns {JSX.Element} Transaction table with form and modals
 */
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');
  const [formData, setFormData] = useState({
    fund_id: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });
  const [editTransaction, setEditTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fund_id: '',
    amount: '',
    recipient: '',
    status: 'pending',
  });
  const [deleteTransaction, setDeleteTransaction] = useState(null);

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
          console.error('Error fetching data:', error);
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
    const data = {
      fund_id: parseInt(formData.fund_id),
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
        setFormData({ fund_id: '', amount: '', recipient: '', status: 'pending' });
      } catch (error) {
        setSyncStatus('Failed to create transaction');
      }
    } else {
      await queueOperation('create', 'Transaction', data);
      setTransactions([...transactions, { ...data, id: Date.now() }]);
      await db.transactions.add({ ...data, id: Date.now() });
      setSyncStatus('Operation queued for sync');
      setFormData({ fund_id: '', amount: '', recipient: '', status: 'pending' });
    }
  };

  /**
   * Open edit modal with transaction data.
   * @param {object} transaction - Transaction to edit
   */
  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setEditFormData({
      fund_id: transaction.fund_id.toString(),
      amount: transaction.amount.toString(),
      recipient: transaction.recipient,
      status: transaction.status,
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
    const data = {
      id: editTransaction.id,
      fund_id: parseInt(editFormData.fund_id),
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
        setSyncStatus('Failed to update transaction');
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
      } catch (error) {
        setSyncStatus('Failed to delete transaction');
      }
    } else {
      await queueOperation('delete', 'Transaction', data);
      setTransactions(transactions.filter((t) => t.id !== deleteTransaction.id));
      await db.transactions.delete(deleteTransaction.id);
      setSyncStatus('Operation queued for sync');
    }
    setDeleteTransaction(null);
  };

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
              <label htmlFor="fund_id" className="form-label">Fund</label>
              <select
                className="form-select"
                id="fund_id"
                name="fund_id"
                value={formData.fund_id}
                onChange={handleChange}
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
              <label htmlFor="recipient" className="form-label">Recipient</label>
              <input
                type="text"
                className="form-control"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                required
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
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{funds.find((f) => f.id === transaction.fund_id)?.source || 'N/A'}</td>
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
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteTransactionModal"
                    onClick={() => handleDelete(transaction)}
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
                  <label htmlFor="editFundId" className="form-label">Fund</label>
                  <select
                    className="form-select"
                    id="editFundId"
                    name="fund_id"
                    value={editFormData.fund_id}
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
```

**Comments**:
- Added edit button and modal with unique ID (`editTransactionModal`).
- Supports online PUT or offline queuing for updates.
- Uses Bootstrap Icons (`bi-pencil`, `bi-save`).

---

### Step 3: Testing (at 9:20 AM EAT, July 21, 2025)

#### Instructions
1. **Start Servers**:
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\backend
   python manage.py runserver
   ```
   ```bash
   cd C:\Users\peter\Desktop\KFPMS\frontend
   npm run dev
   ```

2. **Test Automatic Sync**:
   - Log in at `http://localhost:5173/` with `peter`/`1234`.
   - Go offline (DevTools > Network > Offline).
   - On `/beneficiaries`, add/edit/delete a beneficiary.
   - On `/funds`, add/edit/delete a fund.
   - On `/transactions`, add/edit/delete a transaction.
   - Verify queue in console:
     ```javascript
     window.db.syncQueue.toArray().then(queue => console.log(queue));
     ```
   - Go online (DevTools > Network > Online) and confirm automatic sync with updated data in tables and Django admin (`/admin/api/beneficiary/`, `/admin/api/fund/`, `/admin/api/transaction/`).
   - Check for sync status alerts (e.g., “Sync completed successfully”).

3. **Test Edit Modals**:
   - On `/funds`, edit a fund’s amount, source, or description.
   - On `/transactions`, edit a transaction’s fund, amount, recipient, or status.
   - Test both online and offline, ensuring changes sync correctly.

4. **Test Dashboard**:
   - Navigate to `/dashboard` and verify stats update after online/offline CRUD operations.

---

### Next Steps
The core CRUD functionality (create, read, update, delete) is complete for Beneficiaries, Funds, and Transactions, with automatic sync and a dashboard. Next, I recommend:
1. **Conflict Resolution**: Handle duplicate IDs or concurrent edits during sync (e.g., assign server-generated IDs after sync).
2. **Charts**: Add visualizations to the dashboard using Chart.js for trends (e.g., funds over time).
3. **UI Polish**: Introduce Bootstrap tooltips, alerts, or pagination for large datasets (deferred per your preference, but can start if ready).
4. **Export/Reports**: Add CSV/PDF export for data from tables or dashboard.




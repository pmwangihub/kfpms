





import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

/**
 * Dashboard component to display summary statistics and charts.
 * @returns {JSX.Element} Dashboard with stats and visualizations
 */
const Dashboard = () => {
  const [stats, setStats] = useState({ beneficiaries: 0, funds: 0, transactions: 0 });
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const fetchData = async () => {
      if (isOnline) {
        try {
          const [statsResponse, fundsResponse, transactionsResponse] = await Promise.all([
            axios.get('/api/stats/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/funds/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axios.get('/api/transactions/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          ]);
          setStats(statsResponse.data);
          setFunds(fundsResponse.data);
          setTransactions(transactionsResponse.data);
          // await db.stats.clear();
          await db.funds.clear();
          await db.transactions.clear();
          // await db.stats.add(statsResponse.data);
          await db.funds.bulkPut(fundsResponse.data);
          await db.transactions.bulkPut(transactionsResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error?.response?.data || error.message);
        }
      } else {
        const [offlineStats, offlineFunds, offlineTrans] = await Promise.all([
          // db.stats.toArray(),
          db.funds.toArray(),
          db.transactions.toArray(),
        ]);
        setStats(offlineStats[0] || { beneficiaries: 0, funds: 0, transactions: 0 });
        setFunds(offlineFunds);
        setTransactions(offlineTrans);
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

  // Funds over time chart data
  const fundsChartData = {
    labels: funds.map((fund) => new Date(fund.allocated_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Fund Amount',
        data: funds.map((fund) => fund.amount),
        fill: false,
        borderColor: '#007bff',
        tension: 0.1,
      },
    ],
  };

  // Transaction status pie chart data
  const statusChartData = {
    labels: ['Pending', 'Completed'],
    datasets: [
      {
        label: 'Transaction Status',
        data: [
          transactions.filter((t) => t.status === 'pending').length,
          transactions.filter((t) => t.status === 'completed').length,
        ],
        backgroundColor: ['#ffc107', '#28a745'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Beneficiaries</h5>
              <p className="card-text">{stats.beneficiaries}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Funds</h5>
              <p className="card-text">{stats.funds}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Transactions</h5>
              <p className="card-text">{stats.transactions}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Funds Over Time</h5>
              <Line data={fundsChartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Transaction Status</h5>
              <Pie data={statusChartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
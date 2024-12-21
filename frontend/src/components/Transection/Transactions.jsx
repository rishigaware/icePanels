import React, { useState, useEffect } from 'react';
import styles from './Transaction.module.css';
import TopNavbar from '../Navbar/TopNavbar';
import { PulseLoader } from "react-spinners"; // Import the PacmanLoader
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LoginPopup from '../Login/LoginPopup'

import { useUser } from "../../context/UserContext";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { user , url} = useUser();

  // Open/close modal handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    if (!user || !user.id) {
      setError("User ID is not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/user/deposit-transaction?userId=${user.username}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transactions: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      // Sort transactions by creation date (newest first)
      const sortedTransactions = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTransactions(sortedTransactions);
    } catch (err) {
      setTransactions([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch transactions when user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setIsModalOpen(true); // Open login modal if no user is logged in
      return;
    }

    fetchTransactions();
  }, [user]);

  // Render loading state
  if (loading) {
    return (
      <div className={styles.transactionHistory}>
        <TopNavbar />
        <h3 className={styles.heading}><strong>Transaction History</strong></h3>
        <div className={styles.loading}>
          <PulseLoader color="#4592ef" loading={loading} size={15} />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.transactionHistory}>
        <TopNavbar />
        <h3 className={styles.heading}><strong>Transaction History</strong></h3>
        <div className={styles.errorContainer}>
          <p className={styles.noRecords}>No Transection record</p>
        </div>
      </div>
    );
  }

  // Render transactions
  return (
    <div className={styles.transactionHistory}>
      <TopNavbar />
      <h3 className={styles.heading}><strong>Transaction History</strong></h3>
      <div className={styles.transactions}>
        {transactions.length > 0 ? (
          transactions.map((txn) => (
            <div className={styles.transactionItem} key={txn.id}>
              <div className={styles.column}><strong>Description:</strong> {txn.description}</div>
              <div className={styles.column}><strong>Payment Method:</strong> {txn.paymentMethod}</div>
              <div className={styles.column}><strong>Created At:</strong> {new Date(txn.createdAt).toLocaleString()}</div>
              <div className={`${styles.column} ${styles.status} ${styles[txn.status] || styles.defaultStatus}`}>
                <strong>Status:</strong> {txn.status}
              </div>
              <div className={`${styles.column} ${styles.amountField}`}>
                <strong>Amount:</strong> ₹{txn.amount}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noTransactions}>No transactions yet.</p>
        )}
      </div>
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
    </div>
  );
};

export default Transactions;

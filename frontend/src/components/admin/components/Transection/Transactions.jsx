import React, { useState, useEffect, useRef } from 'react';
import styles from './Transaction.module.css';
import TopNavbar from '../Navbar/TopNavbar';
import { PulseLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import LoginPopup from '../Login/LoginPopup';
import { FaCheck, FaTrash } from 'react-icons/fa'; // Import icons from react-icons
import { useUser } from "../../../../context/UserContext";
import { Toast } from "primereact/toast";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Track selected image for modal

  const navigate = useNavigate();
  const { user, url } = useUser();
  const toast = useRef(null); // Add a reference for Toast


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null); // Clear selected image when modal closes
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    if (!user || !user.id) {
      setError("User ID is not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${url}/api/admin/admin-transaction`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      // console.log(data);
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

  // Accept Transaction API call
  const acceptTransaction = async (txnId) => {
    try {
      const response = await fetch(`${url}/api/admin/accept-transaction/${txnId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to accept transaction: ${response.status} - ${response.statusText}`);
      }

      toast.current.show({
        severity: 'success',
        summary: 'Accepted',
        detail: 'ID created successfully:',
        life: 1000,
      });
      const updatedTxn = await response.json();
      // Update the state to reflect the change
      setTransactions((prevTransactions) =>
        prevTransactions.map((txn) =>
          txn.id === txnId ? { ...txn, status: 'Accepted' } : txn
        )
      );
    } catch (err) {
      setError(err.message);
      toast.current.show({
        severity: 'error',
        summary: 'Accepting Error',
        detail: err.message,
        life: 1000,
      });
    }
  };

  // Reject Transaction API call
  const rejectTransaction = async (txnId) => {
    try {
      const response = await fetch(`${url}/api/admin/reject-transaction/${txnId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to reject transaction: ${response.status} - ${response.statusText}`);
      }

      toast.current.show({
        severity: 'error',
        summary: 'Rejected',
        detail: "Successfully Rejected",
        life: 1000,
      });
      const updatedTxn = await response.json();
      // Update the state to reflect the change
      setTransactions((prevTransactions) =>
        prevTransactions.map((txn) =>
          txn.id === txnId ? { ...txn, status: 'Rejected' } : txn
        )
      );
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Rejecting Error',
        detail: "Error While Rejecting",
        life: 1000,
      });
      setError(err.message);
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

  // Handle image click to open modal
  const handleImageClick = (imagePath) => {
    setSelectedImage(`${url}/${imagePath}`);
    setIsModalOpen(false);
  };

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
          <p className={styles.noRecords}>{error || "An error occurred"}</p>
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
              <div className={styles.column}><strong>User Id:</strong> {txn.createdBy}</div>
              <div className={styles.column}>
                <strong>Description:</strong>
                <span className={styles.highlightedDescription}>{txn.description}</span>
              </div>              
              <div className={styles.column}><strong>Payment Method:</strong> {txn.paymentMethod}</div>
              <div className={styles.column}><strong>Created At:</strong> {new Date(txn.createdAt).toLocaleString()}</div>
              <div className={`${styles.column} ${styles.status} ${styles[txn.status] || styles.defaultStatus}`}>
                <strong>Status:</strong> {txn.status}
              </div>
              <div className={`${styles.column} ${styles.amountField}`}>
                <strong>Amount:</strong> ₹{txn.amount}
              </div>
              <div className={styles.column}>
                {txn.imagePath && (
                  <img
                    src={`${url}/${txn.imagePath}`} // Ensure the correct base URL
                    alt="Transaction"
                    className={styles.transactionImage}
                    onClick={() => handleImageClick(txn.imagePath)} // Open modal on click
                    onError={(e) => {
                      e.target.style.display = "none"; // Hide the image if it fails to load
                    }}
                  />
                )}
              </div>

              {/* Action Buttons - Accept and Reject */}
              <div className={styles.actions}>
                <button
                  className={styles.acceptButton}
                  onClick={() => acceptTransaction(txn.id)}
                >
                  <FaCheck /> Accept
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => rejectTransaction(txn.id)}
                >
                  <FaTrash /> Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noTransactions}>No transactions yet.</p>
        )}
      </div>
      {/* Image Modal */}
      { selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <img src={selectedImage} alt="Full Transaction" className={styles.fullImage} />
        </div>
      )}
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
      <Toast ref={toast} />

    </div>
    
  );
};

export default Transactions;

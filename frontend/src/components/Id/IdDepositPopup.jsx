import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import styles from "./IdDepositPopup.module.css";
import { useUser } from "../../context/UserContext";

export default function IdDepositPopup({ onClose, walletBalance = 0, setWalletBalance, selectedId }) {
  const { user, setUser, url } = useUser();
  const toast = useRef(null);
  const [balance, setBalance] = useState(user.balance); // State to store wallet balance

  const [depositAmount, setDepositAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message



  // Function to fetch balance
  const fetchBalance = async (userId) => {
    try {
      const response = await fetch(`${url}/api/user/get-balance/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance); // Update balance state
        setUser.balance = data.balance;
    } else {
        console.error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (user) {
      fetchBalance(user.id);
    }
  }, [user]); // Refetch balance whenever the user changes



  // Handle deposit payment
  const handlePayment = () => {
    const deposit = parseFloat(depositAmount || 0);

    // Check if deposit is greater than wallet balance
    if (deposit > balance) {
      setErrorMessage("Insufficient funds. Deposit first.");
      return;
    }

    // Check for minimum deposit amount
    if (isNaN(deposit) || deposit < 100) {
      setErrorMessage("₹100 Minimum Deposit Amount.");
      return;
    }

    setDepositAmount(deposit);
    setErrorMessage(""); // Clear error message
    handleSubmit(); // Call API after validation
  };

  // Handle input change and reset error message
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
      setErrorMessage(""); // Reset error message when input changes
    }
  };
  const handleSubmit = async () => {
    // Prepare the payload object with all necessary fields
    const payload = {
      amount: depositAmount, // Deposit amount
      createdAt: new Date().toISOString(), // Current timestamp
      createdBy: user.username, // User's username
      websiteName: selectedId.websiteName,
      websiteUrl: selectedId.websiteUrl,
      username: selectedId.username,
      status: selectedId.status,
      createdAtSelectedId: selectedId.createdAt._seconds, // Example: Sending createdAt from selectedId
      id: selectedId.username, // Append the unique ID of selected object
    };
  
    try {
      // Send the request with JSON data
      const response = await fetch(`${url}/api/user/create-transaction-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set content type to JSON
        },
        body: JSON.stringify(payload), // Send the payload as JSON string
      });
  
      if (!response.ok) {
        throw new Error("Transaction failed");
      }
  
      const data = await response.json();
      // console.log("Deposit created:", data);
      toast.current.show({
        severity: 'success',
        summary: 'Deposit Requested',
        detail: 'Deposit Requested successfully',
        life: 1000,
      });
      // Show success toast
      // toast.current.show({
      //   severity: "success",
      //   summary: "Transaction Successful",
      //   detail: "Transaction was successfully created.",
      //   life: 3000,
      // });
  
      onClose(); // Optionally close the modal
    } catch (error) {
      console.error("Error creating transaction:", error);
  
      // Show error toast
      toast.current.show({
        severity: "error",
        summary: "Error While Deposite",
        detail: error.message,
        life: 1000,
      });
    }
  };
  

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <Toast ref={toast} />

        <div className={styles.initialView}>
          <img
            src={`${url}/${selectedId.imgUrl}`}
            alt="Deposit Icon"
            className={styles.depositImage}
          />
          <p className={styles.username}>{selectedId.username}</p>
          <p className={styles.idName}>{selectedId.websiteName}</p>

          <h2 className={styles.depositName}>Deposit</h2>

          <div className={styles.balanceContainer}>
            <div className={styles.amount}>
              <strong>₹ {depositAmount || "0.00"}</strong>
            </div>

            <p className={styles.wallet}>
              <strong>Wallet Balance : ₹ {balance}</strong>
            </p>
          </div>

          <div className={styles.inputSection}>
            <label className={styles.inputLabel}>
              <strong>Enter Amount:</strong>
            </label>
            <input
              type="number"
              className={styles.input}
              value={depositAmount}
              onChange={handleInputChange}
              placeholder="Enter deposit amount"
              min="0"
              step="0.01"
            />
          </div>

          {/* Error Message */}
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <button className={styles.submitButton} onClick={handlePayment}>
            <strong>Deposit</strong>
          </button>
        </div>
      </div>
    </div>
  );
}

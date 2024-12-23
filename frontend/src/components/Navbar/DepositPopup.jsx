import React, { useState, useRef, useEffect } from "react";
import { FaCopy } from "react-icons/fa"; // Importing FontAwesome copy icon
import styles from "./DepositPopup.module.css";
import { useUser } from "../../context/UserContext";
import LoginPopup from '../Login/LoginPopup';


import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function DepositPopup({ onClose, walletBalance = 0, setWalletBalance }) {
  const { user, setUser, url } = useUser();

  const [accountDetails, setAccountDetails] = useState(null); // Store account details
  const [isDetailedView, setIsDetailedView] = useState(false); // Toggle between views
  const [activeTab, setActiveTab] = useState("depositFunds"); // Toggle between tabs
  const [depositAmount, setDepositAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [paymentMethod, setPaymentMethod] = useState(""); // State for payment method
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const [balance, setBalance] = useState(user.balance); // State to store wallet balance

  const toast = useRef(null); // Add a reference for Toast




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



  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch account details if user exists
  useEffect(() => {
    if (!user) {
      setIsModalOpen(true); // Open modal if no user exists
      return;
    }

    const fetchAccountDetails = async () => {
      try {
        const response = await fetch(`${url}/api/user/get-accountdetails-deposit`);
        if (!response.ok) {
          throw new Error("Failed to fetch account details");
        }
        const data = await response.json();
        // console.log(data);
        setAccountDetails(data); // Store account details in state
      } catch (error) {
        console.error("Error fetching account details:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load account details.",
          life: 3000,
        });
      }
    };

    fetchAccountDetails();
  }, [user]); // Only runs when the 'user' state changes


  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle deposit payment
  const handlePayment = () => {
    const deposit = parseFloat(depositAmount || 0);
    if (isNaN(deposit) || deposit < 100) {
      setErrorMessage(" ₹100 Minimum Deposite Amount."); // Set error message
      return;
    }
    // setWalletBalance((prev) => prev + deposit);
    setDepositAmount(deposit);
    setErrorMessage(""); // Clear error message
    setIsDetailedView(true); // Show detailed view
    // Show success toast message
  };

  // Handle input change and reset error message
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow only positive numbers, no negative signs, no operators
    if (/^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
      setErrorMessage(""); // Reset error message when input changes
    }
  };

  // Function to copy text to clipboard
  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.current.show({ severity: "info", summary: "Copied", detail: "Copied to clipboard", life: 1000 }))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  
  const onFileSelect = (e) => {
    try {
      if (e.files && e.files[0]) {
        const file = e.files[0];
        if (file.size > 1000000) {
          throw new Error('File is too large. Max size is 1MB.');
        }
        if (!file.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        setFile(file);
        toast.current.show({
          severity: 'success',
          summary: 'File Selected',
          detail: 'File uploaded successfully',
          life: 1000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'File Upload Failed',
        detail: error.message,
        life: 1000,
      });
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form default submission
  
    // Validate if photo and payment method are selected
    if (!file) {
      toast.current.show({
        severity: "error",
        summary: "No File",
        detail: "Please upload a valid image file.",
        life: 1000,
      });
      return;
    }
  
    if (!paymentMethod) {
      toast.current.show({
        severity: "error",
        summary: "Payment Method Required",
        detail: "Please select a payment method.",
        life: 1000,
      });
      return;
    }
    // Create FormData object
    const formData = new FormData();
    formData.append("image", file); // Append the image file
    formData.append("amount", depositAmount); // Append other transaction data
    formData.append("createdAt", new Date().toISOString()); // Add current timestamp
    formData.append("createdBy", user.username); // Add user ID
    formData.append("paymentMethod", paymentMethod); // Add payment method
  
    try {
      const response = await fetch(`${url}/api/user/create-transaction`, {
        method: "POST",
        body: formData, // Send the FormData object
      });
  
      if (!response.ok) {
        throw new Error("Transaction failed");
      }
  
      const data = await response.json();
      console.log("Transaction created:", data);
  
      // Show success toast
      toast.current.show({
        severity: "success",
        summary: "Transaction Successful",
        detail: "Transaction was successfully created.",
        life: 1000,
      });
  
      // Optionally reset form or close modal
      onClose();
    } catch (error) {
      console.error("Error creating transaction:", error);
  
      // Show error toast
      toast.current.show({
        severity: "error",
        summary: "Transaction Failed",
        detail: error.message,
        life: 1000,
      });
    }
  };
  
  

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <Toast ref={toast}></Toast> {/* Use the Toast component */}

        {/* Initial Deposit View */}
        {!isDetailedView ? (
          <div className={styles.initialView}>
            <h2 className={styles.depositName}>Deposit</h2>

            {/* Rectangular Container */}
            <div className={styles.balanceContainer}>
              {/* Deposit Amount */}
              <div className={styles.amount}>
                <strong>₹ {depositAmount || "0.00"}</strong>
              </div>

              {/* Wallet Balance */}
              <p className={styles.wallet}>
                <strong>Wallet Balance : ₹ {balance}</strong>
              </p>
            </div>

            {/* Input Section */}
            <div className={styles.inputSection}>
              <label className={styles.inputLabel}>
                <strong>Enter Amount:</strong>
              </label>
              <input
                type="number"
                className={styles.input}
                value={depositAmount}
                onChange={handleInputChange} // Use the updated handler
                placeholder="Enter deposit amount"
                min="0" // Prevent negative number entry
                step="0.01" // Allow decimal values
              />
            </div>

            {/* Error Message */}
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

            {/* Submit Button */}
            <button className={styles.submitButton} onClick={handlePayment}>
              <strong>Make Payment</strong>
            </button>
          </div>
        ) : (
          // Detailed Deposit View
          <div className={styles.detailedView}>
           {depositAmount && (
                <div className={styles.amountDisplay}>
                <strong>Pay ₹{depositAmount}</strong>
                </div>
            )}
            
            {/* Tab Buttons */}
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "depositFunds" ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange("depositFunds")}
              >
                Deposit Funds
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "bankDetails" ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange("bankDetails")}
              >
                Bank Details
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "upiDetails" ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange("upiDetails")}
              >
                UPI ID
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                
              {activeTab === "depositFunds" && (
                <div className={styles.depositFunds}>
                  <h2>
                    <strong>Deposit Funds</strong>
                  </h2>
                  <p>Deposit money only in the below available accounts to get the fastest credits and avoid possible delays.</p>
                </div>
              )}

              {activeTab === "bankDetails" && (
                <div className={styles.bankDetails}>
                  <h2>
                    <strong>Bank Details</strong>
                  </h2>
                  {accountDetails && (
                    <>
                      <p className={styles.copyContainer}>
                        <strong>Bank Name :</strong>&nbsp; {accountDetails.bankName}
                        <FaCopy onClick={() => handleCopy(accountDetails.bankName)} className={styles.copyIcon} />
                      </p>
                      <p className={styles.copyContainer}>
                        <strong>Account Holder Name :</strong>&nbsp; {accountDetails.accountHolderName}
                        <FaCopy onClick={() => handleCopy(accountDetails.accountHolderName)} className={styles.copyIcon} />
                      </p>
                      <p className={styles.copyContainer}>
                        <strong>Account Number :</strong>&nbsp; {accountDetails.accountNumber}
                        <FaCopy onClick={() => handleCopy(accountDetails.accountNumber)} className={styles.copyIcon} />
                      </p>
                      <p className={styles.copyContainer}>
                        <strong>IFSC Code :</strong>&nbsp; {accountDetails.ifscCode}
                        <FaCopy onClick={() => handleCopy(accountDetails.ifscCode)} className={styles.copyIcon} />
                      </p>
                    </>
                  )}
                </div>
              )}

              {activeTab === "upiDetails" && (
                <div className={styles.upiDetails}>
                  <p className={styles.copyContainer}>
                    <strong>UPI ID : </strong>&nbsp;{accountDetails.upiId}
                    <FaCopy onClick={() => handleCopy("yourapp@upi")} className={styles.copyIcon} />
                  </p>
                </div>
              )}

             {/* Upload Payment Photo */}
              <div className={styles.uploadSection}>
              <FileUpload
                mode="basic"
                name="image" // Adjust this based on your backend's expected field name
                url="/api/upload"
                accept="image/*"
                maxFileSize={1000000}
                onSelect={onFileSelect}
                />
              </div>

              {/* Select Payment Method */}
              <div className={styles.dropdownSection}>
                <label className={styles.dropdownLabel}>
                  <strong>Select Payment Method:</strong>
                  <select
                    className={styles.dropdown}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="">-- Select a payment method --</option>
                    <option value="imps">IMPS (Immediate Payment Service)</option>
                    <option value="gpay">Google Pay (GPay)</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                    <option value="paytm">Paytm</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="upi">UPI (Unified Payments Interface)</option>
                    <option value="emiDebit">EMI on Debit Card</option>
                    <option value="emiCredit">EMI on Credit Card</option>
                    <option value="upiAutopay">UPI Autopay</option>
                    <option value="other">Other</option>
                    </select>
                </label>
              </div>

              {/* Submit Button (After Make Payment) */}
              <button className={styles.submitButton} onClick={handleSubmit}>
                <strong>Deposit</strong>
              </button>
            </div>
          </div>
        )}
      </div>
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />

    </div>
  );
}

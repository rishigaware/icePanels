

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TopNavbar.module.css";
import DepositPopup from "./DepositPopup"; // Import the DepositPopup component
import logo from '../../assets/logo.png'
import newlogo from '../../assets/newlogo.png'
import { useUser } from "../../context/UserContext";

export default function TopNavbar() {
  const { user, setUser, url } = useUser();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(100000);
  const [showDepositPopup, setShowDepositPopup] = useState(false); // State to toggle popup
  const [balance, setBalance] = useState(0); // State to store wallet balance
  const navigate = useNavigate();



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


  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLogoutClick = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleDepositClick = () => {
    setShowDepositPopup(true); // Show deposit popup
  };

  const closeDepositPopup = () => {
    setShowDepositPopup(false); // Close deposit popup
  };

  return (
    <div className={styles.navbar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <img
          src={newlogo}
          alt="Logo"
          style={{
            float: 'left',
            height: '85%',
            marginTop: '2px', // Adjust as needed
            marginLeft:'4px',
            objectFit: 'contain' // Ensures the image scales well inside the container
          }}        />
      </div>

      {/* Buttons Section */}
      <div className={styles.navLinks}>
          <div className={styles.walletContainer}>
            <span className={styles.walletBalance}>Wallet : </span>
            <span className={styles.balanceAmount}>₹{balance}</span>
        </div>

        <button className={styles.navButton} onClick={handleDepositClick}>
          Deposit
        </button>
      </div>

      {/* Deposit Popup */}
      {showDepositPopup && (
        <DepositPopup onClose={closeDepositPopup} setWalletBalance={setWalletBalance} />
      )}
    </div>
  );
}

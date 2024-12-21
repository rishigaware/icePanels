import React, { useState, useEffect } from 'react';
import styles from './HomeHeading.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaBalanceScale } from "react-icons/fa"; // Example balance icon
import { FaPlus, FaArrowRight } from "react-icons/fa";
import logo from '../../assets/logo.png';
import LoginPopup from '../Login/LoginPopup';
import { useUser } from "../../context/UserContext";

const HomeHeading = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const [balance, setBalance] = useState(0); // State to store wallet balance
  const { user, setUser, url } = useUser();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogin = () => {
    setIsModalOpen(true);
  };

  const handleClick = () => {
    navigate('/id'); // Redirect to the /id route
  };

  const handleLogout = () => {
    setUser(null); // Clear user context
    localStorage.removeItem('user'); // Remove user from localStorage
  };

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

  return (
    <>
      <div className={styles.navbar}>
        <img
          src={logo}
          alt="Logo"
          style={{ float: 'left', width: '42px' }} // Adjust size as needed
        />
        <div style={{ float: 'right' }}>
          {user ? (
            <button
              className={styles.buttonlogout}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className={styles.buttonlogin}
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className={styles.top}>
        <div className={styles.topSquare}>
          <div className={styles.first}>
            <PiHandDepositDuotone />
            <h3 className={styles.deposit}>Deposit</h3>
          </div>

          <div className={styles.second}>
            <div className={styles.logo}>
              <img
                src={logo}
                alt="Logo"
                style={{ float: 'left', width: '80px' }}
              />
            </div>

            <div className={styles.balanceContainer}>
              <FaBalanceScale size={20} />
              <p className={styles.balanceAmount}>₹{balance}</p>
            </div>
            <h3 className={styles.balance}>Wallet Balance</h3>
          </div>

          <div className={styles.third}>
            <h3 className={styles.withdraw}>Withdraw</h3>
            <BiMoneyWithdraw />
          </div>
        </div>
      </div>
        <div 
            className={styles.createId} 
            onClick={handleClick} // Attach the click handler
            style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
        >
        <div className={styles.leftSide}>
            <FaPlus size={20} className={styles.createIdIcon} />
            <span className={styles.createIdText}>Create ID</span>
        </div>
        <FaArrowRight size={20} className={`${styles.createIdArrow} ${styles.arrow}`} />
        </div>

      {isModalOpen && (
        <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
      )}
    </>
  );
};

export default HomeHeading;

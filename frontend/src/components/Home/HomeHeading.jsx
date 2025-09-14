import React, { useState, useEffect } from 'react';
import styles from './HomeHeading.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaBalanceScale } from "react-icons/fa"; // Example balance icon
import { FaPlus, FaArrowRight } from "react-icons/fa";
// import logo from '../../assets/logo.png';
import newlogo from '../../assets/newlogo.png';
import LoginPopup from '../Login/LoginPopup';
import { useUser } from "../../context/UserContext";

const HomeHeading = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const { user, setUser, url, refreshUserBalance } = useUser();

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

  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (user?.id) {
      refreshUserBalance();
    }
  }, [user?.id, refreshUserBalance]); // Refetch balance whenever the user changes

  return (
    <>
      <div className={styles.navbar}>
      <img
        src={newlogo}
        alt="Logo"
        style={{
          float: 'left',
          height: '85%',
          marginTop: '2px', // Adjust as needed
          marginLeft:'4px',
          objectFit: 'contain' // Ensures the image scales well inside the container
        }}
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
              src={newlogo}
              alt="Logo"
              style={{
                height: '60px',
                marginTop: '2px',
                marginLeft: '4px',
                objectFit: 'contain',
                zIndex: 1000,
                position: 'relative'
              }}
            />           
            </div>

            <div className={styles.balanceContainer}>
              <FaBalanceScale size={20} />
              <p className={styles.balanceAmount}>₹{user?.balance || 0}</p>
            </div>
            <h3 className={styles.balance}>Wallet Balance</h3>
          </div>

          <div className={styles.third}>
            <h3 className={styles.withdraw}>Withdraw</h3>
            <BiMoneyWithdraw />
          </div>
        </div>
      </div>
        {/* Sliding Text Section */}
        {/* <div className={styles.slidingTextSection}>
          <div className={styles.slidingTextContainer}>
            <div className={styles.slidingText}>
              🚀 Welcome to The247Panel - Your Ultimate Gaming & Betting Platform! 🎮💰 • 🎯 Multiple Gaming Websites • 💎 Premium Features • 🔥 24/7 Support • ⚡ Instant Deposits & Withdrawals • 🏆 Best Odds Guaranteed • 🎲 Live Casino Games • 🎰 Slot Machines • 🃏 Card Games • 🏈 Sports Betting • 🎪 Live Events • 💰 Daily Bonuses • 🎁 Special Promotions • 🔐 Secure & Safe • 📱 Mobile Friendly • 🌟 VIP Membership • 🎊 Join Now & Win Big! 🎊
            </div>
          </div>
        </div> */}

        {/* Create Admin Panel Section */}
        <div 
            className={styles.createId} 
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
          <div className={styles.leftSide}>
            <span className={styles.createIdEmoji}>🚀</span>
            <FaPlus size={18} className={styles.createIdIcon} />
            <span className={styles.createIdText}>CREATE SELF ADMIN PANEL'S</span>
            <span className={styles.createIdEmoji}>⚡</span>
          </div>
          <div className={styles.rightSide}>
            <span className={styles.createIdEmoji}>🎯</span>
            <FaArrowRight size={18} className={`${styles.createIdArrow} ${styles.arrow}`} />
          </div>
        </div>

      {isModalOpen && (
        <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
      )}
    </>
  );
};

export default HomeHeading;

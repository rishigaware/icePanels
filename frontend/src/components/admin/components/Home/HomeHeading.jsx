import React from 'react'
import styles from './HomeHeading.module.css'; // Import the CSS module'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useState } from 'react';
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaBalanceScale } from "react-icons/fa"; // Example balance icon
import { FaQuestion } from "react-icons/fa";

import { FaPlus } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
// import logo from '../../assets/logo.png'
import newlogo from '../../assets/newlogo.png'
import LoginPopup from '../Login/LoginPopup';

import { useUser } from "../../../../context/UserContext";


const HomeHeading = () => {
    const navigate = useNavigate();  // Initialize the navigate function
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
    const { user,setUser } = useUser();

    const balance = 100000; // Example balance value
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleLogin = () => {
        setIsModalOpen(true)    
    };

    const handleLogout = () => {
        setUser(null); // Clear user context
        localStorage.removeItem('user'); // Remove user from localStorage
    };

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
                            onClick={handleLogout}>
                            Logout
                        </button>
                    ) : (
                        <button 
                            className={styles.buttonlogin} 
                            onClick={handleLogin}>
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
                        <BiMoneyWithdraw size={20} />
                        <p className={styles.balanceAmount}>₹{user?.balance || 0}</p> 
                    </div>
                    <h3 className={styles.balance}>Wallet Ballance</h3>

                </div>

                <div className={styles.third}>
                    <h3 className={styles.withdraw}>Withdraw</h3>
                    <BiMoneyWithdraw />
                </div>
            
            </div>
            </div>
            <div className={styles.createId}>
            <div className={styles.leftSide}>
                <FaPlus size={20} className={styles.createIdIcon} />
                <span className={styles.createIdText}>
                    CREATE SELF ADMIN PANEL'S
                </span>
            </div>
            <FaArrowRight size={20} className={`${styles.createIdArrow} ${styles.arrow}`} />
            </div>

            {isModalOpen && (
                <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
            )}
      
    </>
  )
}

export default HomeHeading

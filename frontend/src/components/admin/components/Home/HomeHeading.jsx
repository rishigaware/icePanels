import styles from './HomeHeading.module.css'; // Import the CSS module'
import { useState } from 'react';
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

import { FaPlus } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
// import logo from '../../assets/logo.png'
import newlogo from '../../assets/newlogo.png'
import LoginPopup from '../Login/LoginPopup';
import WithdrawalPopup from './WithdrawalPopup';

import { useUser } from "../../../../context/UserContext";


const HomeHeading = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false); // State to control withdrawal modal
    const { user,setUser } = useUser();

    const closeModal = () => setIsModalOpen(false);
    const closeWithdrawalModal = () => setIsWithdrawalModalOpen(false);

    const handleLogin = () => {
        setIsModalOpen(true)    
    };

    const handleLogout = () => {
        setUser(null); // Clear user context
        localStorage.removeItem('user'); // Remove user from localStorage
    };

    const handleDepositClick = () => {
        // Redirect to deposit page
        navigate('/admin/deposit');
    };

    const handleWithdrawalClick = () => {
        // Open withdrawal popup
        setIsWithdrawalModalOpen(true);
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

                <div className={styles.first} onClick={handleDepositClick}>
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

                <div className={styles.third} onClick={handleWithdrawalClick}>
                    <h3 className={styles.withdraw}>Withdraw</h3>
                    <BiMoneyWithdraw />
                </div>
            
            </div>
            </div>

            {/* Create Admin Panel Section */}
            <div className={styles.createId}>
              <div className={styles.leftSide}>
                <span className={styles.createIdEmoji}>🚀</span>
                <FaPlus size={18} className={styles.createIdIcon} />
                <span className={styles.createIdText}>
                  CREATE SELF ADMIN PANEL&apos;S
                </span>
                <span className={styles.createIdEmoji}>⚡</span>
              </div>
              <div className={styles.rightSide}>
                <span className={styles.createIdEmoji}>🎯</span>
                <FaArrowRight size={18} className={`${styles.createIdArrow} ${styles.arrow}`} />
              </div>
            </div>
{/* 
            <div className={styles.slidingTextSection}>
              <div className={styles.slidingTextContainer}>
                <div className={styles.slidingText}>
                  🚀 Welcome to The247Panel - Your Ultimate Gaming & Betting Platform! 🎮💰 • 🎯 Multiple Gaming Websites • 💎 Premium Features • 🔥 24/7 Support • ⚡ Instant Deposits & Withdrawals • 🏆 Best Odds Guaranteed • 🎲 Live Casino Games • 🎰 Slot Machines • 🃏 Card Games • 🏈 Sports Betting • 🎪 Live Events • 💰 Daily Bonuses • 🎁 Special Promotions • 🔐 Secure & Safe • 📱 Mobile Friendly • 🌟 VIP Membership • 🎊 Join Now & Win Big! 🎊
                </div>
              </div>
            </div> 
            */}

            {isModalOpen && (
                <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
            )}

            {isWithdrawalModalOpen && (
                <WithdrawalPopup 
                    isOpen={isWithdrawalModalOpen} 
                    isClose={closeWithdrawalModal}
                    user={user}
                />
            )}
      
    </>
  )
}

export default HomeHeading

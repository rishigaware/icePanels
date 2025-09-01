import React, { useState, useEffect } from "react";
import styles from "./MyId.module.css";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FiEdit3, FiEye, FiX, FiMoreVertical, FiLock } from "react-icons/fi";
import { AiOutlineTransaction } from "react-icons/ai";
import IdDepositPopup from "./IdDepositPopup";
import NewDepositPopup from "./NewDepositPopup";
import NewWithdrawalPopup from "./NewWithdrawalPopup";
import ViewTransactionModal from "./ViewTransactionModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const MyId = () => {
  const { user, url } = useUser();
  const safeUser = user || {};
  const safeUrl = url || '';
  const [myIds, setMyIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [needRefetch, setNeedRefetch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 IDs per page

  const [walletBalance, setWalletBalance] = useState(100);
  const [showIdDepositPopup, setShowIdDepositPopup] = useState(false); // State to toggle popup
  const [showNewDepositPopup, setShowNewDepositPopup] = useState(false); // State for new deposit popup
  const [changePasswordPopup, setChangePasswordPopup] = useState(false); // State to toggle popup
  // const [WithdrawalPopup, setWithdrwalPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);
  
  // Mobile popup state
  const [mobilePopupOpen, setMobilePopupOpen] = useState(null); // Track which ID's popup is open
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null); // Track which ID's menu is open

  // New modal states
  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedIdForModal, setSelectedIdForModal] = useState(null);

  const navigate = useNavigate();
  const toast = useRef(null);

  useEffect(() => {
    const fetchIds = async () => {
      try {
        if (!safeUser?.id) {
          throw new Error("User ID is missing");
        }

        const response = await fetch(
          `${safeUrl}/api/user/get-all-ids?userId=${safeUser?.username}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch IDs");
        }

        const data = await response.json();
        // console.log(data)

        const sortedData = data.sort((a, b) => {
          const timestampA = a.createdAt._seconds;
          const timestampB = b.createdAt._seconds;

          return timestampB - timestampA;
        });

        setMyIds(sortedData);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (safeUser?.id || needRefetch) {
      fetchIds();
      setNeedRefetch(false);
    }
  }, [safeUser?.id, needRefetch]);

  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

  const handleIdClick = (item) => {
    setSelectedId(item);
    setChangePasswordPopup(true)
  };

  const handleClosePopup = () => {
    setSelectedId(null);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const handlePasswordChange = async () => {
    try {
      if (!safeUser?.id || !selectedId?.id) {
        throw new Error("User ID or selected ID is missing");
      }

      const response = await fetch(
        `${safeUrl}/api/user/change-id-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: safeUser.id,
            selectedId: selectedId.id,
            newPassword: newPassword,
          }),
        }
      );

      if (!response.ok) {
        alert("Failed to change password");
        throw new Error("Failed to change password");
      }

      const data = await response.json();
      alert("Password changed successfully");

      setNewPassword("");
      setSelectedId(null);

      setNeedRefetch(true);
    } catch (err) {
      console.error(err);
      alert("Error changing password");
    }
  };

  const handleDepositClick = (item) => {
    // console.log(item)
    setSelectedId(item)
    setChangePasswordPopup(false)
    setIsWithdrawalPopupVisible(false)
    setShowIdDepositPopup(false) // Hide old popup
    setShowNewDepositPopup(true); // Show new deposit popup
  };
  const handleWithdrawalClick = (item) => {
    // console.log(item)
    setSelectedId(item)
    setChangePasswordPopup(false)
    setShowIdDepositPopup(false); // Show deposit popup
    setIsWithdrawalPopupVisible(true);
  }

  const closeDepositPopup = () => {
    setShowIdDepositPopup(false); // Close deposit popup
  };
  const closeWithdrawalPopup = () => {
    setIsWithdrawalPopupVisible(false); // Close withdrawal popup
  };

  const closeNewDepositPopup = () => {
    setShowNewDepositPopup(false); // Close new deposit popup
  };

  const handleCreateId = () => {
    setNeedRefetch(true);
  };

  const filteredIds = (myIds || []).filter(
    (id) =>
      (id.websiteName && id.websiteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.websiteUrl && id.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.username && id.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredIds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIds = filteredIds.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };



  // Mobile popup handlers
  const handleMobileMenuToggle = (itemId, event) => {
    event.stopPropagation();
    setMobilePopupOpen(mobilePopupOpen === itemId ? null : itemId);
  };

  // Close mobile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobilePopupOpen && !event.target.closest('.mobileMenu')) {
        setMobilePopupOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobilePopupOpen]);

  const handleMobileAction = (action, item) => {
    setMobilePopupOpen(null); // Close popup
    switch (action) {
      case 'deposit':
        handleDepositClick(item);
        break;
      case 'withdrawal':
        handleWithdrawalClick(item);
        break;
      case 'changePassword':
        handleChangePassword(item);
        break;
      case 'viewTransaction':
        handleViewTransaction(item);
        break;
      case 'closeId':
        handleCloseId(item);
        break;
      default:
        break;
    }
  };

  // Handle view transaction
  const handleViewTransaction = (id) => {
    const idData = myIds.find(idItem => idItem.id === id);
    if (idData) {
      setSelectedIdForModal(idData);
      setShowViewTransactionModal(true);
    }
  };

  // Handle change password
  const handleChangePassword = (id) => {
    const idData = myIds.find(idItem => idItem.id === id);
    if (idData) {
      setSelectedIdForModal(idData);
      setShowChangePasswordModal(true);
    }
  };

  // Handle close ID
  const handleCloseId = async (id) => {
    if (!user) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'User not logged in',
        life: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`${url}/api/user/close-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          createdBy: user.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'ID closed successfully',
          life: 3000,
        });
        
        // Refresh the IDs list
        setNeedRefetch(true);
      } else {
        throw new Error(data.message || 'Failed to close ID');
      }
    } catch (error) {
      console.error('Error closing ID:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to close ID',
        life: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <PulseLoader color="#4592ef" loading={loading} size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <p className={styles.error}>
        <strong>No Id's created yet</strong>
      </p>
    );
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by website name, URL, or username"
        className={styles.searchInput} // Add styling in your CSS file
      />

      {/* IDs Count */}
      <div className={styles.idsCount}>
        {filteredIds.length === 0 ? 'No IDs found' : `${filteredIds.length} ID${filteredIds.length === 1 ? '' : 's'} found`}
        {filteredIds.length > itemsPerPage && (
          <span> • Showing {startIndex + 1}-{Math.min(endIndex, filteredIds.length)} of {filteredIds.length}</span>
        )}
      </div>

      {currentIds.length === 0 ? (
        <p className={styles.noIds}>No IDs match your search criteria.</p>
      ) : (
        currentIds.map((item, index) => (
          <div key={item.id} className={styles.idCard}>
            <div className={styles.logo} onClick={() => handleIdClick(item)}>
              <img
                src={`${safeUrl}/${item.imgUrl || ''}`}
                alt={`${item.websiteName || 'Website'} logo`}
              />
            </div>

            <div className={styles.details}>
              <p className={styles.websiteName}>{item.websiteName || 'N/A'}</p>
              <span>
                <a
                  href={item.websiteUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  {item.websiteUrl || 'N/A'}
                </a>
              </span>
              <p className={styles.userId}>
                <strong>username : </strong>
                {item.username || 'N/A'}
              </p>
              <p className={styles.idBalance}>
                <strong>Balance : </strong>
                {item.balance || 0} coins
              </p>
              {item.coinRate && (
                <p className={styles.coinRate}>
                  <strong>Rate : </strong>
                  1 coin = ₹{item.coinRate}
                </p>
              )}
            </div>

            <div className={styles.iconContainer}>
              {/* Desktop Icons */}
              <div className={styles.desktopIcons}>
                <div className={styles.iconWrapper}>
                  <PiHandDepositDuotone
                    className={`${styles.icon} ${styles.depositIcon}`}
                    title="Deposit"
                    onClick={() => handleDepositClick(item)} 
                    />
                  <p className={styles.iconLabel}>Deposit</p>
                </div>
                <div className={styles.iconWrapper}>
                  <BiMoneyWithdraw 
                    className={`${styles.icon} ${styles.withdrawalIcon}`}
                    title="Withdrawal" 
                    onClick={() => handleWithdrawalClick(item)} 
                    />
                  <p className={styles.iconLabel}>Withdrawal</p>
                </div>
                <div className={styles.iconWrapper}>
                  <FiEdit3
                    className={`${styles.icon} ${styles.editIcon}`}
                    title="Change Password"
                    onClick={() => handleChangePassword(item.id)} 
                    />
                  <p className={styles.iconLabel}>Change Password</p>
                </div>
                <div className={styles.iconWrapper}>
                  <AiOutlineTransaction
                    className={`${styles.icon} ${styles.transactionIcon}`}
                    title="View Transaction"
                    onClick={() => handleViewTransaction(item.id)} 
                    />
                  <p className={styles.iconLabel}>View Transaction</p>
                </div>
                <div className={styles.iconWrapper}>
                  <FiX
                    className={`${styles.icon} ${styles.closeIcon}`}
                    title="Close ID"
                    onClick={() => handleCloseId(item.id)} 
                    />
                  <p className={styles.iconLabel}>Close ID</p>
                </div>
              </div>

              {/* Mobile Three Dots */}
              <div className={styles.mobileMenu}>
                <FiMoreVertical
                  className={styles.threeDotsIcon}
                  onClick={(e) => handleMobileMenuToggle(item.id, e)}
                />
                
                {/* Mobile Popup */}
                {mobilePopupOpen === item.id && (
                  <div className={styles.mobilePopup}>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('deposit', item)}>
                      <PiHandDepositDuotone className={`${styles.mobileIcon} ${styles.depositIcon}`} />
                      <span>Deposit</span>
                    </div>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('withdrawal', item)}>
                      <BiMoneyWithdraw className={`${styles.mobileIcon} ${styles.withdrawalIcon}`} />
                      <span>Withdrawal</span>
                    </div>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('changePassword', item.id)}>
                      <FiEdit3 className={`${styles.mobileIcon} ${styles.editIcon}`} />
                      <span>Change Password</span>
                    </div>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('viewTransaction', item.id)}>
                      <AiOutlineTransaction className={`${styles.mobileIcon} ${styles.transactionIcon}`} />
                      <span>View Transaction</span>
                    </div>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('closeId', item.id)}>
                      <FiX className={`${styles.mobileIcon} ${styles.closeIcon}`} />
                      <span>Close ID</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Pagination Controls */}
      {filteredIds.length > itemsPerPage && (
        <div className={styles.paginationContainer}>
          {/* Previous Button */}
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((number, index) => (
            <button
              key={index}
              className={`${styles.paginationButton} ${
                number === currentPage ? styles.active : ''
              }`}
              onClick={() => typeof number === 'number' && setCurrentPage(number)}
              disabled={number === '...'}
            >
              {number}
            </button>
          ))}

          {/* Next Button */}
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            →
          </button>

          {/* Page Info */}
          <div className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      

      {selectedId && changePasswordPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button onClick={handleClosePopup} className={styles.closeButton}>
              &times;
            </button>
            <div className={styles.popupHeader}>
              <img
                src={`${url}/${selectedId.imgUrl}`}
                alt={`${selectedId.websiteName} logo`}
                className={styles.popupLogo}
              />
              <h2>{selectedId.websiteName}</h2>
              <p>{selectedId.websiteUrl}</p>
            </div>

            <div className={styles.popupBody}>
              <p>
                <strong>Username:</strong> {selectedId.username}
              </p>
              <p>
                <strong>Password:</strong> {selectedId.password}
              </p>
              <p>
                <strong>Balance:</strong> {selectedId.balance || 0} coins
              </p>
              {selectedId.coinRate && (
                <p>
                  <strong>Coin Rate:</strong> 1 coin = ₹{selectedId.coinRate}
                </p>
              )}
              <p className={styles.popStatusText}>
              <strong>Status :&nbsp;</strong>

                  <span
                    className={
                      selectedId.popStatus === "Requested"
                        ? styles.popStatusRequested
                        : selectedId.status === "Created"
                        ? styles.popStatusCreated
                        : selectedId.status === "Username Exists"
                        ? styles.popStatusUsernameExist
                        : styles.popStatusActive // Default case if no match
                    }
                  >
                    {selectedId.status}
                  </span>
                </p>
              <p>
                <strong>Created At:</strong>{" "}
                {formatDate(selectedId.createdAt._seconds)}
              </p>
            </div>

            {/* <div className={styles.changePasswordSection}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={styles.passwordInput}
              />
              <button
                onClick={handlePasswordChange}
                className={styles.changePasswordButton}
              >
                Change Password
              </button>
            </div> */}
          </div>
        </div>
      )}
      {/* Deposit Popup */}
      {showIdDepositPopup && (
        <IdDepositPopup
          onClose={closeDepositPopup}
          walletBalance={walletBalance} // Pass the wallet balance dynamically
          setWalletBalance={setWalletBalance} // Pass the setWalletBalance function
          selectedId={selectedId} // Pass the selected ID to the popup component
        />
      )}

{/* //withdrawalpopup */}
      {isWithdrawalPopupVisible && (
        <NewWithdrawalPopup
          onClose={closeWithdrawalPopup}
          selectedId={selectedId}
        />
      )}

      {/* New Deposit Popup */}
      {showNewDepositPopup && (
        <NewDepositPopup
          onClose={closeNewDepositPopup}
          selectedId={selectedId}
        />
      )}

      {/* View Transaction Modal */}
      {showViewTransactionModal && (
        <ViewTransactionModal
          isOpen={showViewTransactionModal}
          onClose={() => setShowViewTransactionModal(false)}
          idData={selectedIdForModal}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          idData={selectedIdForModal}
        />
      )}

      {/* Toast for notifications */}
      <Toast ref={toast} />
    </div>


  );
};

export default MyId;


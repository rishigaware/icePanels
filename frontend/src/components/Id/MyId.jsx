import React, { useState, useEffect, useRef } from "react";
import styles from "./MyId.module.css";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FiEdit3, FiMoreVertical, FiX } from "react-icons/fi";
import { AiOutlineTransaction } from "react-icons/ai";
import IdDepositPopup from "./IdDepositPopup";
import NewDepositPopup from "./NewDepositPopup";
import NewWithdrawalPopup from "./NewWithdrawalPopup";
import ViewTransactionModal from "./ViewTransactionModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { Toast } from "primereact/toast";

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
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [walletBalance, setWalletBalance] = useState(100);
  const [showIdDepositPopup, setShowIdDepositPopup] = useState(false);
  const [showNewDepositPopup, setShowNewDepositPopup] = useState(false);
  const [changePasswordPopup, setChangePasswordPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);

  const [mobilePopupOpen, setMobilePopupOpen] = useState(null);

  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedIdForModal, setSelectedIdForModal] = useState(null);

  const navigate = useNavigate();
  const toast = useRef(null);

  const checkStatusUpdates = async () => {
    try {
      if (!safeUser?.id) return;

      const response = await fetch(`${safeUrl}/api/user/deposit-transaction?userId=${safeUser.id}`);
      if (response.ok) {
        const transactions = await response.json();
        const recentTransactions = transactions.filter(txn => {
          const createdAt = new Date(txn.createdAt);
          const now = new Date();
          const diffInMinutes = (now - createdAt) / (1000 * 60);
          return diffInMinutes <= 5 && (txn.status === 'Accepted' || txn.status === 'Rejected');
        });

        recentTransactions.forEach(txn => {
          if (txn.status === 'Accepted') {
            toast.current.show({
              severity: 'success',
              summary: 'Request Approved',
              detail: `${txn.description} has been approved`,
              life: 5000,
            });
          } else if (txn.status === 'Rejected') {
            toast.current.show({
              severity: 'error',
              summary: 'Request Rejected',
              detail: `${txn.description} has been rejected`,
              life: 5000,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error checking status updates:', error);
    }
  };

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
        const sortedData = data.sort((a, b) => {
          const timestampA = a.createdAt._seconds;
          const timestampB = b.createdAt._seconds;
          return timestampB - timestampA;
        });

        setMyIds(sortedData);
        await checkStatusUpdates();
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

  useEffect(() => {
    if (!safeUser?.id) return;

    const interval = setInterval(() => {
      checkStatusUpdates();
    }, 30000);

    return () => clearInterval(interval);
  }, [safeUser?.id]);
  
  const handleIdClick = (item) => {
    setSelectedId(item);
    setChangePasswordPopup(true);
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
          headers: { "Content-Type": "application/json" },
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
    setSelectedId(item);
    setShowNewDepositPopup(true);
  };

  const handleWithdrawalClick = (item) => {
    setSelectedId(item);
    setIsWithdrawalPopupVisible(true);
  };

  const closeNewDepositPopup = () => setShowNewDepositPopup(false);
  const closeWithdrawalPopup = () => setIsWithdrawalPopupVisible(false);

  const filteredIds = (myIds || []).filter(
    (id) =>
      (id.websiteName && id.websiteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.websiteUrl && id.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.username && id.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredIds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIds = filteredIds.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pageNumbers;
  };

  const handleMobileMenuToggle = (itemId, event) => {
    event.stopPropagation();
    setMobilePopupOpen(mobilePopupOpen === itemId ? null : itemId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobilePopupOpen && !event.target.closest(`.${styles.mobileMenu}`)) {
        setMobilePopupOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobilePopupOpen]);

  // Handle view transaction
  const handleViewTransaction = (item) => {
    setSelectedIdForModal(item);
    setShowViewTransactionModal(true);
  };

  // Handle change password
  const handleChangePassword = (item) => {
    setSelectedIdForModal(item);
    setShowChangePasswordModal(true);
  };

  // Handle close ID
  const handleCloseId = async (id) => {
    if (!user) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'User not logged in', life: 3000 });
      return;
    }
    try {
      const response = await fetch(`${url}/api/user/close-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, createdBy: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'ID closed successfully', life: 3000 });
        setNeedRefetch(true);
      } else {
        throw new Error(data.message || 'Failed to close ID');
      }
    } catch (error) {
      console.error('Error closing ID:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to close ID', life: 3000 });
    }
  };

  const handleMobileAction = (action, item) => {
    setMobilePopupOpen(null);
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
        handleCloseId(item.id);
        break;
      default:
        break;
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
    return <p className={styles.error}><strong>No Id's created yet</strong></p>;
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by website name, URL, or username"
        className={styles.searchInput}
      />
      <div className={styles.idsCount}>
        {filteredIds.length === 0 ? 'No IDs found' : `${filteredIds.length} ID${filteredIds.length === 1 ? '' : 's'} found`}
        {filteredIds.length > itemsPerPage && (
          <span> • Showing {startIndex + 1}-{Math.min(endIndex, filteredIds.length)} of {filteredIds.length}</span>
        )}
      </div>

      {currentIds.length === 0 ? (
        <p className={styles.noIds}>No IDs match your search criteria.</p>
      ) : (
        currentIds.map((item) => (
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
                <a href={item.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                  {item.websiteUrl || 'N/A'}
                </a>
              </span>
              <p className={styles.userId}><strong>username : </strong>{item.username || 'N/A'}</p>
              <p className={styles.idBalance}><strong>Balance : </strong>{item.balance || 0} coins</p>
              {item.coinRate && <p className={styles.coinRate}><strong>Rate : </strong>1 coin = ₹{item.coinRate}</p>}
            </div>
            <div className={styles.iconContainer}>
              <div className={styles.desktopIcons}>
                <div className={styles.iconWrapper}>
                  <PiHandDepositDuotone className={`${styles.icon} ${styles.depositIcon}`} title="Deposit" onClick={() => handleDepositClick(item)} />
                  <p className={styles.iconLabel}>Deposit</p>
                </div>
                <div className={styles.iconWrapper}>
                  <BiMoneyWithdraw className={`${styles.icon} ${styles.withdrawalIcon}`} title="Withdrawal" onClick={() => handleWithdrawalClick(item)} />
                  <p className={styles.iconLabel}>Withdrawal</p>
                </div>
                <div className={styles.iconWrapper}>
                  <FiEdit3 className={`${styles.icon} ${styles.editIcon}`} title="Change Password" onClick={() => handleChangePassword(item)} />
                  <p className={styles.iconLabel}>Change Password</p>
                </div>
                <div className={styles.iconWrapper}>
                  <AiOutlineTransaction className={`${styles.icon} ${styles.transactionIcon}`} title="View Transaction" onClick={() => handleViewTransaction(item)} />
                  <p className={styles.iconLabel}>View Transaction</p>
                </div>
                <div className={styles.iconWrapper}>
                  <FiX className={`${styles.icon} ${styles.closeIcon}`} title="Close ID" onClick={() => handleCloseId(item.id)} />
                  <p className={styles.iconLabel}>Close ID</p>
                </div>
              </div>

              <div className={styles.mobileMenu}>
                <FiMoreVertical className={styles.threeDotsIcon} onClick={(e) => handleMobileMenuToggle(item.id, e)} />
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
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('changePassword', item)}>
                      <FiEdit3 className={`${styles.mobileIcon} ${styles.editIcon}`} />
                      <span>Change Password</span>
                    </div>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('viewTransaction', item)}>
                      <AiOutlineTransaction className={`${styles.mobileIcon} ${styles.transactionIcon}`} />
                      <span>View Transaction</span>
                    </div>
                    <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('closeId', item)}>
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

      {filteredIds.length > itemsPerPage && (
        <div className={styles.paginationContainer}>
          <button className={styles.paginationButton} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>←</button>
          {getPageNumbers().map((number, index) => (
            <button key={index} className={`${styles.paginationButton} ${number === currentPage ? styles.active : ''}`} onClick={() => typeof number === 'number' && setCurrentPage(number)} disabled={number === '...'}>{number}</button>
          ))}
          <button className={styles.paginationButton} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>→</button>
          <div className={styles.paginationInfo}>Page {currentPage} of {totalPages}</div>
        </div>
      )}

      {selectedId && changePasswordPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button onClick={handleClosePopup} className={styles.closeButton}>&times;</button>
            <div className={styles.popupHeader}>
              <img src={`${url}/${selectedId.imgUrl}`} alt={`${selectedId.websiteName} logo`} className={styles.popupLogo} />
              <h2>{selectedId.websiteName}</h2>
              <p>{selectedId.websiteUrl}</p>
            </div>
            <div className={styles.popupBody}>
              <p><strong>Username:</strong> {selectedId.username}</p>
              <p><strong>Password:</strong> {selectedId.password}</p>
              <p><strong>Balance:</strong> {selectedId.balance || 0} coins</p>
              {selectedId.coinRate && <p><strong>Coin Rate:</strong> 1 coin = ₹{selectedId.coinRate}</p>}
              <p className={styles.popStatusText}><strong>Status :&nbsp;</strong>
                <span className={selectedId.popStatus === "Requested" ? styles.popStatusRequested : selectedId.status === "Created" ? styles.popStatusCreated : selectedId.status === "Username Exists" ? styles.popStatusUsernameExist : styles.popStatusActive}>{selectedId.status}</span>
              </p>
              <p><strong>Created At:</strong> {formatDate(selectedId.createdAt._seconds)}</p>
            </div>
          </div>
        </div>
      )}

      {showNewDepositPopup && <NewDepositPopup onClose={closeNewDepositPopup} selectedId={selectedId} />}
      {isWithdrawalPopupVisible && <NewWithdrawalPopup onClose={closeWithdrawalPopup} selectedId={selectedId} />}
      {showViewTransactionModal && <ViewTransactionModal isOpen={showViewTransactionModal} onClose={() => setShowViewTransactionModal(false)} idData={selectedIdForModal} />}
      {showChangePasswordModal && <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} idData={selectedIdForModal} />}
      
      <Toast ref={toast} />
    </div>
  );
};

export default MyId;
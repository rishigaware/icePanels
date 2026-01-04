import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./MyId.module.css";
import { useUser } from "../../context/UserContext";

import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FiEdit3, FiMoreVertical, FiX } from "react-icons/fi";
import { AiOutlineTransaction } from "react-icons/ai";
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
  const [idRequests, setIdRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [needRefetch, setNeedRefetch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showNewDepositPopup, setShowNewDepositPopup] = useState(false);
  const [changePasswordPopup, setChangePasswordPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);

  const [mobilePopupOpen, setMobilePopupOpen] = useState(null);

  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedIdForModal, setSelectedIdForModal] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const toast = useRef(null);

  const fetchIds = useCallback(async () => {
    if (!safeUser?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`${safeUrl}/api/user/get-all-ids?userId=${safeUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setMyIds(Array.isArray(data) ? data : []);
      } else {
        // console.error("Error fetching IDs:", data);
        setMyIds([]);
      }
    } catch (error) {
      console.error("Failed to fetch IDs:", error);
      setError("Failed to fetch IDs");
    } finally {
      setLoading(false);
    }
  }, [safeUser?.id, safeUrl]);

  const fetchIdRequests = useCallback(async () => {
    if (!safeUser?.id) return;
    try {
      const response = await fetch(`${safeUrl}/api/user/get-id-requests?userId=${safeUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setIdRequests(Array.isArray(data) ? data : []);
      } else {
        console.error("Error fetching ID requests:", data);
      }
    } catch (error) {
      console.error("Failed to fetch ID requests:", error);
    }
  }, [safeUser?.id, safeUrl]);

  useEffect(() => {
    if (safeUser?.id || needRefetch) {
      fetchIds();
      fetchIdRequests();
      if (needRefetch) setNeedRefetch(false);
    }
  }, [safeUser?.id, needRefetch, fetchIds, fetchIdRequests]);

  // DISABLED: Automatic status updates to prevent infinite API calls
  // useEffect(() => {
  //   if (!safeUser?.id) return;
  //   const interval = setInterval(() => {
  //     checkStatusUpdates();
  //   }, 120000);
  //   return () => clearInterval(interval);
  // }, [safeUser?.id]);
  
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

  const refreshIdRequests = async () => {
    await fetchIdRequests();
    // Also refresh active IDs to catch newly approved ones
    setNeedRefetch(true);
    toast.current.show({
      severity: 'info',
      summary: 'Refreshed',
      detail: 'ID requests and active IDs refreshed successfully',
      life: 2000
    });
  };

  // Combine regular IDs and ID requests
  const allIds = [
    ...(myIds || []).map(id => ({ ...id, type: 'active' })),
    ...(idRequests || []).filter(request => request.status === 'Pending').map(request => ({ ...request, type: 'request' }))
  ];

  const filteredIds = allIds.filter(
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
    return <p className={styles.error}><strong>No IDs created yet</strong></p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by website name, URL, or username"
          className={styles.searchInput}
        />
        <button 
          onClick={refreshIdRequests}
          className={styles.refreshButton}
          title="Refresh ID Requests"
        >
          🔄
        </button>
      </div>
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
          <div key={item.id} className={`${styles.idCard} ${item.type === 'request' ? styles.requestCard : ''}`}>
            <div className={styles.logo} onClick={() => item.type === 'active' ? handleIdClick(item) : null}>
              <img
                src={`${safeUrl}/${item.imgUrl || ''}`}
                alt={`${item.websiteName || 'Website'} logo`}
              />
              {item.type === 'request' && (
                <div className={styles.requestBadge}>
                  <span className={styles.requestStatus}>{item.status || 'Pending'}</span>
                </div>
              )}
            </div>
            <div className={styles.details}>
              <p className={styles.websiteName}>{item.websiteName || 'N/A'}</p>
              <span>
                <a href={item.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                  {item.websiteUrl || 'N/A'}
                </a>
              </span>
              <p className={styles.userId}><strong>username : </strong>{item.username || 'N/A'}</p>
              {item.type === 'request' ? (
                <>
                  <p className={styles.idBalance}><strong>Coins Requested : </strong>{item.coinAmount || 0} coins</p>
                  <p className={styles.idBalance}><strong>Amount : </strong>₹{item.convertedCoins || 0}</p>
                  <p className={styles.coinRate}><strong>Rate : </strong>1 coin = ₹{item.coinRate}</p>
                  <p className={styles.requestDate}><strong>Requested : </strong>{new Date(item.createdAt).toLocaleDateString()}</p>
                </>
              ) : (
                <>
                  <p className={styles.idBalance}><strong>Balance : </strong>{item.balance || 0} coins</p>
                  {item.coinRate && <p className={styles.coinRate}><strong>Rate : </strong>1 coin = ₹{item.coinRate}</p>}
                </>
              )}
            </div>
            <div className={styles.iconContainer}>
              {item.type === 'request' ? (
                <div className={styles.desktopIcons}>
                  <div className={styles.iconWrapper}>
                    <span className={`${styles.requestStatusIcon} ${styles.pendingIcon}`} title="Request Status">
                      ⏳
                    </span>
                    <p className={styles.iconLabel}>Pending Approval</p>
                  </div>
                  <div className={styles.iconWrapper}>
                    <span className={`${styles.requestStatusIcon} ${styles.infoIcon}`} title="Request Details">
                      ℹ️
                    </span>
                    <p className={styles.iconLabel}>Request Details</p>
                  </div>
                </div>
              ) : (
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
              )}

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
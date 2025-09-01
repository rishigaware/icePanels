import React, { useState, useEffect, useRef } from "react";
import styles from "./MyId.module.css";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from 'react-router-dom';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { FiEdit3, FiSave, FiEye, FiEyeOff } from "react-icons/fi";
import { Toast } from "primereact/toast";
import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import IdDepositPopup from "./IdDepositPopup";
import WithdrawalPopup from "./WithdrawalPopup";

const MyId = () => {
  const toast = useRef(null); // Add a reference for Toast
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
  const [itemsPerPage] = useState(5); // Show 5 IDs per page

  const [walletBalance, setWalletBalance] = useState(100);
  const [showIdDepositPopup, setShowIdDepositPopup] = useState(false); // State to toggle popup
  const [changePasswordPopup, setChangePasswordPopup] = useState(false); // State to toggle popup
  // const [WithdrawalPopup, setWithdrwalPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);

  
  // Edit form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
    comment: ""
  });
  const [editErrors, setEditErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchIds = async () => {
      try {
        if (!safeUser?.id) {
          throw new Error("User ID is missing");
        }

        const response = await fetch(
          `${safeUrl}/api/admin/get-all-ids`    
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
  
// Accept API Call
const handleAccept = async (item) => {
  try {
    const response = await fetch(
      `${safeUrl}/api/admin/accept-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id, // Send the current ID
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to accept ID");
    }
    toast.current.show({
      severity: 'success',
      summary: 'ID Accepted',
      detail: 'ID Accepted Successfully',
      life: 1000,
    });
    setNeedRefetch(true); // Trigger refetch to get updated data
  } catch (err) {
    console.error(err.message);
    toast.current.show({
      severity: 'error',
      summary: 'Error accepting',
      detail: 'Error accepting ID',
      life: 1000,
    });
  }
};

// Reject API Call
const handleReject = async (item) => {
  try {
    const response = await fetch(
      `${safeUrl}/api/admin/reject-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id, // Send the current ID
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reject ID");
    }

    toast.current.show({
      severity: 'error',
      summary: 'ID Rejected',
      detail: 'ID Rejected Successfully',
      life: 1000,
    });
    setNeedRefetch(true); // Trigger refetch to get updated data
  } catch (err) {
    console.error(err.message);
    toast.current.show({
      severity: 'error',
      summary: 'Rejecting erro',
      detail: 'Error rejecting ID',
      life: 1000,
    });

  }
};

  const handleIdClick = (item) => {
    setSelectedId(item);
    // console.log(item);
    setChangePasswordPopup(true)
  };

  const handleClosePopup = () => {
    setSelectedId(null);
    setIsEditMode(false);
    setEditFormData({ username: "", password: "", comment: "" });
    setEditErrors({});
    setShowPassword(false);
  };

  const handleEditModeToggle = () => {
    if (!isEditMode && selectedId) {
      setEditFormData({
        username: selectedId.username || "",
        password: selectedId.password || "",
        comment: selectedId.comment || ""
      });
    }
    setIsEditMode(!isEditMode);
    setEditErrors({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editFormData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!editFormData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const response = await fetch(`${safeUrl}/api/admin/update-id`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedId.id,
          username: editFormData.username.trim(),
          password: editFormData.password.trim(),
          comment: editFormData.comment.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ID");
      }

      toast.current.show({
        severity: "success",
        summary: "ID Updated",
        detail: "ID information updated successfully",
        life: 3000,
      });

      setIsEditMode(false);
      setNeedRefetch(true);
    } catch (error) {
      console.error("Error updating ID:", error);
      
      toast.current.show({
        severity: "error",
        summary: "Update Failed",
        detail: error.message || "Failed to update ID information",
        life: 3000,
      });
    }
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
        toast.current.show({
          severity: 'error',
          summary: 'Failed Change',
          detail: 'Failed to change password',
          life: 1000,
        });
        throw new Error("Failed to change password");
      }

      toast.current.show({
        severity: 'success',
        summary: 'Password changed',
        detail: 'Password changed successfully',
        life: 1000,
      });
      const data = await response.json();

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
    setShowIdDepositPopup(true); // Show deposit popup
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

      {filteredIds.length === 0 ? (
        <p className={styles.noIds}>No IDs match your search criteria.</p>
      ) : (
        currentIds.map((item, index) => (
          <div key={item.id} className={styles.idCard}>
            <div className={styles.logo}>
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
                <strong>CreatedBy : </strong>
                {item.createdBy || 'N/A'}
              </p>
            </div>

            <div className={styles.iconContainer}>
              <div className={styles.statusContainer}>
                <p className={styles.statusText}>
                  <span
                    className={
                      item.status === "Requested"
                        ? styles.statusRequested
                        : item.status === "Created"
                        ? styles.statusCreated
                        : item.status === "Accepted"
                        ? styles.statusAccepted
                        : item.status === "Rejected"
                        ? styles.statusRejected
                        : item.status === "Pending"
                        ? styles.statusPending
                        : item.status === "Username Exists"
                        ? styles.statusUsernameExist
                        : styles.statusActive // Default case if no match
                    }
                  >
                    {item.status}
                  </span>
                </p>
              </div>

              <div className={styles.actionIcons}>
                <button
                  className={`${styles.icon} ${styles.editIcon}`}
                  title="Edit ID"
                  onClick={() => handleIdClick(item)}
                >
                  <FiEdit3 />
                </button>

                <AiOutlineCheckCircle
                  style={{ color: "green", fontSize: "30px" }}
                  className={`${styles.icon} ${styles.acceptIcon}`}
                  title="Accept"
                  onClick={() => handleAccept(item)}
                />

                <AiOutlineCloseCircle
                  style={{ color: "red", fontSize: "30px" }}
                  className={`${styles.icon} ${styles.rejectIcon}`}
                  title="Reject"
                  onClick={() => handleReject(item)}
                />
              </div>
            </div>

          </div>
        ))
      )}

      {/* Pagination Controls */}
      {filteredIds.length > itemsPerPage && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredIds.length)} of {filteredIds.length} IDs
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className={styles.pageEllipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${styles.pageButton} ${
                        page === currentPage ? styles.activePage : ''
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedId && changePasswordPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button onClick={handleClosePopup} className={styles.closeButton}>
              &times;
            </button>
            
            <div className={styles.popupHeader}>
              <img
                src={`${safeUrl}/${selectedId.imgUrl || ''}`}
                alt={`${selectedId.websiteName || 'Website'} logo`}
                className={styles.popupLogo}
              />
              <div className={styles.headerInfo}>
                <h2>{selectedId.websiteName || 'N/A'}</h2>
                <p className={styles.websiteUrl}>{selectedId.websiteUrl || 'N/A'}</p>
              </div>
            </div>

            <div className={styles.popupBody}>
              {!isEditMode ? (
                // View Mode
                <>
                  <div className={styles.infoRow}>
                    <label>Username:</label>
                    <span className={styles.infoValue}>{selectedId.username || 'N/A'}</span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <label>Password:</label>
                    <div className={styles.passwordContainer}>
                      <span className={styles.infoValue}>
                        {showPassword ? selectedId.password || 'N/A' : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeButton}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <label>Status:</label>
                    <span
                      className={`${styles.statusBadge} ${
                        selectedId.status === "Requested"
                          ? styles.statusRequested
                          : selectedId.status === "Created"
                          ? styles.statusCreated
                          : selectedId.status === "Accepted"
                          ? styles.statusAccepted
                          : selectedId.status === "Rejected"
                          ? styles.statusRejected
                          : selectedId.status === "Pending"
                          ? styles.statusPending
                          : selectedId.status === "Username Exists"
                          ? styles.statusUsernameExist
                          : styles.statusActive
                      }`}
                    >
                      {selectedId.status}
                    </span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <label>Created At:</label>
                    <span className={styles.infoValue}>
                      {formatDate(selectedId.createdAt._seconds)}
                    </span>
                  </div>
                  
                  {selectedId.comment && (
                    <div className={styles.infoRow}>
                      <label>Comment:</label>
                      <span className={styles.infoValue}>{selectedId.comment}</span>
                    </div>
                  )}
                </>
              ) : (
                // Edit Mode
                <form className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="editUsername">Username *</label>
                    <input
                      type="text"
                      id="editUsername"
                      name="username"
                      value={editFormData.username}
                      onChange={handleEditInputChange}
                      className={`${styles.editInput} ${editErrors.username ? styles.inputError : ""}`}
                      placeholder="Enter username"
                    />
                    {editErrors.username && (
                      <span className={styles.errorText}>{editErrors.username}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="editPassword">Password *</label>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="editPassword"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditInputChange}
                        className={`${styles.editInput} ${editErrors.password ? styles.inputError : ""}`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeButton}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {editErrors.password && (
                      <span className={styles.errorText}>{editErrors.password}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="editComment">Comment / Remark</label>
                    <textarea
                      id="editComment"
                      name="comment"
                      value={editFormData.comment}
                      onChange={handleEditInputChange}
                      className={styles.editTextarea}
                      placeholder="Add any comments or remarks..."
                      rows={3}
                    />
                  </div>
                </form>
              )}
            </div>

            <div className={styles.popupActions}>
              {!isEditMode ? (
                <>
                  <button
                    onClick={handleEditModeToggle}
                    className={styles.editButton}
                  >
                    <FiEdit3 /> Edit
                  </button>
                  <button
                    onClick={handleClosePopup}
                    className={styles.cancelButton}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditSubmit}
                    className={styles.saveButton}
                  >
                    <FiSave /> Save
                  </button>
                  <button
                    onClick={handleEditModeToggle}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
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
        <WithdrawalPopup
          onClose={closeWithdrawalPopup}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          selectedId={selectedId}
        />
      )}


      
      <Toast ref={toast} />

    </div>
  );
};

export default MyId;

import React, { useState, useEffect } from "react";
import styles from "./MyId.module.css";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import IdDepositPopup from "./IdDepositPopup";
import WithdrawalPopup from "./WithdrawalPopup";

const MyId = () => {
  const { user, url } = useUser();
  const [myIds, setMyIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [needRefetch, setNeedRefetch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query

  const [walletBalance, setWalletBalance] = useState(100);
  const [showIdDepositPopup, setShowIdDepositPopup] = useState(false); // State to toggle popup
  const [changePasswordPopup, setChangePasswordPopup] = useState(false); // State to toggle popup
  // const [WithdrawalPopup, setWithdrwalPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchIds = async () => {
      try {
        if (!user?.id) {
          throw new Error("User ID is missing");
        }

        const response = await fetch(
          `${url}/api/user/get-all-ids?userId=${user?.username}`
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

    if (user?.id || needRefetch) {
      fetchIds();
      setNeedRefetch(false);
    }
  }, [user?.id, needRefetch]);

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
      if (!user?.id || !selectedId?.id) {
        throw new Error("User ID or selected ID is missing");
      }

      const response = await fetch(
        `${url}/api/user/change-id-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
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

  const filteredIds = myIds.filter(
    (id) =>
      id.websiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        filteredIds.map((item, index) => (
          <div key={item.id} className={styles.idCard}>
            <div className={styles.logo} onClick={() => handleIdClick(item)}>
              <img
                src={`${url}/${item.imgUrl}`}
                alt={`${item.websiteName} logo`}
              />
            </div>

            <div className={styles.details}>
              <p className={styles.websiteName}>{item.websiteName}</p>
              <span>
                <a
                  href={item.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  {item.websiteUrl}
                </a>
              </span>
              <p className={styles.userId}>
                <strong>username : </strong>
                {item.username}
              </p>
            </div>

            <div className={styles.iconContainer}>
              <div className={styles.iconWrapper}>
                <PiHandDepositDuotone
                  className={styles.icon}
                  title="Deposit"
                  onClick={() => handleDepositClick(item)} 
                  />
                <p className={styles.iconLabel}>Deposit</p>
              </div>
              <div className={styles.iconWrapper}>
                <BiMoneyWithdraw 
                  className={styles.icon} 
                  title="Withdrawal" 
                  onClick={() => handleWithdrawalClick(item)} 
                  />
                <p className={styles.iconLabel}>Withdrawal</p>
              </div>
            </div>
          </div>
        ))
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
        <WithdrawalPopup
          onClose={closeWithdrawalPopup}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          selectedId={selectedId}
        />
      )}
    </div>


  );
};

export default MyId;


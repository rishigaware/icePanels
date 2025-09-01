import React, { useState, useRef, useEffect } from "react";
import styles from "./NewDepositPopup.module.css";
import { Toast } from "primereact/toast";
import { useUser } from "../../context/UserContext";

export default function NewDepositPopup({ onClose, selectedId }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [refundable, setRefundable] = useState("refundable");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coinRate, setCoinRate] = useState(1);
  const [minimumCoins, setMinimumCoins] = useState(0);
  const [availableWalletBalance, setAvailableWalletBalance] = useState(0);
  
  const toast = useRef(null);
  const { user, refreshUserBalance, url } = useUser();

  useEffect(() => {
    if (selectedId) {
      setCoinRate(selectedId.coinRate || 1);
      setMinimumCoins(selectedId.minimumCoins || 0);
    }
    if (user) {
      setAvailableWalletBalance(user.balance || 0);
    }
  }, [selectedId, user]);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const calculateCoinsFromRupees = (rupees) => {
    if (!rupees || isNaN(rupees)) return 0;
    const baseCoins = Math.floor(rupees / coinRate);
    
    // If below minimum coins, add 0.05 to coin rate
    if (baseCoins < minimumCoins) {
      const adjustedRate = coinRate + 0.05;
      const adjustedCoins = Math.floor(rupees / adjustedRate);
      return adjustedCoins;
    }
    
    return baseCoins;
  };

  const calculateRupeesFromCoins = (coins) => {
    if (!coins || isNaN(coins)) return 0;
    return coins * coinRate;
  };

  const getEffectiveCoinRate = (rupees) => {
    if (!rupees || isNaN(rupees)) return { rate: coinRate, reason: null };
    const baseCoins = Math.floor(rupees / coinRate);
    
    if (baseCoins < minimumCoins) {
      return { 
        rate: coinRate + 0.05, 
        reason: "Adjusted rate for deposits below minimum coins requirement" 
      };
    }
    
    return { rate: coinRate, reason: null };
  };

  const handleDepositAmountChange = (e) => {
    const value = e.target.value;
    setDepositAmount(value);
    setErrorMessage("");
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      setErrorMessage("Please enter a valid deposit amount");
      return;
    }

    const amount = parseFloat(depositAmount);
    const coinsToReceive = calculateCoinsFromRupees(amount);

    // Check if user has sufficient wallet balance
    if (amount > availableWalletBalance) {
      toast.current.show({
        severity: 'error',
        summary: 'Insufficient Wallet Balance',
        detail: `You have ₹${availableWalletBalance} in your wallet. Please add more money to your wallet first.`,
        life: 5000
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      console.log('Sending deposit request with user ID:', user.id);
      console.log('Full user object:', user);
      const response = await fetch(`${url}/api/user/create-new-deposit-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          coinsToReceive: coinsToReceive,
          coinRate: effectiveRate.rate,
          baseCoinRate: coinRate,
          additionalRate: effectiveRate.reason ? 0.05 : 0,
          refundable: refundable === "refundable",
          websiteName: selectedId.websiteName,
          websiteUrl: selectedId.websiteUrl,
          username: selectedId.username,
          id: selectedId.id,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          status: 'Pending'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const rateDisplay = effectiveRate.reason ? `₹${coinRate} + 0.05` : `₹${coinRate}`;
        toast.current.show({
          severity: 'success',
          summary: 'Deposit Request Submitted',
          detail: `Deposit request for ₹${amount} (${coinsToReceive} coins at ${rateDisplay}/coin) submitted successfully.`,
          life: 5000
        });
        
        // Refresh user balance
        await refreshUserBalance();
        
        // Close popup after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to submit deposit request');
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const coinsToReceive = calculateCoinsFromRupees(depositAmount);
  const effectiveRate = getEffectiveCoinRate(depositAmount);
  const isAmountValid = depositAmount && !isNaN(depositAmount) && parseFloat(depositAmount) > 0;
  const hasSufficientBalance = parseFloat(depositAmount || 0) <= availableWalletBalance;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <Toast ref={toast} />

        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h2>Deposit to {selectedId?.websiteName}</h2>
          <p className={styles.subtitle}>Add coins to your account</p>
        </div>

        {/* Scrollable Content */}
        <div className={styles.scrollableContent}>
          {/* Website Details */}
          <div className={styles.websiteDetails}>
            <h3>Website Details</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Website:</span>
              <span className={styles.value}>{selectedId?.websiteName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Username:</span>
              <span className={styles.value}>{selectedId?.username}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Coin Rate:</span>
              <span className={styles.value}>1 coin = ₹{coinRate}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Minimum Coins:</span>
              <span className={styles.value}>{minimumCoins} coins</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Current Balance:</span>
              <span className={styles.value}>{selectedId?.balance || 0} coins</span>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className={styles.walletBalance}>
            <h3>Your Wallet Balance</h3>
            <div className={styles.balanceDisplay}>
              <span className={styles.balanceAmount}>₹{availableWalletBalance}</span>
              <span className={styles.balanceLabel}>Available</span>
            </div>
          </div>

          {/* Deposit Amount */}
          <div className={styles.amountSection}>
            <h3>Deposit Amount</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="depositAmount">Amount in Rupees (₹)</label>
              <input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={handleDepositAmountChange}
                placeholder="Enter amount in rupees"
                min="1"
                step="0.01"
                className={styles.input}
              />
            </div>
          </div>

          {/* Coin Conversion */}
          {isAmountValid && (
            <div className={styles.conversionSection}>
              <h3>Coin Conversion</h3>
              <div className={styles.conversionDisplay}>
                <div className={styles.conversionItem}>
                  <span className={styles.conversionLabel}>You will receive:</span>
                  <span className={styles.conversionValue}>{coinsToReceive} coins</span>
                </div>
                <div className={styles.conversionItem}>
                  <span className={styles.conversionLabel}>Rate:</span>
                  <span className={styles.conversionValue}>
                    1 coin = ₹{coinRate}
                    {effectiveRate.reason && <span className={styles.additionalRate}> + 0.05</span>}
                  </span>
                </div>
                {effectiveRate.reason && (
                  <div className={styles.bonusReason}>
                    <span className={styles.bonusIcon}>🎁</span>
                    <span className={styles.bonusText}>{effectiveRate.reason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {isAmountValid && (
            <div className={styles.validationSection}>
              {!hasSufficientBalance && (
                <div className={styles.warningMessage}>
                  ⚠️ Insufficient wallet balance. You have ₹{availableWalletBalance} available.
                </div>
              )}
              {hasSufficientBalance && (
                <div className={styles.successMessage}>
                  ✅ Deposit request is valid and ready to submit.
                </div>
              )}
            </div>
          )}

          {/* Refundable Option */}
          <div className={styles.refundableSection}>
            <h3>Deposit Type</h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="refundable"
                  value="refundable"
                  checked={refundable === "refundable"}
                  onChange={(e) => setRefundable(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  <strong>Refundable</strong>
                  <small>You can request a refund of this deposit</small>
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="refundable"
                  value="non-refundable"
                  checked={refundable === "non-refundable"}
                  onChange={(e) => setRefundable(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  <strong>Non-Refundable</strong>
                  <small>This deposit cannot be refunded</small>
                </span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </div>

        {/* Submit Button Container */}
        <div className={styles.submitButtonContainer}>
          <button 
            className={styles.submitButton} 
            onClick={handleDeposit}
            disabled={isSubmitting || !isAmountValid || !hasSufficientBalance}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

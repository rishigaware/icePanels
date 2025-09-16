import React, { useState, useEffect, useRef } from 'react';
import styles from './IdRequests.module.css';
import { useUser } from '../../../../context/UserContext';
import { Toast } from 'primereact/toast';
import { PulseLoader } from 'react-spinners';
import { FaCheck, FaTimes, FaEye, FaCoins, FaUser, FaGlobe, FaClock, FaRupeeSign } from 'react-icons/fa';

const IdRequests = () => {
  const { url } = useUser();
  const toast = useRef(null);
  const [idRequests, setIdRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchIdRequests();
  }, []);

  const fetchIdRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/api/admin/id-requests`);
      const data = await response.json();
      
      if (response.ok) {
        setIdRequests(data);
      } else {
        console.error('Error fetching ID requests:', data);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch ID requests',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to fetch ID requests:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch ID requests',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setActionLoading(requestId);
      const response = await fetch(`${url}/api/admin/update-id-request-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          status: status,
          adminNotes: adminNotes,
          processedBy: 'admin'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `ID request ${status.toLowerCase()} successfully`,
          life: 3000,
        });
        fetchIdRequests();
        handleCloseModal();
      } else {
        console.error('Error updating status:', data);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: data.message || 'Failed to update status',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update status',
        life: 3000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Pending': { className: styles.pendingBadge, text: 'Pending' },
      'Accepted': { className: styles.acceptedBadge, text: 'Accepted' },
      'Rejected': { className: styles.rejectedBadge, text: 'Rejected' }
    };
    
    const statusStyle = statusStyles[status] || statusStyles['Pending'];
    
    return (
      <span className={`${styles.statusBadge} ${statusStyle.className}`}>
        {statusStyle.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <PulseLoader color="#4592ef" loading={isLoading} size={15} />
        <p>Loading ID requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ID Creation Requests</h1>
        <p className={styles.subtitle}>Manage user ID creation requests with coin conversion</p>
      </div>

      {idRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <FaCoins className={styles.emptyIcon} />
          <h3>No ID Requests Found</h3>
          <p>There are currently no ID creation requests to review.</p>
        </div>
      ) : (
        <div className={styles.requestsGrid}>
          {idRequests.map((request) => (
            <div key={request.id} className={styles.requestCard}>
              <div className={styles.cardHeader}>
                <div className={styles.websiteInfo}>
                  <img
                    src={`${url}/${request.imgUrl}`}
                    alt={request.websiteName}
                    className={styles.websiteLogo}
                  />
                  <div className={styles.websiteDetails}>
                    <h3 className={styles.websiteName}>{request.websiteName}</h3>
                    <p className={styles.websiteUrl}>{request.websiteUrl}</p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.userInfo}>
                  <div className={styles.infoRow}>
                    <FaUser className={styles.icon} />
                    <span className={styles.label}>Username:</span>
                    <span className={styles.value}>{request.username}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <FaUser className={styles.icon} />
                    <span className={styles.label}>Created By:</span>
                    <span className={styles.value}>{request.createdBy}</span>
                  </div>
                </div>

                <div className={styles.coinInfo}>
                  <div className={styles.infoRow}>
                    <FaRupeeSign className={styles.icon} />
                    <span className={styles.label}>Amount:</span>
                    <span className={styles.value}>₹{request.coinAmount}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <FaCoins className={styles.icon} />
                    <span className={styles.label}>Coins:</span>
                    <span className={styles.value}>{request.convertedCoins}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Rate:</span>
                    <span className={styles.value}>1₹ = {request.coinRate} coins</span>
                  </div>
                </div>

                <div className={styles.additionalInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Account Type:</span>
                    <span className={styles.value}>{request.accountType}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Currency:</span>
                    <span className={styles.value}>{request.currency}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Refundable:</span>
                    <span className={`${styles.value} ${request.refundable ? styles.refundableYes : styles.refundableNo}`}>
                      {request.refundable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className={styles.dateInfo}>
                  <div className={styles.infoRow}>
                    <FaClock className={styles.icon} />
                    <span className={styles.label}>Requested:</span>
                    <span className={styles.value}>{formatDate(request.createdAt)}</span>
                  </div>
                  {request.processedAt && (
                    <div className={styles.infoRow}>
                      <FaClock className={styles.icon} />
                      <span className={styles.label}>Processed:</span>
                      <span className={styles.value}>{formatDate(request.processedAt)}</span>
                    </div>
                  )}
                </div>

                {request.adminNotes && (
                  <div className={styles.adminNotes}>
                    <span className={styles.label}>Admin Notes:</span>
                    <p className={styles.notesText}>{request.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => handleViewDetails(request)}
                  className={styles.viewButton}
                >
                  <FaEye className={styles.buttonIcon} />
                  View Details
                </button>
                {request.status === 'Pending' && (
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'Accepted')}
                      className={styles.acceptButton}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <PulseLoader color="#ffffff" size={8} />
                      ) : (
                        <>
                          <FaCheck className={styles.buttonIcon} />
                          Accept
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                      className={styles.rejectButton}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <PulseLoader color="#ffffff" size={8} />
                      ) : (
                        <>
                          <FaTimes className={styles.buttonIcon} />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for detailed view and actions */}
      {showModal && selectedRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>ID Request Details</h2>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Website Information</h3>
                <div className={styles.websiteInfo}>
                  <img
                    src={`${url}/${selectedRequest.imgUrl}`}
                    alt={selectedRequest.websiteName}
                    className={styles.websiteLogo}
                  />
                  <div>
                    <p><strong>Name:</strong> {selectedRequest.websiteName}</p>
                    <p><strong>URL:</strong> {selectedRequest.websiteUrl}</p>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>User Information</h3>
                <p><strong>Username:</strong> {selectedRequest.username}</p>
                <p><strong>Created By:</strong> {selectedRequest.createdBy}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>Coin Conversion Details</h3>
                <p><strong>Amount:</strong> ₹{selectedRequest.coinAmount}</p>
                <p><strong>Coins to Receive:</strong> {selectedRequest.convertedCoins}</p>
                <p><strong>Coin Rate:</strong> 1₹ = {selectedRequest.coinRate} coins</p>
                <p><strong>Minimum Required:</strong> {selectedRequest.minimumCoins} coins</p>
                <p><strong>Refundable:</strong> {selectedRequest.refundable ? 'Yes' : 'No'}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  className={styles.notesTextarea}
                  rows={3}
                />
              </div>
            </div>

            {selectedRequest.status === 'Pending' && (
              <div className={styles.modalActions}>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Accepted')}
                  className={styles.acceptButton}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <PulseLoader color="#ffffff" size={8} />
                  ) : (
                    <>
                      <FaCheck className={styles.buttonIcon} />
                      Accept Request
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                  className={styles.rejectButton}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <PulseLoader color="#ffffff" size={8} />
                  ) : (
                    <>
                      <FaTimes className={styles.buttonIcon} />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast ref={toast} />
    </div>
  );
};

export default IdRequests;

import React, { useState, useEffect, useRef } from 'react';
import styles from './IdRequests.module.css';
import { useUser } from '../../../../context/UserContext';
import { Toast } from 'primereact/toast';
import { PulseLoader } from 'react-spinners';
import { FaCheck, FaTimes, FaEye, FaCoins, FaUser, FaGlobe, FaClock, FaRupeeSign } from 'react-icons/fa';
import TopNavbar from '../Navbar/TopNavbar';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Box,
  Button
} from '@mui/material';
import { Visibility, Check, Close } from '@mui/icons-material';

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

  const getStatusChip = (status) => {
    let color = 'default';
    if (status === 'Accepted') color = 'success';
    if (status === 'Rejected') color = 'error';
    if (status === 'Pending') color = 'warning';

    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        variant={status === 'Pending' ? 'outlined' : 'filled'}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
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
      <TopNavbar />
      <div className={styles.header} style={{ marginTop: '20px', marginBottom: '20px' }}>
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
        <TableContainer 
          component={Paper} 
          elevation={3} 
          sx={{ 
            borderRadius: '12px', 
            overflow: 'auto',
            maxWidth: '100%',
            // Enable horizontal scrolling on mobile
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >
          <Table 
            sx={{ 
              minWidth: { xs: '100%', sm: 650 }, // Remove minWidth on mobile
              width: '100%'
            }} 
            aria-label="id requests table"
            stickyHeader // Make header sticky on scroll
          >
            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ minWidth: { xs: '150px', sm: 'auto' } }}><strong>Website</strong></TableCell>
                <TableCell sx={{ minWidth: { xs: '120px', sm: 'auto' } }}><strong>User Info</strong></TableCell>
                <TableCell sx={{ minWidth: { xs: '120px', sm: 'auto' } }}><strong>Coins / Amount</strong></TableCell>
                <TableCell sx={{ minWidth: { xs: '100px', sm: 'auto' } }}><strong>Status</strong></TableCell>
                <TableCell sx={{ minWidth: { xs: '150px', sm: 'auto' } }}><strong>Date</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: { xs: '120px', sm: 'auto' } }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {idRequests.map((request) => (
                <TableRow
                  key={request.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Avatar 
                          src={`${url}/${request.imgUrl}`} 
                          alt={request.websiteName}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{request.websiteName}</Typography>
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            component="div" 
                            sx={{ 
                              maxWidth: { xs: 150, sm: 200 }, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {request.websiteUrl}
                          </Typography>
                        </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2"><strong>User:</strong> {request.username}</Typography>
                    <Typography variant="caption" color="textSecondary">By: {request.createdBy}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                         ₹{request.convertedCoins}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FaCoins style={{ color: '#ffd700' }} /> {request.coinAmount} Coins
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(request.status)}
                  </TableCell>
                  <TableCell>
                     <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{formatDate(request.createdAt)}</Typography>
                     {request.processedAt && (
                       <Typography variant="caption" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>Proc: {formatDate(request.processedAt)}</Typography>
                     )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={() => handleViewDetails(request)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {request.status === 'Pending' && (
                        <>
                          <Tooltip title="Accept">
                             <IconButton 
                                color="success" 
                                size="small"
                                onClick={() => handleUpdateStatus(request.id, 'Accepted')}
                                disabled={actionLoading === request.id}
                              >
                                {actionLoading === request.id ? <PulseLoader size={4} color="green" /> : <Check />}
                              </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                                disabled={actionLoading === request.id}
                              >
                                {actionLoading === request.id ? <PulseLoader size={4} color="red" /> : <Close />}
                              </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                <p><strong>Amount:</strong> ₹{selectedRequest.convertedCoins}</p>
                <p><strong>Coins to Receive:</strong> {selectedRequest.coinAmount}</p>
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

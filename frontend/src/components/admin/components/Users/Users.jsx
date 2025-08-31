import React, { useState, useEffect, useRef } from "react";
import styles from "./Users.module.css";
import TopNavbar from "../Navbar/TopNavbar";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PulseLoader } from "react-spinners";
import { Toast } from "primereact/toast";
import { useUser } from "../../../../context/UserContext";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tempBalance, setTempBalance] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingBalance, setUpdatingBalance] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(12);
    const toast = useRef(null);
    const { user, url } = useUser();

    // Function to get user initials
    const getUserInitials = (name) => {
        if (!name) return 'U';
        
        const nameParts = name.trim().split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        } else if (nameParts.length >= 2) {
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
        return 'U';
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${url}/api/admin/get-all-users`);
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();
            setUsers(data);
            setCurrentPage(1); // Reset to first page when fetching new data
        } catch (error) {
            console.error("Error fetching users:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
      
    const handleUpdateBalance = async () => {
        if (!selectedUser || tempBalance === "") return;
        
        setUpdatingBalance(true);
        try {
            const response = await fetch(`${url}/api/admin/update-user-balance/${selectedUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ balance: tempBalance }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update balance');
            }
            
            const updatedUser = await response.json();
            
            // Update the users state with the new balance
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === updatedUser.id ? { ...user, balance: updatedUser.balance } : user
                )
            );
            
            toast.current.show({
                severity: 'success',
                summary: 'Balance Updated',
                detail: 'User balance updated successfully',
                life: 2000,
            });
            
            setSelectedUser((prev) => ({ ...prev, balance: updatedUser.balance }));
            setTempBalance("");
            handleClosePopup();
        } catch (error) {
            console.error('Error updating balance:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Update Failed',
                detail: 'Error while updating balance',
                life: 2000,
            });
        } finally {
            setUpdatingBalance(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!selectedUser || tempPassword === "") return;
        
        setUpdatingPassword(true);
        try {
            const response = await fetch(`${url}/api/admin/change-user-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: selectedUser.id, 
                    newPassword: tempPassword 
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update password');
            }
            
            toast.current.show({
                severity: 'success',
                summary: 'Password Updated',
                detail: 'User password updated successfully',
                life: 2000,
            });
            
            setTempPassword("");
            handleClosePopup();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Update Failed',
                detail: 'Error while updating password',
                life: 2000,
            });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleUserClick = (user) => {
        fetchUsers();
        const latestUser = users.find((u) => u.id === user.id);
        setSelectedUser(latestUser);
        setTempBalance(latestUser.balance || "0");
    };

    const handleClosePopup = () => {
        setSelectedUser(null);
        setTempBalance("");
        setTempPassword("");
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${url}/api/admin/delete-user/${userId}`, {
                method: 'DELETE',
            });
      
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            
            toast.current.show({
                severity: 'success',
                summary: 'User Deleted',
                detail: `User "${userName}" deleted successfully`,
                life: 2000,
            });
      
            // Update local state to remove the user
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Delete Failed',
                detail: 'Error while deleting user',
                life: 2000,
            });
            console.error("Error deleting user:", error);
        }
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search query
    const filteredUsers = (users || []).filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
            <div className={styles.container}>
                <TopNavbar />
                <div className={styles.loading}>
                    <PulseLoader color="#3267d2" loading={loading} size={20} />
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <TopNavbar />
                <div className={styles.emptyState}>
                    <h3>Error Loading Users</h3>
                    <p>{error}</p>
                    <button 
                        onClick={fetchUsers}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#3267d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Toast ref={toast} />
            <TopNavbar />
            
            <h2 className={styles.heading}>
                <strong>Users Management</strong>
            </h2>

            {/* Search Container */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                    }}
                    placeholder="Search by name, username, phone, or email..."
                    className={styles.searchInput}
                />
            </div>

            {/* Users Count */}
            <div className={styles.usersCount}>
                {filteredUsers.length === 0 ? 'No users found' : `${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'} found`}
                {filteredUsers.length > usersPerPage && (
                    <span> • Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}</span>
                )}
            </div>

            {/* Users List */}
            <div className={styles.userList}>
                {currentUsers.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h3>No Users Found</h3>
                        <p>Try adjusting your search criteria or check if there are any users in the system.</p>
                    </div>
                ) : (
                    currentUsers.map((user) => (
                        <div
                            key={user.id}
                            className={styles.userCard}
                            onClick={() => handleUserClick(user)}
                        >
                            <div className={styles.userCardContent}>
                                {/* Initials Avatar */}
                                <div className={styles.initialsAvatar}>
                                    {getUserInitials(user.name)}
                                </div>

                                {/* User Details */}
                                <div className={styles.userDetails}>
                                    <p>
                                        <strong>Name:</strong> {user.name || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Username:</strong> {user.username || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Phone:</strong> {user.phoneNumber || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Balance:</strong> ₹{user.balance || '0'}
                                    </p>
                                </div>

                                {/* Delete Icon */}
                                <DeleteOutlineIcon
                                    className={styles.deleteIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUser(user.id, user.name || user.username);
                                    }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
                <div className={styles.paginationContainer}>
                    {/* Previous Button */}
                    <button
                        className={styles.paginationButton}
                        onClick={prevPage}
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
                            onClick={() => typeof number === 'number' && paginate(number)}
                            disabled={number === '...'}
                        >
                            {number}
                        </button>
                    ))}

                    {/* Next Button */}
                    <button
                        className={styles.paginationButton}
                        onClick={nextPage}
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

            {/* User Details Popup */}
            {selectedUser && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <button onClick={handleClosePopup} className={styles.closeButton}>
                            &times;
                        </button>
                        
                        <div className={styles.popupHeader}>
                            <h2>{selectedUser.name || 'User Details'}</h2>
                        </div>
                        
                        <div className={styles.popupBody}>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Name:</strong> {selectedUser.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
                            <p><strong>Username:</strong> {selectedUser.username || 'N/A'}</p>
                            <p><strong>Phone Number:</strong> {selectedUser.phoneNumber || 'N/A'}</p>
                            <p><strong>Current Balance:</strong> ₹{selectedUser.balance || '0'}</p>
                            
                            {/* Update Balance Section */}
                            <div className={styles.updateBalance}>
                                <label>
                                    <strong>Update Balance:</strong>
                                </label>
                                <input
                                    type="number"
                                    value={tempBalance}
                                    onChange={(e) => setTempBalance(e.target.value)}
                                    className={styles.balanceInput}
                                    placeholder="Enter new balance amount"
                                    min="0"
                                    step="0.01"
                                />
                                <button 
                                    onClick={handleUpdateBalance} 
                                    className={styles.updateButton}
                                    disabled={updatingBalance || tempBalance === ""}
                                >
                                    {updatingBalance ? (
                                        <>
                                            <PulseLoader color="#ffffff" size={8} />
                                            <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
                                        </>
                                    ) : (
                                        'Update Balance'
                                    )}
                                </button>
                            </div>

                            {/* Update Password Section */}
                            <div className={styles.updatePassword}>
                                <label>
                                    <strong>Update Password:</strong>
                                </label>
                                <input
                                    type="password"
                                    value={tempPassword}
                                    onChange={(e) => setTempPassword(e.target.value)}
                                    className={styles.passwordInput}
                                    placeholder="Enter new password"
                                />
                                <button 
                                    onClick={handleUpdatePassword} 
                                    className={styles.updateButton}
                                    disabled={updatingPassword || tempPassword === ""}
                                >
                                    {updatingPassword ? (
                                        <>
                                            <PulseLoader color="#ffffff" size={8} />
                                            <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;


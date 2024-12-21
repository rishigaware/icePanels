import React, { useState, useEffect, useRef } from "react";
import styles from "./Users.module.css";
import TopNavbar from "../Navbar/TopNavbar";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import { PulseLoader } from "react-spinners";
import { Toast } from "primereact/toast";
import { useUser } from "../../../../context/UserContext";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);  // Define the loading state
    const [error, setError] = useState(null);  // Define the error state
    const [tempBalance, setTempBalance] = useState(""); // Temporary state for balance input
    const [searchQuery, setSearchQuery] = useState(""); // State for the search query
    const toast = useRef(null); // Add a reference for Toast
    const { user, url } = useUser();



    const fetchUsers = async () => {
        setLoading(true); // Start loading before fetching
        try {
          const response = await fetch(`${url}/api/admin/get-all-users`);
          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }
          const data = await response.json();
          setUsers(data); // Set the fetched users directly inside this function
        } catch (error) {
          console.error("Error fetching users:", error);
          setError(error.message); // Set error state
        } finally {
          setLoading(false); // Stop loading after fetch completes or fails
        }
      };
      
      const handleUpdateBalance = async () => {
        if (!selectedUser || tempBalance === "") return;
        setLoading(true); // Start loading for update
        try {
          const response = await fetch(`${url}/api/admin/update-user-balance/${selectedUser.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ balance: tempBalance }), // Use tempBalance for the API request
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
          setSelectedUser((prev) => ({ ...prev, balance: updatedUser.balance })); // Update selectedUser's balance
          setTempBalance(""); // Clear the temp balance input
          handleClosePopup(); // Close the popup after updating
        } catch (error) {
          console.error('Error updating balance:', error);
          toast.current.show({
            severity: 'error',
            summary: 'Update Failed',
            detail: 'Error while updating balance',
            life: 2000,
          });
        } finally {
          setLoading(false); // Stop loading after the update operation
        }
      };
      

    const handleUserClick = (user) => {
        fetchUsers();
        const latestUser = users.find((u) => u.id === user.id); // Get the latest user data
        setSelectedUser(latestUser); // Update selectedUser with the latest data
        setTempBalance(latestUser.balance); // Set tempBalance with the updated balance
    };
  

    const handleClosePopup = () => {
        setSelectedUser(null);
    };

    const handleDeleteUser = async (userId) => {
        try {
          // Make the API call to delete the user from the database
          const response = await fetch(`${url}/api/admin/delete-user/${userId}`, {
            method: 'DELETE',
          });
      
          if (!response.ok) {
            throw new Error('Failed to delete user');
          }
          toast.current.show({
            severity: 'success',
            summary: 'User Deleted',
            detail: 'User Deleted successfully:',
            life: 2000,
          });
      
          // If deletion is successful, update the local state to remove the user
          setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'User Not Deleted',
                detail: 'Error while Deleting User:',
                life: 2000,
              });
          console.error("Error deleting user:", error);
          // Optionally, you can show an error message to the user
        }
    };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();  // Call the fetchUsers function
  }, []);  // Empty dependency array ensures this runs once on mount

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
      

  return (
    <div className={styles.container}>
      <Toast ref={toast} />

      <TopNavbar />
      <h2 className={styles.heading}><strong>Users</strong></h2>

        <div className={styles.loading}>
            <PulseLoader color="#4592ef" loading={loading} size={15} />
        </div>
        {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name, username, or phone number"
        className={styles.searchInput} // Add styling for the search input
      />

        <div className={styles.userList}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={styles.userCard}
              onClick={() => handleUserClick(user)}
            >
              <div className={styles.userCardContent}>
                {/* Profile Icon */}
                <PersonPinIcon sx={{ fontSize: 35, color: "#007BFF" }} />

                {/* User Details */}
                <div className={styles.userDetails}>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {user.phoneNumber}
                  </p>
                </div>

                {/* Delete Icon */}
                <DeleteOutlineIcon
                  sx={{
                    fontSize: 25,
                    color: "#fa3030",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDeleteUser(user.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>



        {selectedUser && (
  <div className={styles.popup}>
    <div className={styles.popupContent}>
      <button onClick={handleClosePopup} className={styles.closeButton}>
        &times;
      </button>
      <div className={styles.popupHeader}>
        <h2>{selectedUser.name}</h2>
      </div>
      <div className={styles.popupBody}>
        <p><strong>ID:</strong> {selectedUser.id}</p>
        <p><strong>Email:</strong> {selectedUser.email}</p>
        <p><strong>Username:</strong> {selectedUser.username}</p>
        <p><strong>Password:</strong> {selectedUser.password}</p>
        <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
        <p><strong>Balance:</strong> {selectedUser.balance}</p>
        {/* Update Balance Section */}
        <div className={styles.updateBalance}>
          <label>
            <strong>Update Balance:</strong>
            </label>
            <input
                type="number"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)} // Update tempBalance instead of selectedUser
                className={styles.balanceInput}
            />
          <button onClick={handleUpdateBalance} className={styles.updateButton}>
            Update
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Users;


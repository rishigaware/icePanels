import React, { useState, useEffect } from "react";
import styles from "./ProfilePage.module.css"; // Using CSS Modules for styling
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TopNavbar from '../Navbar/TopNavbar';
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from 'react-router-dom';
import LoginPopup from '../Login/LoginPopup';



const ProfilePage = () => {
  const { user, setUser, url } = useUser();  // Get user and setUser from context
  const navigate = useNavigate(); // For navigation
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility


  // console.log(user.id)
  const [profileInfo, setProfileInfo] = useState({
  name: user?.name || '', // ensure default empty string
  phone: user?.phoneNumber || '', // ensure default empty string
  email: user?.email || '', // ensure default empty string
  password: user?.password || '', // ensure default empty string
});

  const [paymentInfo, setPaymentInfo] = useState({
    accountNumber: '1234567890',
    accountHolderName: 'John Doe',
    ifscCode: 'ABCD0123456',
    bankName: 'XYZ Bank',
    upiId: 'abc@upi' // Add default empty string for UPI ID
  });

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isPaymentEditing, setIsPaymentEditing] = useState(false);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch user data on component load (useEffect)
// Check if user exists on component mount
  useEffect(() => {
      if (!user) {
        setIsModalOpen(true); // Open modal if no user exists
        return
      }

    // Send GET request with user.id as a query parameter
    fetch(`${url}/api/admin/get-accountdetails?userId=${user.id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error fetching user data');
      })
      .then(data => {
        // Assuming the API returns the full profile info
        setPaymentInfo({
          accountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName,
          ifscCode: data.ifscCode,
          bankName: data.bankName,
          upiId: data.upiId, // Include UPI ID here
        });
      })
      .catch(error => {
        console.error('Error during the request:', error);
      });
  }, [user, navigate]);  // Effect runs when the 'user' object changes or navigate changes

  // Handle edit button click for Profile
  const handleProfileEditClick = () => {
    setIsProfileEditing(true);
  };

  // Handle edit button click for Payment
  const handlePaymentEditClick = () => {
    setIsPaymentEditing(true);
  };

  // Handle change for profile fields
  const handleProfileChange = (field, value) => {
    setProfileInfo(prevState => ({ ...prevState, [field]: value }));
  };

  // Handle change for payment fields
  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prevState => ({ ...prevState, [field]: value }));
  };

  const handleLogout = () => {
    // Clear user state
    setUser(null);
    // Remove user from localStorage
    localStorage.removeItem('user');
    setIsModalOpen(true);
};


  // Handle save button click for Payment
  const handlePaymentSaveClick = async () => {
    const userId = user.id;

    try {
      const response = await fetch(`${url}/api/admin/update-accountdetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accountNumber: paymentInfo.accountNumber,
          accountHolderName: paymentInfo.accountHolderName,
          ifscCode: paymentInfo.ifscCode,
          bankName: paymentInfo.bankName,
          upiId: paymentInfo.upiId, // Include UPI ID here
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment Details Updated:');
        setIsPaymentEditing(false);  // Disable editing after successful update
      } else {
        const errorData = await response.json();
        console.error('Error updating payment details:', errorData.message);
      }
    } catch (error) {
      console.error('Error during the request:', error);
    }
  };
  const handleProfileSaveClick = async () => {
    const userId = user.id;  // Keep userId as is
    // console.log(userId);
  
    // Prepare the updated profile data
    const updatedProfile = {
      userId,
      name: profileInfo.name,
      phoneNumber: profileInfo.phone,
      email: profileInfo.email,
      password: profileInfo.password, // Only include password if necessary
    };
  
    try {
      // Send POST request to update profile data
      const response = await fetch(`${url}/api/user/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });
  
      // console.log(response);
  
      if (response.ok) {
        // Successfully updated the profile
        const data = await response.json();
        console.log('Profile Updated:');
  
        // Update the user context with the updated information, keeping the userId intact
        setUser((prevUser) => ({
          ...prevUser, // Spread the previous user data
          name: data.updatedUser.name,  // Update the name
          phoneNumber: data.updatedUser.phoneNumber,  // Update the phone number
          email: data.updatedUser.email,  // Update the email
          password: data.updatedUser.password,  // Only update the password if necessary
        }));
  
        // Update localStorage with the updated user information (excluding password)
        // const { password, ...userWithoutPassword } = data.updatedUser; // Exclude password from localStorage
        localStorage.setItem('user', JSON.stringify(user));
  
        // Disable editing mode
        setIsProfileEditing(false);
      } else {
        // Handle errors from the server
        const errorData = await response.json();
        console.error('Error updating profile:', errorData.message);
      }
    } catch (error) {
      // Handle any network or request errors
      console.error('Error during the request:', error);
    }
  };
  
  return (
    <div className={styles.profilePage}>
      <TopNavbar />

      <div className={styles.container}>
        
      <div className={styles.balanceContainer}>
          <div className={styles.amount}>
            <strong>₹ 500,000,000,000</strong>  {/* Replace with actual deposit amount */}
          </div>
          <p className={styles.wallet}>
            <strong>Wallet Balance</strong>
          </p>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <strong>Logout</strong>
          </button>
        </div>

    
        {/* Profile Information Card */}
        <div className={styles.card}>
          <p>
            <AccountCircleIcon
              style={{ marginRight: '5px', fontSize: '2.5rem', color: '#1f5fff' }}
            />
          </p>
          <h2><strong>Profile Information</strong></h2>
          <p>
            <strong>Name :&nbsp;</strong>
            {isProfileEditing ? (
              <input
                type="text"
                value={profileInfo.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                className={styles.editInput}
              />
            ) : (
              profileInfo.name
            )}
          </p>
          <p>
            <strong>Phone Number :&nbsp;</strong>
            {isProfileEditing ? (
              <input
                type="text"
                value={profileInfo.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className={styles.editInput}
              />
            ) : (
              profileInfo.phone
            )}
          </p>
          <p>
            <strong>Email :&nbsp;</strong>
            {profileInfo.email}
          </p>
          {isProfileEditing && (
            <p>
              <strong>Change Password :&nbsp;</strong>
              <input
                type="password"
                value={profileInfo.password}
                onChange={(e) => handleProfileChange('password', e.target.value)}
                className={styles.editInput}
              />
            </p>
          )}
          <div className={styles.buttonContainer}>
            {isProfileEditing ? (
              <button className={styles.saveButton} onClick={handleProfileSaveClick}>Update</button>
            ) : (
              <button className={styles.editButton} onClick={handleProfileEditClick}>
                Edit
              </button>
            )}
          </div>
        </div>

        

        {/* Payment Details Card */}
        <div className={styles.card}>
          <p>
            <AccountBalanceIcon style={{ fontSize: '3rem', color: '#1f5fff' }} />
          </p>
          <h2><strong>Payment Details</strong></h2>
          <p>
            <strong>Account Number :&nbsp;</strong>
            {isPaymentEditing ? (
              <input
                type="text"
                value={paymentInfo.accountNumber}
                onChange={(e) => handlePaymentChange('accountNumber', e.target.value)}
                className={styles.editInput}
              />
            ) : (
              paymentInfo.accountNumber
            )}
          </p>
          <p>
            <strong>Account Holder Name :&nbsp;</strong>
            {isPaymentEditing ? (
              <input
                type="text"
                value={paymentInfo.accountHolderName}
                onChange={(e) => handlePaymentChange('accountHolderName', e.target.value)}
                className={styles.editInput}
                style={{ width: '30%' }}
              />
            ) : (
              paymentInfo.accountHolderName
            )}
          </p>
          <p>
            <strong>IFSC Code :&nbsp;</strong>
            {isPaymentEditing ? (
              <input
                type="text"
                value={paymentInfo.ifscCode}
                onChange={(e) => handlePaymentChange('ifscCode', e.target.value)}
                className={styles.editInput}
              />
            ) : (
              paymentInfo.ifscCode
            )}
          </p>
          <p>
            <strong>Bank Name :&nbsp;</strong>
            {isPaymentEditing ? (
              <input
                type="text"
                value={paymentInfo.bankName}
                onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                className={styles.editInput}
              />
            ) : (
              paymentInfo.bankName
            )}
          </p>
          <p>
            <strong>UPI ID :&nbsp;</strong>
            {isPaymentEditing ? (
              <input
                type="text"
                value={paymentInfo.upiId}
                onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                className={styles.editInput}
              />
            ) : (
              paymentInfo.upiId || 'Not provided'
            )}
          </p>
          <div className={styles.buttonContainer}>
            {isPaymentEditing ? (
              <button className={styles.saveButton} onClick={handlePaymentSaveClick}>
                Update
              </button>
            ) : (
              <button className={styles.editButton} onClick={handlePaymentEditClick}>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
    </div>
  );
};

export default ProfilePage;

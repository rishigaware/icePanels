import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Create the context
const UserContext = createContext();

// UserProvider component to wrap the app and provide user data
export const UserProvider = ({ children }) => {
  // State to manage the user object  
  const [url, setUrl] = useState("https://betting-accounts-manager.onrender.com");
  // const [url, setUrl] = useState("http://localhost:3000");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return null;
    }
});

  // Centralized balance fetching function
  const fetchUserBalance = useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      const response = await fetch(`${url}/api/user/get-balance/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.balance;
      } else {
        console.error('Failed to fetch balance');
        return null;
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }, [url]);

  // Function to refresh user balance
  const refreshUserBalance = useCallback(async () => {
    if (user?.id) {
      const newBalance = await fetchUserBalance(user.id);
      if (newBalance !== null) {
        setUser(prevUser => ({
          ...prevUser,
          balance: newBalance
        }));
        return newBalance;
      }
    }
    return null;
  }, [user?.id, fetchUserBalance]);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      // Store user object in localStorage whenever it changes
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // If user is null, remove from localStorage
      localStorage.removeItem('user');
    }
  }, [user?.id, user?.name, user?.email, user?.phoneNumber, user?.balance]); // Include balance in dependencies

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser,
    url,
    setUrl,
    fetchUserBalance,
    refreshUserBalance
  }), [user?.id, user?.name, user?.email, user?.phoneNumber, user?.balance, url, fetchUserBalance, refreshUserBalance]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user data in any component
export const useUser = () => {
  return useContext(UserContext);
};

export default UserContext;

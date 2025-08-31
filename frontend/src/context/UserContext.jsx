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

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      // Store user object in localStorage whenever it changes
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // If user is null, remove from localStorage
      localStorage.removeItem('user');
    }
  }, [user?.id, user?.name, user?.email, user?.phoneNumber]); // Only depend on specific user properties

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser,
    url,
    setUrl
  }), [user?.id, user?.name, user?.email, user?.phoneNumber, url]);

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

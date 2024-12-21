import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const UserContext = createContext();

// UserProvider component to wrap the app and provide user data
export const UserProvider = ({ children }) => {
  // State to manage the user object
  const [url, setUrl] = useState("http://localhost:3000");
  const [user, setUser] = useState(() => {
    // Retrieve the user object from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
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
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, url, setUrl }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user data in any component
export const useUser = () => {
  return useContext(UserContext);
};

export default UserContext;

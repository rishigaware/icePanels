import React, { useState, useEffect } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { FaUsers } from "react-icons/fa";
import styles from "./Navbar.module.css"; // Import CSS module

export default function Navbar() {
  const location = useLocation(); // Get the current location (route)
  
  // Set the initial value based on the current route
  const [value, setValue] = useState(getRouteValue(location.pathname));

  // Function to get value based on the route
  function getRouteValue(pathname) {
    switch (pathname) {
      case "/admin/home":
        return "recents"; // Home
      case "/admin/id":
        return "favorites"; // IDs
      case "/admin/users":
        return "users"; // Settings
      case "/admin/transactions":
        return "nearby"; // Transactions
      case "/admin/profile":
        return "folder"; // Profile
      default:
        return "recents"; // Default to Home if no match
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Update the value state whenever the location changes
  useEffect(() => {
    setValue(getRouteValue(location.pathname));
  }, [location]);

  return (
    <BottomNavigation
      className={`${styles.navbar} ${styles.navbarBlack}`} // Combine both classes
      value={value}
      onChange={handleChange}
    >
      <BottomNavigationAction
        label="Home"
        value="recents"
        icon={<MapsHomeWorkIcon />}
        component={Link} // Use Link component to navigate
        to="/admin/home" // Link to the home route
      />

      <BottomNavigationAction
        label="ID"
        value="favorites"
        icon={<RecentActorsIcon />}
        component={Link}
        to="/admin/id" // Link to the ID manager route
      />

      <BottomNavigationAction
        label="Users" // Label for the new navigation
        value="users" // Unique value for this navigation
        icon={<GroupsIcon/>} // Increase font size
        component={Link} // Use Link component to navigate
        to="/admin/users" // Link to the settings route
      />
      <BottomNavigationAction
        label="Transactions"
        value="nearby"
        icon={<PaymentsTwoToneIcon />}
        component={Link}
        to="/admin/transactions" // Link to the transactions route
      />
      <BottomNavigationAction
        label="Profile"
        value="folder"
        icon={<AccountCircleIcon />}
        component={Link}
        to="/admin/profile" // Link to the profile route
      />
    </BottomNavigation>
  );
}

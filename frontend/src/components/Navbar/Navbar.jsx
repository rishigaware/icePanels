import React, { useState, useEffect, useCallback, useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom';
import styles from "./Navbar.module.css";

// Memoized route mapping to prevent recreation on every render
const ROUTE_MAP = {
  "/": "recents",
  "/id": "favorites", 
  "/transactions": "nearby",
  "/profile": "folder"
};

// Memoized navigation items to prevent recreation
const NAV_ITEMS = [
  {
    label: "Home",
    value: "recents",
    icon: <MapsHomeWorkIcon />,
    to: "/"
  },
  {
    label: "ID", 
    value: "favorites",
    icon: <RecentActorsIcon />,
    to: "/id"
  },
  {
    label: "Transactions",
    value: "nearby", 
    icon: <PaymentsTwoToneIcon />,
    to: "/transactions"
  },
  {
    label: "Profile",
    value: "folder",
    icon: <AccountCircleIcon />,
    to: "/profile"
  }
];

export default function Navbar() {
  const location = useLocation();
  
  // Memoized function to get route value
  const getRouteValue = useCallback((pathname) => {
    return ROUTE_MAP[pathname] || "recents";
  }, []);

  // Initialize state with current route
  const [value, setValue] = useState(() => getRouteValue(location.pathname));

  // Memoized change handler
  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  // Update value only when pathname changes (not the entire location object)
  useEffect(() => {
    const newValue = getRouteValue(location.pathname);
    setValue(prevValue => prevValue !== newValue ? newValue : prevValue);
  }, [location.pathname, getRouteValue]);

  // Memoized navigation actions to prevent unnecessary re-renders
  const navigationActions = useMemo(() => 
    NAV_ITEMS.map((item) => (
      <BottomNavigationAction
        key={item.value}
        label={item.label}
        value={item.value}
        icon={item.icon}
        component={Link}
        to={item.to}
        sx={{
          minWidth: { xs: '50px', sm: '60px', md: '70px' },
          padding: { xs: '4px 2px', sm: '6px 3px', md: '8px 4px' }
        }}
      />
    )), []
  );

  return (
    <BottomNavigation
      className={`${styles.navbar} ${styles.navbarBlack}`}
      value={value}
      onChange={handleChange}
      showLabels
      sx={{
        '& .MuiBottomNavigationAction-root': {
          minWidth: { xs: '60px', sm: '70px', md: '80px' },
          padding: { xs: '6px 4px', sm: '8px 5px', md: '10px 6px' },
          color: 'rgba(255, 255, 255, 0.8)',
          '&.Mui-selected': {
            color: '#ffffff',
            fontWeight: 700,
            transform: 'scale(1.1)',
            transition: 'all 0.3s ease'
          }
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.8)',
          marginTop: '6px',
          display: 'block !important',
          opacity: 1,
          visibility: 'visible',
          transition: 'all 0.3s ease'
        },
        '& .Mui-selected .MuiBottomNavigationAction-label': {
          color: '#ffffff',
          fontWeight: 700,
          opacity: 1,
          visibility: 'visible',
          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
          transform: 'scale(1.05)'
        },
        '& .MuiBottomNavigationAction-icon': {
          fontSize: { xs: '1.5rem', sm: '1.7rem', md: '1.9rem' },
          transition: 'all 0.3s ease'
        },
        '& .Mui-selected .MuiBottomNavigationAction-icon': {
          fontSize: { xs: '1.7rem', sm: '1.9rem', md: '2.1rem' },
          transform: 'scale(1.1)'
        }
      }}
    >
      {navigationActions}
    </BottomNavigation>
  );
}

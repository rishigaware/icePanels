import React, { useState, useEffect, useCallback, useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import GroupsIcon from '@mui/icons-material/Groups';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom';
import styles from "./Navbar.module.css";

// Memoized route mapping to prevent recreation on every render
const ADMIN_ROUTE_MAP = {
  "/admin/home": "recents",
  "/admin/users": "users",
  "/admin/id": "favorites", 
  "/admin/id-requests": "requests",
  "/admin/transactions": "nearby",
  "/admin/profile": "folder"
};

// Memoized navigation items to prevent recreation
const ADMIN_NAV_ITEMS = [
  {
    label: "Home",
    value: "recents",
    icon: <MapsHomeWorkIcon />,
    to: "/admin/home"
  },
  {
    label: "Users",
    value: "users",
    icon: <GroupsIcon />,
    to: "/admin/users"
  },
  {
    label: "Agents",
    value: "favorites", 
    icon: <RecentActorsIcon />,
    to: "/admin/id"
  },
  {
    label: "Requests",
    value: "requests",
    icon: <RequestPageIcon />,
    to: "/admin/id-requests"
  },
  {
    label: "Transactions",
    value: "nearby",
    icon: <PaymentsTwoToneIcon />,
    to: "/admin/transactions"
  },
  {
    label: "Profile",
    value: "folder",
    icon: <AccountCircleIcon />,
    to: "/admin/profile"
  }
];

export default function Navbar() {
  const location = useLocation();
  
  // Memoized function to get route value
  const getRouteValue = useCallback((pathname) => {
    return ADMIN_ROUTE_MAP[pathname] || "recents";
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
    ADMIN_NAV_ITEMS.map((item) => (
      <BottomNavigationAction
        key={item.value}
        label={item.label}
        value={item.value}
        icon={item.icon}
        component={Link}
        to={item.to}
        sx={{
          minWidth: { xs: '45px', sm: '55px', md: '65px' },
          padding: { xs: '3px 1px', sm: '5px 2px', md: '7px 3px' },
          fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' }
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
          minWidth: { xs: '55px', sm: '65px', md: '75px' },
          padding: { xs: '5px 3px', sm: '7px 4px', md: '9px 5px' },
          color: 'rgba(255, 255, 255, 0.6)',
          '&.Mui-selected': {
            color: 'var(--primary-color)',
            fontWeight: 700,
            transform: 'scale(1.1)',
            transition: 'all 0.3s ease'
          }
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.85rem' },
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.6)',
          marginTop: '5px',
          display: 'block !important',
          opacity: '1 !important',
          visibility: 'visible !important',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          lineHeight: 1.2,
          transition: 'all 0.3s ease'
        },
        '& .Mui-selected .MuiBottomNavigationAction-label': {
          color: 'var(--primary-color) !important',
          fontWeight: 700,
          opacity: '1 !important',
          visibility: 'visible !important',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
          transform: 'scale(1.05)'
        },
        '& .MuiBottomNavigationAction-icon': {
          fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
          transition: 'all 0.3s ease',
          marginBottom: '2px'
        },
        '& .Mui-selected .MuiBottomNavigationAction-icon': {
          fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' },
          transform: 'scale(1.1)',
          color: 'var(--primary-color)'
        }
      }}
    >
      {navigationActions}
    </BottomNavigation>
  );
}

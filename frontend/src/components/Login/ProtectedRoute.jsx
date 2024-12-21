import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useUser();

  // Allow guests to access all user routes
  if (!user && allowedRoles?.includes('user')) {
    return children;
  }

  // Redirect guests trying to access admin routes
  if (!user && allowedRoles?.includes('admin')) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users from user routes to admin home
  if (user?.role === 'admin' && allowedRoles?.includes('user')) {
    return <Navigate to="/admin/home" replace />;
  }

  // Restrict access if the user's role is not in allowedRoles
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children; // Render the children if all checks pass
};

export default ProtectedRoute;

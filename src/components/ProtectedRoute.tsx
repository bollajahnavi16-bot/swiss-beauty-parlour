import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'customer')[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF8F9',
          color: '#713449',
          fontFamily: 'DM Sans, sans-serif',
          gap: '1rem',
        }}
      >
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 600 }}>Verifying credentials and access permissions...</p>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // If not logged in, redirect to the unified login page with return target
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not authorized for this specific route
  if (role && !allowedRoles.includes(role)) {
    // If a customer attempts to access the admin portal:
    if (role === 'customer') {
      return <Navigate to="/customer" replace state={{ unauthorizedAttempt: true }} />;
    }
    // If an admin attempts to access customer route:
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF8F9',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <ShieldAlert size={48} color="#A33346" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#713449', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
          Access Restricted
        </h2>
        <p style={{ maxWidth: '420px', color: '#68555C', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          You do not have permission to view this section with your current account privileges.
        </p>
        <a
          href="/"
          style={{
            backgroundColor: '#713449',
            color: '#FFFFFF',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Return to Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

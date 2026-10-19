import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicWebsite } from './pages/PublicWebsite';
import { UnifiedLogin } from './pages/UnifiedLogin';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Code-split dashboards for optimal landing page performance
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);
const CustomerDashboard = lazy(() =>
  import('./pages/CustomerDashboard').then(module => ({ default: module.CustomerDashboard }))
);

const PageLoader = ({ label }: { label: string }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      color: '#713449',
      backgroundColor: '#FFF8F9',
      fontSize: '1rem',
      fontWeight: 500
    }}
  >
    {label}
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main Public Website Route */}
          <Route path="/" element={<PublicWebsite />} />

          {/* Unified Login & Customer Registration Route */}
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          {/* Secure Password Recovery & Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Role-Protected Customer Portal Route */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin']}>
                <Suspense fallback={<PageLoader label="Opening Client Portal..." />}>
                  <CustomerDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Admin Atelier Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<PageLoader label="Opening Administrative Atelier..." />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to public website */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

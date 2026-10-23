import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import MobileInstallBanner from './components/common/MobileInstallBanner';

// Pages
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import StaffRegisterPage from './pages/StaffRegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import DashboardPage from './pages/DashboardPage';
import BeatVillagesPage from './pages/BeatVillagesPage';
import VillageDashboardPage from './pages/VillageDashboardPage';
import RegisterHousePage from './pages/RegisterHousePage';
import HouseRecordsPage from './pages/HouseRecordsPage';
import HouseDetailsPage from './pages/HouseDetailsPage';
import EditHousePage from './pages/EditHousePage';
import OwnerDetailsPage from './pages/OwnerDetailsPage';
import FamilyManagementPage from './pages/FamilyManagementPage';
import PhotoGalleryPage from './pages/PhotoGalleryPage';
import GpsMapViewPage from './pages/GpsMapViewPage';
import RegistrationSummaryPage from './pages/RegistrationSummaryPage';
import ExportPage from './pages/ExportPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import BackupRestorePage from './pages/BackupRestorePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner message="ದೃಢೀಕರಣ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ / Verifying authorization..." size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isStaffUrl = location.pathname.startsWith('/staff');
    return <Navigate to={isStaffUrl ? '/staff/login' : '/admin/login'} state={{ from: location }} replace />;
  }

  // If user account is pending approval, redirect to pending approval page
  if (user?.accountStatus === 'pending') {
    return <Navigate to="/staff/pending" replace />;
  }

  // Admin-only route guard
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return children;
};

// Route wrapper to redirect root dashboard based on role
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  }
  return <DashboardPage />;
};

function App() {
  return (
    <>
      <Routes>
      {/* 1. Public Homepage (Kannada-first) */}
      <Route path="/" element={<HomePage />} />

      {/* 2. Public Separate Logins */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/staff/login" element={<StaffLoginPage />} />

      {/* 3. Public Staff Registration */}
      <Route path="/staff/register" element={<StaffRegisterPage />} />

      {/* 4. Staff Pending Approval Status Page */}
      <Route path="/staff/pending" element={<PendingApprovalPage />} />

      {/* 5. Public Privacy Policy (Required for Google Play Store & Apple App Store) */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      {/* 6. Protected Dashboard & House Survey Workflow */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin 11 Beats Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Staff Dashboard */}
        <Route path="/staff/dashboard" element={<StaffDashboardPage />} />

        {/* Selected Beat's Village List */}
        <Route path="/beats/:beatNumber" element={<BeatVillagesPage />} />

        {/* Village Dashboard with Registered Houses */}
        <Route path="/villages/:villageId" element={<VillageDashboardPage />} />

        {/* House Registration & Records */}
        <Route path="/register-house" element={<RegisterHousePage />} />
        <Route path="/houses" element={<HouseRecordsPage />} />
        <Route path="/houses/:id" element={<HouseDetailsPage />} />
        <Route path="/houses/:id/edit" element={<EditHousePage />} />
        <Route path="/owners" element={<OwnerDetailsPage />} />
        <Route path="/family" element={<FamilyManagementPage />} />
        <Route path="/gallery" element={<PhotoGalleryPage />} />
        <Route path="/map" element={<GpsMapViewPage />} />
        <Route path="/summary" element={<RegistrationSummaryPage />} />

        {/* Export Reports: Admin only */}
        <Route
          path="/exports"
          element={
            <ProtectedRoute requiredRole="admin">
              <ExportPage />
            </ProtectedRoute>
          }
        />

        {/* Staff & User Management: Admin only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Settings: Admin only */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Backup & Restore: Admin only */}
        <Route
          path="/backup"
          element={
            <ProtectedRoute requiredRole="admin">
              <BackupRestorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/backup"
          element={
            <ProtectedRoute requiredRole="admin">
              <BackupRestorePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch-All Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <MobileInstallBanner />
  </>
  );
}

export default App;

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardLayout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Overview } from './pages/Dashboard/Overview';
import { Customers } from './pages/Dashboard/Customers';
import { Invoices } from './pages/Dashboard/Invoices';
import { CalendarView } from './pages/Dashboard/Calendar';
import { FollowUps } from './pages/Dashboard/FollowUps';
import { Payments } from './pages/Dashboard/Payments';
import { Reports } from './pages/Dashboard/Reports';
import { Settings } from './pages/Dashboard/Settings';
import { Subscription } from './pages/Dashboard/Subscription';
import { SuperAdminSettings } from './pages/SuperAdmin/SuperAdminSettings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Overview /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/calendar" element={<ProtectedRoute><DashboardLayout><CalendarView /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/customers" element={<ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/invoices" element={<ProtectedRoute><DashboardLayout><Invoices /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/payments" element={<ProtectedRoute><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/followups" element={<ProtectedRoute><DashboardLayout><FollowUps /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
      
      {/* SaaS Subscription Route */}
      <Route path="/dashboard/subscription" element={<ProtectedRoute><DashboardLayout><Subscription /></DashboardLayout></ProtectedRoute>} />

      {/* Super Admin Route */}
      <Route path="/superadmin" element={<ProtectedRoute><DashboardLayout><SuperAdminSettings /></DashboardLayout></ProtectedRoute>} />
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
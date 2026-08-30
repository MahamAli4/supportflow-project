import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CreateTicket from './pages/CreateTicket';
import CustomerTicketDetail from './pages/CustomerTicketDetail';
import MyTickets from './pages/MyTickets';

// Agent Pages
import AgentDashboard from './pages/AgentDashboard';
import AgentQueue from './pages/AgentQueue';
import AgentTicketDetail from './pages/AgentTicketDetail';

// Super Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTickets from './pages/AdminTickets';

import { useAuth } from './context/AuthContext';

const HomeRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'agent') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <Navbar />
        <main className="flex-1 pb-12">
          <Routes>
            {/* Auth Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Protected Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/tickets/create"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/tickets"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/tickets/:id"
              element={
                <ProtectedRoute allowedRoles={['customer', 'agent', 'admin']}>
                  <CustomerTicketDetail />
                </ProtectedRoute>
              }
            />

            {/* Agent Protected Routes */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/queue"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentQueue />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/tickets/:id"
              element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentTicketDetail />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTickets />
                </ProtectedRoute>
              }
            />

            {/* Root & Fallback Redirection */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

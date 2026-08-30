import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Headphones, LayoutDashboard, PlusCircle, Ticket, LogOut, Menu, X, Users, Settings } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCustomer = role === 'customer';
  const isAgent = role === 'agent';
  const isAdmin = role === 'admin';

  const isActive = (path) => location.pathname === path;

  const getBrandHome = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isAgent) return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to={getBrandHome()} className="flex items-center space-x-2.5">
              <Shield className="w-7 h-7 text-purple-400" />
              <span className="font-bold text-lg tracking-tight">SupportFlow</span>
            </Link>

            {/* User Role Badge */}
            {role && (
              <span
                className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : isAgent
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {isAdmin ? 'Super Admin' : isAgent ? 'Agent Desk' : 'Customer Portal'}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {isCustomer && (
                <>
                  <Link
                    to="/customer/dashboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/customer/dashboard')
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/customer/tickets/create"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/customer/tickets/create')
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Create Ticket</span>
                  </Link>

                  <Link
                    to="/customer/tickets"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/customer/tickets')
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-indigo-400" />
                    <span>My Tickets</span>
                  </Link>
                </>
              )}

              {isAgent && (
                <>
                  <Link
                    to="/agent/dashboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/agent/dashboard')
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Headphones className="w-4 h-4 text-blue-400" />
                    <span>Agent Dashboard</span>
                  </Link>

                  <Link
                    to="/agent/queue"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/agent/queue')
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-purple-400" />
                    <span>Ticket Queue</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-purple-900/50 text-white border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    <span>Admin Dashboard</span>
                  </Link>

                  <Link
                    to="/admin/users"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/users')
                        ? 'bg-purple-900/50 text-white border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Manage Users & Agents</span>
                  </Link>

                  <Link
                    to="/admin/tickets"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/tickets')
                        ? 'bg-purple-900/50 text-white border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-blue-400" />
                    <span>System Tickets</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Profile & Logout */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 border border-slate-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="pb-2 border-b border-slate-800 mb-2">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 uppercase">
                  {role}
                </span>
              </div>

              {isCustomer && (
                <>
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/customer/tickets/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Create Ticket
                  </Link>
                  <Link
                    to="/customer/tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    My Tickets
                  </Link>
                </>
              )}

              {isAgent && (
                <>
                  <Link
                    to="/agent/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Agent Dashboard
                  </Link>
                  <Link
                    to="/agent/queue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Ticket Queue
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Manage Users & Agents
                  </Link>
                  <Link
                    to="/admin/tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    System Tickets
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-slate-200 bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

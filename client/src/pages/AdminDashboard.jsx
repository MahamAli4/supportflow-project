import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { StatsSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import {
  Users,
  UserCheck,
  Headphones,
  Ticket,
  Sparkles,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  User,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Inline User Creation Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrorMsg, setCreateErrorMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/tickets'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (ticketsRes.data.success) {
        setTickets(ticketsRes.data.tickets);
      }
    } catch (err) {
      console.error('[Admin Dashboard Error]', err);
      setError(err.response?.data?.error || 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateErrorMsg('');
    setCreateSuccessMsg('');

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setCreateErrorMsg('Please fill in Name, Email, and Password.');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await api.post('/admin/users/create', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });

      if (res.data.success) {
        const roleLabel = res.data.user.role === 'customer' ? 'Customer' : 'Support Agent';
        setCreateSuccessMsg(`✓ ${roleLabel} account '${res.data.user.name}' created! Login email: ${res.data.user.email}`);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        fetchAdminData(); // Refresh stats
      }
    } catch (err) {
      console.error('[Admin User Creation Error]', err);
      setCreateErrorMsg(err.response?.data?.error || 'Failed to create user account');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Super Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Super Admin Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            System Control Center
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Welcome, {user?.name}. Provision new Customer and Agent accounts, monitor tickets, and view platform metrics.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/admin/users"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage All Users ({stats ? stats.totalUsers : '...'})</span>
          </Link>
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchAdminData}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* System Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-[11px] text-slate-400 mt-1">Platform accounts</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Support Agents</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Headphones className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAgents}</p>
            <p className="text-[11px] text-slate-400 mt-1">Active desk agents</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTickets}</p>
            <p className="text-[11px] text-slate-400 mt-1">System-wide volume</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Success Rate</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.aiSuccessCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Successful AI triages</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Human Reviewed</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.triageReviewedCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Confirmed by agents</p>
          </div>

        </div>
      ) : null}

      {/* PROMINENT ADMIN USER CREATOR CARD */}
      <div className="bg-white rounded-xl border-2 border-purple-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Admin Quick User Provisioning</h2>
            <p className="text-xs text-slate-500">
              Create new Customer or Agent accounts. Provisioned users can log in with their email and submit support tickets.
            </p>
          </div>
        </div>

        {createErrorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {createErrorMsg}
          </div>
        )}
        {createSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{createSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Account Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Role
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 bg-white font-medium"
              >
                <option value="customer">Customer (Can log in & submit tickets)</option>
                <option value="agent">Support Agent (Can work desk queue)</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. John Doe"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="At least 6 characters..."
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={creatingUser}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{creatingUser ? 'Creating Account...' : 'Create User Account'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Global System Tickets Monitor */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Global System Tickets Monitor</h2>
            <p className="text-xs text-slate-500">Live feed of all customer tickets across all support agents</p>
          </div>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Ticket className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No system tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket #</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Assigned Agent</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tickets.slice(0, 8).map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-purple-600">{t.ticketNumber}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{t.customerId?.name || 'Customer'}</div>
                      <div className="text-slate-400">{t.customerId?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 max-w-xs truncate">{t.subject}</td>
                    <td className="py-4 px-6">
                      {t.assignedAgentId ? (
                        <div className="font-medium text-slate-800 flex items-center space-x-1.5">
                          <Headphones className="w-3.5 h-3.5 text-purple-500" />
                          <span>{t.assignedAgentId.name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;

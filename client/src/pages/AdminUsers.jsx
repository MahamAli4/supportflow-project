import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Users, UserPlus, Headphones, Shield, User, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Provision User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('customer');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrorMsg, setCreateErrorMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const url = roleFilter === 'all' ? '/admin/users' : `/admin/users?role=${roleFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('[Admin Users Error]', err);
      setError(err.response?.data?.error || 'Failed to load system users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateErrorMsg('');
    setCreateSuccessMsg('');

    if (!userName || !userEmail || !userPassword) {
      setCreateErrorMsg('Please fill in all account creation fields.');
      return;
    }

    setSubmittingUser(true);
    try {
      const res = await api.post('/admin/users/create', {
        name: userName,
        email: userEmail,
        password: userPassword,
        role: userRole,
      });

      if (res.data.success) {
        const roleLabel = res.data.user.role === 'customer' ? 'Customer' : 'Support Agent';
        setCreateSuccessMsg(`✓ ${roleLabel} account '${res.data.user.name}' created! User can log in with: ${res.data.user.email}`);
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        fetchUsers();
        setTimeout(() => setShowCreateModal(false), 2000);
      }
    } catch (err) {
      console.error('[Create User Error]', err);
      setCreateErrorMsg(err.response?.data?.error || 'Failed to create user account');
    } finally {
      setSubmittingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User & Agent Account Provisioning</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create Customer and Support Agent accounts. Admin-created users can log in and manage support tickets.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User Account</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-800 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Role Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center space-x-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All Accounts' },
          { key: 'customer', label: 'Customers' },
          { key: 'agent', label: 'Support Agents' },
          { key: 'admin', label: 'Super Admins' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              roleFilter === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No accounts found matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Account Role</th>
                  <th className="py-3.5 px-6">Account ID</th>
                  <th className="py-3.5 px-6">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{u.email}</td>
                    <td className="py-4 px-6">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>Super Admin</span>
                        </span>
                      ) : u.role === 'agent' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Support Agent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>Customer</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">{u._id}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROVISION USER ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Provision User Account</h3>
                  <p className="text-xs text-slate-500">Admin can create Customer or Support Agent accounts</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createErrorMsg && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {createErrorMsg}
              </div>
            )}
            {createSuccessMsg && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {createSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Account Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 bg-white font-medium"
                >
                  <option value="customer">Customer (Can log in & submit support tickets)</option>
                  <option value="agent">Support Agent (Can log in & handle agent workbench queue)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Used to Sign In)
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{submittingUser ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;

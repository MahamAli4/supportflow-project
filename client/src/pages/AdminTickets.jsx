import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Ticket, Search, Filter, Headphones, RefreshCw, AlertCircle, UserPlus, X, CheckCircle2 } from 'lucide-react';

export const AdminTickets = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create User Modal state directly on tickets page
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('customer');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrorMsg, setCreateErrorMsg] = useState('');

  const fetchAllTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/admin/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('[Admin Tickets Error]', err);
      setError(err.response?.data?.error || 'Failed to load system tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateErrorMsg('');
    setCreateSuccessMsg('');

    if (!userName || !userEmail || !userPassword) {
      setCreateErrorMsg('Please fill in all fields.');
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
        setCreateSuccessMsg(`✓ ${roleLabel} account '${res.data.user.name}' created successfully! Login email: ${res.data.user.email}`);
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        setTimeout(() => setShowCreateModal(false), 2000);
      }
    } catch (err) {
      console.error('[Admin Create User Error]', err);
      setCreateErrorMsg(err.response?.data?.error || 'Failed to create user account');
    } finally {
      setSubmittingUser(false);
    }
  };

  // Filter pipeline
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchCust = t.customerId?.name?.toLowerCase().includes(q);
      const matchAgent = t.assignedAgentId?.name?.toLowerCase().includes(q);
      return matchSubject || matchNum || matchCust || matchAgent;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Ticket Control & Monitoring</h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect all support desk tickets across all customers and assigned agents.
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

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchAllTickets}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-800 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {['All', 'New', 'Assigned', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Priority Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium bg-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #, customer, agent..."
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Ticket className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No system tickets match your filter criteria.</p>
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
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/customer/tickets/${t._id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-purple-600">{t.ticketNumber}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{t.customerId?.name || 'Customer'}</div>
                      <div className="text-slate-400">{t.customerId?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 max-w-xs truncate">{t.subject}</td>
                    <td className="py-4 px-6">
                      {t.assignedAgentId ? (
                        <div className="font-medium text-slate-800 flex items-center space-x-1">
                          <Headphones className="w-3.5 h-3.5 text-purple-500" />
                          <span>{t.assignedAgentId.name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {t.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-purple-600">
                      Inspect Ticket →
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
                  <p className="text-xs text-slate-500">Create Customer or Support Agent accounts</p>
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Account Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 bg-white font-medium"
                >
                  <option value="customer">Customer (Can log in & submit tickets)</option>
                  <option value="agent">Support Agent (Can work desk queue)</option>
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

export default AdminTickets;

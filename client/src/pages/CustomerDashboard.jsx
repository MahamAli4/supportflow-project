import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { StatsSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/stats/customer'),
        api.get('/tickets/my'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (ticketsRes.data.success) {
        // Take top 5 recent tickets
        setRecentTickets(ticketsRes.data.tickets.slice(0, 5));
      }
    } catch (err) {
      console.error('[Dashboard Error]', err);
      setError(err.response?.data?.error || 'Failed to load customer dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Track your support tickets, communicate with agents, and get real-time issue resolution.
          </p>
        </div>
        <Link
          to="/customer/tickets/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Ticket</span>
        </Link>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Real Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Total Tickets</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Submitted support requests</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Open / Assigned</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.openTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting or assigned to agent</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">In Progress</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.inProgressTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Actively being investigated</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Resolved</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.resolvedTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Closed with resolution notes</p>
          </div>
        </div>
      ) : null}

      {/* Recent Tickets Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Support Tickets</h2>
            <p className="text-xs text-slate-500">Your latest submitted support issues</p>
          </div>
          <Link
            to="/customer/tickets"
            className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : recentTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No tickets submitted yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Need help with billing, technical issues, or account details? Create your first ticket now.
            </p>
            <Link
              to="/customer/tickets/create"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ticket</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="py-3.5 px-6">Ticket Number</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Updated</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/customer/tickets/${t._id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">{t.ticketNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-900 max-w-xs truncate">{t.subject}</td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(t.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-xs font-semibold text-blue-600 hover:underline">
                        Open →
                      </span>
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

export default CustomerDashboard;

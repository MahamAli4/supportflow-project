import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { StatsSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import {
  Headphones,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Ticket,
  Filter,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/stats/agent'),
        api.get('/agent/tickets'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (ticketsRes.data.success) {
        setTickets(ticketsRes.data.tickets);
      }
    } catch (err) {
      console.error('[Agent Dashboard Error]', err);
      setError(err.response?.data?.error || 'Failed to load agent dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter pipeline
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
              Agent Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Support Desk Workbench
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Welcome, {user?.name}. Review AI triage suggestions, manage ticket statuses, and assist customers.
          </p>
        </div>
        <Link
          to="/agent/queue"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-colors shrink-0"
        >
          <Ticket className="w-4 h-4" />
          <span>Full Ticket Queue</span>
        </Link>
      </div>

      {/* Error Alert */}
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
              <span className="text-sm font-medium text-slate-500">Assigned Tickets</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Headphones className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.assignedTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Total assigned to you</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">High Priority</span>
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.highPriorityTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Require urgent attention</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">In Progress</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgressTickets}</p>
            <p className="text-xs text-slate-400 mt-1">Active investigations</p>
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

      {/* Ticket Queue & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        
        {/* Header & Filter Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Support Queue</h2>
            <p className="text-xs text-slate-500">Review AI suggestions and work on customer tickets</p>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table / List */}
        {loading ? (
          <TableSkeleton />
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No tickets found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filter options.'
                : 'No tickets are currently assigned to your queue.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="py-3.5 px-6">Ticket Number</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Subject</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => navigate(`/agent/tickets/${t._id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">{t.ticketNumber}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{t.customerId?.name || 'Customer'}</div>
                        <div className="text-xs text-slate-400">{t.customerId?.email}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900 max-w-xs truncate">{t.subject}</td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {t.category || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs font-semibold text-blue-600 hover:underline">
                          Work Ticket →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Card View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigate(`/agent/tickets/${t._id}`)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {t.ticketNumber}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-slate-500">{t.customerId?.name} ({t.customerId?.email})</p>
                  <div className="flex items-center justify-between pt-1">
                    <PriorityBadge priority={t.priority} />
                    <span className="text-xs text-blue-600 font-semibold">Open Ticket →</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default AgentDashboard;

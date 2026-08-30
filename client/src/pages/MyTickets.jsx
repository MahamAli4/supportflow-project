import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Ticket, PlusCircle, Search, Filter, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';

export const MyTickets = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/tickets/my');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('[My Tickets Error]', err);
      setError(err.response?.data?.error || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filtered tickets pipeline
  const filteredTickets = tickets.filter((t) => {
    // Status Filter
    if (statusFilter === 'Open' && !['New', 'Assigned'].includes(t.status)) return false;
    if (statusFilter === 'In Progress' && t.status !== 'In Progress') return false;
    if (statusFilter === 'Resolved' && t.status !== 'Resolved') return false;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      return matchSubject || matchNum;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and view all your submitted support issues and conversation history.
          </p>
        </div>
        <Link
          to="/customer/tickets/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Ticket</span>
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
            onClick={fetchTickets}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filtering Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Open' ? 'Open (New / Assigned)' : tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket # or subject..."
            className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Tickets List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No tickets found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your filters or search term.'
                : 'You have not created any support tickets yet.'}
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="py-3.5 px-6">Ticket Number</th>
                    <th className="py-3.5 px-6">Subject</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Last Updated</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => navigate(`/customer/tickets/${t._id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">{t.ticketNumber}</td>
                      <td className="py-4 px-6 font-medium text-slate-900 max-w-md truncate">{t.subject}</td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(t.updatedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs font-semibold text-blue-600 hover:underline">
                          View →
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
                  onClick={() => navigate(`/customer/tickets/${t._id}`)}
                  className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {t.ticketNumber}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">{t.subject}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <PriorityBadge priority={t.priority} />
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
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

export default MyTickets;

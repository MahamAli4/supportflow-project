import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Ticket, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const AgentQueue = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/agent/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('[Agent Queue Error]', err);
      setError(err.response?.data?.error || 'Failed to load assigned tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter pipeline
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchCust = t.customerId?.name?.toLowerCase().includes(q);
      return matchSubject || matchNum || matchCust;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assigned Ticket Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review AI triage suggestions, manage ticket statuses, and respond to customer inquiries.
        </p>
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
        
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {['All', 'Assigned', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
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

          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, # or subject..."
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your search query or filter options.'
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
                          Open →
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

export default AgentQueue;

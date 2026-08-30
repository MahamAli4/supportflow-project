import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  User,
  Headphones,
  Lock,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AgentTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');

  // AI Triage Review Form state
  const [reviewCategory, setReviewCategory] = useState('General');
  const [reviewPriority, setReviewPriority] = useState('Medium');
  const [reviewSummary, setReviewSummary] = useState('');
  const [submittingTriage, setSubmittingTriage] = useState(false);
  const [triageSuccessMsg, setTriageSuccessMsg] = useState('');
  const [triageError, setTriageError] = useState('');

  // Resolution Form state
  const [resolutionNote, setResolutionNote] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const [ticketRes, msgsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/messages`),
      ]);

      if (ticketRes.data.success) {
        const t = ticketRes.data.ticket;
        setTicket(t);

        // Prefill triage review form controls
        const aiCategory = t.aiSuggestion?.category;
        const aiPriority = t.aiSuggestion?.priority;
        const aiSummary = t.aiSuggestion?.summary;

        setReviewCategory(t.category || aiCategory || 'General');
        setReviewPriority(t.priority || aiPriority || 'Medium');
        setReviewSummary(t.summary || aiSummary || '');
      }

      if (msgsRes.data.success) {
        setMessages(msgsRes.data.messages);
      }
    } catch (err) {
      console.error('[Agent Ticket Detail Error]', err);
      setError(err.response?.data?.error || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // Real-time Socket.IO room subscription
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_ticket', id);

    const handleNewMessage = (incomingMsg) => {
      setMessages((prevMsgs) => {
        if (prevMsgs.some((m) => m._id === incomingMsg._id)) return prevMsgs;
        return [...prevMsgs, incomingMsg];
      });
    };

    const handleStatusChange = (payload) => {
      setTicket((prevTicket) => {
        if (!prevTicket) return prevTicket;
        return {
          ...prevTicket,
          status: payload.status,
          resolutionNote: payload.resolutionNote || prevTicket.resolutionNote,
          resolvedAt: payload.resolvedAt || prevTicket.resolvedAt,
          ...(payload.ticket || {}),
        };
      });
    };

    const handleTriageReviewed = (payload) => {
      setTicket((prevTicket) => {
        if (!prevTicket) return prevTicket;
        return {
          ...prevTicket,
          category: payload.category,
          priority: payload.priority,
          summary: payload.summary,
          triageReviewed: payload.triageReviewed,
          ...(payload.ticket || {}),
        };
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('status_change', handleStatusChange);
    socket.on('triage_reviewed', handleTriageReviewed);

    return () => {
      socket.emit('leave_ticket', id);
      socket.off('new_message', handleNewMessage);
      socket.off('status_change', handleStatusChange);
      socket.off('triage_reviewed', handleTriageReviewed);
    };
  }, [socket, id]);

  // Confirm Triage Review Action (PATCH /api/agent/tickets/:id/triage)
  const handleConfirmTriage = async (e) => {
    e.preventDefault();
    setTriageError('');
    setTriageSuccessMsg('');

    if (!reviewSummary || !reviewSummary.trim()) {
      setTriageError('Please provide a summary for the ticket triage review.');
      return;
    }

    setSubmittingTriage(true);
    try {
      const res = await api.patch(`/agent/tickets/${id}/triage`, {
        category: reviewCategory,
        priority: reviewPriority,
        summary: reviewSummary.trim(),
      });

      if (res.data.success && res.data.ticket) {
        setTicket(res.data.ticket);
        setTriageSuccessMsg('✓ Human Triage Review Confirmed! Ticket values updated.');
      }
    } catch (err) {
      console.error('[Triage Review Error]', err);
      setTriageError(err.response?.data?.error || 'Failed to confirm triage review');
    } finally {
      setSubmittingTriage(false);
    }
  };

  // Status Update Action (Assigned -> In Progress)
  const handleStatusChange = async (nextStatus) => {
    setStatusError('');

    try {
      const res = await api.patch(`/agent/tickets/${id}/status`, {
        status: nextStatus,
      });

      if (res.data.success && res.data.ticket) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('[Status Change Error]', err);
      setStatusError(err.response?.data?.error || `Failed to change status to '${nextStatus}'`);
    }
  };

  // Resolve Ticket Action (POST /api/agent/tickets/:id/resolve)
  const handleResolveTicket = async (e) => {
    e.preventDefault();
    setResolveError('');

    if (!resolutionNote || !resolutionNote.trim()) {
      setResolveError('Resolution Note is strictly required when resolving a ticket.');
      return;
    }

    setSubmittingResolve(true);
    try {
      const res = await api.post(`/agent/tickets/${id}/resolve`, {
        resolutionNote: resolutionNote.trim(),
      });

      if (res.data.success && res.data.ticket) {
        setTicket(res.data.ticket);
        setShowResolveModal(false);
        setResolutionNote('');
      }
    } catch (err) {
      console.error('[Resolve Error]', err);
      setResolveError(err.response?.data?.error || 'Failed to resolve ticket');
    } finally {
      setSubmittingResolve(false);
    }
  };

  // Agent Message Post Action
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || !newMessage.trim()) return;

    setSendingMsg(true);
    try {
      const res = await api.post(`/tickets/${id}/messages`, {
        message: newMessage.trim(),
      });

      if (res.data.success && res.data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        setNewMessage('');
      }
    } catch (err) {
      console.error('[Agent Send Message Error]', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const isResolved = ticket?.status === 'Resolved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/agent/queue"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </Link>

        {/* Status Transition Action Buttons */}
        {ticket && !isResolved && (
          <div className="flex items-center space-x-3">
            {ticket.status === 'Assigned' && (
              <button
                onClick={() => handleStatusChange('In Progress')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Mark 'In Progress'</span>
              </button>
            )}

            <button
              onClick={() => setShowResolveModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolve Ticket</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchTicketDetails}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-800 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Status Transition Error */}
      {statusError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-medium">{statusError}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          <div className="h-24 bg-slate-100 rounded w-full"></div>
        </div>
      ) : ticket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Ticket Info, AI Triage Review Card, Conversation */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-wrap items-start justify-between gap-3 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                      {ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    {ticket.triageReviewed && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Human Reviewed</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                    {ticket.subject}
                  </h1>
                </div>
              </div>

              {/* Customer Problem Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Customer Issue Description
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </div>
              </div>

              {/* Resolution Note Alert (If Resolved) */}
              {isResolved && (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Resolution Note (Ticket Closed)</span>
                  </div>
                  <p className="text-sm text-emerald-800 bg-white/70 p-3.5 rounded-lg border border-emerald-100 font-medium">
                    {ticket.resolutionNote}
                  </p>
                  {ticket.resolvedAt && (
                    <p className="text-xs text-emerald-600">
                      Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* CRITICAL HACKATHON REQUIREMENT: AI TRIAGE HUMAN REVIEW CARD */}
            <div className="bg-white rounded-xl border-2 border-indigo-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">AI Triage Suggestion</h2>
                </div>

                {/* AI Analysis Status Badge */}
                {ticket.aiStatus === 'success' ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Analysis Succeeded</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Analysis Unavailable</span>
                  </span>
                )}
              </div>

              <div className="p-6 space-y-6">
                
                {/* AI Analysis Success / Failure Details Banner */}
                {ticket.aiStatus === 'success' ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Advisory Gemini AI Recommendation:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Suggested Category: </span>
                        <span className="font-semibold text-slate-800">{ticket.aiSuggestion?.category || 'General'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Suggested Priority: </span>
                        <span className="font-semibold text-slate-800">{ticket.aiSuggestion?.priority || 'Medium'}</span>
                      </div>
                    </div>
                    {ticket.aiSuggestion?.summary && (
                      <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200">
                        "{ticket.aiSuggestion.summary}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>AI analysis was unavailable. Please classify this ticket manually below.</span>
                  </div>
                )}

                {/* Triage Review Status Alert */}
                {ticket.triageReviewed ? (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <span>Human Reviewed & Confirmed by Support Agent</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                    Please review, edit if necessary, and click <strong>Confirm Triage</strong> to finalize ticket classification.
                  </div>
                )}

                {/* Triage Review Form Alerts */}
                {triageError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {triageError}
                  </div>
                )}
                {triageSuccessMsg && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    {triageSuccessMsg}
                  </div>
                )}

                {/* Editable Controls Form */}
                <form onSubmit={handleConfirmTriage} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        disabled={isResolved}
                        value={reviewCategory}
                        onChange={(e) => setReviewCategory(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="Billing">Billing & Refunds</option>
                        <option value="Technical">Technical Issue</option>
                        <option value="Account">Account Access</option>
                        <option value="Order">Order Status</option>
                        <option value="General">General Inquiry</option>
                      </select>
                    </div>

                    {/* Priority Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        disabled={isResolved}
                        value={reviewPriority}
                        onChange={(e) => setReviewPriority(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                  </div>

                  {/* Summary Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Support Summary Note
                    </label>
                    <textarea
                      rows={2}
                      disabled={isResolved}
                      required
                      value={reviewSummary}
                      onChange={(e) => setReviewSummary(e.target.value)}
                      placeholder="Enter short support summary..."
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Button */}
                  {!isResolved && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submittingTriage}
                        className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{submittingTriage ? 'Confirming...' : 'Confirm Triage'}</span>
                      </button>
                    </div>
                  )}

                </form>

              </div>
            </div>

            {/* Conversation History & Agent Message Composer */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Conversation History</h2>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {messages.length} message(s)
                </span>
              </div>

              {/* Messages Feed */}
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">
                    No messages recorded yet.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isAgentMsg = m.senderRole === 'agent';

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isAgentMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center space-x-2 mb-1 text-xs text-slate-400">
                          {isAgentMsg ? (
                            <>
                              <span className="font-semibold text-indigo-600">{m.senderId?.name || 'You (Agent)'}</span>
                              <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-semibold text-slate-700">{m.senderId?.name || 'Customer'}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                            isAgentMsg
                              ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                {isResolved ? (
                  <div className="p-4 rounded-xl bg-slate-200/70 text-slate-600 text-sm flex items-center justify-center space-x-2 font-medium">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Ticket is resolved and locked for new messages.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <textarea
                        rows={2}
                        required
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Reply to customer..."
                        className="block w-full p-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg || !newMessage.trim()}
                        className="inline-flex items-center space-x-1.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Customer Info & Ticket Meta Sidebar */}
          <div className="space-y-6">
            
            {/* Customer Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                Customer Information
              </h2>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Name</span>
                <span className="text-sm font-semibold text-slate-900">{ticket.customerId?.name || 'Customer'}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Email</span>
                <span className="text-sm font-medium text-slate-700">{ticket.customerId?.email}</span>
              </div>
            </div>

            {/* Ticket Metadata Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                Ticket Information
              </h2>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Final Category</span>
                <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                  {ticket.category || 'General'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Final Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Current Status</span>
                <StatusBadge status={ticket.status} />
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Created Date</span>
                <span className="text-xs text-slate-600 font-medium">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Last Updated</span>
                <span className="text-xs text-slate-600 font-medium">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </div>
      ) : null}

      {/* RESOLUTION MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Resolve Ticket</h3>
                <p className="text-xs text-slate-500">Provide a required resolution note for the customer</p>
              </div>
            </div>

            {resolveError && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {resolveError}
              </div>
            )}

            <form onSubmit={handleResolveTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resolution Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain how the issue was resolved or what steps were completed..."
                  className="block w-full p-3 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Resolution note is strictly required by backend rules before closing ticket.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve || !resolutionNote.trim()}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingResolve ? 'Closing Ticket...' : 'Confirm Resolution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentTicketDetail;

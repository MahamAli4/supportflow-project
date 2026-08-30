import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const CustomerTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [error, setError] = useState('');
  const [msgError, setMsgError] = useState('');

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const [ticketRes, msgsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/messages`),
      ]);

      if (ticketRes.data.success) {
        setTicket(ticketRes.data.ticket);
      }

      if (msgsRes.data.success) {
        setMessages(msgsRes.data.messages);
      }
    } catch (err) {
      console.error('[Ticket Detail Error]', err);
      setError(err.response?.data?.error || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // Real-time Socket.IO room listener
  useEffect(() => {
    if (!socket || !id) return;

    // Join room for this ticket
    socket.emit('join_ticket', id);

    const handleNewMessage = (incomingMsg) => {
      setMessages((prevMsgs) => {
        // Prevent duplicate appending by ID
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMsgError('');

    if (!newMessage || !newMessage.trim()) {
      setMsgError('Message cannot be empty');
      return;
    }

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
      console.error('[Send Message Error]', err);
      setMsgError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const isResolved = ticket?.status === 'Resolved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/tickets"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
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
            onClick={fetchTicketDetails}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
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
          
          {/* Main Column: Ticket Info & Messages */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ticket Header & Description Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-wrap items-start justify-between gap-3 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                      {ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                    {ticket.subject}
                  </h1>
                </div>
              </div>

              {/* Original Problem Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Original Issue Description
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
                    <span>Resolution Note from Support Agent</span>
                  </div>
                  <p className="text-sm text-emerald-800 bg-white/70 p-3.5 rounded-lg border border-emerald-100 font-medium">
                    {ticket.resolutionNote || 'Ticket resolved.'}
                  </p>
                  {ticket.resolvedAt && (
                    <p className="text-xs text-emerald-600">
                      Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* Conversation History & Message Composer */}
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
                    No messages yet. Send a message below to communicate with support.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId?._id === user?.id || m.senderRole === 'customer';

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center space-x-2 mb-1 text-xs text-slate-400">
                          {isMe ? (
                            <>
                              <span>{m.senderId?.name || 'You'}</span>
                              <User className="w-3.5 h-3.5 text-blue-500" />
                            </>
                          ) : (
                            <>
                              <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-semibold text-indigo-600">
                                {m.senderId?.name || 'Support Agent'}
                              </span>
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
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
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
                    <span>This ticket is resolved and locked for new messages.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    {msgError && (
                      <p className="text-xs text-red-600 font-medium">{msgError}</p>
                    )}
                    <div className="flex items-start space-x-3">
                      <textarea
                        rows={2}
                        required
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message or follow-up question..."
                        className="block w-full p-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg || !newMessage.trim()}
                        className="inline-flex items-center space-x-1.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Ticket Meta & Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                Ticket Details
              </h2>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Category</span>
                <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                  {ticket.category || 'General'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Assigned Support Agent</span>
                {ticket.assignedAgentId ? (
                  <div className="flex items-center space-x-2 text-sm font-medium text-slate-800">
                    <Headphones className="w-4 h-4 text-indigo-600" />
                    <span>{ticket.assignedAgentId.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                    Awaiting Assignment
                  </span>
                )}
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

            {/* AI Advisory Summary Info Card */}
            {ticket.aiSuggestion?.summary && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-5 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Triage Summary</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-lg border border-indigo-100">
                  "{ticket.aiSuggestion.summary}"
                </p>
                <p className="text-[10px] text-slate-400">
                  AI suggestions are advisory. Human agent review is authoritative.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : null}

    </div>
  );
};

export default CustomerTicketDetail;

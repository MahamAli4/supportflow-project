import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CreateTicket = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Not Sure');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subject || subject.trim().length < 3) {
      setError('Subject must be at least 3 characters long');
      return;
    }

    if (!description || description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Submitting ticket and analyzing with Google Gemini AI...');

    try {
      const res = await api.post('/tickets', {
        subject: subject.trim(),
        description: description.trim(),
        category,
      });

      if (res.data.success && res.data.ticket) {
        const ticket = res.data.ticket;

        // Show brief success alert before navigating
        if (ticket.aiStatus === 'success') {
          setStatusMessage('✓ AI analyzed ticket successfully! Redirecting...');
        } else {
          setStatusMessage('✓ Ticket created successfully! (AI analysis fallback triggered; manual triage available).');
        }

        setTimeout(() => {
          navigate(`/customer/tickets/${ticket._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error('[Create Ticket Error]', err);
      const errMsg = err.response?.data?.error || 'Failed to create ticket. Please try again.';
      setError(errMsg);
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Back Navigation */}
      <div className="flex items-center space-x-3">
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create Support Ticket</h1>
            <p className="text-xs text-slate-500">
              Submit your issue and our Gemini AI assistant will analyze and route it to a support agent.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Status Feedback Alert */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center space-x-3">
            {isSubmitting ? (
              <Sparkles className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Charged twice for subscription order"
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Provide a brief title summarizing the problem.</p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="Not Sure">Not Sure (AI will automatically categorize)</option>
              <option value="Billing">Billing & Refunds</option>
              <option value="Technical">Technical Issue</option>
              <option value="Account">Account Access</option>
              <option value="Order">Order Status</option>
              <option value="General">General Inquiry</option>
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail, including order numbers, error messages, or steps to reproduce..."
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Minimum 10 characters required.</p>
          </div>

          {/* AI Notice Badge */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">AI Triage Notice:</span> Your submission will be analyzed by Google Gemini to suggest category and priority levels for support agents. AI suggestions are advisory and reviewed by human agents.
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/customer/dashboard"
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting & Analyzing...' : 'Submit Ticket'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default CreateTicket;

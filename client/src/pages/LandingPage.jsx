import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Headphones,
  User,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  Lock,
  Zap,
  Cpu,
  Database,
  Copy,
  Check,
  LogIn,
  Layers,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const LandingPage = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [copiedRole, setCopiedRole] = useState(null);
  const [loggingInRole, setLoggingInRole] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const demoAccounts = [
    {
      id: 'customer',
      roleName: 'Customer Portal',
      badge: 'Client Area',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: User,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      email: 'customer@supportflow.demo',
      password: 'Customer123!',
      portalRoute: '/customer/dashboard',
      description: 'Submit support tickets, view live AI triage category suggestions, and chat in real-time with assigned agents.',
      features: [
        'Submit tickets with auto AI analysis',
        'Real-time Socket.IO chat with agent',
        'Live status tracking (New → In Progress → Resolved)',
        'Access personal ticket history only',
      ],
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      id: 'agent',
      roleName: 'Support Agent Workbench',
      badge: 'Support Desk',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Headphones,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      email: 'agent@supportflow.demo',
      password: 'Agent123!',
      portalRoute: '/agent/dashboard',
      description: 'Review and confirm AI triage recommendations (Human-in-the-Loop), communicate live with customers, update status, and close tickets.',
      features: [
        'Assigned ticket workbench & filtering queue',
        'Review/Edit AI Category, Priority & Summary',
        'Real-time message composer & status changer',
        'Mandatory resolution note enforcement on close',
      ],
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      featured: true,
    },
    {
      id: 'admin',
      roleName: 'Super Admin Control Center',
      badge: 'System Admin',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Shield,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
      email: 'admin@supportflow.demo',
      password: 'Admin123!',
      portalRoute: '/admin/dashboard',
      description: 'Oversee all system tickets across agents, provision new support agent and customer accounts, and inspect global analytics.',
      features: [
        'Global real-time system analytics dashboard',
        'Provision Customer and Support Agent accounts',
        'Inspect all company tickets across agents',
        'System health and performance monitoring',
      ],
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  ];

  const handleQuickLogin = async (account) => {
    setErrorMsg('');
    setLoggingInRole(account.id);

    try {
      const user = await login(account.email, account.password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('[Quick Login Error]', err);
      setErrorMsg(err.response?.data?.error || 'Quick login failed. Please ensure database is seeded.');
    } finally {
      setLoggingInRole(null);
    }
  };

  const copyToClipboard = (text, roleId) => {
    navigator.clipboard.writeText(text);
    setCopiedRole(roleId);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const getMyPortalLink = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'agent') return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-indigo-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Factory 2.0 Hackathon • Modern Web & App Development</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
              AI-Assisted Customer Support Desk with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Human-in-the-Loop Triage
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              <strong>SupportFlow</strong> empowers support teams by combining <strong>Google Gemini & OpenAI AI Triage</strong>, state-machine ticket workflows, real-time <strong>Socket.IO</strong> synchronization, and strict human agent verification before finalizing classifications.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                to={getMyPortalLink()}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
              >
                <span>Go to Your {role === 'admin' ? 'Admin' : role === 'agent' ? 'Agent' : 'Customer'} Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <a
                  href="#demo-credentials"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Choose Role & Quick Login</span>
                </a>
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
                >
                  <span>Manual Login Form</span>
                </Link>
              </>
            )}
          </div>

          {/* Global Alert for Errors */}
          {errorMsg && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Workflow Stepper Preview */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-5">
                Core Architectural Workflow Flowchart
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-left">
                
                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400">STEP 1</span>
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Customer Submits</h4>
                  <p className="text-[11px] text-slate-400">Customer enters issue subject & description.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-400">STEP 2</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white">AI Triages</h4>
                  <p className="text-[11px] text-slate-400">AI suggests Category, Priority & Summary.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-400">STEP 3</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Agent Reviews</h4>
                  <p className="text-[11px] text-slate-400">Human confirms or edits AI suggestions.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">STEP 4</span>
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Live Conversation</h4>
                  <p className="text-[11px] text-slate-400">Real-time Socket.IO chat & status update.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400">STEP 5</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Resolution Note</h4>
                  <p className="text-[11px] text-slate-400">Closed with note & immutable lock.</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 ROLES DEMO LOGIN & CREDENTIALS SECTION */}
      <section id="demo-credentials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-20">
        
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
            3-Tier Role Portals & Demo Accounts
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Role to Open Dedicated Portal
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Each role has distinct security privileges, dedicated views, and features. Click <strong>"1-Click Quick Login"</strong> to authenticate instantly or use the provided credentials.
          </p>
        </div>

        {/* 3 Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isLoggingIn = loggingInRole === acc.id;

            return (
              <div
                key={acc.id}
                className={`bg-white rounded-2xl border ${
                  acc.featured
                    ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-500/20 relative'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                } p-6 sm:p-7 flex flex-col justify-between transition-all`}
              >
                {acc.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    Core Agent Desk
                  </div>
                )}

                <div className="space-y-5">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl border ${acc.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${acc.badgeColor}`}>
                      {acc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{acc.roleName}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {acc.description}
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Demo Email:</span>
                      <div className="flex items-center space-x-1.5">
                        <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {acc.email}
                        </code>
                        <button
                          onClick={() => copyToClipboard(acc.email, `${acc.id}-email`)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Email"
                        >
                          {copiedRole === `${acc.id}-email` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Password:</span>
                      <div className="flex items-center space-x-1.5">
                        <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {acc.password}
                        </code>
                        <button
                          onClick={() => copyToClipboard(acc.password, `${acc.id}-pass`)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Password"
                        >
                          {copiedRole === `${acc.id}-pass` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Key Capabilities:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {acc.features.map((f, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="pt-6 space-y-2 border-t border-slate-100 mt-6">
                  <button
                    onClick={() => handleQuickLogin(acc)}
                    disabled={isLoggingIn}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 ${acc.btnColor}`}
                  >
                    {isLoggingIn ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>1-Click Quick Login as {acc.id.toUpperCase()}</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/login?role=${acc.id}&email=${encodeURIComponent(acc.email)}`}
                    className="w-full flex items-center justify-center space-x-1 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline"
                  >
                    <span>Prefill in Manual Login Form →</span>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* CORE FEATURES GRID */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              System Architecture & Features
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Real-World Reliability
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Built strictly according to Hackathon Task D requirements with production-grade separation of concerns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 inline-block">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Ticket Triage & Fallback</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically extracts Category, Priority, and Summary using OpenAI / Gemini with timeout abort controllers and manual fallback.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 inline-block">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI outputs remain advisory until a human support agent reviews, edits, and explicitly confirms triage data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 inline-block">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real-Time Socket.IO Sync</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bi-directional WebSocket synchronization broadcasts conversation messages, status updates, and triage reviews live without page refresh.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 inline-block">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Resolution Note & Ticket Lock</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tickets cannot be marked Resolved without a mandatory resolution note. Resolved tickets are strictly immutable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 inline-block">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Atomic Ticket Numbering</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Concurrency-safe sequence counter (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">SF-000001</code>) powered by atomic MongoDB <code className="text-[11px] font-mono"></code> operations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 inline-block">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">MongoDB MERN Architecture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full-stack MongoDB database with Mongoose ODM, Express REST APIs, Socket.IO WebSockets, and React Tailwind client.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER CALLOUT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 text-white space-y-4 shadow-md">
          <h3 className="text-2xl font-bold">Ready to test SupportFlow?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience the complete customer issue creation, AI triage, agent review, and real-time resolution workflow now.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <a
              href="#demo-credentials"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Launch Demo Portal</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

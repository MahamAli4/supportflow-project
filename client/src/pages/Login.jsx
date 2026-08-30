import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, LogIn, AlertCircle, Sparkles, User, Headphones, Check } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const demoPresets = [
    {
      id: 'customer',
      roleName: 'Customer',
      email: 'customer@supportflow.demo',
      password: 'Customer123!',
      color: 'border-blue-300 hover:bg-blue-50 text-blue-800 bg-blue-50/50',
      activeColor: 'ring-2 ring-blue-500 bg-blue-50 border-blue-400',
      icon: User,
    },
    {
      id: 'agent',
      roleName: 'Support Agent',
      email: 'agent@supportflow.demo',
      password: 'Agent123!',
      color: 'border-indigo-300 hover:bg-indigo-50 text-indigo-800 bg-indigo-50/50',
      activeColor: 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-400',
      icon: Headphones,
    },
    {
      id: 'admin',
      roleName: 'Super Admin',
      email: 'admin@supportflow.demo',
      password: 'Admin123!',
      color: 'border-purple-300 hover:bg-purple-50 text-purple-800 bg-purple-50/50',
      activeColor: 'ring-2 ring-purple-500 bg-purple-50 border-purple-400',
      icon: Shield,
    },
  ];

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const emailParam = searchParams.get('email');

    if (roleParam) {
      const preset = demoPresets.find((p) => p.id === roleParam);
      if (preset) {
        setEmail(preset.email);
        setPassword(preset.password);
        setSelectedRole(preset.id);
        return;
      }
    }

    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const selectPreset = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setSelectedRole(preset.id);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('[Login Error]', err);
      const errMsg = err.response?.data?.error || 'Invalid email or password';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to SupportFlow
        </h2>
        <p className="mt-1 text-center text-xs text-slate-600">
          AI-Assisted Customer Support Desk with State-Machine Workflows
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* Quick Autofill Role Selectors */}
        <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Click to Autofill Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {demoPresets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedRole === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected ? preset.activeColor : preset.color
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 font-bold" />}
                  </div>
                  <span className="text-[11px] font-bold mt-1 truncate">{preset.roleName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@supportflow.demo"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs border-t border-slate-100 pt-5 space-y-2">
            <div>
              <span className="text-slate-600">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-500">
                Register as Customer
              </Link>
            </div>
            <div>
              <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium">
                ← Back to Landing Page & Overview
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

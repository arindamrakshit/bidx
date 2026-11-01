import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(usernameOrEmail, password);
      navigate('/auctions');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userType) => {
    if (userType === 'user') {
      setUsernameOrEmail('arindam');
      setPassword('user123');
    } else if (userType === 'seller') {
      setUsernameOrEmail('luxurystore');
      setPassword('seller123');
    } else if (userType === 'admin') {
      setUsernameOrEmail('admin');
      setPassword('admin123');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Gavel className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white">Sign in to BidX</h1>
        <p className="text-xs text-slate-400">Access the high-concurrency real-time order books</p>
      </div>

      {/* Demo Credentials Quick-Pill */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">⚡ 1-Click Demo Accounts:</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('user')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/30 rounded-lg text-xs font-semibold text-slate-300 hover:text-brand-400 transition-colors"
          >
            User
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('seller')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/30 rounded-lg text-xs font-semibold text-slate-300 hover:text-brand-400 transition-colors"
          >
            Seller
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-brand-500/25 hover:from-brand-500 hover:to-sky-400 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-semibold hover:underline">
            Register with ₹50,000 demo credit
          </Link>
        </p>
      </div>
    </div>
  );
};

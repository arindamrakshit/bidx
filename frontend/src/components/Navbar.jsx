import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gavel, 
  Wallet as WalletIcon, 
  Bell, 
  User, 
  LogOut, 
  PlusCircle, 
  ShieldCheck, 
  Menu, 
  X,
  Compass,
  LayoutDashboard
} from 'lucide-react';

export const Navbar = () => {
  const { user, wallet, notifications, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#060a13]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  Bid<span className="text-brand-400">X</span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">Live</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-medium">HIGH-CONCURRENCY</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/auctions"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/auctions') 
                    ? 'text-brand-400 bg-brand-500/10' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Live Auctions</span>
              </Link>

              {user && (user.role === 'ROLE_SELLER' || user.role === 'ROLE_ADMIN') && (
                <Link
                  to="/create-auction"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/create-auction') 
                      ? 'text-brand-400 bg-brand-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Auction</span>
                </Link>
              )}

              {user && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/dashboard') 
                      ? 'text-brand-400 bg-brand-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}

              {user?.role === 'ROLE_ADMIN' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/admin') 
                      ? 'text-brand-400 bg-brand-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Wallet Pill */}
                <Link
                  to="/dashboard?tab=wallet"
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-200 transition-all shadow-inner"
                >
                  <WalletIcon className="w-4 h-4 text-brand-400" />
                  <div className="text-xs">
                    <span className="text-slate-400 font-medium mr-1">Available:</span>
                    <span className="font-semibold text-emerald-400">
                      ₹{wallet ? Number(wallet.availableBalance).toLocaleString('en-IN') : '0.00'}
                    </span>
                  </div>
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Drawer */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                        <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Notifications</span>
                        <span className="text-[11px] text-brand-400">{notifications.length} total</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                              <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white leading-tight">{user.fullName || user.username}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user.role?.replace('ROLE_', '')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 text-white hover:from-brand-500 hover:to-sky-400 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#060a13] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            Live Auctions
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/create-auction"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                List Auction
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-400 hover:bg-slate-800"
              >
                Sign Out
              </button>
            </>
          )}
          {!user && (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-700 text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

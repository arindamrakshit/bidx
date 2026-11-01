import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';
import api from '../services/api';
import { AuctionCard } from '../components/AuctionCard';

export const LandingPage = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [stats, setStats] = useState({
    activeAuctions: 12,
    totalBids: 842,
    totalUsers: 1420,
    volume: 52000000
  });

  useEffect(() => {
    api.get('/auctions?size=3&sortBy=popular')
      .then(res => {
        if (res.data && res.data.content) {
          setFeaturedAuctions(res.data.content);
        }
      })
      .catch(err => console.error("Could not load featured auctions", err));

    api.get('/admin/statistics')
      .then(res => {
        if (res.data) {
          setStats({
            activeAuctions: res.data.activeAuctions || 8,
            totalBids: res.data.totalBids || 340,
            totalUsers: res.data.totalUsers || 24,
            volume: res.data.totalPlatformVolume || 35000000
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="text-center relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen Real-Time Auction Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]"
          >
            Where Every Bid <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Moves the Market.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Engineered with pessimistic concurrency locks, event-driven WebSocket STOMP broadcasting, 
            and automated multi-tier financial settlement. Experience zero lost updates at scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/auctions"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Auctions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-850 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Selling</span>
            </Link>
          </motion.div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="p-4 text-center">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Active Auctions</span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.activeAuctions}</p>
          </div>
          <div className="p-4 text-center border-l border-slate-800">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Bids</span>
            <p className="text-2xl sm:text-3xl font-black text-brand-400 mt-1">{stats.totalBids}</p>
          </div>
          <div className="p-4 text-center border-l border-slate-800">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Trading Volume</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              ₹{(stats.volume / 100000).toFixed(1)}L+
            </p>
          </div>
          <div className="p-4 text-center border-l border-slate-800">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Pessimistic Isolation</span>
            <p className="text-2xl sm:text-3xl font-black text-sky-400 mt-1">100% ACID</p>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Featured Lots</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">High-Volume Live Auctions</h2>
          </div>
          <Link
            to="/auctions"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>View All Auctions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>

      {/* Core Engineering Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/90 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">System Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for High-Concurrency Integrity</h2>
            <p className="text-sm text-slate-400">
              Traditional web applications fail under high-frequency bidding race conditions. BidX implements a multi-layered transactional safeguard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Row-Level Pessimistic Locking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilizes <code className="text-brand-300">SELECT ... FOR UPDATE</code> to serialize concurrent bid placement on the exact auction record, ensuring lost updates and dirty reads are mathematically impossible.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Sub-Second WebSocket STOMP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bypasses HTTP polling overhead. When a bid commits to the database, a dedicated WebSocket event fires to <code className="text-sky-300">/topic/auction/{'{id}'}</code>, synchronizing all clients instantaneously.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Atomic Wallet Escrow</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bidders must hold liquid capital. Placed bids lock escrow instantly. When outbid, funds return immediately to available balance, preventing ghost bids and bad-debt insolvency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Protocol</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The Bidding Lifecycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: '01', title: 'Fund & Verify', desc: 'Demo balance of ₹50,000 is automatically credited upon registration for immediate testing.' },
            { step: '02', title: 'Real-Time Pulse', desc: 'Join the live auction room. Live updates stream through STOMP WebSocket topics.' },
            { step: '03', title: 'Serial Lock', desc: 'Your bid acquires a transactional row lock. Balance is reserved in escrow instantly.' },
            { step: '04', title: 'Automated Settlement', desc: 'Scheduler terminates auctions upon expiry, deducting the winning lot and crediting the seller.' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 relative">
              <span className="text-3xl font-black text-brand-500/20 font-mono absolute top-4 right-4">{item.step}</span>
              <h3 className="text-base font-bold text-white mt-4">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

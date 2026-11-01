import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, Database, DollarSign, Layers } from 'lucide-react';
import api from '../services/api';

export const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/statistics')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading system metrics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Enterprise Control</span>
        <h1 className="text-3xl font-black text-white mt-1">Platform Operations & Telemetry</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor transactional consistency, pessimistic lock health, and aggregate ledger volumes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Registered Accounts</span>
          </div>
          <p className="text-3xl font-black text-white font-mono">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-slate-500">Authenticated via BCrypt & JWT</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Active Auctions</span>
          </div>
          <p className="text-3xl font-black text-sky-400 font-mono">{stats?.activeAuctions || 0}</p>
          <p className="text-[11px] text-slate-500">Order books active for bidding</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Total Completed Lots</span>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">{stats?.completedAuctions || 0}</p>
          <p className="text-[11px] text-slate-500">Settled without race conditions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Bids Processed</span>
          <p className="text-3xl font-black text-white font-mono">{stats?.totalBids || 0}</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every bid passes through <code className="text-brand-300">@Lock(LockModeType.PESSIMISTIC_WRITE)</code> to guarantee ACID integrity.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Platform Trading Gross Volume</span>
          <p className="text-3xl font-black text-emerald-400 font-mono">
            ₹{stats?.totalPlatformVolume ? Number(stats.totalPlatformVolume).toLocaleString('en-IN') : '0.00'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Backed by virtual escrow ledger reservations and zero-loss outbid release.
          </p>
        </div>
      </div>
    </div>
  );
};

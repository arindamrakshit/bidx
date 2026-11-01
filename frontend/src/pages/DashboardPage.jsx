import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gavel, 
  Bookmark, 
  Trophy, 
  History, 
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user, wallet, refreshWallet } = useAuth();
  const [myBids, setMyBids] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [sellerAuctions, setSellerAuctions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('25000');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [bidsRes, watchRes, wonRes, txRes] = await Promise.all([
        api.get('/user/bids'),
        api.get('/user/watchlist'),
        api.get('/user/won-auctions'),
        api.get('/wallet/transactions')
      ]);
      setMyBids(bidsRes.data);
      setWatchlist(watchRes.data);
      setWonAuctions(wonRes.data);
      setTransactions(txRes.data);

      if (user?.role === 'ROLE_SELLER' || user?.role === 'ROLE_ADMIN') {
        const sellerRes = await api.get('/user/seller/auctions');
        setSellerAuctions(sellerRes.data);
      }
    } catch (err) {
      console.error("Dashboard data load error", err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/wallet/deposit', { amount: parseFloat(depositAmount) });
      refreshWallet();
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Account Console</span>
          <h1 className="text-3xl font-black text-white mt-1">
            Welcome back, {user?.fullName || user?.username}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            UUID: usr_{user?.id} • Role: {user?.role}
          </p>
        </div>

        {/* Quick Balance Banner */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Available Balance</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ₹{wallet ? Number(wallet.availableBalance).toLocaleString('en-IN') : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Wallet', icon: WalletIcon },
          { id: 'bids', label: 'My Bids', icon: Gavel },
          { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
          { id: 'won', label: 'Won Lots', icon: Trophy },
          ...(user?.role === 'ROLE_SELLER' || user?.role === 'ROLE_ADMIN' ? [{ id: 'seller', label: 'Seller Catalog', icon: History }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                active 
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview & Wallet */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Available Liquid Funds</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">
                ₹{wallet ? Number(wallet.availableBalance).toLocaleString('en-IN') : '0.00'}
              </p>
              <p className="text-[11px] text-slate-500">Ready to deploy into active auctions</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Reserved in Escrow</span>
              <p className="text-3xl font-black text-amber-400 font-mono">
                ₹{wallet ? Number(wallet.reservedBalance).toLocaleString('en-IN') : '0.00'}
              </p>
              <p className="text-[11px] text-slate-500">Locked on your highest ongoing bids</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Simulated Deposit</span>
              <form onSubmit={handleDeposit} className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                >
                  + Add
                </button>
              </form>
              <p className="text-[11px] text-slate-500">Inject test liquidity for bidding</p>
            </div>
          </div>

          {/* Ledger History */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Wallet Transaction Ledger</h3>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Details</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.type.includes('DEPOSIT') || tx.type.includes('REFUND') || tx.type.includes('PAYOUT')
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          ₹{Number(tx.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: My Bids */}
      {activeTab === 'bids' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">My Bid History</h3>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-sans">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Lot #</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Bid Amount</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Time</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {myBids.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 font-sans">
                      You haven't placed any bids yet.
                    </td>
                  </tr>
                ) : (
                  myBids.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-brand-400">#{b.auctionId}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">₹{Number(b.amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">{new Date(b.bidTime).toLocaleString()}</td>
                      <td className="py-3 px-4 font-sans">
                        <Link to={`/auctions/${b.auctionId}`} className="text-brand-400 hover:underline flex items-center space-x-1">
                          <span>View Lot</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Won Lots */}
      {activeTab === 'won' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Acquired / Won Auctions</h3>
          {wonAuctions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              No won auctions yet. Keep bidding to take home winning lots!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wonAuctions.map(a => (
                <div key={a.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase">
                    Settled & Won
                  </span>
                  <h4 className="text-base font-bold text-white line-clamp-1">{a.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">Winning Bid: ₹{Number(a.currentBid).toLocaleString('en-IN')}</p>
                  <Link to={`/auctions/${a.id}`} className="text-xs text-brand-400 font-semibold block hover:underline">
                    View Certificate of Provenance &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Watchlist */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Watched Lots</h3>
          {watchlist.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              Your watchlist is empty. Bookmark items to monitor real-time pricing moves.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlist.map(a => (
                <div key={a.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-base font-bold text-white line-clamp-1">{a.title}</h4>
                  <p className="text-xs text-emerald-400 font-mono font-bold">Current: ₹{Number(a.currentBid).toLocaleString('en-IN')}</p>
                  <Link to={`/auctions/${a.id}`} className="text-xs text-brand-400 font-semibold block hover:underline">
                    Open Real-Time Room &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Seller Catalog */}
      {activeTab === 'seller' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">My Listed Lots</h3>
            <Link to="/create-auction" className="text-xs font-semibold text-brand-400 hover:underline">
              + New Listing
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-sans">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Title</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Current Bid</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Total Bids</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sellerAuctions.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-white font-sans font-medium">{a.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">₹{Number(a.currentBid).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-300">{a.totalBids}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

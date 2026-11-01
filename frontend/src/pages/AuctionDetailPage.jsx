import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  TrendingUp, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  ArrowUpRight, 
  Clock, 
  Lock,
  Bookmark,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { wsService } from '../services/websocket';
import { useAuth } from '../context/AuthContext';
import { CountdownTimer } from '../components/CountdownTimer';

export const AuctionDetailPage = () => {
  const { id } = useParams();
  const { user, wallet, refreshWallet } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pulseBidChange, setPulseBidChange] = useState(false);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const [aucRes, bidsRes] = await Promise.all([
        api.get(`/auctions/${id}`),
        api.get(`/auctions/${id}/bids`)
      ]);
      setAuction(aucRes.data);
      setBids(bidsRes.data);
      // Pre-fill next minimum bid
      setBidAmount(aucRes.data.minNextBid ? String(aucRes.data.minNextBid) : '');
    } catch (err) {
      setErrorMsg("Failed to load auction lot details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();

    // Subscribe to STOMP WebSocket topic for this specific auction
    const unsubscribe = wsService.subscribeToAuction(id, (event) => {
      // Real-time WebSocket payload received!
      setAuction((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentBid: event.currentBid,
          minNextBid: event.minNextBid || (Number(event.currentBid) + Number(prev.minIncrement)),
          totalBids: event.totalBids,
          highestBidderId: event.highestBidderId,
          highestBidderName: event.highestBidderName,
        };
      });

      // Automatically prepend new bid in the history table
      setBids((prev) => [
        {
          id: Date.now(),
          auctionId: event.auctionId,
          bidderUsername: event.highestBidderName || 'Anonymous',
          amount: event.currentBid,
          bidTime: event.timestamp || new Date().toISOString()
        },
        ...prev
      ]);

      // Trigger UI flash/animation
      setPulseBidChange(true);
      setTimeout(() => setPulseBidChange(false), 800);

      // Auto update suggested input
      if (event.minNextBid) {
        setBidAmount(String(event.minNextBid));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("Please sign in to place a bid.");
      return;
    }

    const numAmount = parseFloat(bidAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid bid amount.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.post(`/auctions/${id}/bids`, { amount: numAmount });
      
      setSuccessMsg(`Bid of ₹${numAmount.toLocaleString('en-IN')} placed successfully!`);
      refreshWallet();

      // Confetti burst for high achievement
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Bid placement failed. Please verify minimum increment and wallet balance.";
      setErrorMsg(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 bg-slate-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-slate-800 rounded-2xl" />
          <div className="lg:col-span-5 h-96 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Auction Lot Not Found</h2>
        <Link to="/auctions" className="text-sm font-semibold text-brand-400 hover:underline">
          Return to Auctions &rarr;
        </Link>
      </div>
    );
  }

  const isHighestBidder = user && auction.highestBidderId === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb & Lot ID */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Link to="/auctions" className="hover:text-brand-400">Auctions</Link>
          <span>/</span>
          <span className="text-slate-200">{auction.category}</span>
          <span>/</span>
          <span className="text-brand-400">Lot #{auction.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Real-Time Sync Active</span>
        </div>
      </div>

      {/* Main Grid: Left Column Details & Right Column Bidding Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Images & Narrative */}
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/10] relative shadow-2xl">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                Category: {auction.category}
              </span>
              <CountdownTimer endTime={auction.endTime} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {auction.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>
          </div>

          {/* Seller Provenance Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Curated By</p>
                <p className="text-sm font-bold text-white">{auction.sellerName || 'Verified Enterprise'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Escrow Protected</span>
            </div>
          </div>

          {/* Real-time Bid History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Live Bid Activity</h3>
              <span className="text-xs text-slate-400">{bids.length} entries</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Bidder</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {bids.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-500">
                        No bids placed yet. Be the first to move the market!
                      </td>
                    </tr>
                  ) : (
                    bids.map((b, idx) => (
                      <tr 
                        key={b.id || idx} 
                        className={`hover:bg-slate-800/30 transition-colors ${idx === 0 ? 'bg-brand-500/5 font-semibold' : ''}`}
                      >
                        <td className="py-3 px-4 text-slate-200 flex items-center space-x-1.5">
                          {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          <span>@{b.bidderUsername}</span>
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          ₹{Number(b.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                          {new Date(b.bidTime).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Real-time Execution Console */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-2xl relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="space-y-6">
              {/* Current Bid Display */}
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Current Market Price</span>
                <motion.div 
                  animate={pulseBidChange ? { scale: [1, 1.05, 1], color: ['#10b981', '#38bdf8', '#10b981'] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-4xl sm:text-5xl font-black text-emerald-400 mt-1 font-mono tracking-tight"
                >
                  ₹{Number(auction.currentBid).toLocaleString('en-IN')}
                </motion.div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Starting: ₹{Number(auction.startingPrice).toLocaleString('en-IN')}</span>
                  <span>Min Increment: +₹{Number(auction.minIncrement).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Banner */}
              {isHighestBidder && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>You are currently the highest bidder on this lot!</span>
                </div>
              )}

              {/* Bidding Form */}
              <form onSubmit={handleBidSubmit} className="space-y-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Enter Bid Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                    <input
                      type="number"
                      step="any"
                      min={auction.minNextBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={String(auction.minNextBid)}
                      disabled={submitting || auction.status !== 'ACTIVE'}
                      className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
                    <span>Minimum next acceptable bid:</span>
                    <span className="font-semibold text-brand-400">₹{Number(auction.minNextBid).toLocaleString('en-IN')}</span>
                  </p>
                </div>

                {/* Quick increment buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    auction.minIncrement,
                    Number(auction.minIncrement) * 2,
                    Number(auction.minIncrement) * 5
                  ].map((inc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBidAmount(String(Number(auction.currentBid) + Number(inc)))}
                      className="py-2 px-2 bg-slate-950 border border-slate-800 hover:border-brand-500/40 rounded-lg text-xs font-mono font-semibold text-slate-300 transition-all hover:bg-slate-800"
                    >
                      +{Number(inc).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Feedback notifications */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || auction.status !== 'ACTIVE'}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-black text-sm tracking-wide shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Real-Time Bid</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Liquid Balance Indicator */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Available Balance:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ₹{wallet ? Number(wallet.availableBalance).toLocaleString('en-IN') : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

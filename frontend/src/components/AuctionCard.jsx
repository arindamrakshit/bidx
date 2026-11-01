import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import { Bookmark, TrendingUp, User } from 'lucide-react';
import api from '../services/api';

export const AuctionCard = ({ auction, onWatchToggle }) => {
  const [watched, setWatched] = useState(auction.userWatched);
  const [loadingWatch, setLoadingWatch] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoadingWatch(true);
      const res = await api.post(`/user/watchlist/${auction.id}`);
      setWatched(res.data.watched);
      if (onWatchToggle) onWatchToggle(auction.id, res.data.watched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWatch(false);
    }
  };

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-brand-500/50 overflow-hidden glow-card transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
        
        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 border border-slate-700/60">
          {auction.category}
        </span>

        {/* Watchlist Bookmark */}
        <button
          onClick={handleToggle}
          disabled={loadingWatch}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            watched 
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-700/50'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${watched ? 'fill-current' : ''}`} />
        </button>

        {/* Countdown Over Thumbnail */}
        <div className="absolute bottom-3 left-3">
          <CountdownTimer endTime={auction.endTime} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {auction.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {auction.description}
          </p>
        </div>

        {/* Financial Details */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Current Bid</span>
              <span className="text-lg font-black text-emerald-400">
                ₹{Number(auction.currentBid).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Activity</span>
              <div className="flex items-center space-x-1 text-slate-300 font-semibold text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
                <span>{auction.totalBids || 0} bids</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <User className="w-3 h-3 text-slate-500" />
              <span>Seller: {auction.sellerName || 'Verified'}</span>
            </span>
            <span className="text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              Place Bid &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

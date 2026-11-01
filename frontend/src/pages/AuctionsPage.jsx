import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import api from '../services/api';
import { AuctionCard } from '../components/AuctionCard';

const CATEGORIES = ['ALL', 'Watches', 'Automobiles', 'Electronics', 'Collectibles', 'Artwork'];
const STATUSES = ['ALL', 'ACTIVE', 'SCHEDULED', 'ENDED'];
const SORT_OPTIONS = [
  { label: 'Newest Listed', value: 'createdAt' },
  { label: 'Ending Soonest', value: 'endingSoon' },
  { label: 'Highest Activity', value: 'popular' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
];

export const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ACTIVE');
  const [sortBy, setSortBy] = useState('createdAt');

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {
        category: category === 'ALL' ? undefined : category,
        status: status === 'ALL' ? undefined : status,
        search: search.trim() || undefined,
        sortBy,
        size: 24,
      };
      const res = await api.get('/auctions', { params });
      if (res.data && res.data.content) {
        setAuctions(res.data.content);
      }
    } catch (err) {
      console.error("Error fetching auctions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [category, status, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Marketplace</span>
          <h1 className="text-3xl font-black text-white mt-1">Live Bidding Arena</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time high-concurrency auction catalogue. Inspect active lots and participate live.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by lot title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & Status Selectors */}
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-slate-900/40 rounded-2xl border border-slate-800 h-80" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/30 border border-slate-800/80 space-y-3">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Auctions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, status filters or check back later for new inventory listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

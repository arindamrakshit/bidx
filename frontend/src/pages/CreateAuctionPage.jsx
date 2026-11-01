import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image, Sparkles, Check, ArrowRight } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = ['Watches', 'Automobiles', 'Electronics', 'Collectibles', 'Artwork'];

export const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Watches',
    startingPrice: '',
    minIncrement: '',
    durationHours: '24',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const now = new Date();
      const endTime = new Date(now.getTime() + parseInt(formData.durationHours) * 60 * 60 * 1000);

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startingPrice: parseFloat(formData.startingPrice),
        minIncrement: parseFloat(formData.minIncrement),
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        imageUrl: formData.imageUrl,
      };

      const res = await api.post('/auctions', payload);
      navigate(`/auctions/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish auction listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Seller Portal</span>
        <h1 className="text-3xl font-black text-white mt-1">List New Auction Lot</h1>
        <p className="text-xs text-slate-400 mt-1">
          Deploy an item into the high-concurrency order book. Specify starting thresholds and increment rules.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Lot Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 1974 Rolex GMT-Master 'Pepsi' Ref. 1675"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Duration</label>
              <select
                name="durationHours"
                value={formData.durationHours}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="1">1 Hour (Sprint)</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours (2 Days)</option>
                <option value="72">72 Hours (3 Days)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Starting Price (₹)</label>
              <input
                type="number"
                name="startingPrice"
                required
                min="1"
                step="any"
                value={formData.startingPrice}
                onChange={handleChange}
                placeholder="50000"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Min Bid Increment (₹)</label>
              <input
                type="number"
                name="minIncrement"
                required
                min="1"
                step="any"
                value={formData.minIncrement}
                onChange={handleChange}
                placeholder="1000"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Product Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Full Description & Condition Report</label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide thorough provenance, condition, serial tags, and inclusions..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 text-white font-black text-sm tracking-wide shadow-xl shadow-brand-500/25 hover:from-brand-500 hover:to-sky-400 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Publish Auction to Order Book</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuctionsPage } from './pages/AuctionsPage';
import { AuctionDetailPage } from './pages/AuctionDetailPage';
import { CreateAuctionPage } from './pages/CreateAuctionPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auctions" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#060a13] text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auctions" element={<AuctionsPage />} />
              <Route path="/auctions/:id" element={<AuctionDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Authenticated user routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/create-auction" element={
                <ProtectedRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}>
                  <CreateAuctionPage />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          <footer className="border-t border-slate-900 bg-slate-950/60 py-10 px-4 mt-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <div>
                <span className="font-bold text-slate-300">BidX Real-Time Auction Platform</span> &copy; {new Date().getFullYear()}. All rights reserved.
              </div>
              <div className="flex space-x-6 text-slate-400">
                <span>Pessimistic Concurrency</span>
                <span>•</span>
                <span>Optimistic Versioning</span>
                <span>•</span>
                <span>WebSocket STOMP</span>
                <span>•</span>
                <span>Spring Boot & React</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

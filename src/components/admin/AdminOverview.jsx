import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, MessageSquare, CheckCircle, ArrowUpRight, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingInquiries: 0,
    approvedProperties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch dashboard statistics
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fix 1: Updated API route to '/admin/dashboard-stats'
      const res = await apiRequest('/admin/dashboard-stats'); 
      const data = await res.json();

      if (res.ok) {
        // Fix 2: Mapped data correctly
        setStats({
          totalUsers: data.totalUsers || 0,
          totalProperties: data.totalProperties || 0,
          pendingInquiries: data.pendingProperties || 0, // Mapped to pendingProperties based on API response
          approvedProperties: data.approvedProperties || 0,
        });
      } else {
        setError(data.message || 'Failed to load stats');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Animation configuration for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <Activity className="text-green-600 shrink-0" size={28} />
          Admin Overview
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2">
          Welcome back! Here's a quick look at your platform's performance today.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-start sm:items-center gap-2 bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-semibold border border-red-100">
          <AlertCircle size={18} className="shrink-0 mt-0.5 sm:mt-0" /> {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8"
          >
            {/* Total Users Card */}
            <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-200 transition-all min-w-0">
              <div className="space-y-1.5 sm:space-y-2 min-w-0 pr-3">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block truncate">Total Users</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-800 block truncate">{stats.totalUsers}</span>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0">
                <Users size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>

            {/* Total Properties Card */}
            <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all min-w-0">
              <div className="space-y-1.5 sm:space-y-2 min-w-0 pr-3">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block truncate">Total Listings</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-800 block truncate">{stats.totalProperties}</span>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Building2 size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>

            {/* Approved Properties Card */}
            <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all min-w-0">
              <div className="space-y-1.5 sm:space-y-2 min-w-0 pr-3">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block truncate">Approved Property</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-800 block truncate">{stats.approvedProperties}</span>
              </div>
              <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <CheckCircle size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>

            {/* Pending Inquiries Card */}
            <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all min-w-0">
              <div className="space-y-1.5 sm:space-y-2 min-w-0 pr-3">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block truncate">New Inquiries</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-800 block truncate">{stats.pendingInquiries}</span>
              </div>
              <div className="p-3 sm:p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                <MessageSquare size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Grid: Quick Links & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Quick Navigation Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600 shrink-0" /> Quick Management Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link to="/admin/users" className="p-3 sm:p-4 bg-slate-50 hover:bg-green-50/50 rounded-xl border border-gray-100 text-center block transition-all group">
                  <span className="font-bold text-xs sm:text-sm text-slate-700 group-hover:text-green-600 flex items-center justify-center gap-1.5">
                    Manage Users <ArrowUpRight size={16} className="shrink-0" />
                  </span>
                </Link>
                <Link to="/admin/properties" className="p-3 sm:p-4 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-gray-100 text-center block transition-all group">
                  <span className="font-bold text-xs sm:text-sm text-slate-700 group-hover:text-blue-600 flex items-center justify-center gap-1.5">
                    Properties <ArrowUpRight size={16} className="shrink-0" />
                  </span>
                </Link>
                <Link to="/admin/inquiries" className="p-3 sm:p-4 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-gray-100 text-center block transition-all group">
                  <span className="font-bold text-xs sm:text-sm text-slate-700 group-hover:text-amber-600 flex items-center justify-center gap-1.5">
                    Inquiries <ArrowUpRight size={16} className="shrink-0" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Platform Status Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1.5 sm:mb-2">System Status</h3>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium mb-4">All server systems running normally.</p>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex justify-between items-center text-[11px] sm:text-xs font-semibold">
                  <span className="text-gray-500">API Gateway</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 sm:py-0.5 rounded-md">Healthy</span>
                </div>
                <div className="flex justify-between items-center text-[11px] sm:text-xs font-semibold">
                  <span className="text-gray-500">Database Cluster</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 sm:py-0.5 rounded-md">Connected</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
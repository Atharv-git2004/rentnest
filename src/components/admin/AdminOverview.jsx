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

  // 1. ഡാഷ്‌ബോർഡിലെ സ്റ്റാറ്റിസ്റ്റിക്സ് വിവരങ്ങൾ ഫെച്ച് ചെയ്യുന്നു
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // ഫിക്സ് 1: API റൂട്ട് '/admin/dashboard-stats' എന്നാക്കി മാറ്റി
      const res = await apiRequest('/admin/dashboard-stats'); 
      const data = await res.json();

      if (res.ok) {
        // ഫിക്സ് 2: ഡാറ്റ കൃത്യമായി മാപ്പ് ചെയ്തു 
        setStats({
          totalUsers: data.totalUsers || 0,
          totalProperties: data.totalProperties || 0,
          pendingInquiries: data.pendingProperties || 0, // ഇവിടെ pendingProperties എന്ന് കൊടുത്തു
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

  // കാർഡുകൾക്കുള്ള ആനിമേഷൻ കോൺഫിഗറേഷൻ
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <Activity className="text-green-600" size={28} />
          Admin Overview
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Welcome back! Here's a quick look at your platform's performance today.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
          >
            {/* Total Users Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-200 transition-all">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Users</span>
                <span className="text-3xl font-black text-slate-800 block">{stats.totalUsers}</span>
              </div>
              <div className="p-4 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
            </motion.div>

            {/* Total Properties Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Listings</span>
                <span className="text-3xl font-black text-slate-800 block">{stats.totalProperties}</span>
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 size={24} />
              </div>
            </motion.div>

            {/* Approved Properties Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Approved Property</span>
                <span className="text-3xl font-black text-slate-800 block">{stats.approvedProperties}</span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle size={24} />
              </div>
            </motion.div>

            {/* Pending Inquiries Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">New Inquiries</span>
                <span className="text-3xl font-black text-slate-800 block">{stats.pendingInquiries}</span>
              </div>
              <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <MessageSquare size={24} />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Grid: Quick Links & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Navigation Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600" /> Quick Management Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/admin/users" className="p-4 bg-slate-50 hover:bg-green-50/50 rounded-xl border border-gray-100 text-center block transition-all group">
                  <span className="font-bold text-sm text-slate-700 group-hover:text-green-600 flex items-center justify-center gap-1">
                    Manage Users <ArrowUpRight size={16} />
                  </span>
                </Link>
                <Link to="/admin/properties" className="p-4 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-gray-100 text-center block transition-all group">
                  <span className="font-bold text-sm text-slate-700 group-hover:text-blue-600 flex items-center justify-center gap-1">
                    Properties <ArrowUpRight size={16} />
                  </span>
                </Link>
                <Link to="/admin/inquiries" className="p-4 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-gray-100 text-center block transition-all group">
                  <span className="font-bold text-sm text-slate-700 group-hover:text-amber-600 flex items-center justify-center gap-1">
                    Inquiries <ArrowUpRight size={16} />
                  </span>
                </Link>
              </div>
            </div>

            {/* Platform Status Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-2">System Status</h3>
                <p className="text-xs text-gray-400 font-medium mb-4">All server systems running normally.</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-500">API Gateway</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Healthy</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-500">Database Cluster</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Connected</span>
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
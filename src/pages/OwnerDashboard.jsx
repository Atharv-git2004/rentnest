import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Building2, Plus, DollarSign, Users, 
  Trash2, Edit3, Eye, TrendingUp, CheckCircle, Clock 
} from 'lucide-react';

import { apiRequest } from '../services/api';

const BACKEND_URL = 
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 
  (typeof process !== 'undefined' && process.env.REACT_APP_BACKEND_URL) || 
  'http://localhost:5000';

const getImageUrl = (imagePath, fallback = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80') => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith('http')) return imagePath; 
  return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`; 
};

const OwnerDashboard = () => {
  const navigate = useNavigate(); 
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerProperties();
  }, []);

  const stats = useMemo(() => {
    const activeProperties = properties.filter(p => p.status?.toLowerCase() === 'approved');
    const pendingProperties = properties.filter(p => p.status?.toLowerCase() === 'pending');
    
    const revenue = activeProperties.reduce((sum, prop) => sum + (Number(prop.price) || 0), 0);

    return {
      totalProperties: properties.length,
      activeBookings: activeProperties.length,
      totalEarnings: revenue > 0 ? `₹${revenue.toLocaleString('en-IN')}` : '₹0',
      pendingRequests: pendingProperties.length
    };
  }, [properties]);

  const fetchOwnerProperties = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/properties/owner'); 
      const data = await res.json();
      
      if (res.ok) {
        const fetchedData = Array.isArray(data) ? data : (data.data || []);
        setProperties(fetchedData);
      } else {
        toast.error(data.message || "Failed to fetch properties.");
        loadDummyData();
      }
    } catch (err) {
      console.error("Dashboard API error:", err);
      toast.error("Server connection failed. Showing sample data.");
      loadDummyData(); 
    } finally {
      setLoading(false);
    }
  };

  const loadDummyData = () => {
    setProperties([
      {
        _id: 'p1',
        title: 'Skyline Luxury Apartment',
        location: 'Kakkanad, Kochi',
        price: 25000,
        status: 'approved',
        houseImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80'
      },
      {
        _id: 'p2',
        title: 'Green Valley Villa',
        location: 'Edappally, Kochi',
        price: 35000,
        status: 'pending',
        houseImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80'
      }
    ]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property listing? This action cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting property...");
    
    try {
      const res = await apiRequest(`/properties/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        setProperties(prev => prev.filter(prop => prop._id !== id));
        toast.success("Property deleted successfully", { id: loadingToast });
      } else {
        throw new Error("Failed to delete from server");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setProperties(prev => prev.filter(prop => prop._id !== id));
      toast.success("Property removed (Local Test Mode)", { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 border-4 border-gray-200 border-t-green-600 rounded-full"
        />
        <p className="text-gray-500 font-medium mt-4 animate-pulse">Loading Owner Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans selection:bg-green-500 selection:text-white">
      <Toaster position="top-right" reverseOrder={false} /> 
      
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your listed properties and track tenant requests.</p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/add-property')} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-200 text-sm"
          >
            <Plus size={18} /> Add New Property
          </motion.button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Listings</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalProperties}</h3>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Building2 size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Revenue</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalEarnings}</h3>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl shadow-inner"><DollarSign size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Rentals</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.activeBookings}</h3>
            </div>
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shadow-inner"><Users size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Approvals</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.pendingRequests}</h3>
            </div>
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shadow-inner"><Clock size={24} /></div>
          </div>
        </div>

        {/* --- MAIN CONTENT: LISTINGS & RECENT ACTIVITY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg">My Listed Properties</h3>
              {properties.length > 0 && (
                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {properties.length} Properties
                </span>
              )}
            </div>

            {properties.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center">
                <Building2 size={48} className="text-gray-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-700">No properties found</h4>
                <p className="text-gray-500 font-medium mt-1 mb-6">You haven't listed any properties yet.</p>
                <button 
                  onClick={() => navigate('/add-property')}
                  className="text-green-600 font-bold hover:text-green-700 underline underline-offset-4"
                >
                  List your first property
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400 bg-slate-50/30">
                      <th className="p-4 pl-6">Property Details</th>
                      <th className="p-4">Rent (Monthly)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-medium text-slate-700">
                    {properties.map((property) => (
                      <tr key={property._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4 pl-6 flex items-center gap-4">
                          <img 
                            src={getImageUrl(property.houseImage || property.image || property.images?.[0])} 
                            alt={property.title} 
                            className="w-16 h-16 object-cover rounded-xl border border-gray-100 bg-slate-50 shadow-sm group-hover:shadow-md transition-shadow"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80';
                            }}
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1">{property.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{property.location}</p>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          ₹{Number(property.price) ? Number(property.price).toLocaleString('en-IN') : property.price}
                        </td>
                        <td className="p-4">
                          {property.status?.toLowerCase() === 'approved' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle size={14} /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                              <Clock size={14} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center pr-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => navigate(`/property/${property._id}`)} 
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => navigate(`/edit-property/${property._id}`)} 
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                              title="Edit Listing"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(property._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                              title="Delete Listing"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-lg mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" /> Recent Activity
              </h3>
              
              <div className="space-y-5 text-sm font-medium">
                <div className="flex gap-4 border-l-2 border-gray-100 pl-4 pb-2 relative">
                  <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px] top-1 ring-4 ring-white" />
                  <div>
                    <p className="text-slate-800 font-bold">New Lease Request</p>
                    <p className="text-xs text-gray-500 mt-1">Rahul J. applied for Skyline Apartment</p>
                    <span className="text-[10px] text-gray-400 block mt-1.5 uppercase tracking-wider">2 hours ago</span>
                  </div>
                </div>
                <div className="flex gap-4 border-l-2 border-gray-100 pl-4 pb-2 relative">
                  <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1 ring-4 ring-white" />
                  <div>
                    <p className="text-slate-800 font-bold">Rent Received</p>
                    <p className="text-xs text-gray-500 mt-1">Received ₹25,000 from Sneha P.</p>
                    <span className="text-[10px] text-gray-400 block mt-1.5 uppercase tracking-wider">Yesterday</span>
                  </div>
                </div>
                <div className="flex gap-4 pl-4 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[5px] top-1 ring-4 ring-white" />
                  <div>
                    <p className="text-slate-800 font-bold">Listing Approved</p>
                    <p className="text-xs text-gray-500 mt-1">Green Valley Villa is now live</p>
                    <span className="text-[10px] text-gray-400 block mt-1.5 uppercase tracking-wider">3 days ago</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
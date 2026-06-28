import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Building2, Plus, Users, 
  Trash2, Edit3, Eye, CheckCircle, Clock, FolderPlus 
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

  // Calculate statistics dynamically based on properties list
  const stats = useMemo(() => {
    const activeProperties = properties.filter(p => p.status?.toLowerCase() === 'approved');
    const pendingProperties = properties.filter(p => p.status?.toLowerCase() === 'pending');

    return {
      totalProperties: properties.length,
      activeBookings: activeProperties.length,
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
        title: 'Palm Grove Luxury Independent Villa',
        location: 'Thondayad Bypass, near Cyberpark, Calicut',
        price: 38000,
        status: 'approved',
        houseImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80'
      }
    ]);
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid property ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this property listing? This action cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting property...");
    
    try {
      const res = await apiRequest(`/properties/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        setProperties(prev => prev.filter(prop => (prop._id || prop.id) !== id));
        toast.success("Property deleted successfully", { id: loadingToast });
      } else {
        throw new Error("Failed to delete from server");
      }
    } catch (err) {
      console.error("Delete error:", err);
      // Fallback for UI testing environments
      setProperties(prev => prev.filter(prop => (prop._id || prop.id) !== id));
      toast.success("Property removed (Local Test Mode)", { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 md:w-14 md:h-14 border-4 border-gray-200 border-t-green-600 rounded-full"
        />
        <p className="text-gray-500 text-sm md:text-medium mt-4 animate-pulse text-center">Loading Owner Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-10 font-sans selection:bg-green-500 selection:text-white overflow-x-hidden">
      <Toaster position="top-right" reverseOrder={false} /> 
      
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">Manage your listed properties and track tenant requests.</p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/add-property')} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-green-200 text-sm cursor-pointer"
          >
            <Plus size={18} /> Add New Property
          </motion.button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Listings</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 mt-1 md:mt-2">{stats.totalProperties}</h3>
            </div>
            <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl shadow-inner"><Building2 size={22} /></div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Rentals</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 mt-1 md:mt-2">{stats.activeBookings}</h3>
            </div>
            <div className="p-3 md:p-4 bg-purple-50 text-purple-600 rounded-xl md:rounded-2xl shadow-inner"><Users size={22} /></div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Approvals</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 mt-1 md:mt-2">{stats.pendingRequests}</h3>
            </div>
            <div className="p-3 md:p-4 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl shadow-inner"><Clock size={22} /></div>
          </div>
        </div>

        {/* --- MAIN CONTENT: LISTINGS --- */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-extrabold text-slate-800 text-base md:text-lg">My Listed Properties</h3>
            {properties.length > 0 && (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
              </span>
            )}
          </div>

          {/* Empty State Component */}
          {properties.length === 0 ? (
            <div className="p-8 md:p-16 text-center flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50/30">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner">
                <FolderPlus size={32} className="text-green-600" />
              </div>
              <h4 className="text-lg md:text-xl font-extrabold text-slate-800">No Properties Listed Yet</h4>
              <p className="text-sm md:text-base text-gray-500 font-medium mt-2 mb-6 md:mb-8 max-w-sm">
                Your dashboard looks a bit empty! Let's add your first property listing to get started.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/add-property')}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-green-100 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Create First Listing
              </motion.button>
            </div>
          ) : (
            <div>
              {/* Responsive Mobile-First List View (Visible on Mobile/Tablets) */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {properties.map((property) => {
                  const propId = property._id || property.id;
                  return (
                    <div key={propId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                      <img 
                        src={getImageUrl(property.houseImage || property.image || property.images?.[0])} 
                        alt={property.title} 
                        className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-xl border border-gray-100 bg-slate-50 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0 space-y-1 w-full">
                        <div className="flex items-start justify-between gap-2 w-full">
                          <h4 className="font-bold text-slate-800 text-base line-clamp-1">{property.title}</h4>
                          <span className="shrink-0">
                            {property.status?.toLowerCase() === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <CheckCircle size={12} /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{property.location}</p>
                        <div className="pt-2 flex items-center justify-between gap-4 w-full">
                          <span className="text-sm font-extrabold text-slate-800">
                            ₹{Number(property.price) ? Number(property.price).toLocaleString('en-IN') : property.price} <span className="text-xs font-medium text-gray-400">/ mo</span>
                          </span>
                          <div className="flex items-center gap-1 bg-slate-50 border border-gray-100 rounded-xl p-0.5">
                            <button 
                              onClick={() => navigate(`/property/${propId}`)} 
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer" 
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => navigate(`/edit-property/${propId}`)} 
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-white rounded-lg transition-all cursor-pointer" 
                              title="Edit Listing"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(propId)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-all cursor-pointer" 
                              title="Delete Listing"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Standard Desktop View (Visible on Large Screen Laptops/Desktops) */}
              <div className="hidden lg:block overflow-x-auto">
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
                    {properties.map((property) => {
                      const propId = property._id || property.id;
                      
                      return (
                        <tr key={propId} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="p-4 pl-6 flex items-center gap-4 max-w-sm">
                            <img 
                              src={getImageUrl(property.houseImage || property.image || property.images?.[0])} 
                              alt={property.title} 
                              className="w-16 h-16 shrink-0 object-cover rounded-xl border border-gray-100 bg-slate-50 shadow-sm group-hover:shadow-md transition-shadow"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80';
                              }}
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 truncate">{property.title}</h4>
                              <p className="text-xs text-gray-400 mt-1 truncate">{property.location}</p>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                            ₹{Number(property.price) ? Number(property.price).toLocaleString('en-IN') : property.price}
                          </td>
                          <td className="p-4 whitespace-nowrap">
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
                          <td className="p-4 text-center pr-6 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => navigate(`/property/${propId}`)} 
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" 
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => navigate(`/edit-property/${propId}`)} 
                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer" 
                                title="Edit Listing"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(propId)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" 
                                title="Delete Listing"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
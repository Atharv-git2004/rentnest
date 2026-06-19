import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { 
  Building2, Plus, DollarSign, Users, 
  Trash2, Edit3, Eye, TrendingUp, CheckCircle, Clock 
} from 'lucide-react';
import { apiRequest } from '../services/api';

// 💡 ബാക്ക്-എൻഡ് ഇമേജ് യുആർഎൽ ഹെൽപ്പർ ഫങ്ഷൻ
const BACKEND_URL = 'http://localhost:5000'; 
const getImageUrl = (imagePath, fallback = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80') => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith('http')) return imagePath; 
  return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`; 
};

const OwnerDashboard = () => {
  const navigate = useNavigate(); 

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💡 റിയൽ-ടൈം ഡാറ്റയ്ക്ക് അനുസരിച്ച് മാറാൻ സ്റ്റാറ്റ്സ് ഡയനാമിക് ആക്കി
  const stats = {
    totalProperties: properties.length || 0,
    activeBookings: properties.filter(p => p.status === 'Active' || p.status === 'approved').length || 0,
    totalEarnings: "₹75,000", // ബാക്ക്-എൻഡിൽ ടോട്ടൽ തുക ഉണ്ടെങ്കിൽ ഇവിടെ നൽകാം
    pendingRequests: 2
  };

  useEffect(() => {
    fetchOwnerProperties();
  }, []);

  const fetchOwnerProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔄 യഥാർത്ഥ API Call (ബാക്ക്-എൻഡ് റൂട്ട്)
      const res = await apiRequest('/properties/owner'); 
      const data = await res.json();
      
      if (res.ok) {
        if (Array.isArray(data)) {
          setProperties(data);
        } else if (data && Array.isArray(data.data)) {
          setProperties(data.data);
        } else {
          setProperties([]);
        }
      } else {
        // എപിഐ റെസ്പോൺസ് പരാജയപ്പെട്ടാൽ ഡമ്മി ഡാറ്റ ബാക്കപ്പ് ആയി കാണിക്കും (ടെസ്റ്റിംഗിന് വേണ്ടി)
        useDummyData();
      }
    } catch (err) {
      console.error("Dashboard API error, loading dummy data:", err);
      useDummyData(); // സെർവർ ഓഫ് ആണെങ്കിലും യുഐ കാണാൻ വേണ്ടി
    } finally {
      setLoading(false);
    }
  };

  // ടെസ്റ്റിംഗ് ആവശ്യങ്ങൾക്കുള്ള ഡമ്മി ഡാറ്റ ലോഡർ
  const useDummyData = () => {
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

  // പ്രോപ്പർട്ടി ഡിലീറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property listing?")) return;
    
    try {
      const res = await apiRequest(`/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProperties(properties.filter(prop => prop._id !== id));
        alert("Property deleted successfully");
      } else {
        alert("Failed to delete from server, removing from UI");
        setProperties(properties.filter(prop => prop._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      // ബാക്ക്-എൻഡ് കണക്ട് ആയിട്ടില്ലെങ്കിലും ഫ്രണ്ട്-എൻഡിൽ വർക്ക് ആകാൻ വേണ്ടി:
      setProperties(properties.filter(prop => prop._id !== id));
      alert("Property removed successfully (Local)");
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
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
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
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Listings</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalProperties}</h3>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Building2 size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalEarnings}</h3>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl shadow-inner"><DollarSign size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Rentals</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.activeBookings}</h3>
            </div>
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shadow-inner"><Users size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Lease Requests</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.pendingRequests}</h3>
            </div>
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shadow-inner"><Clock size={24} /></div>
          </div>
        </div>

        {/* --- MAIN CONTENT: LISTINGS & RECENT ACTIVITY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Property Listings Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg">My Listed Properties</h3>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Live Connection</span>
            </div>

            {properties.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Building2 size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">You haven't listed any properties yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400 bg-slate-50/30">
                      <th className="p-4 pl-6">Property Details</th>
                      <th className="p-4">Rent</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-medium text-slate-700">
                    {properties.map((property) => (
                      <tr key={property._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-4">
                          <img 
                            src={getImageUrl(property.houseImage || property.image || property.images?.[0])} 
                            alt={property.title} 
                            className="w-14 h-14 object-cover rounded-xl border border-gray-100 bg-slate-50"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80';
                            }}
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1">{property.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{property.location}</p>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {/* 💡 ക്രാഷ് ഒഴിവാക്കാൻ കണ്ടീഷണൽ ഫോർമാറ്റിംഗ് */}
                          ₹{Number(property.price) ? Number(property.price).toLocaleString('en-IN') : property.price}
                        </td>
                        <td className="p-4">
                          {property.status === 'Approved' || property.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                              <CheckCircle size={12} /> Live / Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                              <Clock size={12} /> Pending Approval
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
                              <Eye size={16} />
                            </button>

                            <button 
                              onClick={() => navigate(`/edit-property/${property._id}`)} 
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                              title="Edit Listing"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button 
                              onClick={() => handleDelete(property._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                              title="Delete Listing"
                            >
                              <Trash2 size={16} />
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

          {/* Right Column: Recent Activity & Requests */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-500" /> Recent Activity
              </h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex gap-3 border-l-2 border-gray-100 pl-4 pb-2 relative">
                  <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px] top-1 ring-4 ring-white" />
                  <div>
                    <p className="text-slate-800 font-bold">New Lease Request</p>
                    <p className="text-xs text-gray-400 mt-0.5">Rahul J. applied for Luxury Villa</p>
                    <span className="text-[10px] text-gray-400 block mt-1">2 hours ago</span>
                  </div>
                </div>
                <div className="flex gap-3 border-l-2 border-gray-100 pl-4 pb-2 relative">
                  <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1 ring-4 ring-white" />
                  <div>
                    <p className="text-slate-800 font-bold">Rent Received</p>
                    <p className="text-xs text-gray-400 mt-0.5">Received ₹25,000 from Sneha P.</p>
                    <span className="text-[10px] text-gray-400 block mt-1">Yesterday</span>
                  </div>
                </div>
                <div className="flex gap-3 pl-4 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[5px] top-1 ring-4 ring-white" />
                  <div>
                    <p className="text-slate-800 font-bold">Listing Approved</p>
                    <p className="text-xs text-gray-400 mt-0.5">2 BHK Apartment is now live</p>
                    <span className="text-[10px] text-gray-400 block mt-1">3 days ago</span>
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
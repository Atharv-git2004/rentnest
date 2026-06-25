import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Trash2, CheckCircle, XCircle, Search, 
  MapPin, User, AlertCircle, Eye, X, Sparkles, Home 
} from 'lucide-react';
import { apiRequest } from '../../services/api'; 

const BACKEND_URL = 'http://localhost:5000'; 

const getImageUrl = (imagePath, fallback = 'https://placehold.co/150?text=No+Image') => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith('http')) return imagePath; 
  return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`; 
};

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // 💡 Safe API Response Parser (To prevent unexpected token '<' crash)
  const parseResponse = async (res) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    await res.text(); 
    return { 
      message: res.status === 404 
        ? "API Endpoint not found (404)." 
        : `Server returned an error (${res.status}).`
    };
  };

  // 1. പ്രോപ്പർട്ടികൾ ഫെച്ച് ചെയ്യാനുള്ള ഫങ്ഷൻ (Optimized with useCallback)
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // 💡 അഡ്മിൻ പെൻഡിങ് റിക്വസ്റ്റുകൾ കാണാനുള്ള കൃത്യമായ എപിഐ റൂട്ട്
      const res = await apiRequest('/properties/admin/pending'); 
      const data = await parseResponse(res);

      if (res.ok) {
        if (Array.isArray(data)) {
          setProperties(data);
        } else if (data && Array.isArray(data.data)) {
          setProperties(data.data);
        } else if (data && Array.isArray(data.properties)) {
          setProperties(data.properties);
        } else {
          setProperties([]); 
          console.error('Unexpected API response structure:', data);
        }
      } else {
        setError(data.message || 'Failed to fetch pending properties');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // 2. പ്രോപ്പർട്ടി അപ്രൂവ് ചെയ്യാനോ വെരിഫൈ ചെയ്യാനോ ഉള്ള ഫങ്ഷൻ
  const handleVerifyToggle = async (id, currentStatus) => {
    const action = currentStatus === 'Approved' || currentStatus === 'approved' ? 'rejected' : 'approved';
    
    if (!window.confirm(`Are you sure you want to mark this property as ${action}?`)) return;

    try {
      // 💡 വെരിഫൈ ചെയ്യാനുള്ള റൂട്ട്
      const res = await apiRequest(`/properties/admin/verify/${id}`, {
        method: 'PUT',
        body: { action }, 
      });
      
      const data = await parseResponse(res);

      if (res.ok) {
        const updatedStatus = action === 'approved' ? 'Approved' : 'Pending';
        
        setProperties((prevProps) =>
          prevProps.map((prop) =>
            prop._id === id ? { ...prop, status: updatedStatus } : prop
          )
        );
        
        if (selectedProperty && selectedProperty._id === id) {
          setSelectedProperty(prev => ({ ...prev, status: updatedStatus }));
        }
        
        alert(`Property status updated to ${updatedStatus}!`);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating property status:', err);
      alert('Something went wrong');
    }
  };

  // 3. പ്രോപ്പർട്ടി ഡിലീറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;

    try {
      const res = await apiRequest(`/admin/properties/${id}`, {
        method: 'DELETE',
      });
      
      const data = await parseResponse(res);

      if (res.ok) {
        setProperties((prevProps) => prevProps.filter((prop) => prop._id !== id));
        if (selectedProperty?._id === id) setSelectedProperty(null);
        alert('Property deleted successfully.');
      } else {
        alert(data.message || 'Failed to delete property');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('Something went wrong');
    }
  };

  const filteredProperties = properties.filter(
    (prop) =>
      prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen selection:bg-green-500 selection:text-white">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Building2 className="text-green-600" size={28} />
            Manage Properties
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Approve, reject, or remove properties listed on the platform.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm font-semibold text-slate-700"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Property Details</th>
                  <th className="px-6 py-4">Owner Info</th>
                  <th className="px-6 py-4">Price / Rent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <tr key={property._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Property Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(property.houseImage || property.images?.[0])}
                            alt={property.title}
                            className="w-14 h-14 object-cover rounded-xl border border-gray-100 bg-slate-50"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/150?text=No+Image';
                            }}
                          />
                          <div className="flex flex-col gap-0.5 max-w-xs md:max-w-md">
                            <span className="font-bold text-slate-800 text-base line-clamp-1">{property.title}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                              <MapPin size={12} /> {property.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner Information */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 font-medium text-slate-700">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <User size={14} className="text-gray-400" /> 
                            {property.ownerName || property.owner?.name || 'Unknown Owner'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {property.ownerEmail || property.owner?.email || 'No email'}
                          </span>
                        </div>
                      </td>

                      {/* Price / Rent Details */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 flex items-center gap-0.5 text-base">
                          ₹{property.price?.toLocaleString('en-IN') || property.price}
                          <span className="text-xs text-gray-400 font-medium"> / month</span>
                        </span>
                      </td>

                      {/* Verification Status Badge */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleVerifyToggle(property._id, property.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            property.status === 'Approved' || property.status === 'approved'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {property.status === 'Approved' || property.status === 'approved' ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span className="capitalize">{property.status || 'Pending'}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(property)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            title="View Full Details & Rooms"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(property._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Property"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                      No pending properties found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* DETAILED PROPERTY REVIEW MODAL */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-gray-100 p-6 md:p-8 space-y-6 scrollbar-thin"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md uppercase tracking-wider">
                    {selectedProperty.type || 'Apartment'}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 mt-1.5 leading-snug">{selectedProperty.title}</h3>
                  <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin size={13} /> {selectedProperty.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 text-gray-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Image & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 rounded-2xl overflow-hidden border border-gray-100 h-48 bg-slate-50">
                  <img
                    src={getImageUrl(selectedProperty.houseImage || selectedProperty.images?.[0], 'https://placehold.co/600x400?text=No+Image')}
                    alt="Main Cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-between border border-gray-100/50">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Monthly Rent</span>
                    <p className="text-2xl font-black text-slate-800">₹{selectedProperty.price}</p>
                  </div>
                  <div className="text-xs font-bold text-slate-600 space-y-1.5 pt-4 border-t border-gray-200/60">
                    <div>🛏️ {selectedProperty.bedrooms || selectedProperty.bhk || 0} BHK / Beds</div>
                    <div>🛁 {selectedProperty.bathrooms || 0} Bathrooms</div>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-green-600" /> Amenities Provided
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.amenities.map((amenity, idx) => (
                      <span key={idx} className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-200/20">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Wise Highlights */}
              <div>
                <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                  <Home size={16} className="text-green-600" /> Room Wise Media & Highlights
                </h4>
                {selectedProperty.rooms && selectedProperty.rooms.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProperty.rooms.map((room, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-4 p-3 bg-slate-50 rounded-2xl border border-gray-100">
                        {room.imageUrl && (
                          <img
                            src={getImageUrl(room.imageUrl)}
                            alt={room.roomType}
                            className="w-full sm:w-28 h-20 object-cover rounded-xl bg-white border border-gray-200/60 flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/150?text=No+Image';
                            }}
                          />
                        )}
                        <div className="flex flex-col justify-center">
                          <span className="font-bold text-slate-800 text-sm">{room.roomType}</span>
                          <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">{room.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400 bg-slate-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                    No specific room data provided for this property.
                  </p>
                )}
              </div>

              {/* Overall Description */}
              {selectedProperty.description && (
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-black text-slate-800 mb-1">Overall Description</h4>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">{selectedProperty.description}</p>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleVerifyToggle(selectedProperty._id, selectedProperty.status)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm text-white ${
                    selectedProperty.status === 'Approved' || selectedProperty.status === 'approved'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selectedProperty.status === 'Approved' || selectedProperty.status === 'approved' 
                    ? 'Mark as Pending (Reject)' 
                    : 'Approve & Verify Property'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManageProperties;
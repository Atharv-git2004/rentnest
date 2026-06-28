import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, IndianRupee, Home, Info, ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

// 💡 Importing your custom api wrapper here
import { apiRequest } from '../services/api';

const EditProperty = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    type: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        // Fetch data using api.js (it automatically handles tokens)
        const response = await apiRequest(`properties/${id}`, {
          method: 'GET'
        });

        const data = await response.json();
        console.log("🔥 Backend Response:", data); // For debugging

        if (response.ok) {
          const propertyData = data.property || data.data || data;

          if (propertyData && propertyData.title) {
            setFormData({
              title: propertyData.title || '',
              location: propertyData.location || '',
              price: propertyData.price || '',
              type: propertyData.type || 'Apartment',
              bedrooms: propertyData.bedrooms || '',
              bathrooms: propertyData.bathrooms || '',
              description: propertyData.description || '',
            });
          } else {
            toast.error("Property data format is incorrect.");
          }
        } else {
          toast.error(data.message || 'Failed to load property details');
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error('Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await apiRequest(`properties/${id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Property updated successfully!');
        navigate(-1); 
      } else {
        toast.error(data.message || 'Failed to update property.');
      }
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error('Something went wrong while updating.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center w-full">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 sm:p-2.5 mt-0.5 sm:mt-0 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 cursor-pointer shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 truncate">Edit Property</h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate mt-0.5">Update the details of your listing (ID: {id})</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8 w-full"
      >
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          
          {/* Title Field */}
          <div className="w-full">
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">
              <Building2 size={16} className="text-green-600 shrink-0" /> Property Title
            </label>
            <input
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full">
            
            {/* Location Field */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">
                <MapPin size={16} className="text-green-600 shrink-0" /> Location
              </label>
              <input
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                required
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold"
              />
            </div>

            {/* Price Field */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">
                <IndianRupee size={16} className="text-green-600 shrink-0" /> Rent Price (₹ / Month)
              </label>
              <input
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold"
              />
            </div>

            {/* Property Type Dropdown */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">
                <Home size={16} className="text-green-600 shrink-0" /> Property Type
              </label>
              <div className="relative w-full">
                <select
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold appearance-none"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Studio">Studio</option>
                </select>
                {/* Custom Chevron for select */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Bedrooms and Bathrooms Split */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">Bedrooms</label>
                <input
                  type="number" 
                  name="bedrooms" 
                  value={formData.bedrooms} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold"
                />
              </div>
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">Bathrooms</label>
                <input
                  type="number" 
                  name="bathrooms" 
                  value={formData.bathrooms} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="w-full">
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2 ml-1">
              <Info size={16} className="text-green-600 shrink-0" /> Property Description
            </label>
            <textarea
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="4" 
              required
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm sm:text-base text-slate-800 font-semibold resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-gray-100 w-full">
            <button
              type="button" 
              onClick={() => navigate(-1)} 
              disabled={isUpdating}
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3 rounded-xl text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} /> Cancel
            </button>
            <motion.button
              whileHover={{ scale: isUpdating ? 1 : 1.02 }}
              whileTap={{ scale: isUpdating ? 1 : 0.98 }}
              type="submit" 
              disabled={isUpdating}
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm sm:text-base font-bold shadow-md shadow-green-600/20 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Save size={18} /> {isUpdating ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default EditProperty;
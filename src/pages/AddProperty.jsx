import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Building2, MapPin, IndianRupee, Home, Info, 
  ArrowLeft, PlusCircle, X, Image as ImageIcon, Trash2, Plus, Sparkles, AlertCircle 
} from 'lucide-react';
import { apiRequest } from '../services/api';

const AddProperty = () => {
  const navigate = useNavigate();

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Main form data state
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    type: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    description: '',
    houseImage: '', 
    amenities: [], 
  });

  // Dynamic array state to capture room-specific details (images, descriptions)
  const [roomDetails, setRoomDetails] = useState([
    { roomType: 'Living Room', imageUrl: '', description: '' }
  ]);

  // List of universally available amenities
  const availableAmenities = ['WiFi', 'Car Parking', 'Kitchen Cabinets', 'AC', 'Power Backup', '24/7 Water', 'CCTV Security'];

  // Handle standard input fields and selection state changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle specific amenity checkbox options
  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: current };
    });
  };

  // Append a brand new room section block dynamically
  const addRoomSection = () => {
    setRoomDetails([...roomDetails, { roomType: 'Bedroom', imageUrl: '', description: '' }]);
  };

  // Remove a designated room section block by its index
  const removeRoomSection = (index) => {
    const updatedRooms = roomDetails.filter((_, i) => i !== index);
    setRoomDetails(updatedRooms);
  };

  // Synchronize inline room-specific field input updates
  const handleRoomFieldChange = (index, field, value) => {
    const updatedRooms = [...roomDetails];
    updatedRooms[index][field] = value;
    setRoomDetails(updatedRooms);
  };

  // Form submit handler parsing fields and posting data securely via API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); 
    
    const loadingToast = toast.loading('Adding property listing...');
    
    // Explicitly cast numeric string values to numbers for strict backend schema validation
    const finalPropertyData = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      rooms: roomDetails 
    };

    try {
      // Submit mapped property payload asynchronously to backend API endpoint
      const res = await apiRequest('/properties', {
        method: 'POST',
        body: JSON.stringify(finalPropertyData),
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success('Property added successfully! Waiting for Admin Approval.', { id: loadingToast });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Isolate Mongoose validation schema error mapping gracefully
        let errorMessage = 'Failed to add property listing';
        if (data.errors) {
          errorMessage = Object.values(data.errors).map(err => err.message).join(', ');
        } else if (data.message || data.error) {
          errorMessage = data.message || data.error;
        }
        setError(errorMessage);
        toast.error('Validation failed. Please check the details.', { id: loadingToast });
      }
    } catch (err) {
      console.error('Error adding property:', err);
      setError('Server connection failed. Please try again.');
      toast.error('Server connection failed.', { id: loadingToast });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 min-h-screen selection:bg-green-500 selection:text-white w-full overflow-x-hidden">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8 border-b border-gray-100 pb-5">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-sm w-fit active:scale-95"
          disabled={loading}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Add Detailed Property</h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">Fill in details along with specific room images & attributes.</p>
        </div>
      </div>

      {/* ERROR ALERT BANNER */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 shadow-sm animate-fadeIn">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> 
          <div>{error}</div>
        </div>
      )}

      {/* MAIN FORM */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-5">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 size={18} className="text-green-600 shrink-0" /> Basic Information
            </h3>
            
            <div className="space-y-5">
              {/* House Main Image Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  House Main Image (URL)
                </label>
                <input
                  type="url" 
                  name="houseImage" 
                  value={formData.houseImage} 
                  onChange={handleChange} 
                  required
                  disabled={loading}
                  className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 disabled:opacity-50 text-sm"
                  placeholder="https://example.com/house-cover.jpg"
                />
                
                {/* House Image Preview Container */}
                {formData.houseImage && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 bg-slate-50 max-w-full sm:max-w-md shadow-sm aspect-video">
                    <img 
                      src={formData.houseImage} 
                      alt="Main House Cover Preview" 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL"; 
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Property Title</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange} required
                  disabled={loading}
                  className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 disabled:opacity-50 text-sm"
                  placeholder="e.g. Fully Furnished 3 BHK Luxury Apartment"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Location / Address</label>
                  <input
                    type="text" name="location" value={formData.location} onChange={handleChange} required
                    disabled={loading}
                    className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 disabled:opacity-50 text-sm"
                    placeholder="e.g. Kakkanad, Kochi"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rent Price (₹ / Month)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number" name="price" value={formData.price} onChange={handleChange} required
                      disabled={loading}
                      className="w-full bg-slate-50/50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 disabled:opacity-50 text-sm"
                      placeholder="18000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Property Type</label>
                  <select
                    name="type" value={formData.type} onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-bold text-slate-800 disabled:opacity-50 text-sm cursor-pointer"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Beds</label>
                    <input
                      type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required
                      disabled={loading}
                      className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 disabled:opacity-50 text-sm"
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Baths</label>
                    <input
                      type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required
                      disabled={loading}
                      className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 disabled:opacity-50 text-sm"
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Amenities */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sparkles size={18} className="text-green-600 shrink-0" /> Amenities Available
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <label 
                  key={amenity} 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-98 ${
                    formData.amenities.includes(amenity)
                      ? 'bg-green-50 border-green-200 text-green-700 font-bold'
                      : 'bg-slate-50/50 border-gray-100 text-slate-600 font-semibold hover:bg-slate-50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    disabled={loading}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.amenities.includes(amenity) ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 bg-white'}`}>
                    {formData.amenities.includes(amenity) && <span className="text-[10px]">✓</span>}
                  </div>
                  <span className="text-sm tracking-tight">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Room Wise Images & Description */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <ImageIcon size={18} className="text-green-600 shrink-0" /> Room Media & Highlights
              </h3>
              <button
                type="button"
                onClick={addRoomSection}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 px-4 py-2.5 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 w-full sm:w-auto active:scale-95"
              >
                <Plus size={14} /> Add Room
              </button>
            </div>

            <div className="space-y-4">
              {roomDetails.map((room, index) => (
                <div key={index} className="p-4 bg-slate-50/70 rounded-2xl border border-gray-100 relative space-y-4 shadow-inner">
                  {roomDetails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoomSection(index)}
                      disabled={loading}
                      className="absolute right-3 top-3 p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100 disabled:opacity-50 z-10 active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Room Type</label>
                      <select
                        value={room.roomType}
                        onChange={(e) => handleRoomFieldChange(index, 'roomType', e.target.value)}
                        disabled={loading}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="Living Room">Living Room</option>
                        <option value="Master Bedroom">Master Bedroom</option>
                        <option value="Kids Bedroom">Kids Bedroom</option>
                        <option value="Modular Kitchen">Modular Kitchen</option>
                        <option value="Attached Bathroom">Attached Bathroom</option>
                        <option value="Balcony/Verandah">Balcony/Verandah</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Room Image Link / URL</label>
                      <input
                        type="url"
                        value={room.imageUrl}
                        onChange={(e) => handleRoomFieldChange(index, 'imageUrl', e.target.value)}
                        placeholder="https://example.com/kitchen.jpg"
                        required
                        disabled={loading}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Room Image Preview Container */}
                  {room.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm w-full sm:max-w-xs aspect-video">
                      <img 
                        src={room.imageUrl} 
                        alt={`${room.roomType} Preview`} 
                        className="w-full h-full object-cover object-center"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = "https://placehold.co/400x300?text=Invalid+Room+URL"; 
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">What makes this room special? (Description)</label>
                    <input
                      type="text"
                      value={room.description}
                      onChange={(e) => handleRoomFieldChange(index, 'description', e.target.value)}
                      placeholder="e.g. Spacious with modular setup, chimney, and large windows."
                      required
                      disabled={loading}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: General Description */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Info size={18} className="text-green-600 shrink-0" /> Overall Description
            </h3>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows="4" required
              disabled={loading}
              className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-semibold text-slate-800 resize-none disabled:opacity-50 text-sm"
              placeholder="Tell us about the neighborhood, nearby landmarks (like Metro station, Infopark), rules etc..."
            ></textarea>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button" 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 w-full sm:w-auto active:scale-95"
              disabled={loading}
            >
              <X size={18} /> Cancel
            </button>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              type="submit"
              disabled={loading} 
              className={`flex items-center justify-center gap-1.5 px-6 py-3 text-white rounded-xl font-bold shadow-md transition-colors w-full sm:w-auto ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              <PlusCircle size={18} /> {loading ? 'Adding Listing...' : 'Add Listing'}
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default AddProperty;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, IndianRupee, Home, Info, 
  ArrowLeft, PlusCircle, X, Image as ImageIcon, Trash2, Plus, Sparkles, AlertCircle 
} from 'lucide-react';
import { apiRequest } from '../services/api';

const AddProperty = () => {
  const navigate = useNavigate();

  // 🔄 ലോഡിങ്, എറർ സ്റ്റേറ്റുകൾ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // മെയിൻ ഫോം സ്റ്റേറ്റ്
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

  // ഓരോ റൂമിന്റെയും ഇമേജും വിവരണവും സൂക്ഷിക്കാനുള്ള സ്റ്റേറ്റ് (Dynamic Array)
  const [roomDetails, setRoomDetails] = useState([
    { roomType: 'Living Room', imageUrl: '', description: '' }
  ]);

  // ലഭ്യമായ ആകെ അമെനിറ്റീസ് ലിസ്റ്റ്
  const availableAmenities = ['WiFi', 'Car Parking', 'Kitchen Cabinets', 'AC', 'Power Backup', '24/7 Water', 'CCTV Security'];

  // നോർമൽ ഇൻപുട്ടുകൾ മാറാൻ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // അമെനിറ്റീസ് ചെックബോക്സ് മാറ്റാൻ
  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: current };
    });
  };

  // പുതിയൊരു റൂം സെക്ഷൻ കൂടി ഫോമിലേക്ക് കൂട്ടിച്ചേർക്കാൻ
  const addRoomSection = () => {
    setRoomDetails([...roomDetails, { roomType: 'Bedroom', imageUrl: '', description: '' }]);
  };

  // ചേർത്ത റൂം സെക്ഷൻ ഡിലീറ്റ് ചെയ്യാൻ
  const removeRoomSection = (index) => {
    const updatedRooms = roomDetails.filter((_, i) => i !== index);
    setRoomDetails(updatedRooms);
  };

  // റൂം സെക്ഷനിലെ വിവരങ്ങൾ ടൈപ്പ് ചെയ്യുമ്പോൾ അപ്ഡേറ്റ് ചെയ്യാൻ
  const handleRoomFieldChange = (index, field, value) => {
    const updatedRooms = [...roomDetails];
    updatedRooms[index][field] = value;
    setRoomDetails(updatedRooms);
  };

  // ഫോം സബ്മിറ്റ് ചെയ്യുമ്പോൾ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); 
    
    // 💡 നമ്പർ വാല്യൂസ് കൃത്യമായി ടൈപ്പ് കാസ്റ്റ് ചെയ്യുന്നു
    const finalPropertyData = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      rooms: roomDetails 
    };

    try {
      // 🔄 ബാക്ക്-എൻഡിലേക്ക് പ്രോപ്പർട്ടി ഡാറ്റ പോസ്റ്റ് ചെയ്യുന്നു
      const res = await apiRequest('/properties', {
        method: 'POST',
        body: JSON.stringify(finalPropertyData),
      });
      
      const data = await res.json();

      if (res.ok) {
        alert('Property with detailed room info added successfully! Waiting for Admin Approval.');
        navigate('/dashboard'); 
      } else {
        // 💡 ബാക്ക്-എൻഡ് വാലിഡേഷൻ എററുകൾ (Mongoose errors) കൃത്യമായി വേർതിരിച്ചെടുക്കുന്നു
        if (data.errors) {
          const validationErrors = Object.values(data.errors).map(err => err.message).join(', ');
          setError(validationErrors);
        } else {
          setError(data.message || data.error || 'Failed to add property listing');
        }
      }
    } catch (err) {
      console.error('Error adding property:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen selection:bg-green-500 selection:text-white">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-sm"
          disabled={loading}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Add Detailed Property</h1>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">Fill in the details along with specific room images & features.</p>
        </div>
      </div>

      {/* 🔄 ERROR ALERT BANNER */}
      {error && (
        <div className="mb-6 flex items-start gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> 
          <div>{error}</div>
        </div>
      )}

      {/* MAIN FORM */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Building2 size={18} className="text-green-600" /> Basic Information
            </h3>
            <div className="space-y-5">
              
              {/* House Main Image Field */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  House Main Image (URL)
                </label>
                <input
                  type="url" 
                  name="houseImage" 
                  value={formData.houseImage} 
                  onChange={handleChange} 
                  required
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                  placeholder="https://example.com/house-cover.jpg"
                />
                
                {/* House Image Preview Container */}
                {formData.houseImage && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-50 max-w-md shadow-inner">
                    <img 
                      src={formData.houseImage} 
                      alt="Main House Preview" 
                      className="w-full h-48 object-cover object-center"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL"; 
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Property Title</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                  placeholder="e.g. Fully Furnished 3 BHK Luxury Apartment"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location / Address</label>
                  <input
                    type="text" name="location" value={formData.location} onChange={handleChange} required
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                    placeholder="e.g. Kakkanad, Kochi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rent Price (₹ / Month)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number" name="price" value={formData.price} onChange={handleChange} required
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                      placeholder="18000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Property Type</label>
                  <select
                    name="type" value={formData.type} onChange={handleChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Beds</label>
                    <input
                      type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Baths</label>
                    <input
                      type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800"
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Amenities */}
          <div>
            <h3 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Sparkles size={18} className="text-green-600" /> Amenities Available
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <label 
                  key={amenity} 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.amenities.includes(amenity)
                      ? 'bg-green-50 border-green-200 text-green-700 font-bold'
                      : 'bg-slate-50 border-gray-100 text-slate-600 font-semibold'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.amenities.includes(amenity) ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                    {formData.amenities.includes(amenity) && <span className="text-[10px]">✓</span>}
                  </div>
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Room Wise Images & Description */}
          <div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-4">
              <h3 className="text-md font-black text-slate-800 flex items-center gap-2">
                <ImageIcon size={18} className="text-green-600" /> Room Media & Highlights
              </h3>
              <button
                type="button"
                onClick={addRoomSection}
                className="flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Plus size={14} /> Add Room
              </button>
            </div>

            <div className="space-y-4">
              {roomDetails.map((room, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-gray-100 relative space-y-4">
                  {roomDetails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoomSection(index)}
                      className="absolute right-3 top-3 p-1.5 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-colors border border-gray-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Select Room Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Room Type</label>
                      <select
                        value={room.roomType}
                        onChange={(e) => handleRoomFieldChange(index, 'roomType', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="Living Room">Living Room</option>
                        <option value="Master Bedroom">Master Bedroom</option>
                        <option value="Kids Bedroom">Kids Bedroom</option>
                        <option value="Modular Kitchen">Modular Kitchen</option>
                        <option value="Attached Bathroom">Attached Bathroom</option>
                        <option value="Balcony/Verandah">Balcony/Verandah</option>
                      </select>
                    </div>

                    {/* Image URL Link Input */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Room Image Link / URL</label>
                      <input
                        type="url"
                        value={room.imageUrl}
                        onChange={(e) => handleRoomFieldChange(index, 'imageUrl', e.target.value)}
                        placeholder="https://example.com/kitchen.jpg"
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Room Image Preview Container */}
                  {room.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm w-full sm:w-64">
                      <img 
                        src={room.imageUrl} 
                        alt={`${room.roomType} Preview`} 
                        className="w-full h-36 object-cover object-center"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = "https://placehold.co/400x300?text=Invalid+Room+URL"; 
                        }}
                      />
                    </div>
                  )}

                  {/* Room Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">What makes this room special? (Description)</label>
                    <input
                      type="text"
                      value={room.description}
                      onChange={(e) => handleRoomFieldChange(index, 'description', e.target.value)}
                      placeholder="e.g. Spacious with modular setup, chimney, and large windows for cross-ventilation."
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: General Description */}
          <div>
            <h3 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Info size={18} className="text-green-600" /> Overall Description
            </h3>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows="4" required
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold text-slate-800 resize-none"
              placeholder="Tell us about the neighborhood, nearby landmarks (like Metro station, Infopark), rules etc..."
            ></textarea>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X size={18} /> Cancel
            </button>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading} 
              className={`flex items-center gap-1.5 px-6 py-3 text-white rounded-xl font-bold shadow-md transition-colors ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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
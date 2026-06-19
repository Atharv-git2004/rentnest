import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, IndianRupee, Home, Info, ArrowLeft, Save, X } from 'lucide-react';

const EditProperty = () => {
  const { id } = useParams(); // URL-ൽ നിന്നുള്ള പ്രോപ്പർട്ടി ID
  const navigate = useNavigate();

  // ഫോമിലെ ഡാറ്റ സൂക്ഷിക്കാൻ
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

  // ഡമ്മി ഡാറ്റ ലോഡ് ചെയ്യുന്നു (പിന്നീട് ഇത് API വഴി ബാക്ക്-എൻഡിൽ നിന്ന് എടുക്കാം)
  useEffect(() => {
    // സിമുലേറ്റ് ചെയ്യുന്ന API കാൾ
    setTimeout(() => {
      setFormData({
        title: 'Skyline Luxury Apartment',
        location: 'Kakkanad, Kochi',
        price: '25000',
        type: 'Apartment',
        bedrooms: '3',
        bathrooms: '2',
        description: 'A beautiful luxury apartment located at the heart of IT hub with all modern amenities including pool, gym, and 24x7 security.',
      });
      setIsLoading(false);
    }, 500);
  }, [id]);

  // ഇൻപുട്ട് ഫീൽഡുകളിൽ മാറ്റം വരുത്തുമ്പോൾ സ്റ്റേറ്റ് അപ്ഡേറ്റ് ചെയ്യാൻ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ഫോം സേവ് ചെയ്യുമ്പോൾ
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Property Data:', formData);
    alert('Property Updated Successfully!');
    navigate('/dashboard'); // സേവ് ചെയ്ത ശേഷം ഡാഷ്‌ബോർഡിലേക്ക് തിരികെ പോകും
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Edit Property</h1>
          <p className="text-sm font-semibold text-gray-500">Update the details of your listing (ID: {id})</p>
        </div>
      </div>

      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Property Title */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
              <Building2 size={16} className="text-green-600" /> Property Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold"
              placeholder="e.g. Beautiful Sea-view Villa"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <MapPin size={16} className="text-green-600" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold"
              />
            </div>

            {/* Price */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <IndianRupee size={16} className="text-green-600" /> Rent Price (₹ / Month)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Home size={16} className="text-green-600" /> Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            {/* Beds & Baths Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
              <Info size={16} className="text-green-600" /> Property Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-slate-800 font-semibold resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} /> Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center gap-1.5 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              <Save size={18} /> Save Changes
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default EditProperty;
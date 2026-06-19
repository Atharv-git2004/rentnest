import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, DollarSign, BedDouble, Building, X } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import Footer from '../components/Footer';
import { apiRequest } from '../services/api';

const ExploreProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // ഫിൽട്ടർ സ്റ്റേറ്റുകൾ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100000);

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const res = await apiRequest('/properties');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setProperties(items);
          setFilteredProperties(items);
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProperties();
  }, []);

  // ഫിൽട്ടറിംഗ് ലോജിക് (Search, Type, Location, Price എന്നിവ ഒരുമിച്ച് പ്രവർത്തിക്കും)
  useEffect(() => {
    let result = properties;

    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      result = result.filter(p => p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    if (selectedType !== 'All') {
      result = result.filter(p => p.type?.toLowerCase() === selectedType.toLowerCase());
    }

    if (maxPrice) {
      result = result.filter(p => p.price <= maxPrice);
    }

    setFilteredProperties(result);
  }, [searchQuery, selectedLocation, selectedType, maxPrice, properties]);

  // ഫിൽട്ടറുകൾ എല്ലാം റീസെറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedType('All');
    setMaxPrice(100000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-green-500 selection:text-white">
      
      {/* --- HEADER SEARCH BANNER --- */}
      <div className="bg-slate-900 text-white py-12 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Explore Available Homes</h1>
            <p className="text-slate-400 font-medium mt-1">Find and filter through the best premium rental properties near you.</p>
          </div>

          {/* Search Bar & Filter Toggle Button */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search by title, neighborhood or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm md:text-base"
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md ${showFilters ? 'bg-green-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50'}`}
            >
              <SlidersHorizontal size={18} /> {showFilters ? 'Hide Filters' : 'Filters'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* --- DETAILED FILTER PANEL --- */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-sm font-semibold text-slate-700">
              
              {/* Filter 1: Property Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-wider text-xs"><Building size={14}/> Property Type</label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-slate-800"
                >
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                </select>
              </div>

              {/* Filter 2: Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-wider text-xs"><MapPin size={14}/> Location / City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kochi, Calicut"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-slate-800"
                />
              </div>

              {/* Filter 3: Max Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-500"><DollarSign size={14}/> Max Budget</span>
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="150000" 
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-green-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-4"
                />
              </div>

              {/* Reset Controls Button */}
              <div className="sm:col-span-3 flex justify-end pt-2">
                <button 
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl border border-gray-100"
                >
                  <X size={14} /> Clear All Filters
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROPERTIES GRID RESULTS --- */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Results Info */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-slate-500 font-bold text-sm md:text-base">
            Showing <span className="text-slate-800 font-black">{filteredProperties.length}</span> verified properties
          </p>
        </div>

        {/* Grid or Loader */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-14 h-14 border-4 border-gray-200 border-t-green-500 rounded-full"
            />
            <p className="text-gray-400 font-semibold animate-pulse">Searching properties...</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <motion.div 
                  layout
                  key={property._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard {...property} id={property._id} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center">
                <img 
                  src="https://illustrations.popsy.co/amber/home-office.svg" 
                  alt="No results" 
                  className="h-56 opacity-60 mb-4"
                />
                <h3 className="text-slate-800 text-xl font-bold">No matches found</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-sm">We couldn't find anything matching your exact filter setup. Try clearing some options or loosening your budget criteria.</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ExploreProperties;
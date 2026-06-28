import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, DollarSign, Building, X } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import Footer from '../components/Footer';
import { apiRequest } from '../services/api';

const ExploreProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
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

  // Filtering Logic (Synchronizes Search, Type, Location, and Price)
  useEffect(() => {
    let result = properties;

    if (searchQuery) {
      result = result.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      result = result.filter(p => p.location?.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    if (selectedType !== 'All') {
      result = result.filter(p => p.type?.toLowerCase() === selectedType.toLowerCase());
    }

    if (maxPrice) {
      result = result.filter(p => p.price <= maxPrice);
    }

    setFilteredProperties(result);
  }, [searchQuery, selectedLocation, selectedType, maxPrice, properties]);

  // Function to clear/reset all filter settings
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedType('All');
    setMaxPrice(100000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-green-500 selection:text-white w-full overflow-x-hidden flex flex-col">
      
      {/* --- HEADER SEARCH BANNER --- */}
      <div className="bg-slate-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 w-full">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Explore Available Homes</h1>
            <p className="text-slate-400 font-medium text-xs sm:text-sm md:text-base mt-1.5 max-w-2xl">
              Find and filter through the best premium rental properties near you.
            </p>
          </div>

          {/* Search Bar & Filter Toggle Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-3xl w-full">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="text"
                placeholder="Search by title, neighborhood or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 text-white placeholder-slate-400 font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-inner"
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-3.5 rounded-2xl font-bold text-sm transition-all shrink-0 shadow-md ${
                showFilters 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50'
              }`}
            >
              <SlidersHorizontal size={16} /> {showFilters ? 'Hide Filters' : 'Filters'}
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
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white border-b border-gray-200 overflow-hidden shadow-sm w-full"
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-end text-sm font-semibold text-slate-700">
              
              {/* Filter 1: Property Type */}
              <div className="space-y-1.5 w-full">
                <label className="flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <Building size={14} className="text-gray-400 shrink-0"/> Property Type
                </label>
                <div className="relative w-full">
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-slate-800 cursor-pointer transition-all appearance-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Studio">Studio</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filter 2: Location */}
              <div className="space-y-1.5 w-full">
                <label className="flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <MapPin size={14} className="text-gray-400 shrink-0"/> Location / City
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Kakkanad, Kochi"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-slate-800 placeholder-gray-400 transition-all"
                />
              </div>

              {/* Filter 3: Max Price Slider */}
              <div className="space-y-1.5 w-full sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <DollarSign size={14} className="text-gray-400 shrink-0"/> Max Budget
                  </span>
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded font-black">
                    ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2">
                  <input 
                    type="range" 
                    min="5000" 
                    max="150000" 
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-green-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Reset Controls Button */}
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2 w-full">
                <button 
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-1.5 w-full sm:w-auto text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-gray-50 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-gray-100 cursor-pointer"
                >
                  <X size={14} /> Clear All Filters
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROPERTIES GRID RESULTS --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
        {/* Results Info */}
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <p className="text-slate-500 font-bold text-xs sm:text-sm md:text-base">
            Showing <span className="text-slate-800 font-black">{filteredProperties.length}</span> verified properties
          </p>
        </div>

        {/* Grid or Loader */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 sm:py-28 space-y-4 w-full">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full"
            />
            <p className="text-gray-400 font-semibold text-sm animate-pulse">Searching properties...</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full"
          >
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <motion.div 
                  layout
                  key={property._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <PropertyCard {...property} id={property._id} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-14 sm:py-20 px-4 text-center bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col items-center justify-center w-full">
                <img 
                  src="https://illustrations.popsy.co/amber/home-office.svg" 
                  alt="No results found graphic" 
                  className="h-40 sm:h-56 max-w-full opacity-60 mb-4 object-contain"
                />
                <h3 className="text-slate-800 text-lg sm:text-xl font-bold">No matches found</h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
                  We couldn't find anything matching your exact filter setup. Try clearing some options or loosening your budget criteria.
                </p>
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
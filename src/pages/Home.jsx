import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, ShieldCheck, Search, ArrowRight, Home as HomeIcon } from 'lucide-react';

import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import Footer from '../components/Footer';
import { apiRequest } from '../services/api';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await apiRequest('/properties');
        if (res.ok) {
          const data = await res.json();
          setProperties(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error("Error loading properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 w-full overflow-x-hidden flex flex-col">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full pt-28 pb-20 md:pt-36 md:pb-28 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Background Setup */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 z-0 bg-gray-900/75 md:bg-gray-900/65"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8 shadow-sm"
          >
            <HomeIcon size={14} className="shrink-0" />
            <span>Premium Real Estate</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 text-white leading-[1.15] tracking-tight"
          >
            Find Your Next <br className="hidden sm:block" /> Perfect Home
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 md:mb-12 font-medium px-2 leading-relaxed"
          >
            Explore carefully selected properties that match your lifestyle. Safe, secure, and hassle-free.
          </motion.p>

          {/* Search Bar Wrapper */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-3xl bg-white p-2 md:p-3 rounded-2xl shadow-2xl"
          >
            <SearchBar />
          </motion.div>

        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="relative z-20 w-full px-4 sm:px-6 -mt-8 md:-mt-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 flex flex-wrap justify-between items-center gap-6 md:gap-10">
          <div className="flex-1 text-center min-w-[30%] sm:min-w-0">
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">12k+</h4>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Listings</p>
          </div>
          
          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          
          <div className="flex-1 text-center min-w-[30%] sm:min-w-0">
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">99%</h4>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Happy Clients</p>
          </div>
          
          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          
          <div className="flex-1 text-center min-w-[100%] sm:min-w-0 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">25+</h4>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Cities</p>
          </div>
        </div>
      </section>

      {/* --- FEATURED PROPERTIES --- */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-grow">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-500 text-sm md:text-base flex items-center gap-1.5 font-medium">
              <MapPin size={16} className="text-blue-600 shrink-0" /> 
              <span>Handpicked residences for you.</span>
            </p>
          </div>
          
          {/* Desktop Button */}
          <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl shrink-0">
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 w-full">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm mt-5 font-semibold animate-pulse">Loading premium properties...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div key={property._id} className="w-full flex">
                  <PropertyCard {...property} id={property._id} />
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="col-span-full py-20 px-4 text-center bg-white rounded-3xl border border-gray-200 flex flex-col items-center justify-center shadow-sm w-full">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-5">
                  <Building size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-sm md:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
                  We currently have no listings available in this category. Please check back later or update your filters.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Full-width Button */}
        <button className="sm:hidden w-full mt-8 py-4 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl flex justify-center items-center gap-2 active:bg-blue-100 transition-colors border border-blue-100">
          View All Properties <ArrowRight size={16} />
        </button>
      </main>

      {/* --- WHY CHOOSE US --- */}
      <section className="w-full bg-white border-t border-gray-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Why Choose RentNest?</h2>
            <p className="text-gray-500 text-sm md:text-base mt-3 max-w-xl mx-auto font-medium">
              Experience a safe, fast, and completely transparent process from searching to moving in.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            <div className="flex flex-col items-center pt-6 md:pt-0 md:px-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-blue-100">
                <Building size={24} />
              </div>
              <h4 className="font-extrabold text-lg text-gray-900 mb-2.5">Verified Homes</h4>
              <p className="text-sm text-gray-500 px-2 leading-relaxed">
                Every single property is strictly inspected and checked for quality and authenticity before listing.
              </p>
            </div>
            
            <div className="flex flex-col items-center pt-8 md:pt-0 md:px-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-blue-100">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-extrabold text-lg text-gray-900 mb-2.5">100% Secure</h4>
              <p className="text-sm text-gray-500 px-2 leading-relaxed">
                Enjoy safe, encrypted transactions and complete legal assistance for your rental agreements.
              </p>
            </div>
            
            <div className="flex flex-col items-center pt-8 md:pt-0 md:px-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-blue-100">
                <Search size={24} />
              </div>
              <h4 className="font-extrabold text-lg text-gray-900 mb-2.5">No Hidden Fees</h4>
              <p className="text-sm text-gray-500 px-2 leading-relaxed">
                Transparent and upfront pricing with absolutely zero unexpected brokerage or hidden charges.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
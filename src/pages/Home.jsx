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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      
      {/* --- HERO SECTION (Mobile Optimized) --- */}
      <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col justify-center items-center px-4">
        {/* Background Setup */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 z-0 bg-gray-900/70 md:bg-gray-900/60"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-6">
            <HomeIcon size={14} />
            <span>Premium Real Estate</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-[1.2] tracking-tight">
            Find Your Next <br /> Perfect Home
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 md:mb-12 font-medium px-2 leading-relaxed">
            Explore carefully selected properties that match your lifestyle. Safe, secure, and hassle-free.
          </p>

          {/* Search Bar - Full width on mobile */}
          <div className="w-full max-w-3xl bg-white p-2 md:p-3 rounded-2xl shadow-xl">
            <SearchBar />
          </div>

        </div>
      </section>

      {/* --- STATS SECTION (Stacked on very small screens, row on slightly larger) --- */}
      <section className="relative z-20 w-full px-4 -mt-6 md:-mt-10 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-wrap justify-between items-center gap-6 md:gap-10">
          <div className="flex-1 text-center min-w-[100px]">
            <h4 className="text-2xl md:text-4xl font-bold text-gray-900">12k+</h4>
            <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mt-1">Listings</p>
          </div>
          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          <div className="flex-1 text-center min-w-[100px]">
            <h4 className="text-2xl md:text-4xl font-bold text-gray-900">99%</h4>
            <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mt-1">Happy Clients</p>
          </div>
          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          <div className="flex-1 text-center min-w-[100px] w-full sm:w-auto mt-4 sm:mt-0">
            <h4 className="text-2xl md:text-4xl font-bold text-gray-900">25+</h4>
            <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mt-1">Cities</p>
          </div>
        </div>
      </section>

      {/* --- FEATURED PROPERTIES --- */}
      <main className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-500 text-sm flex items-center gap-1.5">
              <MapPin size={16} className="text-blue-600 shrink-0" /> 
              <span>Handpicked residences for you.</span>
            </p>
          </div>
          
          {/* Desktop Button */}
          <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg">
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-xs md:text-sm mt-4 font-medium animate-pulse">Loading properties...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div key={property._id} className="w-full">
                  <PropertyCard {...property} id={property._id} />
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="col-span-full py-16 px-4 text-center bg-white rounded-2xl border border-gray-200 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <Building size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Properties Found</h3>
                <p className="text-sm text-gray-500 max-w-xs">We currently have no listings available. Please check back later.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Full-width Button */}
        <button className="md:hidden w-full mt-8 py-3.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl flex justify-center items-center gap-2 active:bg-blue-100 transition-colors border border-blue-100">
          View All Properties <ArrowRight size={16} />
        </button>
      </main>

      {/* --- WHY CHOOSE US (Mobile Stacked) --- */}
      <section className="w-full bg-white border-t border-gray-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose RentNest?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">Experience a safe and transparent process from search to moving in.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            
            <div className="flex flex-col items-center pt-6 sm:pt-0">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Building size={20} />
              </div>
              <h4 className="font-bold text-base text-gray-900 mb-2">Verified Homes</h4>
              <p className="text-xs md:text-sm text-gray-500 px-4">Every house is checked for quality and authenticity.</p>
            </div>
            
            <div className="flex flex-col items-center pt-8 sm:pt-0">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-base text-gray-900 mb-2">100% Secure</h4>
              <p className="text-xs md:text-sm text-gray-500 px-4">Safe transactions and complete legal assistance.</p>
            </div>
            
            <div className="flex flex-col items-center pt-8 sm:pt-0">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Search size={20} />
              </div>
              <h4 className="font-bold text-base text-gray-900 mb-2">No Hidden Fees</h4>
              <p className="text-xs md:text-sm text-gray-500 px-4">Transparent pricing with zero unexpected brokerage.</p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
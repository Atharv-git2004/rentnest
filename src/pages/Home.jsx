import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Building, 
  ShieldCheck, 
  Star,
  Home as HomeIcon, 
  MessageSquare, 
  User 
} from 'lucide-react';
import { FaCrown, FaArrowDown } from 'react-icons/fa';

import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import Footer from '../components/Footer';
import { apiRequest } from '../services/api';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", damping: 20, stiffness: 100 } 
    }
  };

  const categories = ['All', 'Apartment', 'Villa', 'Penthouse', 'Studio'];

  return (
    // Added pb-20 md:pb-0 to prevent content from hiding behind the mobile nav bar
    <div className="min-h-screen bg-slate-50/50 font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white text-slate-800 pb-20 md:pb-0">
      
      {/* --- HERO SECTION --- */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
        className="relative w-full min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden"
      >
        {/* Modern Background with Grid & Ambient Light */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat bg-fixed"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-emerald-950/80 backdrop-blur-[1px]"></div>
        
        {/* Premium Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />

        <motion.div 
          initial={{ y: 40, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center w-full max-w-4xl mx-auto flex flex-col items-center pt-12"
        >
          {/* Tagline Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 shadow-xl"
          >
            <Sparkles size={14} className="animate-pulse" /> The Height of Luxury Living
          </motion.div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tight text-white drop-shadow-sm">
            Crafting Spaces For <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300">
              Your Legacy.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8 md:mb-10 font-medium leading-relaxed px-2">
            Experience real estate refined. Access our handpicked collection of ultra-premium residences tailored specifically to your distinguished lifestyle.
          </p>

          {/* Search Bar Container */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-2 md:p-2.5 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl"
          >
            <SearchBar />
          </motion.div>

          {/* Mini Trust Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-8 md:gap-16 mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/10 w-full max-w-2xl text-white/80">
            <div className="text-center">
              <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400">12k+</h4>
              <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Premium Units</p>
            </div>
            <div className="text-center border-x border-white/10 px-2 sm:px-4">
              <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400">99.4%</h4>
              <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Happy Clients</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400">25+</h4>
              <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Prime Cities</p>
            </div>
          </div>
        </motion.div>

        {/* Floating Scroll Indicator - Hidden on very small screens to save space */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-6 z-10 text-white/40 hidden md:flex flex-col items-center gap-1.5 cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Discover</span>
          <FaArrowDown size={12} className="text-emerald-400" />
        </motion.div>
      </motion.div>


      {/* --- FEATURED PROPERTIES SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-28 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-12 border-b border-slate-200/60 pb-6 md:pb-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs">
              <FaCrown size={14} /> Curated Collection
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Featured Residences
            </h2>
            <p className="text-slate-500 font-medium flex justify-center lg:justify-start items-center gap-2 text-sm pt-1">
              <MapPin size={16} className="text-emerald-500" /> Discover architectural masterpieces available worldwide.
            </p>
          </div>

          {/* Quick Filters Tab Layout */}
          <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 md:py-32 space-y-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full"
            />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              Refining Premium Catalog...
            </p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden" 
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
          >
            {properties.length > 0 ? (
              properties.map((property) => (
                <motion.div 
                  key={property._id} 
                  variants={itemVariants} 
                  className="group relative bg-white border border-slate-100 rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Subtle Top-Right Premium Badge on Hover */}
                  <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" /> Luxury Certified
                  </div>

                  <PropertyCard {...property} id={property._id} />
                </motion.div>
              ))
            ) : (
              /* High-End Empty State */
              <div className="col-span-full py-16 md:py-24 text-center flex flex-col items-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto w-full px-4">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 border border-slate-100">
                  <Building size={32} />
                </div>
                <p className="text-slate-900 text-lg md:text-xl font-black">No Vaulted Listings Open</p>
                <p className="text-slate-400 text-sm max-w-sm mt-1 font-medium">All properties in this category are currently occupied. Contact an agent for private listings.</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* --- HIGH END BRAND ASSETS BANNER --- */}
      <section className="bg-slate-900 text-white py-12 md:py-16 px-4 md:px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="flex items-center gap-4 flex-col md:flex-row">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Building size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base">Vetted Portfolio</h4>
              <p className="text-xs text-slate-400 mt-0.5">Every house undergoes 100+ quality assessment checks.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-col md:flex-row border-y md:border-y-0 md:border-x border-slate-800 py-6 md:py-0 md:px-8">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base">Secure Transactions</h4>
              <p className="text-xs text-slate-400 mt-0.5">Complete smart contract ledger & premium legal assistance.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-col md:flex-row">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Search size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base">Transparent Pricing</h4>
              <p className="text-xs text-slate-400 mt-0.5">Zero hidden brokering fees or sudden monthly surges.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 pb-safe flex justify-between items-center shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
        
        {/* Home Button (Active State Example) */}
        <button className="flex flex-col items-center w-16 text-emerald-600 transition-transform active:scale-95">
          <HomeIcon size={22} className="stroke-[2.5px]" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>
        
        {/* Messages Button */}
        <button className="flex flex-col items-center w-16 text-slate-400 hover:text-emerald-500 transition-all active:scale-95">
          <MessageSquare size={22} className="stroke-2" />
          <span className="text-[10px] font-bold mt-1">Messages</span>
        </button>
        
        {/* Profile Button */}
        <button className="flex flex-col items-center w-16 text-slate-400 hover:text-emerald-500 transition-all active:scale-95">
          <User size={22} className="stroke-2" />
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </button>

      </div>
    </div>
  );
};

export default Home;
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  Home as HomeIcon, 
  PlusCircle, 
  ShieldCheck, 
  Banknote,
  ArrowRight
} from 'lucide-react';

const HowItWorks = () => {
  // Animation Variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Data mapping for Renter Steps
  const tenantSteps = [
    {
      icon: <Search size={28} className="text-green-600 sm:w-8 sm:h-8" />,
      title: "1. Explore Properties",
      description: "Use our smart search to find houses, apartments, or rooms that fit your budget and location preferences perfectly."
    },
    {
      icon: <MessageSquare size={28} className="text-blue-600 sm:w-8 sm:h-8" />,
      title: "2. Connect Directly",
      description: "Chat securely with property owners through our built-in messaging system. No middlemen involved."
    },
    {
      icon: <HomeIcon size={28} className="text-purple-600 sm:w-8 sm:h-8" />,
      title: "3. Move In",
      description: "Finalize the deal, complete the paperwork, and move into your new dream nest with complete peace of mind."
    }
  ];

  // Data mapping for Owner Steps
  const ownerSteps = [
    {
      icon: <PlusCircle size={28} className="text-amber-600 sm:w-8 sm:h-8" />,
      title: "1. List Your Property",
      description: "Add your property details, upload high-quality photos, and set your terms in just a few clicks."
    },
    {
      icon: <ShieldCheck size={28} className="text-indigo-600 sm:w-8 sm:h-8" />,
      title: "2. Verify Tenants",
      description: "Receive inquiries from verified users. Review their profiles and communicate safely before making a decision."
    },
    {
      icon: <Banknote size={28} className="text-emerald-600 sm:w-8 sm:h-8" />,
      title: "3. Start Earning",
      description: "Rent out your property quickly and start receiving your monthly rental income without any hassle."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
            How <span className="text-green-600">RentNest</span> Works
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium px-2">
            Whether you're looking for a new home or wanting to rent out your property, we make the process simple, secure, and transparent.
          </p>
        </motion.div>

        {/* --- FOR RENTERS SECTION --- */}
        <div className="mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 justify-center md:justify-start text-center sm:text-left">
            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider">
              For Renters
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Find Your Next Home</h2>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {tenantSteps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-100 transition-all duration-300 relative overflow-hidden group w-full"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* --- FOR OWNERS SECTION --- */}
        <div className="mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 justify-center md:justify-start text-center sm:text-left">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider">
              For Owners
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">List and Earn</h2>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {ownerSteps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 relative overflow-hidden group w-full"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* --- CALL TO ACTION --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-xl w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of users who have found their perfect home or reliable tenants through RentNest.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full">
            <Link 
              to="/explore"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold transition-colors w-full sm:w-auto text-sm sm:text-base shadow-sm"
            >
              Explore Properties <ArrowRight size={18} className="shrink-0" />
            </Link>
            <Link 
              to="/register"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold transition-colors w-full sm:w-auto backdrop-blur-sm border border-white/10 text-sm sm:text-base"
            >
              Create an Account
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HowItWorks;
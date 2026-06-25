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
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const tenantSteps = [
    {
      icon: <Search size={32} className="text-green-600" />,
      title: "1. Explore Properties",
      description: "Use our smart search to find houses, apartments, or rooms that fit your budget and location preferences perfectly."
    },
    {
      icon: <MessageSquare size={32} className="text-blue-600" />,
      title: "2. Connect Directly",
      description: "Chat securely with property owners through our built-in messaging and video call system. No middlemen involved."
    },
    {
      icon: <HomeIcon size={32} className="text-purple-600" />,
      title: "3. Move In",
      description: "Finalize the deal, complete the paperwork, and move into your new dream nest with complete peace of mind."
    }
  ];

  const ownerSteps = [
    {
      icon: <PlusCircle size={32} className="text-amber-600" />,
      title: "1. List Your Property",
      description: "Add your property details, upload high-quality photos, and set your terms in just a few clicks."
    },
    {
      icon: <ShieldCheck size={32} className="text-indigo-600" />,
      title: "2. Verify Tenants",
      description: "Receive inquiries from verified users. Review their profiles and communicate safely before making a decision."
    },
    {
      icon: <Banknote size={32} className="text-emerald-600" />,
      title: "3. Start Earning",
      description: "Rent out your property quickly and start receiving your monthly rental income without any hassle."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
            How <span className="text-green-600">RentNest</span> Works
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Whether you're looking for a new home or wanting to rent out your property, we make the process simple, secure, and transparent.
          </p>
        </motion.div>

        {/* FOR TENANTS SECTION */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
              For Renters
            </span>
            <h2 className="text-2xl font-bold text-slate-800">Find Your Next Home</h2>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {tenantSteps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* FOR OWNERS SECTION */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
              For Owners
            </span>
            <h2 className="text-2xl font-bold text-slate-800">List and Earn</h2>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {ownerSteps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CALL TO ACTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Join thousands of users who have found their perfect home or reliable tenants through RentNest.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/explore">
              <button className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold transition-colors w-full sm:w-auto">
                Explore Properties <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/register">
              <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl font-bold transition-colors w-full sm:w-auto backdrop-blur-sm">
                Create an Account
              </button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HowItWorks;
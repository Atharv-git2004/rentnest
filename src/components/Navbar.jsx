import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home as HomeIcon, LogIn, Building2, UserPlus, LogOut, User, 
  MessageSquare, Compass, Gift, HelpCircle, ShieldCheck, LayoutDashboard 
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // LocalStorage-ൽ നിന്ന് യൂസർ ഡാറ്റ എടുക്കുന്നു
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    alert('Logged out successfully!');
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 px-4 py-3 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        
        {/* LOGO SECTION */}
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-green-600 text-white p-2 rounded-xl shadow-md">
              <Building2 size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Rent<span className="text-green-600">Nest</span>
            </span>
          </Link>
        </div>

        {/* ALL NAVIGATION FIELDS */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-semibold text-gray-600">
          
          <Link to="/" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/' ? 'text-green-600 bg-green-50' : 'hover:text-green-600'}`}>
            <HomeIcon size={16} /> <span>Home</span>
          </Link>

          <Link to="/explore" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/explore' ? 'text-green-600 bg-green-50' : 'hover:text-green-600'}`}>
            <Compass size={16} /> <span>Explore</span>
          </Link>

          <Link to="/offers" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/offers' ? 'text-green-600 bg-green-50' : 'hover:text-green-600'}`}>
            <Gift size={16} /> <span>Offers</span>
          </Link>

          <Link to="/how-it-works" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/how-it-works' ? 'text-green-600 bg-green-50' : 'hover:text-green-600'}`}>
            <HelpCircle size={16} /> <span>How It Works</span>
          </Link>

          {/* --- ലോഗിൻ ചെയ്തവർക്ക് മാത്രം കാണിക്കുന്നവ --- */}
          {userInfo && (
            <>
              <Link to="/chats" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/chats' ? 'text-green-600 bg-green-50' : 'hover:text-green-600'}`}>
                <MessageSquare size={16} /> <span>Chats</span>
              </Link>

              {userInfo.role === 'owner' && (
                <Link to="/dashboard" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-blue-600 bg-blue-50 transition-all hover:bg-blue-100 ${location.pathname === '/dashboard' ? 'ring-1 ring-blue-300' : ''}`}>
                  <LayoutDashboard size={16} /> <span>Owner Dashboard</span>
                </Link>
              )}

              {userInfo.role === 'admin' && (
                <Link to="/admin" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-purple-600 bg-purple-50 transition-all hover:bg-purple-100 ${location.pathname === '/admin' ? 'ring-1 ring-purple-300' : ''}`}>
                  <ShieldCheck size={16} /> <span>Admin Panel</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* AUTH BUTTONS SECTION (Login/Signup/Logout) */}
        <div className="flex items-center gap-3 text-sm font-semibold border-t border-gray-100 pt-2 md:border-none md:pt-0">
          {userInfo ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              {/* 💡 Profile Badge (ഇവിടെയാണ് മാറ്റം വരുത്തിയത്) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-bold text-xs">
                <User size={14} className="text-slate-500" />
                {/* name അല്ലെങ്കിൽ username എടുക്കും, രണ്ടും ഇല്ലെങ്കിൽ 'User' എന്ന് കാണിക്കും */}
                <span className="max-w-[100px] truncate">
                  {userInfo.name || userInfo.username || 'User'}
                </span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {userInfo.role || 'user'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-xs font-bold"
              >
                <LogOut size={14} /> <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-auto md:ml-0">
              <Link to="/login" className="text-gray-600 hover:text-green-600 transition-colors text-xs font-bold">
                Login
              </Link>
              <Link to="/register">
                <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
                  <UserPlus size={14} /> Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </motion.nav>
  );
};

export default Navbar;
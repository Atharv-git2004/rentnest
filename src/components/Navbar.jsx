import React, { useState } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import toast from 'react-hot-toast'; 
import { 
  Building2, UserPlus, LogOut, User, Menu, X, AlertTriangle,
  Home as HomeIcon, MessageSquare, Compass, HelpCircle, ShieldCheck, LayoutDashboard, Heart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); 

  const { user, logout } = useAuth();

  const localUser = JSON.parse(localStorage.getItem('userInfo'));
  const userInfo = user || localUser;

  const handleLogout = () => {
    if (logout) logout(); 
    localStorage.removeItem('userInfo');
    
    toast.success('Logged out successfully!'); 
    setIsOpen(false);
    navigate('/login');
  };

  const getLinkStyle = (path) => 
    location.pathname === path 
      ? 'text-green-600 bg-green-50' 
      : 'hover:text-green-600 hover:bg-gray-50 lg:hover:bg-transparent';

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 px-4 py-3 shadow-sm w-full"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full gap-2">
          
          {/* Logo Section */}
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group flex-shrink-0">
            <div className="bg-green-600 text-white p-1.5 sm:p-2 rounded-xl shadow-md flex-shrink-0">
              <Building2 size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
              Rent<span className="text-green-600">Nest</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-gray-600">
            <Link to="/" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/')}`}>
              <HomeIcon size={16} /> <span>Home</span>
            </Link>

            <Link to="/explore" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/explore')}`}>
              <Compass size={16} /> <span>Explore</span>
            </Link>

            <Link to="/how-it-works" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/how-it-works')}`}>
              <HelpCircle size={16} /> <span>How It Works</span>
            </Link>

            {userInfo && (
              <>
                {/* Wishlist Link */}
                <Link to="/wishlist" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/wishlist')}`}>
                  <Heart size={16} /> <span>Wishlist</span>
                </Link>

                <Link to="/chats" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/chats')}`}>
                  <MessageSquare size={16} /> <span>Chats</span>
                </Link>

                {/* Complaints Link */}
                {userInfo.role !== 'admin' && (
                  <Link 
                    to="/help-support"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                      location.pathname === '/help-support' 
                      ? 'text-amber-700 bg-amber-100 ring-1 ring-amber-300' 
                      : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle size={16} /> <span>Complaints</span>
                  </Link>
                )}

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

          {/* Auth Buttons & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 text-sm font-semibold flex-shrink-0">
            {userInfo ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 font-bold text-xs">
                  
                  {userInfo?.picture || userInfo?.avatar ? (
                    <img 
                      src={userInfo.picture || userInfo.avatar} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ring-green-100 flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                    />
                  ) : (
                    <User size={14} className="text-slate-500 flex-shrink-0" />
                  )}
                  
                  <span className="max-w-[60px] sm:max-w-[80px] md:max-w-[100px] truncate">
                    {userInfo.name || userInfo.username || 'User'}
                  </span>
                  <span className="hidden md:inline-block text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {userInfo.role || 'user'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 sm:px-3 rounded-xl transition-colors cursor-pointer text-xs font-bold flex-shrink-0"
                >
                  <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login" className="text-gray-600 hover:text-green-600 transition-colors text-xs sm:text-sm font-bold">
                  Login
                </Link>
                <Link to="/register">
                  <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm cursor-pointer flex-shrink-0">
                    <UserPlus size={14} /> <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </Link>
              </div>
            )}

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1.5 text-slate-700 hover:bg-gray-100 rounded-xl lg:hidden transition-colors cursor-pointer flex-shrink-0"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden bg-white border-t border-gray-100 mt-3 rounded-2xl flex flex-col gap-1 p-2 text-sm font-bold text-gray-600 shadow-inner w-full"
            >
              <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/')}`}>
                <HomeIcon size={16} /> <span>Home</span>
              </Link>

              <Link to="/explore" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/explore')}`}>
                <Compass size={16} /> <span>Explore</span>
              </Link>

              <Link to="/how-it-works" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/how-it-works')}`}>
                <HelpCircle size={16} /> <span>How It Works</span>
              </Link>

              {userInfo && (
                <>
                  {/* Wishlist Link Mobile */}
                  <Link to="/wishlist" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/wishlist')}`}>
                    <Heart size={16} /> <span>Wishlist</span>
                  </Link>

                  <Link to="/chats" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/chats')}`}>
                    <MessageSquare size={16} /> <span>Chats</span>
                  </Link>

                  {/* Complaints Link Mobile */}
                  {userInfo.role !== 'admin' && (
                    <Link 
                      to="/help-support"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                        location.pathname === '/help-support' 
                        ? 'text-amber-700 bg-amber-100 ring-1 ring-amber-300' 
                        : 'text-amber-600 bg-amber-50/70 hover:bg-amber-100'
                      }`}
                    >
                      <AlertTriangle size={16} /> <span>Complaints</span>
                    </Link>
                  )}

                  {userInfo.role === 'owner' && (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-3 rounded-xl text-blue-600 bg-blue-50/70">
                      <LayoutDashboard size={16} /> <span>Owner Dashboard</span>
                    </Link>
                  )}

                  {userInfo.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-3 rounded-xl text-purple-600 bg-purple-50/70">
                      <ShieldCheck size={16} /> <span>Admin Panel</span>
                    </Link>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
import React, { useState } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import toast from 'react-hot-toast'; 
import { 
  Building2, UserPlus, LogOut, User, Menu, X, AlertTriangle,
  Home as HomeIcon, MessageSquare, Compass, HelpCircle, ShieldCheck, LayoutDashboard 
} from 'lucide-react';
import ComplaintModal from './ComplaintModal'; 
import { useAuth } from '../context/AuthContext'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); 
  const [isComplaintOpen, setIsComplaintOpen] = useState(false); 

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
      : 'hover:text-green-600 hover:bg-gray-50 md:hover:bg-transparent';

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 px-4 py-3 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* LOGO SECTION */}
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
            <div className="bg-green-600 text-white p-2 rounded-xl shadow-md">
              <Building2 size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Rent<span className="text-green-600">Nest</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Link to="/" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/')}`}>
              <HomeIcon size={16} /> <span>Home</span>
            </Link>

            <Link to="/explore" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/explore')}`}>
              <Compass size={16} /> <span>Explore</span>
            </Link>

            {/* 💡 Only How It Works Kept Here */}
            <Link to="/how-it-works" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/how-it-works')}`}>
              <HelpCircle size={16} /> <span>How It Works</span>
            </Link>

            {userInfo && (
              <>
                <Link to="/chats" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/chats')}`}>
                  <MessageSquare size={16} /> <span>Chats</span>
                </Link>

                {userInfo.role !== 'admin' && (
                  <button 
                    onClick={() => setIsComplaintOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer"
                  >
                    <AlertTriangle size={16} /> <span>Complaints</span>
                  </button>
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

          {/* AUTH BUTTONS SECTION & MOBILE TOGGLE */}
          <div className="flex items-center gap-2 md:gap-3 text-sm font-semibold">
            {userInfo ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl text-slate-700 font-bold text-xs">
                  
                  {userInfo?.picture || userInfo?.avatar ? (
                    <img 
                      src={userInfo.picture || userInfo.avatar} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-green-100"
                      onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                    />
                  ) : (
                    <User size={14} className="text-slate-500" />
                  )}
                  
                  <span className="max-w-[70px] md:max-w-[100px] truncate">
                    {userInfo.name || userInfo.username || 'User'}
                  </span>
                  <span className="hidden sm:inline-block text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {userInfo.role || 'user'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 md:px-3 rounded-xl transition-colors cursor-pointer text-xs font-bold"
                >
                  <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-green-600 transition-colors text-xs font-bold">
                  Login
                </Link>
                <Link to="/register">
                  <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">
                    <UserPlus size={14} /> <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </Link>
              </div>
            )}

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1.5 text-slate-700 hover:bg-gray-100 rounded-xl md:hidden transition-colors cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN NAVIGATION */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100 mt-3 rounded-2xl flex flex-col gap-1 p-2 text-sm font-bold text-gray-600 shadow-inner"
            >
              <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/')}`}>
                <HomeIcon size={16} /> <span>Home</span>
              </Link>

              <Link to="/explore" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/explore')}`}>
                <Compass size={16} /> <span>Explore</span>
              </Link>

              {/* 💡 Only How It Works Kept Here for Mobile too */}
              <Link to="/how-it-works" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/how-it-works')}`}>
                <HelpCircle size={16} /> <span>How It Works</span>
              </Link>

              {userInfo && (
                <>
                  <Link to="/chats" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/chats')}`}>
                    <MessageSquare size={16} /> <span>Chats</span>
                  </Link>

                  {userInfo.role !== 'admin' && (
                    <button 
                      onClick={() => { setIsOpen(false); setIsComplaintOpen(true); }}
                      className="flex items-center gap-2 p-3 rounded-xl text-amber-600 bg-amber-50/70 text-left w-full cursor-pointer"
                    >
                      <AlertTriangle size={16} /> <span>Complaints</span>
                    </button>
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

      <ComplaintModal isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} />
    </>
  );
};

export default Navbar;import React, { useState } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import toast from 'react-hot-toast'; 
import { 
  Building2, UserPlus, LogOut, User, Menu, X, AlertTriangle,
  Home as HomeIcon, MessageSquare, Compass, HelpCircle, ShieldCheck, LayoutDashboard 
} from 'lucide-react';
import ComplaintModal from './ComplaintModal'; 
import { useAuth } from '../context/AuthContext'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); 
  const [isComplaintOpen, setIsComplaintOpen] = useState(false); 

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
      : 'hover:text-green-600 hover:bg-gray-50 md:hover:bg-transparent';

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 px-4 py-3 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* LOGO SECTION */}
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
            <div className="bg-green-600 text-white p-2 rounded-xl shadow-md">
              <Building2 size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Rent<span className="text-green-600">Nest</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Link to="/" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/')}`}>
              <HomeIcon size={16} /> <span>Home</span>
            </Link>

            <Link to="/explore" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/explore')}`}>
              <Compass size={16} /> <span>Explore</span>
            </Link>

            {/* 💡 Only How It Works Kept Here */}
            <Link to="/how-it-works" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/how-it-works')}`}>
              <HelpCircle size={16} /> <span>How It Works</span>
            </Link>

            {userInfo && (
              <>
                <Link to="/chats" className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${getLinkStyle('/chats')}`}>
                  <MessageSquare size={16} /> <span>Chats</span>
                </Link>

                {userInfo.role !== 'admin' && (
                  <button 
                    onClick={() => setIsComplaintOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer"
                  >
                    <AlertTriangle size={16} /> <span>Complaints</span>
                  </button>
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

          {/* AUTH BUTTONS SECTION & MOBILE TOGGLE */}
          <div className="flex items-center gap-2 md:gap-3 text-sm font-semibold">
            {userInfo ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl text-slate-700 font-bold text-xs">
                  
                  {userInfo?.picture || userInfo?.avatar ? (
                    <img 
                      src={userInfo.picture || userInfo.avatar} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-green-100"
                      onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                    />
                  ) : (
                    <User size={14} className="text-slate-500" />
                  )}
                  
                  <span className="max-w-[70px] md:max-w-[100px] truncate">
                    {userInfo.name || userInfo.username || 'User'}
                  </span>
                  <span className="hidden sm:inline-block text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {userInfo.role || 'user'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 md:px-3 rounded-xl transition-colors cursor-pointer text-xs font-bold"
                >
                  <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-green-600 transition-colors text-xs font-bold">
                  Login
                </Link>
                <Link to="/register">
                  <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">
                    <UserPlus size={14} /> <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </Link>
              </div>
            )}

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1.5 text-slate-700 hover:bg-gray-100 rounded-xl md:hidden transition-colors cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN NAVIGATION */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100 mt-3 rounded-2xl flex flex-col gap-1 p-2 text-sm font-bold text-gray-600 shadow-inner"
            >
              <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/')}`}>
                <HomeIcon size={16} /> <span>Home</span>
              </Link>

              <Link to="/explore" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/explore')}`}>
                <Compass size={16} /> <span>Explore</span>
              </Link>

              {/* 💡 Only How It Works Kept Here for Mobile too */}
              <Link to="/how-it-works" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/how-it-works')}`}>
                <HelpCircle size={16} /> <span>How It Works</span>
              </Link>

              {userInfo && (
                <>
                  <Link to="/chats" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl ${getLinkStyle('/chats')}`}>
                    <MessageSquare size={16} /> <span>Chats</span>
                  </Link>

                  {userInfo.role !== 'admin' && (
                    <button 
                      onClick={() => { setIsOpen(false); setIsComplaintOpen(true); }}
                      className="flex items-center gap-2 p-3 rounded-xl text-amber-600 bg-amber-50/70 text-left w-full cursor-pointer"
                    >
                      <AlertTriangle size={16} /> <span>Complaints</span>
                    </button>
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

      <ComplaintModal isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} />
    </>
  );
};

export default Navbar;
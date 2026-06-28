import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon, Compass, MessageSquare, 
  LayoutDashboard, ShieldCheck, User, LogIn 
} from 'lucide-react';

const BottomNavbar = () => {
  const location = useLocation();

  // Retrieve user data from LocalStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Function to style active links
  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => `
    flex flex-col items-center justify-center flex-1 py-2 sm:py-3 text-[10px] sm:text-xs font-bold transition-all duration-200
    ${isActive(path) ? 'text-green-600 scale-105' : 'text-gray-500 hover:text-green-500'}
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 pb-[env(safe-area-inset-bottom,0.5rem)] pt-1">
      <div className="flex justify-around items-center max-w-md mx-auto w-full">
        
        {/* HOME */}
        <Link to="/" className={linkStyle('/')}>
          <HomeIcon size={20} className={`sm:w-6 sm:h-6 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          <span className="mt-1">Home</span>
        </Link>

        {/* EXPLORE */}
        <Link to="/explore" className={linkStyle('/explore')}>
          <Compass size={20} className={`sm:w-6 sm:h-6 ${isActive('/explore') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          <span className="mt-1">Explore</span>
        </Link>

        {/* CHATS (For logged-in users only) */}
        {userInfo && (
          <Link to="/chats" className={linkStyle('/chats')}>
            <div className="relative">
              <MessageSquare size={20} className={`sm:w-6 sm:h-6 ${isActive('/chats') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              {/* We can add an unread message badge (+1, +2) here later */}
            </div>
            <span className="mt-1">Chats</span>
          </Link>
        )}

        {/* DASHBOARD / ADMIN / PROFILE */}
        {userInfo ? (
          <>
            {userInfo.role === 'owner' && (
              <Link to="/dashboard" className={linkStyle('/dashboard')}>
                <LayoutDashboard size={20} className={`sm:w-6 sm:h-6 ${isActive('/dashboard') ? 'text-blue-600 stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className={`mt-1 ${isActive('/dashboard') ? 'text-blue-600' : ''}`}>Dashboard</span>
              </Link>
            )}

            {userInfo.role === 'admin' && (
              <Link to="/admin" className={linkStyle('/admin')}>
                <ShieldCheck size={20} className={`sm:w-6 sm:h-6 ${isActive('/admin') ? 'text-purple-600 stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className={`mt-1 ${isActive('/admin') ? 'text-purple-600' : ''}`}>Admin</span>
              </Link>
            )}

            {userInfo.role !== 'owner' && userInfo.role !== 'admin' && (
              <Link to="/profile" className={linkStyle('/profile')}>
                <User size={20} className={`sm:w-6 sm:h-6 ${isActive('/profile') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className="mt-1">Profile</span>
              </Link>
            )}
          </>
        ) : (
          /* Show Login button instead of Profile for unauthenticated users */
          <Link to="/login" className={linkStyle('/login')}>
            <LogIn size={20} className={`sm:w-6 sm:h-6 ${isActive('/login') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="mt-1">Login</span>
          </Link>
        )}

      </div>
    </div>
  );
};

export default BottomNavbar;
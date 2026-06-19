import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon, Compass, MessageSquare, 
  LayoutDashboard, ShieldCheck, User, LogIn 
} from 'lucide-react';

const BottomNavbar = () => {
  const location = useLocation();

  // LocalStorage-ൽ നിന്ന് യൂസർ ഡാറ്റ എടുക്കുന്നു
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // ആക്റ്റീവ് ലിങ്ക് സ്റ്റൈൽ ചെയ്യാൻ
  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => `
    flex flex-col items-center justify-center flex-1 py-2 text-[10px] font-bold transition-all duration-200
    ${isActive(path) ? 'text-green-600 scale-105' : 'text-gray-500 hover:text-green-500'}
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 pb-safe-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        
        {/* HOME */}
        <Link to="/" className={linkStyle('/')}>
          <HomeIcon size={20} className={isActive('/') ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span className="mt-1">Home</span>
        </Link>

        {/* EXPLORE */}
        <Link to="/explore" className={linkStyle('/explore')}>
          <Compass size={20} className={isActive('/explore') ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span className="mt-1">Explore</span>
        </Link>

        {/* CHATS (ലോഗിൻ ചെയ്തവർക്ക് മാത്രം) */}
        {userInfo && (
          <Link to="/chats" className={linkStyle('/chats')}>
            <div className="relative">
              <MessageSquare size={20} className={isActive('/chats') ? 'stroke-[2.5]' : 'stroke-[2]'} />
              {/* 💡 ഇവിടെ നമുക്ക് പിന്നീട് അൺറെഡ് മെസ്സേജ് ബാഡ്ജ് (+1, +2) വെക്കാം */}
            </div>
            <span className="mt-1">Chats</span>
          </Link>
        )}

        {/* DASHBOARD / ADMIN / PROFILE */}
        {userInfo ? (
          <>
            {userInfo.role === 'owner' && (
              <Link to="/dashboard" className={linkStyle('/dashboard')}>
                <LayoutDashboard size={20} className={isActive('/dashboard') ? 'text-blue-600 stroke-[2.5]' : 'stroke-[2]'} />
                <span className={`mt-1 ${isActive('/dashboard') ? 'text-blue-600' : ''}`}>Dashboard</span>
              </Link>
            )}

            {userInfo.role === 'admin' && (
              <Link to="/admin" className={linkStyle('/admin')}>
                <ShieldCheck size={20} className={isActive('/admin') ? 'text-purple-600 stroke-[2.5]' : 'stroke-[2]'} />
                <span className={`mt-1 ${isActive('/admin') ? 'text-purple-600' : ''}`}>Admin</span>
              </Link>
            )}

            {userInfo.role !== 'owner' && userInfo.role !== 'admin' && (
              <Link to="/profile" className={linkStyle('/profile')}>
                <User size={20} className={isActive('/profile') ? 'stroke-[2.5]' : 'stroke-[2]'} />
                <span className="mt-1">Profile</span>
              </Link>
            )}
          </>
        ) : (
          /* ലോഗിൻ ചെയ്യാത്തവർക്ക് പ്രൊഫൈലിന് പകരം ലോഗിൻ ബട്ടൺ */
          <Link to="/login" className={linkStyle('/login')}>
            <LogIn size={20} className={isActive('/login') ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="mt-1">Login</span>
          </Link>
        )}

      </div>
    </div>
  );
};

export default BottomNavbar;
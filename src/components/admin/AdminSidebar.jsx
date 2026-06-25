import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, MessageSquare, 
  LogOut, Home, X, Shield 
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  // Logout ഫങ്ഷൻ
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // സൈഡ്ബാർ മെനു ലിസ്റ്റ് (inquiries മാറ്റി complaints ആക്കി)
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Manage Users', icon: <Users size={20} /> },
    { id: 'properties', label: 'Manage Properties', icon: <Building2 size={20} /> },
    { id: 'complaints', label: 'Manage Complaints', icon: <MessageSquare size={20} /> },
  ];

  return (
    <>
      {/* --- SIDEBAR CONTAINER --- */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 w-64 p-5 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo & Header Section */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white p-2 rounded-xl shadow-md">
                <Shield size={20} />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Rent<span className="text-green-500">Nest</span> Admin
              </span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false); // മൊബൈലിൽ ടാബ് മാറുമ്പോൾ സൈഡ്ബാർ ക്ലോസ് ആകും
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/10' 
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Section (Bottom Links) */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Home size={16} />
            <span>Go to Homepage</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Screen */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
};

export default AdminSidebar;
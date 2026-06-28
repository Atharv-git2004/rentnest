import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

// 📂 Import sub-components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import ManageUsers from '../components/admin/ManageUsers';
import ManageProperties from '../components/admin/ManageProperties';
// Replaced ManageInquiries with ManageComplaints 👇
import ManageComplaints from '../components/admin/ManageComplaints';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  // Fetch admin name from LocalStorage on component mount
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.name) {
      setAdminName(userInfo.name);
    }
  }, []);

  // Render dynamic content based on the selected tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <ManageUsers />;
      case 'properties':
        return <ManageProperties />;
      case 'complaints': 
        return <ManageComplaints />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative w-full overflow-hidden">
      
      {/* --- SIDEBAR COMPONENT --- */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 h-16 min-h-[4rem] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-sm w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-600 lg:hidden p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider hidden sm:block truncate">
              Dashboard / <span className="text-slate-800 font-black">{activeTab}</span>
            </h1>
          </div>

          {/* Admin Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 truncate max-w-[150px]">{adminName}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black rounded-xl flex items-center justify-center border border-slate-200 shadow-sm uppercase shrink-0 text-sm sm:text-base">
              {adminName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Sub-Component Body */}
        <main className="flex-1 bg-slate-50 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;
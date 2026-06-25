import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

// 📂 സബ്-കമ്പോണന്റുകൾ ഇമ്പോർട്ട് ചെയ്യുന്നു
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import ManageUsers from '../components/admin/ManageUsers';
import ManageProperties from '../components/admin/ManageProperties';
// ManageInquiries മാറ്റി ManageComplaints ആക്കി ഉൾപ്പെടുത്തിയിട്ടുണ്ട് 👇
import ManageComplaints from '../components/admin/ManageComplaints';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  // LocalStorage-ൽ നിന്ന് അഡ്മിന്റെ പേര് എടുക്കുന്നു
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.name) {
      setAdminName(userInfo.name);
    }
  }, []);

  // സെലക്ട് ചെയ്യുന്ന ടാബ് അനുസരിച്ച് പേജുകൾ മാറ്റുന്നു
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <ManageUsers />;
      case 'properties':
        return <ManageProperties />;
      case 'complaints': // 'inquiries' മാറ്റി 'complaints' ആക്കി
        return <ManageComplaints />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      
      {/* --- SIDEBAR COMPONENT --- */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-600 lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-sm font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
              Dashboard / <span className="text-slate-800 font-black">{activeTab}</span>
            </h1>
          </div>

          {/* Admin Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800">{adminName}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black rounded-xl flex items-center justify-center border border-slate-200 shadow-sm uppercase">
              {adminName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Sub-Component Body */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogOut } from 'lucide-react';

// Context & Components
import { useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import CallModal from './components/CallModal';
import BottomNavbar from './components/BottomNavbar'; // 💡 പുതിയ BottomNavbar ഇംപോർട്ട് ചെയ്തു

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetails from './pages/PropertyDetails';
import ExploreProperties from './pages/ExploreProperties';
import Chats from './pages/Chats';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EditProperty from './pages/EditProperty';
import AddProperty from './pages/AddProperty';

// --- NAVBAR COMPONENT ---
const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 px-4 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-green-600 text-white p-2 rounded-xl">
            <Building2 size={20} />
          </div>
          <span className="text-xl font-black text-slate-800">
            Rent<span className="text-green-600">Nest</span>
          </span>
        </Link>
        
        {/* DESKTOP NAVIGATION (മൊബൈലിൽ ഹൈഡ് ആകും) */}
        <div className="hidden md:flex gap-6 font-semibold text-gray-600 text-sm">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <Link to="/explore" className="hover:text-green-600 transition-colors">Explore</Link>
          {user && (
            <>
              <Link to="/chats" className="hover:text-green-600 transition-colors">Chats</Link>
              {user.role === 'owner' && <Link to="/dashboard" className="text-blue-600 transition-colors">Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin" className="text-purple-600 transition-colors">Admin</Link>}
            </>
          )}
        </div>

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
              <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

// --- APP CONTENT COMPONENT ---
const AppContent = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [callerName, setCallerName] = useState("Unknown Caller"); 
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      const handleIncomingCall = (data) => {
        console.log("Incoming Call:", data);
        setCallerName(data?.callerName || "Owner"); 
        setIsCalling(true);
      };

      socket.on('incoming-call', handleIncomingCall);

      return () => {
        socket.off('incoming-call', handleIncomingCall);
      };
    }
  }, [socket]);

  return (
    // 💡 താഴെ pb-16 നൽകിയത് ശ്രദ്ധിക്കുക. മൊബൈലിൽ ബാറിനടിയിൽ കണ്ടന്റ് മറയാതിരിക്കാനാണ് ഇത്.
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Navbar />
      
      {/* കോൾ മോഡൽ */}
      <CallModal 
        isOpen={isCalling} 
        callerName={callerName} 
        onAccept={() => {
          console.log("Call Accepted");
          setIsCalling(false);
        }} 
        onReject={() => setIsCalling(false)} 
      />

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/explore" element={<ExploreProperties />} />
          <Route path="/chats" element={<Chats />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/edit-property/:id" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EditProperty /></ProtectedRoute>} />
          <Route path="/add-property" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><AddProperty /></ProtectedRoute>} />
        </Routes>
      </div>

      {/* 💡 ഇവിടെ BottomNavbar ചേർത്തു */}
      <BottomNavbar />
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
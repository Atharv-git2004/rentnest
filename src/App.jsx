// App.jsx

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogOut } from 'lucide-react';

// Context & Components
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import BottomNavbar from './components/BottomNavbar';
import VideoCall from './components/VideoCall'; // 🚀 PRO FIX: Global VideoCall Overlay
import { apiRequest } from './services/api';

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

// =======================================================
// 📞 1. GLOBAL CALL CONTEXT & PROVIDER (The Master Hub)
// =======================================================
export const CallContext = createContext(null);
export const useCall = () => useContext(CallContext);

const GlobalCallProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();

  const getUserId = useCallback((userObj) => {
    if (!userObj) return '';
    if (typeof userObj === 'object') return (userObj._id || userObj.id || '').toString().trim();
    return userObj.toString().trim();
  }, []);

  const currentUserId = useMemo(() => getUserId(user), [user, getUserId]);

  const [callData, setCallData] = useState({
    isActive: false, 
    signal: null, 
    partnerId: null, 
    callType: 'video', 
    startTime: null,
    isCaller: false,
    callerName: "User",
    callerAvatar: null
  });

  // ⚡ GLOBAL SOCKET LISTENER: യൂസർ ഏതു പേജിൽ നിന്നാലും ഇൻകമിംഗ് കോൾ പിടിക്കും!
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleIncomingCall = (data) => {
      console.log("⚡ [Global Call Hub] Incoming call detected anywhere in app:", data);
      setCallData({
        isActive: true,
        signal: data.signal || data.signalData,
        partnerId: data.from,
        callType: data.callType || 'video',
        startTime: null,
        isCaller: false,
        callerName: data.callerName || "User",
        callerAvatar: data.callerAvatar || null
      });
    };

    const handleCallEnded = () => {
      console.log("🚫 [Global Call Hub] Remote user ended the call.");
      setCallData({ isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null, isCaller: false });
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, currentUserId]);

  // 🚀 ഫ്രണ്ട്-എൻഡിൽ നിന്ന് പുതിയ കോൾ വിളിക്കാൻ (Chats.jsx-ൽ നിന്നും വിളിക്കാനുള്ള ഫംഗ്ഷൻ)
  const initiateCall = useCallback((partnerId, partnerName, partnerAvatar, type = 'video') => {
    if (!socket || !partnerId) return;
    setCallData({ 
      isActive: true, 
      signal: null, 
      partnerId: partnerId, 
      callType: type, 
      startTime: new Date(),
      isCaller: true,
      callerName: partnerName || "User",
      callerAvatar: partnerAvatar || null
    });
  }, [socket]);

  // കോൾ ലോഗ് ഡാറ്റാബേസിൽ സേവ് ചെയ്യാൻ (Caller മാത്രം സേവ് ചെയ്യും)
  const handleSendMessage = useCallback(async (messageText, type = 'call', partnerId, callDetails) => {
    if (!partnerId || !currentUserId) return;
    const payload = { 
      receiverId: partnerId, 
      text: messageText, 
      messageType: type, 
      callDetails 
    };
    try {
      const response = await apiRequest('/messages', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const savedData = await response.json();
      if (savedData.success && socket) {
        socket.emit('send-message', { ...savedData.data, senderId: currentUserId, receiverId: partnerId });
      }
    } catch (err) { 
      console.error("Call log save error:", err); 
    }
  }, [currentUserId, socket]);

  // കോൾ കട്ട് ചെയ്യുമ്പോൾ ഉള്ള പ്രോസസ്സ്
  const endCall = useCallback((duration = 0, isCallerSequence = false) => {
    const partner = callData.partnerId;
    if (socket && partner) socket.emit('end-call', { to: partner });
    
    if (partner && callData.isActive && isCallerSequence) { 
      let callText = duration > 0 ? (Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration % 60}s`) : 'Missed Call';
      handleSendMessage(callText, 'call', partner, { callType: callData.callType, duration: Number(duration) });
    }
    setCallData({ isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null, isCaller: false });
  }, [callData, socket, handleSendMessage]);

  return (
    <CallContext.Provider value={{ callData, initiateCall, endCall }}>
      {children}
      
      {/* 🚀 GLOBAL POPUP: യൂസർ ഏതു പേജിൽ ആണെങ്കിലും സ്ക്രീനിൽ തെളിയുന്ന കോൾ വിൻഡോ */}
      {callData.isActive && (
        <VideoCall 
          socket={socket} 
          currentUserId={currentUserId} 
          activeChatId={callData.partnerId}
          activeChatName={callData.callerName}
          activeChatAvatar={callData.callerAvatar}
          incomingSignal={callData.signal} 
          onEndCall={endCall} 
          callType={callData.callType} 
          isCaller={callData.isCaller}  
        />
      )}
    </CallContext.Provider>
  );
};

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
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-green-600 text-white p-2 rounded-xl">
            <Building2 size={20} />
          </div>
          <span className="text-xl font-black text-slate-800">
            Rent<span className="text-green-600">Nest</span>
          </span>
        </Link>
        
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
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/explore" element={<ExploreProperties />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/edit-property/:id" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EditProperty /></ProtectedRoute>} />
          <Route path="/add-property" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><AddProperty /></ProtectedRoute>} />
        </Routes>
      </div>
      <BottomNavbar />
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GlobalCallProvider>
            <AppContent />
          </GlobalCallProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
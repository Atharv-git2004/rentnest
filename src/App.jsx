import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context & Components
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import BottomNavbar from './components/BottomNavbar';
import VideoCall from './components/VideoCall'; 
import Navbar from './components/Navbar'; // 💡 പ്രധാന Navbar ഇവിടെ ഇമ്പോർട്ട് ചെയ്തു
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
import HowItWorks from './pages/HowItWorks';

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

  // 🚀 ഫ്രണ്ട്-എൻഡിൽ നിന്ന് പുതിയ കോൾ വിളിക്കാൻ
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

  // കോൾ ലോഗ് ഡാറ്റാബേസിൽ സേവ് ചെയ്യാൻ
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
      
      {/* 🚀 GLOBAL POPUP */}
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

// --- APP CONTENT COMPONENT ---
const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Navbar /> {/* 💡 സെപ്പറേറ്റ് ഫയലിൽ നിന്നുള്ള Navbar ഇവിടെ വർക്ക് ചെയ്യും */}
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
          <Route path="/how-it-works" element={<HowItWorks />} />
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
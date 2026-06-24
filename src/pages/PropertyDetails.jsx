import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, IndianRupee, Bed, Bath, 
  Sparkles, Check, Info, ShieldCheck, MessageSquare, 
  Send, X, Phone, Video 
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall'; 

const BACKEND_URL = 'http://localhost:5000'; 

const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '';
  if (imagePath.startsWith('http')) return imagePath; 
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
  return `${BACKEND_URL}/${cleanPath}`; 
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const socket = useSocket();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  // Call States
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('audio');
  const [incomingCallData, setIncomingCallData] = useState(null);

  const isCallingRef = useRef(isCalling);

  useEffect(() => {
    isCallingRef.current = isCalling;
  }, [isCalling]);

  const ownerId = property?.owner?._id || property?.ownerId || property?.owner;
  const callTargetId = incomingCallData ? (incomingCallData.from?._id || incomingCallData.from) : ownerId;

  // 🚀 FIX 1: പ്രോപ്പർട്ടി ഓണർ തന്നെയാണോ ലോഗിൻ ചെയ്തിരിക്കുന്നത് എന്ന് ചെക്ക് ചെയ്യുന്നു
  const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));

  // Fetch Property Details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setFetchError(false);
        const res = await apiRequest(`/properties/${id}`); 
        const resData = await res.json();

        if (res.ok) {
          const actualData = resData.data || resData;
          setProperty(actualData);
          setSelectedRoomIndex(0); 
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // Fetch Chat History
  useEffect(() => {
    if (!isChatOpen || !ownerId || !currentUserId) return;

    const fetchChatHistory = async () => {
      try {
        const res = await apiRequest(`/messages/${ownerId}`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          if (resData.data && resData.data.length > 0) {
            setMessages(resData.data);
          } else {
            setMessages([
              { id: 'welcome', sender: 'owner', text: 'Hello! Thank you for showing interest in my property. How can I help you today?' }
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchChatHistory();
  }, [isChatOpen, ownerId, currentUserId]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !ownerId) return;

    const receiveMessageHandler = (data) => {
      const msgSenderId = data.senderId?._id || data.senderId;
      if (String(msgSenderId) === String(ownerId)) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const incomingCallHandler = (data) => {
      if (!isCallingRef.current) {
        setIncomingCallData(data);
      }
    };

    socket.on('receive-message', receiveMessageHandler);
    socket.on('incoming-call', incomingCallHandler);

    return () => {
      socket.off('receive-message', receiveMessageHandler);
      socket.off('incoming-call', incomingCallHandler);
    };
  }, [socket, ownerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!user) {
      alert("Please login to send messages.");
      return;
    }

    try {
      const res = await apiRequest('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: id,
          receiverId: ownerId,
          text: newMessage
        })
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        const savedMessage = resData.data;
        if (socket) socket.emit('send-message', savedMessage);
        setMessages((prev) => [...prev, savedMessage]);
        setNewMessage('');
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 🚀 FIX 3: കോൾ വർക്ക് ആവാൻ കോൾ സ്റ്റാർട്ട് ചെയ്യുമ്പോൾ ചാറ്റ് വിൻഡോ ക്ലോസ് ചെയ്യുന്നു
  const handleStartCall = (type) => {
    if (!user) {
      alert("Please login to call the owner.");
      return;
    }
    setCallType(type);
    setIsCalling(true);
    setIsChatOpen(false); // Close chat to avoid overlapping UI
  };

  // End Call
  const handleEndCall = async (duration) => {
    setIsCalling(false);
    setIncomingCallData(null);

    try {
      const res = await apiRequest('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: id,
          receiverId: callTargetId,
          messageType: 'call',
          callDetails: { callType, duration }
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        const savedMessage = resData.data;
        if (socket) socket.emit('send-message', savedMessage);
        setMessages((prev) => [...prev, savedMessage]);
      }
    } catch (error) {
      console.error("Error saving call log:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <p className="text-slate-500 font-medium">Property not found. Please check the URL or try again.</p>
        <button onClick={() => navigate('/')} className="text-sm font-bold bg-slate-950 text-white px-4 py-2 rounded-xl">Go Home</button>
      </div>
    );
  }

  const getRoomList = () => {
    let list = [];
    if (property.houseImage || property.image) {
      list.push({ 
        roomType: 'Main View', 
        imageUrl: property.houseImage || property.image,
        description: property.description || 'Main structural overview of the verified property.'
      });
    }
    if (property.rooms && property.rooms.length > 0) {
      list = [...list, ...property.rooms];
    }
    return list;
  };

  const roomList = getRoomList();
  const activeRoom = roomList[selectedRoomIndex] || roomList[0] || {};
  const activeImageUrl = getImageUrl(activeRoom.imageUrl);
  const ownerData = property.owner || {};

  return (
    <div className="min-h-screen bg-white pb-16 font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* VIDEO/AUDIO CALL COMPONENT */}
      {isCalling && (
        <div className="fixed inset-0 z-[9999]">
          <VideoCall 
            socket={socket}
            currentUserId={currentUserId}
            activeChatId={callTargetId} 
            callType={callType}
            incomingSignal={incomingCallData?.signal || null}
            onEndCall={handleEndCall}
          />
        </div>
      )}

      {/* INCOMING CALL MODAL */}
      {incomingCallData && !isCalling && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl text-center shadow-2xl animate-bounce w-full max-w-sm">
            <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 animate-pulse">
              {callTargetId ? String(callTargetId).slice(-2).toUpperCase() : 'CU'}
            </div>
            <h3 className="text-xl font-bold mb-2">Incoming {incomingCallData.callType} Call</h3>
            <p className="text-slate-500 mb-6">User is calling you...</p>
            {/* 🚀 FIX 2: മൊബൈലിലും ഭംഗിയായി കാണാൻ flex-col sm:flex-row കൊടുത്തു */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => { setCallType(incomingCallData.callType); setIsCalling(true); }} 
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={() => { setIncomingCallData(null); if (socket) socket.emit('end-call', { to: callTargetId }); }} 
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          ID: #{property._id?.substring(0, 8)}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="relative bg-slate-100 rounded-2xl overflow-hidden h-[260px] md:h-[460px] flex-shrink-0 group border border-slate-200 shadow-xs">
              {activeImageUrl ? (
                <img 
                  src={activeImageUrl} alt={activeRoom.roomType || "Property Core"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle' dy='.3em'%3EImage Not Found on Server%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-50">No Image Uploaded</div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeRoom.description && (
                <motion.div 
                  key={selectedRoomIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1.5">
                    <Sparkles size={14} className="animate-pulse" /> What makes the {activeRoom.roomType || 'room'} special:
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
                    {activeRoom.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto h-auto lg:h-[460px] content-start pb-2 lg:pb-0 pr-1 snap-x">
            {roomList.map((room, idx) => {
              const currentImgUrl = getImageUrl(room.imageUrl);
              const isSelected = selectedRoomIndex === idx;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRoomIndex(idx)} 
                  className={`relative h-20 w-28 sm:w-36 lg:w-full flex-shrink-0 snap-start rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-slate-100 ${
                    isSelected ? 'border-slate-900 scale-95 shadow-sm ring-2 ring-slate-900/50' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={currentImgUrl} alt={room.roomType || 'Room'} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-md line-clamp-1">{room.roomType || `Image ${idx + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-slate-100 text-slate-800 px-2.5 py-1 rounded">{property.type || 'Property'}</span>
              {property.status === 'approved' && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded"><ShieldCheck size={12} /> Verified</span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">{property.title}</h1>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-500"><MapPin size={16} className="text-slate-400" /> {property.location}</p>
            <div className="flex items-center gap-6 pt-2 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-2 text-slate-700"><div className="p-2 bg-slate-50 rounded-lg"><Bed size={18} /></div><span className="text-sm font-bold">{property.bedrooms || property.bhk || 0} Beds</span></div>
              <div className="flex items-center gap-2 text-slate-700"><div className="p-2 bg-slate-50 rounded-lg"><Bath size={18} /></div><span className="text-sm font-bold">{property.bathrooms || 0} Baths</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Info size={14} /> Description</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">{property.description || 'No description provided for this property.'}</p>
          </div>
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Sparkles size={14} /> Amenities Offered</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Check size={14} className="text-emerald-600 stroke-[3]" />
                    <span className="text-xs font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="lg:col-span-1">
          <div className="border border-slate-150 rounded-2xl p-6 shadow-xs bg-white sticky top-6 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rent / Month</span>
              <div className="flex items-center text-slate-950">
                <IndianRupee size={22} className="stroke-[2.5]" />
                <span className="text-2xl font-black tracking-tight">{Number(property.price) ? Number(property.price).toLocaleString('en-IN') : property.price}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">{(property.ownerName || ownerData.name || 'O').charAt(0)}</div>
              <div>
                <p className="text-xs font-bold text-slate-400">Listed By</p>
                <p className="text-sm font-black text-slate-800">{property.ownerName || ownerData.name || 'Owner'}</p>
              </div>
            </div>

            {/* 🚀 FIX 1 & 2: ഓണർക്ക് ഈ കോൺടാക്ട് ബട്ടണുകൾ കാണിക്കില്ല. അല്ലാത്തവർക്ക് ഇത് മൊബൈലിലും ഗ്രിഡ് ആയി കാണിക്കും */}
            {!isOwner ? (
              <div className="space-y-2.5">
                <button onClick={() => setIsChatOpen(true)} className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-slate-950/10">
                  <MessageSquare size={16} /> Chat With Owner
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleStartCall('audio')} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-2 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Phone size={16} /> Audio Call
                  </button>
                  <button onClick={() => handleStartCall('video')} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-2 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Video size={16} /> Video Call
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold py-3 px-4 rounded-xl text-center text-sm">
                This is your property
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIVE CHAT BOX */}
      <AnimatePresence>
        {isChatOpen && !isOwner && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-xs" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-[100] shadow-2xl flex flex-col border-l border-slate-100">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs border border-slate-700">
                    {(property.ownerName || ownerData.name || 'O').charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black">{property.ownerName || ownerData.name || 'Owner'}</h4>
                    <p className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleStartCall('audio')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"><Phone size={16} /></button>
                  <button onClick={() => handleStartCall('video')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"><Video size={16} /></button>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white ml-2"><X size={18} /></button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                <div className="text-center"><span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 line-clamp-1">Inquiry regarding: {property.title}</span></div>
                {messages.map((msg, index) => {
                  const msgSenderId = msg.senderId?._id || msg.senderId;
                  const isMyMessage = msg.sender === 'user' || (msgSenderId && String(msgSenderId) === String(currentUserId));

                  return (
                    <div key={msg._id || msg.id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-2xs ${isMyMessage ? 'bg-slate-950 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                        {msg.messageType === 'call' ? (
                          <div className="flex items-center gap-2">
                            {msg.callDetails?.callType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                            <span>{msg.callDetails?.callType} Call ended ({msg.callDetails?.duration || 0}s)</span>
                          </div>
                        ) : (<p>{msg.text}</p>)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition-colors" />
                <button type="submit" className="p-2.5 bg-slate-950 text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center shadow-xs"><Send size={14} /></button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PropertyDetails;
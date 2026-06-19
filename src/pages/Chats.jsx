import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, MoreVertical, MessageSquare, CheckCheck, ArrowLeft, PhoneOff, PhoneIncoming } from 'lucide-react';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

// വീഡിയോ കോൾ കോംപോണന്റ്
import VideoCall from '../components/VideoCall';

const Chats = () => {
  const socket = useSocket();
  const { user } = useAuth(); 
  
  const currentUserId = user ? (user._id || user.id || user).toString().trim() : '';

  const [contacts, setContacts] = useState([]); 
  const [chatHistory, setChatHistory] = useState({}); 
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // WebRTC Calling State
  const [callData, setCallData] = useState({
    isActive: false,      
    isReceiving: false,   
    signal: null,         
    partnerId: null,      
    callType: 'video'     
  });

  const messagesEndRef = useRef(null);
  const activeChatIdRef = useRef(null);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserId = (userObj) => {
    if (!userObj) return '';
    if (typeof userObj === 'object') {
      return (userObj._id || userObj.id || '').toString().trim();
    }
    return userObj.toString().trim();
  };

  const activeChatId = activeChat ? getUserId(activeChat) : null;

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return;
      try {
        const res = await apiRequest('/messages/conversations', { method: 'GET' });
        const data = await res.json();
        // ബാക്കെൻഡിൽ നിന്ന് unreadCount വരുന്നുണ്ടെങ്കിൽ അത് ഇവിടെ ലഭിക്കും
        if (data.success) setContacts(data.data);
      } catch (err) { console.error("Error fetching conversations:", err); }
    };
    fetchConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!activeChatId || !currentUserId) return;
    
    const fetchMessages = async () => {
      try {
        const res = await apiRequest(`/messages/${activeChatId}`, { method: 'GET' });
        const data = await res.json();
        if (data.success) {
          setChatHistory(prev => ({ ...prev, [activeChatId]: data.data }));
          
          if (socket) {
            socket.emit('mark-messages-read', { senderId: activeChatId, receiverId: currentUserId });
          }
        }
      } catch (err) { console.error("Error fetching messages:", err); }
    };

    fetchMessages();
  }, [activeChatId, currentUserId, socket]);

  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleReceiveMessage = (message) => {
      const msgSenderId = getUserId(message.senderId || message.sender);
      const msgReceiverId = getUserId(message.receiverId || message.receiver);
      const otherUserId = msgSenderId === currentUserId ? msgReceiverId : msgSenderId;

      setChatHistory((prevHistory) => {
        const existingMessages = prevHistory[otherUserId] || [];
        if (existingMessages.some(msg => getUserId(msg) === getUserId(message))) return prevHistory;
        return { ...prevHistory, [otherUserId]: [...existingMessages, message] };
      });

      setContacts((prevContacts) => {
        const filtered = prevContacts.filter((c) => getUserId(c) !== otherUserId);
        const existing = prevContacts.find((c) => getUserId(c) === otherUserId);
        
        // 🟢 ലൈവ് ആയി മെസ്സേജ് വരുമ്പോൾ Unread Count കൂട്ടാനുള്ള ലോജിക്
        const isChatOpen = activeChatIdRef.current === otherUserId;
        const currentUnreadCount = existing?.unreadCount || 0;
        const newUnreadCount = isChatOpen ? 0 : currentUnreadCount + 1;

        const updatedContact = existing 
          ? { 
              ...existing, 
              lastMessage: message.text, 
              time: 'Just now',
              unreadCount: newUnreadCount // 👈 Unread Count അപ്ഡേറ്റ് ചെയ്യുന്നു
            }
          : { 
              _id: otherUserId, 
              name: message.senderName || 'User', 
              lastMessage: message.text, 
              time: 'Just now',
              unreadCount: 1 // 👈 പുതിയ ആൾ ആണെങ്കിൽ Count 1 ആക്കുന്നു
            };

        return [updatedContact, ...filtered];
      });

      if (activeChatIdRef.current === otherUserId) {
        socket.emit('mark-messages-read', { senderId: otherUserId, receiverId: currentUserId });
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      setChatHistory((prev) => {
        const updatedHistory = { ...prev };
        if (updatedHistory[readerId]) {
          updatedHistory[readerId] = updatedHistory[readerId].map(msg => 
            msg.status !== 'read' ? { ...msg, status: 'read' } : msg
          );
        }
        return updatedHistory;
      });
    };

    const handleIncomingCall = (data) => {
      setCallData({ 
        isActive: false, 
        isReceiving: true, 
        signal: data.signal, 
        partnerId: data.from,
        callType: data.callType || 'video'
      });
    };

    const handleCallEnded = () => {
      setCallData({ isActive: false, isReceiving: false, signal: null, partnerId: null, callType: 'video' });
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messages-read', handleMessagesRead);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messages-read', handleMessagesRead);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeChatId]);

  // 🟢 ചാറ്റ് സെലക്ട് ചെയ്യുമ്പോൾ Unread Count ക്ലിയർ ചെയ്യാനുള്ള ഫങ്ഷൻ
  const handleSelectChat = (contact) => {
    setActiveChat(contact);
    const contactId = getUserId(contact);
    
    setContacts(prevContacts => 
      prevContacts.map(c => 
        getUserId(c) === contactId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !activeChatId) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: activeChatId,
      text: newMessage,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    setChatHistory((prev) => ({
      ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage]
    }));
    setNewMessage(''); 

    try {
      const response = await apiRequest('/messages', {
        method: 'POST',
        body: { receiverId: activeChatId, text: tempMessage.text }
      });

      const data = await response.json();

      if (data.success) {
        const savedMessage = {
          ...data.data,
          senderId: currentUserId 
        };

        if (socket) socket.emit('send-message', savedMessage);

        setChatHistory((prev) => ({
          ...prev,
          [activeChatId]: prev[activeChatId].map(msg => msg._id === tempId ? savedMessage : msg)
        }));
      }
    } catch (error) { console.error("Error sending message:", error); }
  };

  const handleStartCall = (type = 'video') => {
    if (!socket || !activeChatId) return;
    setCallData({ isActive: true, isReceiving: false, signal: null, partnerId: activeChatId, callType: type });
  };

  const handleAcceptCall = () => {
    setCallData((prev) => ({ ...prev, isActive: true, isReceiving: false }));
  };

  const handleEndOrRejectCall = () => {
    if (socket && callData.partnerId) {
      socket.emit('end-call', { to: callData.partnerId });
    }
    setCallData({ isActive: false, isReceiving: false, signal: null, partnerId: null, callType: 'video' });
  };

  const filteredContacts = contacts.filter(contact => 
    (contact.name || 'User').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = activeChatId ? (chatHistory[activeChatId] || []) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-100px)]">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex h-full overflow-hidden relative">
        
        {/* ==================== 📞 INCOMING CALL SCREEN ==================== */}
        {callData.isReceiving && !callData.isActive && (
          <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center text-white animate-fade-in">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_20px_rgba(22,163,74,0.5)]">
              {callData.callType === 'audio' ? <PhoneIncoming size={40} /> : <Video size={40} />}
            </div>
            <h2 className="text-3xl font-bold">Incoming {callData.callType === 'audio' ? 'Audio' : 'Video'} Call...</h2>
            <div className="flex gap-8 mt-12">
              <button onClick={handleAcceptCall} className="p-5 bg-green-500 hover:bg-green-600 rounded-full transition-transform transform hover:scale-110 shadow-lg flex flex-col items-center gap-2">
                <Phone size={28} />
              </button>
              <button onClick={handleEndOrRejectCall} className="p-5 bg-red-600 hover:bg-red-700 rounded-full transition-transform transform hover:scale-110 shadow-lg flex flex-col items-center gap-2">
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 📞 ACTIVE CALL COMPONENT ==================== */}
        {callData.isActive && (
          <VideoCall 
            socket={socket} 
            currentUserId={currentUserId} 
            activeChatId={callData.partnerId} 
            incomingSignal={callData.signal} 
            onEndCall={handleEndOrRejectCall}
            callType={callData.callType} 
          />
        )}

        {/* --- LEFT SIDEBAR (CONTACTS) --- */}
        <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 space-y-3">
            <h2 className="text-xl font-black text-slate-800">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Search chats..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none placeholder-gray-400 focus:bg-gray-200/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const contactId = getUserId(contact);
              const isChatActive = activeChatId === contactId;
              return (
                // 🟢 onClick ഇവിടെ മാറ്റിയിട്ടുണ്ട് (പുതിയ ഫങ്ഷൻ കൊടുത്തിരിക്കുന്നു)
                <div key={contactId} onClick={() => handleSelectChat(contact)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${isChatActive ? 'bg-green-50 text-green-900' : 'hover:bg-white'}`}>
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                    {contact.name ? contact.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{contact.name || 'User'}</h3>
                    <p className="text-xs text-gray-500 truncate">{contact.lastMessage || 'No messages yet'}</p>
                  </div>
                  
                  {/* 🟢 പുതിയ Unread Badge UI */}
                  {contact.unreadCount > 0 && (
                    <div className="bg-green-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0 shadow-sm">
                      {contact.unreadCount}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT PANEL (CHAT BOX) --- */}
        <div className={`flex-1 flex-col bg-white ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* ചാറ്റ് ഹെഡർ */}
              <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                    {activeChat.name ? activeChat.name.charAt(0) : 'U'}
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{activeChat.name || 'User'}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <button onClick={() => handleStartCall('audio')} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Audio Call">
                    <Phone size={20} />
                  </button>
                  <button onClick={() => handleStartCall('video')} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Video Call">
                    <Video size={20} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Chat background layout */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#efeae2] space-y-4">
                {currentMessages.map((msg) => {
                  const msgSenderId = getUserId(msg.senderId || msg.sender);
                  const isMyMessage = msgSenderId === currentUserId;
                  const tickColor = msg.status === 'read' ? 'text-[#53bdeb]' : 'text-gray-400';
                  
                  return (
                    <div key={msg._id || Math.random().toString()} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-1.5 shadow-sm ${
                        isMyMessage 
                          ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none'   
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className="flex justify-end items-center gap-1 text-[10px] opacity-70 mt-0.5">
                          {msg.time || formatTime(msg.createdAt)} 
                          {isMyMessage && <CheckCheck size={14} className={tickColor} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ഇൻപുട്ട് ബാർ */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#f0f2f5] flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm outline-none shadow-sm" />
                <button type="submit" className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-sm"><Send size={18} /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] text-gray-500">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chats;
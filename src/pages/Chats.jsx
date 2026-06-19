import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Send, Phone, Video, MoreVertical, MessageSquare, 
  CheckCheck, ArrowLeft, PhoneOff, PhoneIncoming, 
  Home as HomeIcon, User, Paperclip, Smile
} from 'lucide-react';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

// വീഡിയോ കോൾ കോംപോണന്റ്
import VideoCall from '../components/VideoCall';

const Chats = () => {
  const navigate = useNavigate();
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
        
        const isChatOpen = activeChatIdRef.current === otherUserId;
        const currentUnreadCount = existing?.unreadCount || 0;
        const newUnreadCount = isChatOpen ? 0 : currentUnreadCount + 1;

        const updatedContact = existing 
          ? { 
              ...existing, 
              lastMessage: message.text, 
              time: 'Just now',
              unreadCount: newUnreadCount 
            }
          : { 
              _id: otherUserId, 
              name: message.senderName || 'User', 
              lastMessage: message.text, 
              time: 'Just now',
              unreadCount: 1 
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
    <div className={`max-w-[1600px] mx-auto md:py-4 h-[100dvh] md:h-screen bg-[#0a1014] ${!activeChat ? 'pb-[60px] md:pb-0' : ''}`}>
      <div className="bg-[#111b21] md:rounded-md shadow-lg flex h-full overflow-hidden relative border-none">
        
        {/* ==================== 📞 INCOMING CALL SCREEN ==================== */}
        {callData.isReceiving && !callData.isActive && (
          <div className="absolute inset-0 bg-[#0b141a]/95 z-50 flex flex-col items-center justify-center text-[#e9edef] animate-fade-in">
            <div className="w-24 h-24 bg-[#00a884] rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_20px_rgba(0,168,132,0.5)]">
              {callData.callType === 'audio' ? <PhoneIncoming size={40} /> : <Video size={40} />}
            </div>
            <h2 className="text-3xl font-bold text-[#e9edef]">Incoming {callData.callType === 'audio' ? 'Audio' : 'Video'} Call...</h2>
            <div className="flex gap-8 mt-12">
              <button onClick={handleAcceptCall} className="p-5 bg-[#00a884] hover:bg-[#029173] rounded-full transition-transform transform hover:scale-110 shadow-lg text-white">
                <Phone size={28} />
              </button>
              <button onClick={handleEndOrRejectCall} className="p-5 bg-red-500 hover:bg-red-600 rounded-full transition-transform transform hover:scale-110 shadow-lg text-white">
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
        <div className={`w-full md:w-[30%] lg:w-[35%] border-r border-[#222d34] flex flex-col bg-[#111b21] ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="bg-[#202c33] p-3.5 flex justify-between items-center text-[#aebac1]">
             <h2 className="text-[20px] font-semibold text-[#e9edef]">Chats</h2>
             <div className="flex gap-4">
                <MessageSquare size={20} className="cursor-pointer hover:text-[#e9edef] transition-colors" />
                <MoreVertical size={20} className="cursor-pointer hover:text-[#e9edef] transition-colors" />
             </div>
          </div>

          {/* Search Bar */}
          <div className="p-2 border-b border-[#202c33]">
            <div className="bg-[#202c33] flex items-center rounded-lg px-3 py-1.5 gap-3">
              <Search className="text-[#8696a0]" size={18} />
              <input 
                type="text" placeholder="Search or start new chat" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#e9edef] text-[15px] outline-none placeholder-[#8696a0]"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto style-scrollbar">
            {filteredContacts.map((contact) => {
              const contactId = getUserId(contact);
              const isChatActive = activeChatId === contactId;
              return (
                <div key={contactId} onClick={() => handleSelectChat(contact)}
                  className={`flex items-center px-3 py-3 cursor-pointer transition-colors ${isChatActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}>
                  <div className="w-12 h-12 bg-[#6b7c85] text-[#e9edef] rounded-full flex items-center justify-center font-bold uppercase shrink-0 mr-3">
                    {contact.name ? contact.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1 min-w-0 border-b border-[#222d34] pb-3 -mb-3 flex justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-[16px] text-[#e9edef] truncate">{contact.name || 'User'}</h3>
                      <p className={`text-[14px] truncate ${contact.unreadCount > 0 ? 'text-[#e9edef] font-medium' : 'text-[#8696a0]'}`}>
                        {contact.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[12px] ${contact.unreadCount > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                        {/* Time Logic Placeholder */} 12:00
                      </span>
                      {contact.unreadCount > 0 && (
                        <div className="bg-[#00a884] text-[#111b21] text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT PANEL (CHAT BOX) --- */}
        <div className={`flex-1 flex-col bg-[#222d34] ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* ചാറ്റ് ഹെഡർ */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#202c33] z-10 border-l border-[#222d34]">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-1 -ml-2 text-[#aebac1] hover:bg-[#2a3942] rounded-full">
                    <ArrowLeft size={24} />
                  </button>
                  <div className="w-10 h-10 bg-[#6b7c85] text-[#e9edef] rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                    {activeChat.name ? activeChat.name.charAt(0) : 'U'}
                  </div>
                  <div>
                     <h3 className="text-[16px] text-[#e9edef] font-medium">{activeChat.name || 'User'}</h3>
                     <p className="text-[13px] text-[#8696a0]">tap here for contact info</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#aebac1]">
                  <button onClick={() => handleStartCall('video')} className="hover:text-[#e9edef] transition-colors" title="Video Call">
                    <Video size={20} />
                  </button>
                  <button onClick={() => handleStartCall('audio')} className="hover:text-[#e9edef] transition-colors" title="Audio Call">
                    <Phone size={20} />
                  </button>
                  <button className="hover:text-[#e9edef] transition-colors">
                    <Search size={20} />
                  </button>
                  <button className="hover:text-[#e9edef] transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Background */}
              {/* Using WhatsApp default dark background color #0b141a */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0b141a] space-y-2 relative" 
                   style={{ backgroundImage: 'radial-gradient(circle at center, #111b21 0%, #0b141a 100%)' }}>
                {currentMessages.map((msg) => {
                  const msgSenderId = getUserId(msg.senderId || msg.sender);
                  const isMyMessage = msgSenderId === currentUserId;
                  const tickColor = msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]';
                  
                  return (
                    <div key={msg._id || Math.random().toString()} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[85%] sm:max-w-[65%] px-3 py-1.5 text-[15px] shadow-sm relative group ${
                        isMyMessage 
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none' 
                          : 'bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none'   
                      }`}>
                        <div className="flex flex-wrap items-end gap-2">
                          <span className="leading-relaxed whitespace-pre-wrap break-words pb-1 pr-10">
                            {msg.text}
                          </span>
                          <span className="text-[11px] text-[#8696a0] flex items-center gap-1 absolute bottom-1 right-2">
                            {msg.time || formatTime(msg.createdAt)} 
                            {isMyMessage && <CheckCheck size={16} className={tickColor} />}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ഇൻപുട്ട് ബാർ */}
              <form onSubmit={handleSendMessage} className="px-4 py-3 bg-[#202c33] flex items-center gap-3 pb-safe">
                <Smile size={26} className="text-[#aebac1] cursor-pointer hover:text-[#e9edef] shrink-0" />
                <Paperclip size={24} className="text-[#aebac1] cursor-pointer hover:text-[#e9edef] shrink-0" />
                <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2.5 flex items-center">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message" className="w-full bg-transparent text-[#e9edef] text-[15px] outline-none placeholder-[#8696a0]" />
                </div>
                {newMessage.trim() ? (
                  <button type="submit" className="p-2.5 bg-[#00a884] text-[#111b21] rounded-full hover:bg-[#029173] transition-colors shrink-0">
                    <Send size={20} className="ml-1" />
                  </button>
                ) : (
                  <button type="button" className="p-2.5 text-[#aebac1] hover:text-[#e9edef] transition-colors shrink-0">
                     {/* Microphone Icon Placeholder */}
                     <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path></svg>
                  </button>
                )}
              </form>
            </>
          ) : (
            // Empty State (No Chat Selected)
            <div className="flex-1 flex flex-col items-center justify-center bg-[#222d34] text-[#8696a0] border-l border-[#222d34]">
              <div className="text-center max-w-sm px-6">
                <div className="flex justify-center mb-6">
                   <div className="w-[320px] h-[160px] bg-[#2a3942] rounded-2xl flex items-center justify-center text-[#e9edef]/20">
                      <MessageSquare size={64} />
                   </div>
                </div>
                <h2 className="text-3xl font-light text-[#e9edef] mb-4">WhatsApp for Web</h2>
                <p className="text-[14px] leading-relaxed">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      {!activeChat && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111b21] border-t border-[#202c33] px-6 py-3 flex justify-between items-center pb-safe">
          <button onClick={() => navigate('/')} className="flex flex-col items-center w-16 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <HomeIcon size={24} className="mb-1" />
            <span className="text-[11px] font-medium">Home</span>
          </button>
          
          <button onClick={() => navigate('/chats')} className="flex flex-col items-center w-16 text-[#00a884] transition-colors relative">
            <MessageSquare size={24} className="mb-1 fill-[#00a884]/20" />
            <span className="text-[11px] font-medium">Chats</span>
          </button>
          
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center w-16 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <User size={24} className="mb-1" />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Chats;
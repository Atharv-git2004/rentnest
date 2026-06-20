import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Send, Phone, Video, MessageSquare, 
  CheckCheck, ArrowLeft, PhoneOff, PhoneIncoming, 
  Home as HomeIcon, User, Paperclip, Smile, Sun, Moon,
  Clock, PhoneMissed
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
  
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 📞 WebRTC Calling State
  const [callData, setCallData] = useState({
    isActive: false,      
    isReceiving: false,   
    signal: null,         
    partnerId: null,      
    callType: 'video',
    startTime: null 
  });

  const messagesEndRef = useRef(null);
  const activeChatIdRef = useRef(null);

  const theme = isDarkMode ? {
    appBg: 'bg-[#0a1014]', panelBg: 'bg-[#111b21]', headerBg: 'bg-[#202c33]', chatBg: 'bg-[#0b141a]',
    textPrimary: 'text-[#e9edef]', textSecondary: 'text-[#8696a0]', border: 'border-[#222d34]',
    hover: 'hover:bg-[#202c33]', active: 'bg-[#2a3942]', inputBar: 'bg-[#202c33]', inputBg: 'bg-[#2a3942]',
    msgMine: 'bg-[#005c4b] text-[#e9edef]', msgOther: 'bg-[#202c33] text-[#e9edef]',
    iconColor: 'text-[#aebac1]', iconHover: 'hover:text-[#e9edef]',
    dropdownBg: 'bg-[#233138] shadow-[0_2px_5px_0_rgba(11,20,26,.26),0_2px_10px_0_rgba(11,20,26,.16)]',
    emptyStateBg: 'bg-[#222d34]'
  } : {
    appBg: 'bg-[#d1d7db]', panelBg: 'bg-[#ffffff]', headerBg: 'bg-[#f0f2f5]', chatBg: 'bg-[#efeae2]',
    textPrimary: 'text-[#111b21]', textSecondary: 'text-[#667781]', border: 'border-[#d1d7db]',
    hover: 'hover:bg-[#f5f6f6]', active: 'bg-[#ebebeb]', inputBar: 'bg-[#f0f2f5]', inputBg: 'bg-[#ffffff]',
    msgMine: 'bg-[#d9fdd3] text-[#111b21]', msgOther: 'bg-[#ffffff] text-[#111b21]',
    iconColor: 'text-[#54656f]', iconHover: 'hover:text-[#111b21]',
    dropdownBg: 'bg-[#ffffff] shadow-[0_2px_5px_0_rgba(11,20,26,.26),0_2px_10px_0_rgba(11,20,26,.16)]',
    emptyStateBg: 'bg-[#f0f2f5]'
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserId = (userObj) => {
    if (!userObj) return '';
    if (typeof userObj === 'object') return (userObj._id || userObj.id || '').toString().trim();
    return userObj.toString().trim();
  };

  const activeChatId = activeChat ? getUserId(activeChat) : null;

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

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
          if (socket) socket.emit('mark-messages-read', { senderId: activeChatId, receiverId: currentUserId });
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

        let lastMsgText = message.text;
        // 💡 Ensure call message shows in contact list properly
        if (message.messageType === 'call' || (message.callDetails && Object.keys(message.callDetails).length > 0)) {
          lastMsgText = message.callDetails?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call';
        }

        const updatedContact = existing 
          ? { ...existing, lastMessage: lastMsgText, time: 'Just now', unreadCount: newUnreadCount }
          : { _id: otherUserId, name: message.senderName || 'User', lastMessage: lastMsgText, time: 'Just now', unreadCount: 1 };

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
        callType: data.callType || 'video',
        startTime: null
      });
    };

    const handleCallEnded = () => {
      // If partner ended call before we answered
      if(callData.isReceiving && !callData.isActive) {
          saveCallLogToDb(callData.partnerId, callData.callType, 'missed', 0);
      }
      setCallData({ isActive: false, isReceiving: false, signal: null, partnerId: null, callType: 'video', startTime: null });
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
  }, [socket, currentUserId, callData]); // 💡 Added callData to dependency array to get latest state in handleCallEnded

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeChatId]);

  const handleSelectChat = (contact) => {
    setActiveChat(contact);
    const contactId = getUserId(contact);
    setContacts(prevContacts => 
      prevContacts.map(c => getUserId(c) === contactId ? { ...c, unreadCount: 0 } : c)
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
      messageType: 'text',
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
        body: { receiverId: activeChatId, text: tempMessage.text, messageType: 'text' }
      });
      const data = await response.json();

      if (data.success) {
        const savedMessage = { ...data.data, senderId: currentUserId };
        if (socket) socket.emit('send-message', savedMessage);
        setChatHistory((prev) => ({
          ...prev,
          [activeChatId]: prev[activeChatId].map(msg => msg._id === tempId ? savedMessage : msg)
        }));
      }
    } catch (error) { console.error("Error sending message:", error); }
  };

  // 📞 START CALL
  const handleStartCall = (type = 'video') => {
    if (!socket || !activeChatId) return;
    setCallData({ isActive: true, isReceiving: false, signal: null, partnerId: activeChatId, callType: type, startTime: new Date() });
  };

  // 📞 ACCEPT CALL
  const handleAcceptCall = () => {
    setCallData((prev) => ({ ...prev, isActive: true, isReceiving: false, startTime: new Date() }));
  };

  // 💡 Helper function to save call log
  const saveCallLogToDb = async (partnerId, callType, callStatus, durationInSeconds, startTime) => {
    if (!partnerId || !currentUserId) return;
    
    // Create temp message for instant UI update
    const tempId = Date.now().toString();
    const tempCallMessage = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: partnerId,
      text: callType === 'video' ? '📹 Video Call' : '📞 Audio Call',
      messageType: 'call',
      callDetails: {
         callType: callType,
         status: callStatus,
         duration: durationInSeconds
      },
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    // Update UI instantly
    setChatHistory((prev) => ({
      ...prev, [partnerId]: [...(prev[partnerId] || []), tempCallMessage]
    }));

    try {
      const response = await apiRequest('/messages', {
        method: 'POST',
        body: { 
          receiverId: partnerId, 
          text: callType === 'video' ? '📹 Video Call' : '📞 Audio Call',
          messageType: 'call',
          callDetails: {
            callType: callType,
            status: callStatus,
            startTime: startTime || new Date(),
            endTime: new Date(),
            duration: durationInSeconds
          }
        }
      });
      const data = await response.json();
      if (data.success) {
        const savedLog = { ...data.data, senderId: currentUserId };
        if (socket) socket.emit('send-message', savedLog);
        
        // Replace temp message with actual saved message
        setChatHistory((prev) => ({
          ...prev, 
          [partnerId]: prev[partnerId].map(msg => msg._id === tempId ? savedLog : msg)
        }));
      }
    } catch (error) {
      console.error("Error saving call log:", error);
    }
  };

  // 📞 END OR REJECT CALL
  const handleEndOrRejectCall = () => {
    let durationInSeconds = 0;
    const endTime = new Date();

    if (callData.startTime && callData.isActive) {
      durationInSeconds = Math.floor((endTime - callData.startTime) / 1000);
    }
    
    const callStatus = callData.isActive ? 'completed' : 'missed';

    if (socket && callData.partnerId) {
      socket.emit('end-call', { to: callData.partnerId });
    }

    // Save log
    if(callData.partnerId) {
       saveCallLogToDb(callData.partnerId, callData.callType, callStatus, durationInSeconds, callData.startTime);
    }

    setCallData({ isActive: false, isReceiving: false, signal: null, partnerId: null, callType: 'video', startTime: null });
  };

  const filteredContacts = contacts.filter(contact => 
    (contact.name || 'User').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = activeChatId ? (chatHistory[activeChatId] || []) : [];

  return (
    <div className={`flex w-full h-[100dvh] md:h-screen md:p-4 justify-center ${theme.appBg} transition-colors duration-300`}>
      <div className={`flex w-full max-w-[1600px] h-full ${theme.panelBg} md:rounded-xl shadow-xl overflow-hidden relative`}>
        
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
        <div className={`flex flex-col w-full md:w-[350px] lg:w-[400px] h-full border-r ${theme.border} ${theme.panelBg} ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className={`${theme.headerBg} p-3.5 flex justify-between items-center ${theme.iconColor} shrink-0`}>
             <h2 className={`text-[20px] font-semibold ${theme.textPrimary}`}>Chats</h2>
             <div className="flex items-center gap-3">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 ${theme.iconHover} rounded-full transition-colors`} title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <MessageSquare size={20} className={`cursor-pointer ${theme.iconHover} transition-colors`} />
             </div>
          </div>

          <div className={`p-2 border-b ${theme.border} shrink-0`}>
            <div className={`${theme.headerBg} flex items-center rounded-lg px-3 py-1.5 gap-3`}>
              <Search className={theme.textSecondary} size={18} />
              <input type="text" placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent ${theme.textPrimary} text-[15px] outline-none placeholder:text-opacity-70`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto style-scrollbar">
            {filteredContacts.map((contact) => {
              const contactId = getUserId(contact);
              const isChatActive = activeChatId === contactId;
              return (
                <div key={contactId} onClick={() => handleSelectChat(contact)} className={`flex items-center px-3 py-3 cursor-pointer transition-colors ${isChatActive ? theme.active : theme.hover}`}>
                  <div className="w-12 h-12 bg-[#6b7c85] text-[#e9edef] rounded-full flex items-center justify-center font-bold uppercase shrink-0 mr-3">
                    {contact.name ? contact.name.charAt(0) : 'U'}
                  </div>
                  <div className={`flex-1 min-w-0 border-b ${theme.border} pb-3 -mb-3 flex justify-between`}>
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className={`text-[16px] ${theme.textPrimary} truncate`}>{contact.name || 'User'}</h3>
                      <p className={`text-[14px] truncate ${contact.unreadCount > 0 ? theme.textPrimary + ' font-medium' : theme.textSecondary}`}>
                        {contact.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[12px] ${contact.unreadCount > 0 ? 'text-[#00a884]' : theme.textSecondary}`}>
                        {contact.time || '12:00'}
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

          {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
          <div className={`md:hidden flex justify-between items-center px-6 py-2 border-t ${theme.border} ${theme.panelBg} shrink-0`}>
            <button onClick={() => navigate('/')} className={`flex flex-col items-center w-16 ${theme.textSecondary} ${theme.iconHover} transition-colors`}>
              <HomeIcon size={24} className="mb-1" />
              <span className="text-[11px] font-medium">Home</span>
            </button>
            <button onClick={() => navigate('/chats')} className="flex flex-col items-center w-16 text-[#00a884] transition-colors relative">
              <MessageSquare size={24} className="mb-1 fill-[#00a884]/20" />
              <span className="text-[11px] font-medium">Chats</span>
            </button>
            <button onClick={() => navigate('/profile')} className={`flex flex-col items-center w-16 ${theme.textSecondary} ${theme.iconHover} transition-colors`}>
              <User size={24} className="mb-1" />
              <span className="text-[11px] font-medium">Profile</span>
            </button>
          </div>
        </div>

        {/* --- RIGHT PANEL (CHAT BOX) --- */}
        <div className={`flex flex-col flex-1 h-full min-w-0 ${theme.panelBg} ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className={`flex items-center justify-between px-3 sm:px-4 py-2.5 ${theme.headerBg} z-10 shrink-0`}>
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <button onClick={() => setActiveChat(null)} className={`md:hidden p-1 sm:-ml-2 shrink-0 ${theme.iconColor} ${theme.hover} rounded-full`}>
                    <ArrowLeft size={24} />
                  </button>
                  <div className="w-10 h-10 bg-[#6b7c85] text-[#e9edef] rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                    {activeChat.name ? activeChat.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h3 className={`text-[16px] ${theme.textPrimary} font-medium truncate`}>{activeChat.name || 'User'}</h3>
                     <p className={`text-[13px] ${theme.textSecondary} truncate`}>tap here for contact info</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${theme.iconColor}`}>
                  <button onClick={() => handleStartCall('video')} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title="Video Call">
                    <Video size={20} />
                  </button>
                  <button onClick={() => handleStartCall('audio')} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title="Audio Call">
                    <Phone size={20} />
                  </button>
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              </div>

              {/* Chat Background & Message Container */}
              <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${theme.chatBg} space-y-3 relative`} style={isDarkMode ? { backgroundImage: 'radial-gradient(circle at center, #111b21 0%, #0b141a 100%)' } : {}}>
                
                {currentMessages.map((msg, index) => {
                  const msgSenderId = getUserId(msg.senderId || msg.sender);
                  const isMyMessage = msgSenderId === currentUserId;
                  const tickColor = msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]';
                  
                  return (
                    <div key={msg._id || `msg-${index}`} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] w-fit relative px-3 pt-1.5 pb-2 text-[15px] shadow-sm group ${
                        isMyMessage ? `${theme.msgMine} rounded-lg rounded-tr-none` : `${theme.msgOther} rounded-lg rounded-tl-none`   
                      }`}>
                        
                        {/* 📞 CALL LOG UI OR TEXT UI */}
                        {(msg.messageType === 'call' || (msg.callDetails && Object.keys(msg.callDetails).length > 0)) ? (
                          <div className="flex items-center gap-3 pr-8 pb-2 mt-1">
                            <div className={`p-3 rounded-full flex items-center justify-center ${isMyMessage ? 'bg-black/10' : 'bg-gray-500/10'}`}>
                              {msg.callDetails?.callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[15px]">
                                {msg.callDetails?.callType === 'video' ? 'Video Call' : 'Audio Call'}
                              </span>
                              <span className="text-[12px] opacity-80 flex items-center gap-1 mt-0.5">
                                {msg.callDetails?.duration > 0 ? (
                                  <><Clock size={12} /> {msg.callDetails.duration} Seconds</>
                                ) : (
                                  <><PhoneMissed size={12} className="text-red-500" /> {msg.callDetails?.status === 'missed' ? 'Missed Call' : 'Rejected / Unanswered'}</>
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="whitespace-pre-wrap break-words text-left leading-relaxed">
                            {msg.text}
                          </span>
                        )}

                        <span className="inline-block w-[68px] sm:w-[75px] h-1 select-none pointer-events-none"></span>

                        <div className={`text-[11px] ${theme.textSecondary} flex items-center gap-1 absolute bottom-1 right-2 select-none`}>
                          <span>{msg.time || formatTime(msg.createdAt)}</span>
                          {isMyMessage && <CheckCheck size={16} className={tickColor} />}
                        </div>

                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className={`px-2 sm:px-4 py-3 ${theme.inputBar} flex items-center gap-2 sm:gap-3 shrink-0`}>
                <Smile size={26} className={`hidden sm:block ${theme.iconColor} cursor-pointer ${theme.iconHover} shrink-0`} />
                <Paperclip size={24} className={`${theme.iconColor} cursor-pointer ${theme.iconHover} shrink-0`} />
                <div className={`flex-1 ${theme.inputBg} rounded-lg px-4 py-2 flex items-center border ${isDarkMode ? 'border-transparent' : 'border-gray-200'}`}>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message" className={`w-full bg-transparent ${theme.textPrimary} text-[15px] outline-none placeholder:text-opacity-70 h-8`} />
                </div>
                {newMessage.trim() ? (
                  <button type="submit" className="p-2.5 bg-[#00a884] text-white rounded-full hover:bg-[#029173] transition-colors shrink-0">
                    <Send size={20} className="ml-1" />
                  </button>
                ) : (
                  <button type="button" className={`p-2.5 ${theme.iconColor} ${theme.iconHover} transition-colors shrink-0`}>
                     <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path></svg>
                  </button>
                )}
              </form>
            </>
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center ${theme.emptyStateBg} ${theme.textSecondary}`}>
              <div className="text-center w-full px-6 flex flex-col items-center">
                <div className="flex justify-center mb-6 w-full max-w-[320px]">
                   <div className={`w-full aspect-[2/1] ${isDarkMode ? 'bg-[#2a3942]' : 'bg-white'} rounded-2xl flex items-center justify-center ${theme.textPrimary} opacity-20`}>
                      <MessageSquare size={64} />
                   </div>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-light ${theme.textPrimary} mb-4`}>WhatsApp for Web</h2>
                <p className="text-[13px] sm:text-[14px] leading-relaxed">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chats;
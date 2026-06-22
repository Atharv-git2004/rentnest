import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Phone, Video, MessageSquare, PhoneOff, 
  Home as HomeIcon, User, Sun, Moon
} from 'lucide-react';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import VideoCall from '../components/VideoCall';
import ChatWindow from '../components/ChatWindow'; 

const Chats = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth(); 

  const getUserId = useCallback((userObj) => {
    if (!userObj) return '';
    if (typeof userObj === 'object') return (userObj._id || userObj.id || '').toString().trim();
    return userObj.toString().trim();
  }, []);

  const currentUserId = getUserId(user);

  const [contacts, setContacts] = useState([]); 
  const [chatHistory, setChatHistory] = useState({}); 
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const activeChatIdRef = useRef(null);
  const activeChatId = activeChat ? getUserId(activeChat) : null;

  useEffect(() => { 
    activeChatIdRef.current = activeChatId; 
  }, [activeChatId]);

  // 💡 isReceiving സ്റ്റേറ്റ് ഒഴിവാക്കി (ഇൻകമിംഗ് കോൾ ഇനി App.jsx ആണ് കൈകാര്യം ചെയ്യുന്നത്)
  const [callData, setCallData] = useState({
    isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null 
  });

  const theme = isDarkMode ? {
    appBg: 'bg-[#0a1014]', panelBg: 'bg-[#111b21]', headerBg: 'bg-[#202c33]', chatBg: 'bg-[#0b141a]',
    textPrimary: 'text-[#e9edef]', textSecondary: 'text-[#8696a0]', border: 'border-[#222d34]',
    hover: 'hover:bg-[#202c33]', active: 'bg-[#2a3942]', inputBar: 'bg-[#202c33]', inputBg: 'bg-[#2a3942]',
    msgMine: 'bg-[#005c4b] text-[#e9edef]', msgOther: 'bg-[#202c33] text-[#e9edef]',
    iconColor: 'text-[#aebac1]', iconHover: 'hover:text-[#e9edef]',
  } : {
    appBg: 'bg-[#d1d7db]', panelBg: 'bg-[#ffffff]', headerBg: 'bg-[#f0f2f5]', chatBg: 'bg-[#efeae2]',
    textPrimary: 'text-[#111b21]', textSecondary: 'text-[#667781]', border: 'border-[#d1d7db]',
    hover: 'hover:bg-[#f5f6f6]', active: 'bg-[#ebebeb]', inputBar: 'bg-[#f0f2f5]', inputBg: 'bg-[#ffffff]',
    msgMine: 'bg-[#d9fdd3] text-[#111b21]', msgOther: 'bg-[#ffffff] text-[#111b21]',
    iconColor: 'text-[#54656f]', iconHover: 'hover:text-[#111b21]',
  };

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return;
      try {
        const res = await apiRequest('/messages/conversations', { method: 'GET' });
        const data = await res.json();
        if (data.success) setContacts(data.data);
      } catch (err) { console.error("Contacts fetch error:", err); }
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
      } catch (err) { console.error("Messages fetch error:", err); }
    };
    fetchMessages();
  }, [activeChatId, currentUserId, socket]);

  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleReceiveMessage = (message) => {
      const msgSenderId = getUserId(message.senderId || message.sender);
      if (msgSenderId === currentUserId) return;

      setChatHistory((prev) => {
        const existing = prev[msgSenderId] || [];
        if (existing.some(m => m._id === message._id)) return prev;
        return { ...prev, [msgSenderId]: [...existing, message] };
      });

      setContacts((prevContacts) => {
        const filtered = prevContacts.filter((c) => getUserId(c) !== msgSenderId);
        const existing = prevContacts.find((c) => getUserId(c) === msgSenderId);
        const isChatOpen = activeChatIdRef.current === msgSenderId;
        const newUnreadCount = isChatOpen ? 0 : (existing?.unreadCount || 0) + 1;

        let lastMsgText = message.text;
        if (message.messageType === 'call' || message.callDetails?.callType) {
          lastMsgText = message.callDetails?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call';
        }

        const updatedContact = existing 
          ? { ...existing, lastMessage: lastMsgText, time: 'Just now', unreadCount: newUnreadCount }
          : { _id: msgSenderId, name: message.senderName || 'User', lastMessage: lastMsgText, time: 'Just now', unreadCount: 1 };

        return [updatedContact, ...filtered];
      });

      if (activeChatIdRef.current === msgSenderId) {
        socket.emit('mark-messages-read', { senderId: msgSenderId, receiverId: currentUserId });
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      setChatHistory((prev) => {
        if (!prev[readerId]) return prev;
        return {
          ...prev, [readerId]: prev[readerId].map(msg => msg.status !== 'read' ? { ...msg, status: 'read' } : msg)
        };
      });
    };

    const handleCallEnded = () => {
      setCallData({ isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null });
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messages-read', handleMessagesRead);
    socket.on('call-ended', handleCallEnded); // 💡 ഇൻകമിംഗ് ലിസണർ ഒഴിവാക്കി

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messages-read', handleMessagesRead);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, currentUserId, getUserId]); 

  const handleSelectChat = (contact) => {
    setActiveChat(contact);
    const contactId = getUserId(contact);
    setContacts(prev => prev.map(c => getUserId(c) === contactId ? { ...c, unreadCount: 0 } : c));
    
    if (socket && currentUserId) {
      socket.emit('mark-messages-read', { senderId: contactId, receiverId: currentUserId });
    }
  };

  const handleSendMessage = async (messageText, type = 'text', targetReceiverId = null, callDetails = null) => {
    const receiverId = targetReceiverId || activeChatId;
    if (!messageText.trim() || !receiverId || !currentUserId) return;

    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId,
      receiverId: receiverId,
      text: messageText.trim(),
      messageType: type,
      status: 'sent',
      createdAt: new Date().toISOString(),
      ...(callDetails && { callDetails })
    };

    setChatHistory(prev => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), optimisticMsg]
    }));

    setContacts(prevContacts => {
      const filtered = prevContacts.filter(c => getUserId(c) !== receiverId);
      const targetContact = prevContacts.find(c => getUserId(c) === receiverId) || activeChat;
      
      let lastMsg = messageText.trim();
      if (type === 'call') {
        lastMsg = callDetails?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call';
      }

      return [{
        ...targetContact,
        lastMessage: lastMsg,
        time: 'Just now',
        unreadCount: 0
      }, ...filtered];
    });

    const payload = {
      senderId: currentUserId,
      receiverId: receiverId,
      text: messageText.trim(),
      messageType: type,
      ...(callDetails && { callDetails })
    };

    if (socket) {
      socket.emit('send-message', payload);
    }

    try {
      await apiRequest('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Failed to save message to database:", err);
    }
  };

  const handleStartCall = (type = 'video') => {
    if (!socket || !activeChatId) return;
    setCallData({ isActive: true, signal: null, partnerId: activeChatId, callType: type, startTime: new Date() });
  };

  // 💡 Outgoing കോൾ കട്ടാകുമ്പോൾ മാത്രം കോൾ ലോഗ് സേവ് ചെയ്യുന്നു
  const handleEndOrRejectCall = (duration = 0) => {
    const partner = callData.partnerId;
    const cType = callData.callType;
    const wasActive = callData.isActive; 

    if (socket && partner) socket.emit('end-call', { to: partner });

    if (partner && wasActive) { 
      let callText = '';
      if (duration > 0) {
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        callText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      } else {
        callText = 'Missed Call';
      }

      handleSendMessage(callText, 'call', partner, {
        callType: cType,
        duration: Number(duration)
      });
    }

    setCallData({ isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null });
  };

  const filteredContacts = contacts.filter(c => (c.name || 'User').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`flex w-full h-[100dvh] justify-center ${theme.appBg} transition-colors duration-300`}>
      <div className={`flex w-full max-w-[1600px] h-full ${theme.panelBg} overflow-hidden relative`}>

        {/* 💡 നിങ്ങൾ കോൾ വിളിക്കുമ്പോൾ (Outgoing) മാത്രം ഈ VideoCall കമ്പോണന്റ് ഇവിടെ ഓപ്പൺ ആകും */}
        {callData.isActive && (
          <VideoCall socket={socket} currentUserId={currentUserId} activeChatId={callData.partnerId} incomingSignal={callData.signal} onEndCall={handleEndOrRejectCall} callType={callData.callType} />
        )}
        
        <div className={`flex flex-col w-full md:w-[350px] lg:w-[400px] h-full border-r ${theme.border} ${theme.panelBg} ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className={`${theme.headerBg} p-3.5 flex justify-between items-center ${theme.iconColor}`}>
             <h2 className={`text-[20px] font-semibold ${theme.textPrimary}`}>Chats</h2>
             <div className="flex items-center gap-3">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 hover:text-white rounded-full`}>
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
             </div>
          </div>

          <div className={`p-2 border-b ${theme.border}`}>
            <div className={`${theme.headerBg} flex items-center rounded-lg px-3 py-1.5 gap-3`}>
              <Search className={theme.textSecondary} size={18} />
              <input type="text" placeholder="Search chats" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent ${theme.textPrimary} outline-none text-[15px]`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => {
              const isChatActive = activeChatId === getUserId(contact);
              return (
                <div key={getUserId(contact)} onClick={() => handleSelectChat(contact)} className={`flex items-center px-3 py-3 cursor-pointer ${isChatActive ? theme.active : theme.hover}`}>
                  <div className="w-12 h-12 bg-[#6b7c85] text-white rounded-full flex items-center justify-center font-bold mr-3 uppercase">
                    {contact.name ? contact.name.charAt(0) : 'U'}
                  </div>
                  <div className={`flex-1 border-b ${theme.border} pb-3 -mb-3 flex justify-between`}>
                    <div className="flex-1 pr-2 truncate">
                      <h3 className={`text-[16px] ${theme.textPrimary}`}>{contact.name || 'User'}</h3>
                      <p className={`text-[14px] ${theme.textSecondary} truncate`}>{contact.lastMessage || ''}</p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="bg-[#00a884] text-black text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`md:hidden flex justify-around py-2 border-t ${theme.border} ${theme.panelBg}`}>
            <button onClick={() => navigate('/')} className="text-gray-500 flex flex-col items-center"><HomeIcon size={20} /><span className="text-[10px]">Home</span></button>
            <button className="text-[#00a884] flex flex-col items-center"><MessageSquare size={20} /><span className="text-[10px]">Chats</span></button>
            <button onClick={() => navigate('/profile')} className="text-gray-500 flex flex-col items-center"><User size={20} /><span className="text-[10px]">Profile</span></button>
          </div>
        </div>

        <ChatWindow 
          activeChat={activeChat} 
          setActiveChat={setActiveChat} 
          currentUserId={currentUserId} 
          socket={socket}
          chatHistory={chatHistory} 
          setChatHistory={setChatHistory} 
          setContacts={setContacts} 
          handleStartCall={handleStartCall}
          onSendMessage={handleSendMessage}
          theme={theme} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
        />

      </div>
    </div>
  );
};

export default Chats;
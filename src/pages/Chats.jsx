import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  const currentUserId = useMemo(() => getUserId(user), [user, getUserId]);

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

  // isCaller കൂടി സ്റ്റേറ്റിൽ ഉൾപ്പെടുത്തിയിട്ടുണ്ട്
  const [callData, setCallData] = useState({
    isActive: false, 
    signal: null, 
    partnerId: null, 
    callType: 'video', 
    startTime: null,
    isCaller: false 
  });

  // Theme configuration mapping
  const theme = useMemo(() => {
    return isDarkMode ? {
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
  }, [isDarkMode]);

  // Fetch all recent conversations/contacts
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return;
      try {
        const res = await apiRequest('/messages/conversations', { method: 'GET' });
        const data = await res.json();
        if (data.success) setContacts(data.data);
      } catch (err) { 
        console.error("Contacts fetch error:", err); 
      }
    };
    fetchConversations();
  }, [currentUserId]);

  // Fetch messages when an active chat is selected
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
      } catch (err) { 
        console.error("Messages fetch error:", err); 
      }
    };
    fetchMessages();
  }, [activeChatId, currentUserId, socket]);

  // Handle sending text or call log messages
  const handleSendMessage = useCallback(async (messageText, type = 'text', targetReceiverId = null, callDetails = null) => {
    const receiverId = targetReceiverId || activeChatId;
    if (!messageText.trim() || !receiverId || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId, 
      senderId: currentUserId, 
      receiverId: receiverId,
      text: messageText.trim(), 
      messageType: type, 
      status: 'sending',
      createdAt: new Date().toISOString(), 
      ...(callDetails && { callDetails })
    };

    setChatHistory(prev => ({ ...prev, [receiverId]: [...(prev[receiverId] || []), optimisticMsg] }));

    setContacts(prevContacts => {
      const filtered = prevContacts.filter(c => getUserId(c) !== receiverId);
      const targetContact = prevContacts.find(c => getUserId(c) === receiverId) || activeChat;
      let lastMsg = type === 'call' ? (callDetails?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call') : messageText.trim();
      return [{ ...targetContact, lastMessage: lastMsg, time: 'Just now', unreadCount: 0 }, ...filtered];
    });

    const payload = { 
      receiverId: receiverId, 
      text: messageText.trim(), 
      messageType: type, 
      ...(callDetails && { callDetails }) 
    };

    try {
      const response = await apiRequest('/messages', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const savedData = await response.json();
      if (savedData.success) {
        const savedMessage = { ...savedData.data, senderId: currentUserId, receiverId: receiverId };
        
        if (socket) socket.emit('send-message', savedMessage);
        
        setChatHistory(prev => ({
          ...prev,
          [receiverId]: (prev[receiverId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
        }));
      }
    } catch (err) { 
      console.error("Failed to save message:", err);
      setChatHistory(prev => ({
        ...prev,
        [receiverId]: (prev[receiverId] || []).filter(msg => msg._id !== tempId)
      }));
    }
  }, [activeChatId, currentUserId, activeChat, socket, getUserId]);

  // Real-time socket event listeners orchestration
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
        let lastMsgText = message.messageType === 'call' ? (message.callDetails?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call') : message.text;
        
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
      setChatHistory((prev) => (!prev[readerId] ? prev : { 
        ...prev, 
        [readerId]: prev[readerId].map(msg => msg.status !== 'read' ? { ...msg, status: 'read' } : msg) 
      }));
    };

    const handleCallEnded = () => {
      setCallData({ isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null, isCaller: false });
    };

    const handleIncomingCall = (data) => {
      console.log("📞 Incoming call event triggered:", data);
      setCallData({
        isActive: true,
        signal: data.signal || data.signalData,
        partnerId: data.from,
        callType: data.callType || 'video',
        startTime: null,
        isCaller: false 
      });
    };

    // 🆕 മെസ്സേജ് എഡിറ്റ് ചെയ്യുമ്പോൾ റിയൽ ടൈം ആയി അപ്ഡേറ്റ് ആകാൻ
    const handleMessageEdited = (updatedMessage) => {
      const msgSenderId = getUserId(updatedMessage.senderId || updatedMessage.sender);
      const chatPartnerId = msgSenderId === currentUserId 
        ? getUserId(updatedMessage.receiverId || updatedMessage.receiver) 
        : msgSenderId;

      setChatHistory((prev) => {
        const existing = prev[chatPartnerId] || [];
        return {
          ...prev,
          [chatPartnerId]: existing.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        };
      });

      // ആവശ്യമെങ്കിൽ Contacts ലിസ്റ്റിലെ lastMessage അപ്ഡേറ്റ് ചെയ്യാം (ഏറ്റവും പുതിയ മെസ്സേജ് ആണെങ്കിൽ മാത്രം)
      setContacts((prevContacts) => {
        return prevContacts.map(contact => {
          if (getUserId(contact) === chatPartnerId && contact.lastMessage === "This message was deleted" === false) { // Basic check
             // Here we might just leave the contact list alone unless it's strictly the last message, 
             // but for now, updating chat history is the most important part.
             return contact;
          }
          return contact;
        });
      });
    };

    // 🆕 മെസ്സേജ് ഡിലീറ്റ് ചെയ്യുമ്പോൾ റിയൽ ടൈം ആയി അപ്ഡേറ്റ് ആകാൻ
    const handleMessageDeleted = ({ messageId, senderId, receiverId }) => {
      const parsedSenderId = getUserId(senderId);
      const parsedReceiverId = getUserId(receiverId);
      const chatPartnerId = parsedSenderId === currentUserId ? parsedReceiverId : parsedSenderId;

      setChatHistory((prev) => {
        const existing = prev[chatPartnerId] || [];
        return {
          ...prev,
          [chatPartnerId]: existing.map(msg => 
            msg._id === messageId 
              ? { ...msg, isDeleted: true, text: "This message was deleted", fileUrl: "" } 
              : msg
          )
        };
      });
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messages-read', handleMessagesRead);
    socket.on('call-ended', handleCallEnded);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('receive-edit', handleMessageEdited);       // 🆕 Added
    socket.on('receive-delete', handleMessageDeleted);   // 🆕 Added

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messages-read', handleMessagesRead);
      socket.off('call-ended', handleCallEnded);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('receive-edit', handleMessageEdited);     // 🆕 Clean up
      socket.off('receive-delete', handleMessageDeleted); // 🆕 Clean up
    };
  }, [socket, currentUserId, getUserId]); 

  const handleSelectChat = useCallback((contact) => {
    setActiveChat(contact);
    const contactId = getUserId(contact);
    setContacts(prev => prev.map(c => getUserId(c) === contactId ? { ...c, unreadCount: 0 } : c));
    if (socket && currentUserId) socket.emit('mark-messages-read', { senderId: contactId, receiverId: currentUserId });
  }, [socket, currentUserId, getUserId]);

  const handleStartCall = useCallback((type = 'video') => {
    if (!socket || !activeChatId) return;
    setCallData({ 
      isActive: true, 
      signal: null, 
      partnerId: activeChatId, 
      callType: type, 
      startTime: new Date(),
      isCaller: true 
    });
  }, [socket, activeChatId]);

  const handleEndOrRejectCall = useCallback((duration = 0) => {
    const partner = callData.partnerId;
    if (socket && partner) socket.emit('end-call', { to: partner });
    if (partner && callData.isActive) { 
      let callText = duration > 0 ? (Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration % 60}s`) : 'Missed Call';
      handleSendMessage(callText, 'call', partner, { callType: callData.callType, duration: Number(duration) });
    }
    setCallData({ isActive: false, signal: null, partnerId: null, callType: 'video', startTime: null, isCaller: false });
  }, [callData, socket, handleSendMessage]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => (c.name || 'User').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [contacts, searchQuery]);

  return (
    <div className={`flex w-full h-[100dvh] justify-center ${theme.appBg} transition-colors duration-300`}>
      <div className={`flex w-full max-w-[1600px] h-full ${theme.panelBg} overflow-hidden relative`}>
        
        {/* WebRTC Video/Audio Overlay view */}
        {callData.isActive && (
          <VideoCall 
            socket={socket} 
            currentUserId={currentUserId} 
            activeChatId={callData.partnerId} 
            incomingSignal={callData.signal} 
            onEndCall={handleEndOrRejectCall} 
            callType={callData.callType} 
            isCaller={callData.isCaller}  
          />
        )}
        
        {/* Left Hand Contacts Panel */}
        <div className={`flex flex-col w-full md:w-[350px] lg:w-[400px] h-full border-r ${theme.border} ${theme.panelBg} ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className={`${theme.headerBg} p-3.5 flex justify-between items-center ${theme.iconColor}`}>
             <h2 className={`text-[20px] font-semibold ${theme.textPrimary}`}>Chats</h2>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 hover:text-white rounded-full transition-colors">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
          
          <div className={`p-2 border-b ${theme.border}`}>
            <div className={`${theme.headerBg} flex items-center rounded-lg px-3 py-1.5 gap-3`}>
              <Search className={theme.textSecondary} size={18} />
              <input 
                type="text" 
                placeholder="Search chats" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className={`w-full bg-transparent ${theme.textPrimary} outline-none text-[15px]`} 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => {
              const cid = getUserId(contact);
              const isChatActive = activeChatId === cid;
              return (
                <div 
                  key={cid || Math.random().toString()} 
                  onClick={() => handleSelectChat(contact)} 
                  className={`flex items-center px-3 py-3 cursor-pointer ${isChatActive ? theme.active : theme.hover}`}
                >
                  <div className="w-12 h-12 bg-[#6b7c85] text-white rounded-full flex items-center justify-center font-bold mr-3 uppercase overflow-hidden shrink-0">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                      contact.name ? contact.name.charAt(0) : 'U'
                    )}
                  </div>
                  <div className={`flex-1 border-b ${theme.border} pb-3 -mb-3 flex justify-between min-w-0`}>
                    <div className="flex-1 pr-2 truncate">
                      <h3 className={`text-[16px] ${theme.textPrimary} font-medium truncate`}>{contact.name || 'User'}</h3>
                      <p className={`text-[14px] ${theme.textSecondary} truncate`}>{contact.lastMessage || ''}</p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="bg-[#00a884] text-black text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0 market-unread-bubble">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Right Hand Chat Space Window */}
        <ChatWindow 
          activeChat={activeChat} 
          setActiveChat={setActiveChat} 
          currentUserId={currentUserId} 
          socket={socket}
          chatHistory={chatHistory} 
          setChatHistory={setChatHistory} 
          setContacts={setContacts} 
          handleStartCall={handleStartCall} 
          theme={theme} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
        />
      </div>
    </div>
  );
};

export default Chats;
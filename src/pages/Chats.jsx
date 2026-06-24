// Chats.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Phone, Video, MessageSquare, PhoneOff, 
  Home as HomeIcon, User, Sun, Moon
} from 'lucide-react';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import ChatWindow from '../components/ChatWindow'; 
import { useCall } from '../App'; // 🚀 PRO FIX: App.jsx-ൽ നിന്നും Global Call Hook ഇമ്പോർട്ട് ചെയ്തു!

const Chats = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth(); 
  const { initiateCall } = useCall(); // 🚀 PRO FIX: Global Hook വിളിച്ച് initiateCall ഫംഗ്ഷൻ എടുക്കുന്നു

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

  // 🗑️ CLEANUP: ഇവിടെ കിടന്നിരുന്ന ലോക്കൽ 'callData' സ്റ്റേറ്റ് പൂർണ്ണമായി ഒഴിവാക്കി!

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
    };

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

    // 🗑️ CLEANUP: ഇവിടെ കിടന്നിരുന്ന ലോക്കൽ call-ended, incoming-call ലിസണറുകൾ വെട്ടിമാറ്റി!

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messages-read', handleMessagesRead);
    socket.on('receive-edit', handleMessageEdited);       
    socket.on('receive-delete', handleMessageDeleted);   

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messages-read', handleMessagesRead);
      socket.off('receive-edit', handleMessageEdited);     
      socket.off('receive-delete', handleMessageDeleted); 
    };
  }, [socket, currentUserId, getUserId]); 

  const handleSelectChat = useCallback((contact) => {
    setActiveChat(contact);
    const contactId = getUserId(contact);
    setContacts(prev => prev.map(c => getUserId(c) === contactId ? { ...c, unreadCount: 0 } : c));
    if (socket && currentUserId) socket.emit('mark-messages-read', { senderId: contactId, receiverId: currentUserId });
  }, [socket, currentUserId, getUserId]);

  // 🚀 PRO FIX: ഇനി കോൾ വിളിക്കുന്നത് App.jsx-ലെ 'initiateCall' വഴിയാണ്!
  const handleStartCall = useCallback((type = 'video') => {
    if (!activeChat || !initiateCall) return;
    const partnerId = getUserId(activeChat);
    initiateCall(partnerId, activeChat.name, activeChat.avatar, type);
  }, [activeChat, initiateCall, getUserId]);

  // 🗑️ CLEANUP: 'handleEndOrRejectCall' ഫംഗ്ഷൻ ഇവിടെ നിന്നും പൂർണ്ണമായി ഒഴിവാക്കി

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => (c.name || 'User').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [contacts, searchQuery]);

  return (
    <div className={`flex w-full h-[calc(100dvh-75px)] overflow-hidden justify-center ${theme.appBg} transition-colors duration-300`}>
      <div className={`flex w-full max-w-[1600px] mx-auto h-full ${theme.panelBg} overflow-hidden relative`}>
        
        {/* 🗑️ CLEANUP: ഇവിടെ കിടന്നിരുന്ന ലോക്കൽ <VideoCall /> കമ്പോണന്റ് എടുത്തുമാറ്റി */}
        
        {/* Left Hand Contacts Panel */}
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex-col shrink-0 border-r ${theme.border} ${theme.panelBg} ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          
          <div className={`${theme.headerBg} p-3.5 flex justify-between items-center shrink-0 ${theme.iconColor}`}>
             <h2 className={`text-[20px] font-semibold ${theme.textPrimary}`}>Chats</h2>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 hover:text-white rounded-full transition-colors">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
          
          <div className={`p-2 border-b shrink-0 ${theme.border}`}>
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
        <div className={`w-full h-full flex-col flex-1 min-w-0 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
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
    </div>
  );
};

export default Chats;
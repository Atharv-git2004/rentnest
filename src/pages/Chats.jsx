import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Phone, Video, MessageSquare, PhoneOff, 
  Home as HomeIcon, User, Sun, Moon
} from 'lucide-react';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import ChatWindow from '../components/ChatWindow'; 
import { useCall } from '../App'; 

const Chats = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const socket = useSocket();
  const { user } = useAuth(); 
  const { initiateCall } = useCall(); 

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
    if (location.state && location.state.ownerId) {
      const { ownerId, ownerName, ownerAvatar, startCall, callType } = location.state;
      
      const newActiveChat = { 
        _id: ownerId, 
        name: ownerName, 
        avatar: ownerAvatar 
      };

      setActiveChat(newActiveChat);

      setContacts((prev) => {
        const exists = prev.find(c => getUserId(c) === ownerId);
        if (!exists) return [newActiveChat, ...prev];
        return prev;
      });

      if (startCall && initiateCall) {
        setTimeout(() => {
          initiateCall(ownerId, ownerName, ownerAvatar, callType);
        }, 500);
      }

      navigate(location.pathname, { replace: true });
    }
  }, [location.state, getUserId, initiateCall, navigate, location.pathname]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return;
      try {
        const res = await apiRequest('/messages/conversations', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          // ബാക്ക്-എൻഡിൽ നിന്ന് വരുന്ന ഡാറ്റ സ്ട്രക്ച്ചർ അനുസരിച്ച് അഡ്ജസ്റ്റ് ചെയ്തു
          const fetchedContacts = data.data || data || []; 
          if (Array.isArray(fetchedContacts)) {
             setContacts(fetchedContacts);
          }
        }
      } catch (err) { 
        console.error("Contacts fetch error:", err); 
      }
    };
    fetchConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!activeChatId || activeChatId === 'undefined' || activeChatId === 'null' || !currentUserId) return;
    
    const fetchMessages = async () => {
      try {
        const res = await apiRequest(`/messages/${activeChatId}`, { method: 'GET' });
        if (res.ok) {
           const data = await res.json();
           const fetchedMessages = data.data || data || [];
           setChatHistory(prev => ({ ...prev, [activeChatId]: fetchedMessages }));
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

    // തൽക്കാലം സ്ക്രീനിൽ കാണിക്കാൻ മെസ്സേജ് ആഡ് ചെയ്യുന്നു
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
      
      // 💡 FIX: ബാക്ക്-എൻഡ് ഡാറ്റ അയക്കുന്ന രീതിക്കനുസരിച്ച് (success ഇല്ലെങ്കിലും വർക്ക് ആവാൻ) മാറ്റം വരുത്തി.
      const messagePayload = savedData.data || savedData.message || savedData;

      if (response.ok && messagePayload && messagePayload._id) {
        const savedMessage = { ...messagePayload, senderId: currentUserId, receiverId: receiverId };
        
        // സോക്കറ്റിലേക്ക് മെസ്സേജ് പാസ്സ് ചെയ്യുന്നു (ലൈവ് അപ്ഡേറ്റിന്)
        if (socket) socket.emit('send-message', savedMessage);
        
        // ടെമ്പററി ഐഡി മാറ്റി ഒറിജിനൽ ഐഡി നൽകുന്നു
        setChatHistory(prev => ({
          ...prev,
          [receiverId]: (prev[receiverId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
        }));
      } else {
        throw new Error("Message format invalid");
      }
    } catch (err) { 
      console.error("Failed to save message:", err);
      // എറർ വന്നാൽ മെസ്സേജ് ഡിലീറ്റ് ആകാതിരിക്കാൻ sending സ്റ്റാറ്റസ് failed ആക്കുന്നു
      setChatHistory(prev => ({
        ...prev,
        [receiverId]: (prev[receiverId] || []).map(msg => msg._id === tempId ? { ...msg, status: 'failed' } : msg)
      }));
    }
  }, [activeChatId, currentUserId, activeChat, socket, getUserId]);

  // 💡 സോക്കറ്റ് ഇവന്റുകൾ കേൾക്കാനുള്ള അപ്ഡേറ്റ് ചെയ്ത കോഡ്
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleReceiveMessage = (message) => {
      if (!message || (!message._id && !message.id)) return; // അനാവശ്യ ഡാറ്റ ഒഴിവാക്കുന്നു

      const msgSenderId = getUserId(message.senderId || message.sender);
      const msgReceiverId = getUserId(message.receiverId || message.receiver);
      
      const chatPartnerId = msgSenderId === currentUserId ? msgReceiverId : msgSenderId;
      if (!chatPartnerId) return;

      // മെസ്സേജ് ഹിസ്റ്ററി അപ്ഡേറ്റ് ചെയ്യുന്നു (ലൈവ് ആയി കാണിക്കാൻ)
      setChatHistory((prev) => {
        const existing = prev[chatPartnerId] || [];
        // ഡ്യൂപ്ലിക്കേറ്റ് വരാതിരിക്കാൻ ചെക്ക് ചെയ്യുന്നു
        if (existing.some(m => m._id === message._id)) return prev;
        return { ...prev, [chatPartnerId]: [...existing, message] };
      });

      // കോൺടാക്ട് ലിസ്റ്റ് അപ്ഡേറ്റ് ചെയ്യുന്നു
      setContacts((prevContacts) => {
        const filtered = prevContacts.filter((c) => getUserId(c) !== chatPartnerId);
        const existing = prevContacts.find((c) => getUserId(c) === chatPartnerId);
        const isChatOpen = activeChatIdRef.current === chatPartnerId;
        
        const newUnreadCount = (isChatOpen || msgSenderId === currentUserId) ? 0 : (existing?.unreadCount || 0) + 1;
        let lastMsgText = message.messageType === 'call' 
          ? (message.callDetails?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call') 
          : message.text;
        
        const updatedContact = existing 
          ? { ...existing, lastMessage: lastMsgText, time: 'Just now', unreadCount: newUnreadCount } 
          : { _id: chatPartnerId, name: message.senderName || 'User', lastMessage: lastMsgText, time: 'Just now', unreadCount: newUnreadCount };
        
        return [updatedContact, ...filtered];
      });

      if (activeChatIdRef.current === chatPartnerId && msgSenderId !== currentUserId) {
        socket.emit('mark-messages-read', { senderId: chatPartnerId, receiverId: currentUserId });
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

    socket.on('receive-message', handleReceiveMessage);
    socket.on('call-log-update', handleReceiveMessage); 
    socket.on('messages-read', handleMessagesRead);
    socket.on('receive-edit', handleMessageEdited);        
    socket.on('receive-delete', handleMessageDeleted);   

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('call-log-update', handleReceiveMessage);
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

  const handleStartCall = useCallback((type = 'video') => {
    if (!activeChat || !initiateCall) return;
    const partnerId = getUserId(activeChat);
    initiateCall(partnerId, activeChat.name, activeChat.avatar, type);
  }, [activeChat, initiateCall, getUserId]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => (c.name || 'User').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [contacts, searchQuery]);

  return (
    <div className={`flex w-full h-[calc(100dvh-75px)] overflow-hidden justify-center ${theme.appBg} transition-colors duration-300`}>
      <div className={`flex w-full max-w-[1600px] mx-auto h-full ${theme.panelBg} overflow-hidden relative`}>
        
        {/* Left Hand Contacts Panel */}
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex-col shrink-0 border-r ${theme.border} ${theme.panelBg} ${activeChat ? 'hidden md:flex' : 'flex'} min-w-0`}>
          
          <div className={`${theme.headerBg} p-3.5 flex justify-between items-center shrink-0 ${theme.iconColor}`}>
             <h2 className={`text-[20px] font-semibold ${theme.textPrimary}`}>Chats</h2>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 hover:text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500">
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
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-transparent">
            {filteredContacts.map((contact) => {
              const cid = getUserId(contact);
              const isChatActive = activeChatId === cid;
              return (
                <div 
                  key={cid || Math.random().toString()} 
                  onClick={() => handleSelectChat(contact)} 
                  className={`flex items-center px-3 py-3 cursor-pointer transition-colors ${isChatActive ? theme.active : theme.hover}`}
                >
                  <div className="w-12 h-12 bg-[#6b7c85] text-white rounded-full flex items-center justify-center font-bold mr-3 uppercase overflow-hidden shrink-0">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                      contact.name ? contact.name.charAt(0) : 'U'
                    )}
                  </div>
                  <div className={`flex-1 border-b ${theme.border} pb-3 -mb-3 flex justify-between items-center min-w-0`}>
                    <div className="flex-1 pr-2 truncate min-w-0">
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
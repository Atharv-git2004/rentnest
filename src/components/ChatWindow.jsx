import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Video, Phone, ArrowLeft, CheckCheck, Clock, PhoneMissed, 
  Smile, Paperclip, Send, Mic, X, Sun, Moon, FileText, 
  ChevronDown, Edit2, Trash2, Ban 
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { apiRequest } from '../services/api';

// Custom Audio Player Component
const AudioMessage = React.memo(({ fileUrl, getMediaUrl, durationProp }) => {
  const [duration, setDuration] = useState(durationProp || 0);
  const audioRef = useRef(null);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && !durationProp) {
      const dur = audioRef.current.duration;
      if (dur === Infinity) {
        audioRef.current.currentTime = 1e101;
        audioRef.current.ontimeupdate = () => {
          audioRef.current.ontimeupdate = null;
          audioRef.current.currentTime = 0;
          setDuration(audioRef.current.duration);
        };
      } else if (dur && !isNaN(dur)) {
        setDuration(dur);
      }
    }
  }, [durationProp]);

  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  return (
    <div className="pt-1 pb-1 pr-1 sm:pr-2 flex flex-col w-full max-w-full overflow-hidden">
      <audio 
        ref={audioRef}
        controls 
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full max-w-[180px] xs:max-w-[210px] sm:max-w-[250px] h-[40px] outline-none"
      >
        <source src={getMediaUrl(fileUrl)} />
        Your browser does not support the audio element.
      </audio>
      {duration > 0 && (
        <span className="text-[11px] font-medium opacity-70 mt-1 ml-1 flex items-center gap-1">
          <Clock size={10} /> {formatTime(duration)}
        </span>
      )}
    </div>
  );
});

AudioMessage.displayName = 'AudioMessage';

const getUserId = (userObj) => {
  if (!userObj) return '';
  if (typeof userObj === 'object') return (userObj._id || userObj.id || '').toString().trim();
  return userObj.toString().trim();
};

const ChatWindow = ({
  activeChat,
  setActiveChat,
  currentUserId,
  socket,
  chatHistory,
  setChatHistory,
  setContacts,
  handleStartCall,
  theme,
  isDarkMode,
  setIsDarkMode
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [messageMenuOpen, setMessageMenuOpen] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recordingTimeRef = useRef(0); 
  const isCancelledRef = useRef(false);

  const BACKEND_URL = 'https://rentnest-backend-civ9.onrender.com'; 

  const getMediaUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }, []);

  const activeChatId = useMemo(() => activeChat ? getUserId(activeChat) : null, [activeChat]);
  const currentMessages = useMemo(() => activeChatId ? (chatHistory[activeChatId] || []) : [], [activeChatId, chatHistory]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    setShowEmojiPicker(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [activeChatId, currentMessages.length]);

  // ==========================================
  // NEW FIX: SOCKET LISTENERS FOR REAL-TIME UPDATES
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (incomingMsg) => {
      const chatId = getUserId(incomingMsg.senderId);
      
      setChatHistory((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), incomingMsg]
      }));

      setContacts((prevContacts) => {
        const safeContacts = prevContacts || [];
        const filtered = safeContacts.filter((c) => getUserId(c) !== chatId);
        const existing = safeContacts.find((c) => getUserId(c) === chatId);
        
        if (existing) {
          return [{ ...existing, lastMessage: incomingMsg.text || '📎 Media', time: 'Just now' }, ...filtered];
        }
        return safeContacts; 
      });
    };

    const handleEditMessage = (editedMsg) => {
      const chatId = getUserId(editedMsg.senderId) === currentUserId 
                     ? getUserId(editedMsg.receiverId) 
                     : getUserId(editedMsg.senderId);
                     
      setChatHistory((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => 
          msg._id === editedMsg._id ? editedMsg : msg
        )
      }));
    };

    const handleDeleteMessage = ({ messageId, senderId, receiverId }) => {
      const chatId = getUserId(senderId) === currentUserId 
                     ? getUserId(receiverId) 
                     : getUserId(senderId);

      setChatHistory((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeleted: true, text: "This message was deleted", fileUrl: "" } 
            : msg
        )
      }));
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('edit-message', handleEditMessage);
    socket.on('delete-message', handleDeleteMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('edit-message', handleEditMessage);
      socket.off('delete-message', handleDeleteMessage);
    };
  }, [socket, currentUserId, setChatHistory, setContacts]);
  // ==========================================

  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const onEmojiClick = useCallback((emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatId) return;

    let fileType = 'file';
    let msgText = '📎 File';

    if (file.type.startsWith('image/')) {
      fileType = 'image';
      msgText = '📷 Image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
      msgText = '🎥 Video';
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      fileType = 'pdf';
      msgText = '📄 PDF Document';
    }

    const tempId = `temp-${Date.now()}`;
    const localFileUrl = URL.createObjectURL(file);

    const tempMessage = {
      _id: tempId, senderId: currentUserId, receiverId: activeChatId, text: msgText,
      messageType: fileType, fileUrl: localFileUrl, status: 'sending', createdAt: new Date().toISOString()
    };

    setChatHistory((prev) => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage] }));

    const formData = new FormData();
    formData.append('file', file); 

    try {
      const response = await apiRequest('/messages/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Upload Failed: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const messageData = { receiverId: activeChatId, text: msgText, messageType: fileType, fileUrl: data.fileUrl };
        const res = await apiRequest('/messages', { 
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) 
        });
        const savedData = await res.json();
        
        if (savedData.success) {
           const savedMessage = { ...savedData.data, senderId: currentUserId, receiverId: activeChatId };
           if (socket) socket.emit('send-message', savedMessage);
           
           setChatHistory((prev) => ({
             ...prev, [activeChatId]: (prev[activeChatId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
           }));

           setContacts((prevContacts) => {
             const safeContacts = prevContacts || [];
             const filtered = safeContacts.filter((c) => getUserId(c) !== activeChatId);
             const existing = safeContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
             return [{ ...existing, lastMessage: msgText, time: 'Just now' }, ...filtered];
           });
        }
      }
    } catch (err) { 
      console.error("File Upload error:", err.message); 
      setChatHistory((prev) => ({
        ...prev, [activeChatId]: (prev[activeChatId] || []).filter(msg => msg._id !== tempId)
      }));
    } finally {
      e.target.value = null; 
    }
  }, [activeChatId, currentUserId, activeChat, socket, setChatHistory, setContacts]);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setRecordingTime(0);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCancelledRef.current = false; 

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (isCancelledRef.current) return;

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        const tempId = `temp-${Date.now()}`;
        const localAudioUrl = URL.createObjectURL(audioBlob); 
        const finalAudioDuration = recordingTimeRef.current; 

        const tempMessage = {
          _id: tempId, senderId: currentUserId, receiverId: activeChatId, text: '🎙️ Voice Message',
          messageType: 'audio', fileUrl: localAudioUrl, audioDuration: finalAudioDuration, 
          status: 'sending', createdAt: new Date().toISOString()
        };

        setChatHistory((prev) => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage] }));

        const formData = new FormData();
        formData.append('file', audioBlob, `voice-message.${extension}`);

        try {
          const response = await apiRequest('/messages/upload', { method: 'POST', body: formData });
          if (!response.ok) throw new Error(`Status ${response.status}`);

          const data = await response.json();
          if (data.success) {
            const messageData = {
              receiverId: activeChatId, text: '🎙️ Voice Message', messageType: 'audio', 
              fileUrl: data.fileUrl, audioDuration: finalAudioDuration 
            };

            const res = await apiRequest('/messages', { 
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) 
            });
            const savedData = await res.json();

            if (savedData.success) {
               const savedMessage = { ...savedData.data, audioDuration: finalAudioDuration, senderId: currentUserId, receiverId: activeChatId };
               if (socket) socket.emit('send-message', savedMessage);
               
               setChatHistory((prev) => ({ 
                 ...prev, [activeChatId]: (prev[activeChatId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
               }));
            }
          }
        } catch (err) { 
          console.error("Audio upload error:", err);
          setChatHistory((prev) => ({
            ...prev, [activeChatId]: (prev[activeChatId] || []).filter(msg => msg._id !== tempId)
          }));
        }
      };

      mediaRecorder.start(250); 
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      
      recordingIntervalRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);

    } catch (err) {
      alert("Please enable microphone permissions in your browser settings.");
    }
  }, [activeChatId, currentUserId, socket, setChatHistory]);

  const sendRecording = useCallback(() => {
    isCancelledRef.current = false;
    stopMediaRecorder();
  }, [stopMediaRecorder]);

  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true;
    stopMediaRecorder();
  }, [stopMediaRecorder]);

  const handleStartEdit = (msg) => {
    setMessageMenuOpen(null);
    setEditingMessage(msg);
    setNewMessage(msg.text);
    if (fileInputRef.current) fileInputRef.current.value = null; 
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDeleteMessage = async (msgId) => {
    setMessageMenuOpen(null);
    setChatHistory((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map(msg => 
        msg._id === msgId ? { ...msg, isDeleted: true, text: "This message was deleted", fileUrl: "" } : msg
      )
    }));

    try {
      const response = await apiRequest(`/messages/${msgId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json();
      }
      
      if (socket) {
        socket.emit('delete-message', { messageId: msgId, senderId: currentUserId, receiverId: activeChatId });
      }
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !activeChatId) return;

    const messageText = newMessage;
    setNewMessage(''); 
    setShowEmojiPicker(false);

    if (editingMessage) {
      const msgId = editingMessage._id;
      handleCancelEdit();
      setChatHistory((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map(msg => 
          msg._id === msgId ? { ...msg, text: messageText, isEdited: true } : msg
        )
      }));

      try {
        const response = await apiRequest(`/messages/${msgId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: messageText })
        });
        
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success && socket) socket.emit('edit-message', { ...data.data, senderId: currentUserId, receiverId: activeChatId });
        }
      } catch (err) {
        console.error("Error editing message:", err.message);
      }
      return; 
    }

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId, senderId: currentUserId, receiverId: activeChatId,
      text: messageText, messageType: 'text', createdAt: new Date().toISOString(), status: 'sending'
    };

    setChatHistory((prev) => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage] }));

    setContacts((prevContacts) => {
      const safeContacts = prevContacts || [];
      const filtered = safeContacts.filter((c) => getUserId(c) !== activeChatId);
      const existing = safeContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
      return [{ ...existing, lastMessage: messageText, time: 'Just now' }, ...filtered];
    });
    
    try {
      const response = await apiRequest('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeChatId, text: messageText, messageType: 'text' })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const savedMessage = { ...data.data, senderId: currentUserId, receiverId: activeChatId };
          if (socket) socket.emit('send-message', savedMessage);
          setChatHistory((prev) => ({
            ...prev, [activeChatId]: (prev[activeChatId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
          }));
        }
      }
    } catch (error) { 
      console.error("Error sending message:", error); 
    }
  }, [newMessage, currentUserId, activeChatId, editingMessage, activeChat, socket, setChatHistory, setContacts]);

  if (!activeChat) {
    return (
      <div className={`hidden md:flex flex-col flex-1 h-full items-center justify-center p-6 ${theme.panelBg}`}>
        <div className="text-center space-y-4 max-w-sm opacity-60">
          <div className="w-16 h-16 bg-[#202c33] rounded-full flex items-center justify-center mx-auto text-[#00a884] shadow-sm">
            <Smile size={32} />
          </div>
          <h3 className={`text-xl font-semibold tracking-wide ${theme.textPrimary}`}>Select a chat to start messaging</h3>
          <p className={`text-sm ${theme.textSecondary}`}>Choose a contact from your list to begin a secure, responsive real-time conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-1 h-full max-h-full min-w-0 overflow-hidden ${theme.panelBg} relative`} onClick={() => messageMenuOpen && setMessageMenuOpen(null)}>
      
      {/* 1. Header Layout */}
      <div className={`flex items-center justify-between w-full px-3 sm:px-4 py-2.5 ${theme.headerBg} z-20 shadow-sm flex-none border-b ${theme.border || 'border-gray-100/10'}`}> 
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button onClick={() => setActiveChat(null)} className={`md:hidden p-1.5 -ml-1 shrink-0 ${theme.iconColor} ${theme.hover} rounded-full transition-colors`} aria-label="Go Back">
            <ArrowLeft size={22} />
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#6b7c85] text-[#e9edef] rounded-full flex items-center justify-center font-bold uppercase shrink-0 overflow-hidden shadow-inner">
            {activeChat.avatar ? <img src={activeChat.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (activeChat.name ? activeChat.name.charAt(0) : 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[15px] sm:text-[16px] ${theme.textPrimary} font-semibold truncate`}>{activeChat.name || 'User'}</h3>
            <p className={`text-[12px] sm:text-[13px] ${theme.textSecondary} truncate text-green-500 font-medium`}>Online</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${theme.iconColor}`}>
          <button onClick={() => handleStartCall('video')} className={`p-2 ${theme.iconHover || 'hover:bg-black/5'} rounded-full transition-all active:scale-95`} title="Video Call">
            <Video size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => handleStartCall('audio')} className={`p-2 ${theme.iconHover || 'hover:bg-black/5'} rounded-full transition-all active:scale-95`} title="Audio Call">
            <Phone size={19} className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => setIsDarkMode(prev => !prev)} className={`p-2 ${theme.iconHover || 'hover:bg-black/5'} rounded-full transition-all active:scale-95`} title="Toggle Theme">
            {isDarkMode ? <Sun size={20} className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon size={20} className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Message List */}
      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 ${theme.chatBg} space-y-3 relative scroll-smooth overflow-x-hidden`} onClick={() => showEmojiPicker && setShowEmojiPicker(false)}>
        {currentMessages.map((msg, index) => {
          const isMyMessage = getUserId(msg.senderId || msg.sender) === currentUserId;
          const tickColor = msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]';
          
          return (
            <div key={msg._id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} w-full relative group`}>
              <div className={`max-w-[88%] sm:max-w-[75%] md:max-w-[70%] min-w-[110px] relative px-3 pt-2 pb-6 text-[14px] sm:text-[15px] shadow-sm break-words flex flex-col ${isMyMessage ? `${theme.msgMine} rounded-2xl rounded-tr-none` : `${theme.msgOther} rounded-2xl rounded-tl-none`}`}>
                
                {isMyMessage && !msg.isDeleted && msg.status !== 'sending' && (
                  <div className="absolute top-1.5 right-1.5 cursor-pointer md:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full bg-black/5 z-10" onClick={(e) => { e.stopPropagation(); setMessageMenuOpen(msg._id); }}>
                    <ChevronDown size={15} className="opacity-70 hover:opacity-100" />
                  </div>
                )}

                {messageMenuOpen === msg._id && (
                  <div className={`absolute top-7 right-2 w-32 ${isDarkMode ? 'bg-[#233138] text-white' : 'bg-white text-black'} rounded-xl py-1 z-50 shadow-xl border ${theme.border || 'border-gray-200'} overflow-hidden`}>
                    {msg.messageType === 'text' && (
                       <button className="w-full text-left px-3.5 py-2 hover:bg-black/10 text-xs sm:text-sm flex items-center gap-2 transition-colors" onClick={() => handleStartEdit(msg)}>
                         <Edit2 size={13} /> Edit
                       </button>
                    )}
                    <button className="w-full text-left px-3.5 py-2 hover:bg-black/10 text-xs sm:text-sm text-red-500 flex items-center gap-2 transition-colors" onClick={() => handleDeleteMessage(msg._id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}

                {msg.isDeleted || msg.text === "This message was deleted" ? (
                   <div className="flex items-center gap-1.5 opacity-60 italic text-[13.5px] sm:text-[14.5px] pr-2 py-0.5 text-gray-500">
                     <Ban size={14} /> This message was deleted
                   </div>
                ) : (msg.messageType === 'call' || msg.callDetails?.callType) ? (
                  <div className="flex items-center gap-3 pr-2 pb-1 mt-0.5 w-full">
                    <div className={`p-2.5 rounded-full shrink-0 ${isMyMessage ? 'bg-black/10' : 'bg-gray-500/10'}`}>
                      {msg.callDetails?.callType === 'video' ? <Video size={18} /> : <Phone size={18} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm sm:text-[15px] truncate">{msg.callDetails?.callType === 'video' ? 'Video Call' : 'Audio Call'}</span>
                      <span className="text-[11px] sm:text-[12px] opacity-80 flex items-center gap-1 mt-0.5 truncate">
                        {msg.callDetails?.duration > 0 ? <><Clock size={11} /> {msg.callDetails.duration}s</> : <><PhoneMissed size={11} className="text-red-500" /> Missed Call</>}
                      </span>
                    </div>
                  </div>
                ) : msg.messageType === 'audio' ? (
                  <AudioMessage fileUrl={msg.fileUrl} getMediaUrl={getMediaUrl} durationProp={msg.audioDuration} />
                ) : msg.messageType === 'video' ? (
                  <div className="pb-1 pt-0.5 max-w-full">
                     <video controls className="rounded-xl w-full h-auto max-h-[200px] sm:max-h-[250px] outline-none bg-black/10 shadow-sm">
                       <source src={getMediaUrl(msg.fileUrl)} />
                     </video>
                  </div>
                ) : msg.messageType === 'image' ? (
                  <div className="pb-1 pt-0.5 max-w-full">
                     <a href={getMediaUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                       <img src={getMediaUrl(msg.fileUrl)} alt="Uploaded content" className="rounded-xl w-full h-auto max-h-[200px] sm:max-h-[250px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-200 bg-black/5" />
                     </a>
                  </div>
                ) : msg.messageType === 'pdf' || msg.messageType === 'file' ? (
                  <div className="pb-1 pt-0.5 flex items-center gap-2.5 max-w-full overflow-hidden">
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-xl shrink-0"><FileText size={22} /></div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <a href={getMediaUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold underline truncate hover:text-[#00a884] transition-colors">
                        {msg.fileUrl?.split('/').pop() || 'Document'}
                      </a>
                      <span className="text-[10px] uppercase opacity-60 font-medium tracking-wider mt-0.5">Document</span>
                    </div>
                  </div>
                ) : (
                  <div className={`whitespace-pre-wrap leading-relaxed pr-2 break-words text-justify ${msg.isEdited ? 'pr-7' : ''}`}>{msg.text}</div>
                )}

                <div className={`text-[10px] ${theme.textSecondary} flex items-center gap-1 absolute bottom-1 right-2 select-none font-medium opacity-80`}>
                  {msg.isEdited && !msg.isDeleted && <span className="italic opacity-70 mr-0.5">edited</span>}
                  <span>{msg.time || formatTime(msg.createdAt)}</span>
                  {isMyMessage && !msg.isDeleted && (
                    msg.status === 'sending' ? <Clock size={11} className="text-gray-400 animate-spin" /> : <CheckCheck size={14} className={tickColor} />
                  )}
                </div>

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Layout Guard */}
      {showEmojiPicker && (
        <div className="absolute bottom-[75px] left-2 right-2 sm:left-4 sm:right-auto z-50 shadow-2xl max-w-[calc(100vw-16px)] sm:max-w-none overflow-hidden rounded-xl">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={isDarkMode ? 'dark' : 'light'} lazyLoadEmojis={true} width="100%" height={320} />
        </div>
      )}

      <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*,application/pdf" />

      {/* Editing State Header */}
      {editingMessage && (
         <div className={`px-4 py-2 flex items-center justify-between border-t ${theme.border || 'border-gray-100/10'} ${theme.headerBg} shadow-inner flex-none w-full z-10 animate-fade-in`}>
            <div className="flex flex-col flex-1 min-w-0 border-l-4 border-[#00a884] pl-3">
               <span className="text-[12px] sm:text-[13px] font-bold text-[#00a884] tracking-wide">Edit Message</span>
               <span className={`text-[13px] sm:text-[14px] ${theme.textSecondary} truncate w-full mt-0.5`}>{editingMessage.text}</span>
            </div>
            <button onClick={handleCancelEdit} className={`p-1.5 rounded-full ${theme.hover || 'hover:bg-black/5'} text-red-400 shrink-0 ml-2 transition-colors`} aria-label="Cancel editing">
              <X size={18} />
            </button>
         </div>
      )}

      {/* Input Action Form Bar */}
      <form onSubmit={handleSendMessage} className={`flex-none w-full px-2 sm:px-4 py-3 ${theme.inputBar || 'bg-white'} flex items-center gap-1.5 sm:gap-3 z-10 border-t ${theme.border || 'border-gray-100/10'}`}>
        {!isRecording && (
          <>
            <button type="button" className="shrink-0 p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors" onClick={() => setShowEmojiPicker(prev => !prev)} aria-label="Toggle Emoji Picker">
              {showEmojiPicker ? (
                <X size={24} className={`${theme.iconColor} shrink-0`} />
              ) : (
                <Smile size={24} className={`${theme.iconColor} shrink-0`} />
              )}
            </button>
            
            <button type="button" className="shrink-0 p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors" onClick={() => fileInputRef.current.click()} aria-label="Attach File">
              <Paperclip size={22} className={`${theme.iconColor} shrink-0`} />
            </button>
            
            <input 
              type="text" 
              placeholder="Type a message" 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              className={`flex-1 min-w-0 ${theme.inputBg || 'bg-gray-100'} ${theme.textPrimary} px-3.5 sm:px-4 py-2 rounded-xl outline-none text-sm sm:text-[15px] shadow-inner border border-transparent focus:border-[#00a884]/20 transition-all`} 
            />
          </>
        )}

        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-red-50 text-red-600 px-3.5 sm:px-4 py-2 rounded-xl w-full animate-pulse border border-red-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              <span className="text-xs sm:text-sm font-bold tracking-wider">{recordingTime}s</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button type="button" onClick={cancelRecording} className="p-1.5 bg-white hover:bg-gray-100 rounded-full text-red-500 transition-colors shadow-sm" title="Cancel Recording"><X size={16} /></button>
              <button type="button" onClick={sendRecording} className="p-1.5 bg-[#00a884] hover:bg-[#029173] rounded-full text-white transition-colors shadow-sm" title="Send Recording"><Send size={16} className="ml-0.5" /></button>
            </div>
          </div>
        ) : (
          newMessage.trim() ? (
            <button type="submit" className="p-2 sm:p-2.5 bg-[#00a884] text-white rounded-xl hover:bg-[#029173] active:scale-95 transition-all shrink-0 shadow-md flex items-center justify-center" aria-label="Send Message">
              <Send size={18} className="ml-0.5" />
            </button>
          ) : (
            <button type="button" className={`p-2 sm:p-2.5 rounded-xl ${theme.iconHover || 'hover:bg-black/5'} shrink-0 active:scale-95 transition-all flex items-center justify-center`} onClick={startRecording} aria-label="Voice Record">
              <Mic size={22} className={theme.iconColor} />
            </button>
          )
        )}
      </form>
    </div>
  );
};

export default ChatWindow;
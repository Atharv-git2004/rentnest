import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Phone, ArrowLeft, CheckCheck, Clock, PhoneMissed, 
  Smile, Paperclip, Send, Mic, X, Sun, Moon, FileText 
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { apiRequest } from '../services/api';

// 🎵 Custom Audio Player Component to show duration before playing
const AudioMessage = ({ fileUrl, getMediaUrl, durationProp }) => {
  const [duration, setDuration] = useState(durationProp || 0);
  const audioRef = useRef(null);

  const handleLoadedMetadata = () => {
    if (audioRef.current && !durationProp) {
      const dur = audioRef.current.duration;
      // Workaround for Chrome bug where webm duration is Infinity
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
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="pt-1 pb-1 pr-2 flex flex-col">
      <audio 
        ref={audioRef}
        controls 
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        className="max-w-[200px] sm:max-w-[250px] h-[40px] outline-none"
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

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recordingTimeRef = useRef(0); // Added to keep track of exact seconds for backend
  const isCancelledRef = useRef(false);

  const BACKEND_URL = 'https://rentnest-backend-civ9.onrender.com'; 

  // Safely join backend URL
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const cleanUrl = url.replace(/^\/api/, '').replace(/^\//, '');
    return `${BACKEND_URL}/${cleanUrl}`;
  };

  const getUserId = (userObj) => {
    if (!userObj) return '';
    if (typeof userObj === 'object') return (userObj._id || userObj.id || '').toString().trim();
    return userObj.toString().trim();
  };

  const activeChatId = activeChat ? getUserId(activeChat) : null;
  const currentMessages = activeChatId ? (chatHistory[activeChatId] || []) : [];

  // Cleanup active audio tracks & intervals if component unmounts mid-recording
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll strictly bound to message count changes
  useEffect(() => {
    setShowEmojiPicker(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, currentMessages.length]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  // 📷 FILE / PDF UPLOAD
  const handleFileSelect = async (e) => {
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
      _id: tempId,
      senderId: currentUserId,
      receiverId: activeChatId,
      text: msgText,
      messageType: fileType,
      fileUrl: localFileUrl,
      status: 'sending',
      createdAt: new Date().toISOString()
    };

    setChatHistory((prev) => ({
      ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage]
    }));

    const formData = new FormData();
    formData.append('file', file); 

    try {
      const response = await apiRequest('/messages/upload', { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) throw new Error(`Upload Failed: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const messageData = {
          receiverId: activeChatId,
          text: msgText, 
          messageType: fileType, 
          fileUrl: data.fileUrl
        };
        
        const res = await apiRequest('/messages', { method: 'POST', body: messageData });
        const savedData = await res.json();
        
        if (savedData.success) {
           const savedMessage = { ...savedData.data, senderId: currentUserId, receiverId: activeChatId };
           if (socket) socket.emit('send-message', savedMessage);
           
           setChatHistory((prev) => ({
             ...prev,
             [activeChatId]: (prev[activeChatId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
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
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).filter(msg => msg._id !== tempId)
      }));
      alert("Failed to upload file.");
    } finally {
      e.target.value = null; 
    }
  };

  // 🎙️ AUDIO RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCancelledRef.current = false; 

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (isCancelledRef.current) return;

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        const tempId = `temp-${Date.now()}`;
        const localAudioUrl = URL.createObjectURL(audioBlob); 
        const finalAudioDuration = recordingTimeRef.current; // Get the exact duration recorded

        const tempMessage = {
          _id: tempId,
          senderId: currentUserId,
          receiverId: activeChatId,
          text: '🎙️ Voice Message',
          messageType: 'audio',
          fileUrl: localAudioUrl,
          audioDuration: finalAudioDuration, // Save duration for UI
          status: 'sending',
          createdAt: new Date().toISOString()
        };

        setChatHistory((prev) => ({ 
          ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage] 
        }));

        setContacts((prevContacts) => {
          const safeContacts = prevContacts || [];
          const filtered = safeContacts.filter((c) => getUserId(c) !== activeChatId);
          const existing = safeContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
          return [{ ...existing, lastMessage: '🎙️ Voice Message', time: 'Just now' }, ...filtered];
        });

        const formData = new FormData();
        formData.append('file', audioBlob, `voice-message.${extension}`);

        try {
          const response = await apiRequest('/messages/upload', { method: 'POST', body: formData });
          if (!response.ok) throw new Error(`Status ${response.status}`);

          const data = await response.json();
          if (data.success) {
            const messageData = {
              receiverId: activeChatId, 
              text: '🎙️ Voice Message', 
              messageType: 'audio', 
              fileUrl: data.fileUrl,
              audioDuration: finalAudioDuration // Send to backend if your model supports it
            };
            const res = await apiRequest('/messages', { method: 'POST', body: messageData });
            const savedData = await res.json();

            if (savedData.success) {
               // Make sure duration is passed back locally even if backend doesn't save it yet
               const savedMessage = { ...savedData.data, audioDuration: finalAudioDuration, senderId: currentUserId, receiverId: activeChatId };
               if (socket) socket.emit('send-message', savedMessage);
               
               setChatHistory((prev) => ({ 
                 ...prev, 
                 [activeChatId]: (prev[activeChatId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
               }));
            }
          }
        } catch (err) { 
          console.error("Audio upload error:", err);
          setChatHistory((prev) => ({
            ...prev,
            [activeChatId]: (prev[activeChatId] || []).filter(msg => msg._id !== tempId)
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
  };

  const sendRecording = () => {
    isCancelledRef.current = false;
    stopMediaRecorder();
  };

  const cancelRecording = () => {
    isCancelledRef.current = true;
    stopMediaRecorder();
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    // Note: Deliberately not clearing recordingTimeRef here so onstop can read the final value
    setRecordingTime(0);
  };

  // ✉️ SEND TEXT
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !activeChatId) return;

    const messageText = newMessage;
    setNewMessage(''); 
    setShowEmojiPicker(false);

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId, senderId: currentUserId, receiverId: activeChatId,
      text: messageText, messageType: 'text', createdAt: new Date().toISOString(), status: 'sending'
    };

    setChatHistory((prev) => ({ 
      ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage] 
    }));

    setContacts((prevContacts) => {
      const safeContacts = prevContacts || [];
      const filtered = safeContacts.filter((c) => getUserId(c) !== activeChatId);
      const existing = safeContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
      return [{ ...existing, lastMessage: messageText, time: 'Just now' }, ...filtered];
    });

    try {
      const response = await apiRequest('/messages', {
        method: 'POST', body: { receiverId: activeChatId, text: messageText, messageType: 'text' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        const savedMessage = { ...data.data, senderId: currentUserId, receiverId: activeChatId };
        if (socket) socket.emit('send-message', savedMessage);
        
        setChatHistory((prev) => ({
          ...prev, [activeChatId]: (prev[activeChatId] || []).map(msg => msg._id === tempId ? savedMessage : msg)
        }));
      }
    } catch (error) { 
      console.error("Error sending message:", error); 
    }
  };

  if (!activeChat) {
    return (
      <div className={`hidden md:flex flex-col flex-1 h-full items-center justify-center ${theme.panelBg}`}>
        <div className="text-center space-y-3 opacity-60">
          <div className="w-16 h-16 bg-[#202c33] rounded-full flex items-center justify-center mx-auto text-[#00a884]">
            <Smile size={32} />
          </div>
          <h3 className={`text-xl font-medium ${theme.textPrimary}`}>Select a chat to start messaging</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-1 h-full min-w-0 ${theme.panelBg} relative`}>
      {/* 1. Header - flex-none നൽകി സ്ക്രോൾ ആവാതെ ലോക്ക് ചെയ്തു */}
      <div className={`flex-none flex items-center justify-between px-3 sm:px-4 py-2.5 ${theme.headerBg} z-10`}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button onClick={() => setActiveChat(null)} className={`md:hidden p-1 sm:-ml-2 shrink-0 ${theme.iconColor} ${theme.hover} rounded-full`}>
            <ArrowLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-[#6b7c85] text-[#e9edef] rounded-full flex items-center justify-center font-bold uppercase shrink-0">
            {activeChat.name ? activeChat.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[16px] ${theme.textPrimary} font-medium truncate`}>{activeChat.name || 'User'}</h3>
            <p className={`text-[13px] ${theme.textSecondary} truncate`}>Online</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${theme.iconColor}`}>
          <button onClick={() => handleStartCall('video')} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title="Video Call">
            <Video size={20} />
          </button>
          <button onClick={() => handleStartCall('audio')} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title="Audio Call">
            <Phone size={20} />
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* 2. Messages List - flex-1 overflow-y-auto നൽകി ഇത് മാത്രം സ്ക്രോൾ ചെയ്യിക്കുന്നു 🚀 */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${theme.chatBg} space-y-3 relative`} onClick={() => showEmojiPicker && setShowEmojiPicker(false)}>
        {currentMessages.map((msg, index) => {
          const isMyMessage = getUserId(msg.senderId || msg.sender) === currentUserId;
          const tickColor = msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]';
          
          return (
            <div key={msg._id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1`}>
              <div className={`max-w-[85%] sm:max-w-[70%] min-w-[85px] relative px-3 pt-1.5 pb-5 text-[15px] shadow-sm break-words ${
                isMyMessage ? `${theme.msgMine} rounded-xl rounded-tr-none` : `${theme.msgOther} rounded-xl rounded-tl-none`   
              }`}>
                {(msg.messageType === 'call' || msg.callDetails?.callType) ? (
                  <div className="flex items-center gap-3 pr-4 pb-1 mt-1">
                    <div className={`p-3 rounded-full ${isMyMessage ? 'bg-black/10' : 'bg-gray-500/10'}`}>
                      {msg.callDetails?.callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[15px]">{msg.callDetails?.callType === 'video' ? 'Video Call' : 'Audio Call'}</span>
                      <span className="text-[12px] opacity-80 flex items-center gap-1 mt-0.5">
                        {msg.callDetails?.duration > 0 ? <><Clock size={12} /> {msg.callDetails.duration}s</> : <><PhoneMissed size={12} className="text-red-500" /> Missed Call</>}
                      </span>
                    </div>
                  </div>
                ) : msg.messageType === 'audio' ? (
                  // Replaced generic audio player with our Custom Component
                  <AudioMessage 
                    fileUrl={msg.fileUrl} 
                    getMediaUrl={getMediaUrl} 
                    durationProp={msg.audioDuration} 
                    key={msg._id || msg.fileUrl || index} 
                  />
                ) : msg.messageType === 'video' ? (
                  <div className="pb-2 pt-1">
                     <video controls className="rounded-md max-w-full h-auto max-h-[250px] outline-none bg-black/20">
                        <source src={getMediaUrl(msg.fileUrl)} />
                        Your browser does not support the video tag.
                     </video>
                  </div>
                ) : msg.messageType === 'image' ? (
                  <div className="pb-2 pt-1">
                     <a href={getMediaUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer">
                       <img src={getMediaUrl(msg.fileUrl)} alt="Uploaded content" className="rounded-md max-w-full h-auto max-h-[250px] object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                     </a>
                  </div>
                ) : msg.messageType === 'pdf' || msg.messageType === 'file' ? (
                  <div className="pb-2 pt-1 flex items-center gap-2">
                    <div className="p-2.5 bg-black/10 rounded-lg text-red-500">
                      <FileText size={22} />
                    </div>
                    <div className="flex flex-col min-w-0 pr-4">
                      <a 
                        href={getMediaUrl(msg.fileUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-semibold underline truncate hover:opacity-80"
                      >
                        {msg.fileUrl?.split('/').pop() || 'Document'}
                      </a>
                      <span className="text-[10px] uppercase opacity-60">PDF Document</span>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed pr-1">
                    {msg.text}
                  </div>
                )}
                
                <div className={`text-[10.5px] ${theme.textSecondary} flex items-center gap-1 absolute bottom-1 right-2 select-none`}>
                  <span>{msg.time || formatTime(msg.createdAt)}</span>
                  {isMyMessage && (
                    msg.status === 'sending' ? (
                      <Clock size={12} className="text-gray-400 animate-spin" />
                    ) : (
                      <CheckCheck size={15} className={tickColor} />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-[75px] left-4 z-50 shadow-xl">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={isDarkMode ? 'dark' : 'light'} lazyLoadEmojis={true} />
        </div>
      )}

      <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*,application/pdf" />

      {/* 3. Input Form - flex-none നൽകി സ്ക്രോൾ ആവാതെ ലോക്ക് ചെയ്തു */}
      <form onSubmit={handleSendMessage} className={`flex-none px-2 sm:px-4 py-3 ${theme.inputBar} flex items-center gap-2 sm:gap-3`}>
        {!isRecording && (
          <>
            {showEmojiPicker ? (
              <X size={26} className={`${theme.iconColor} cursor-pointer shrink-0`} onClick={() => setShowEmojiPicker(false)} />
            ) : (
              <Smile size={26} className={`${theme.iconColor} cursor-pointer shrink-0`} onClick={() => setShowEmojiPicker(true)} />
            )}
            
            <Paperclip size={24} className={`${theme.iconColor} cursor-pointer shrink-0`} onClick={() => fileInputRef.current.click()} />

            <input 
              type="text" 
              placeholder="Type a message" 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              className={`flex-1 min-w-0 ${theme.inputBg} ${theme.textPrimary} px-4 py-2 rounded-lg outline-none text-[15px]`}
            />
          </>
        )}

        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-red-100 text-red-600 px-4 py-2 rounded-full w-full animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              <span className="text-sm font-bold">{recordingTime}s</span>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={cancelRecording} className="p-2 bg-white hover:bg-gray-200 rounded-full text-red-500 transition-colors shadow-sm" title="Cancel Recording">
                <X size={18} />
              </button>
              <button type="button" onClick={sendRecording} className="p-2 bg-[#00a884] hover:bg-[#029173] rounded-full text-white transition-colors shadow-sm" title="Send Audio">
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          newMessage.trim() ? (
            <button type="submit" className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#029173] transition-colors shrink-0">
              <Send size={20} />
            </button>
          ) : (
            <Mic size={24} className={`${theme.iconColor} cursor-pointer shrink-0`} onClick={startRecording} />
          )
        )}
      </form>
    </div>
  );
};

export default ChatWindow;
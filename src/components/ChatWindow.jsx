import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Phone, ArrowLeft, CheckCheck, Clock, PhoneMissed, 
  Smile, Paperclip, Send, Mic, X, Sun, Moon 
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { apiRequest } from '../services/api';

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
  
  // 🆕 ഓഡിയോ റെക്കോർഡിങ് ക്യാൻസൽ ചെയ്തതാണോ എന്ന് തിരിച്ചറിയാൻ
  const isCancelledRef = useRef(false);

  const getUserId = (userObj) => {
    if (!userObj) return '';
    if (typeof userObj === 'object') return (userObj._id || userObj.id || '').toString().trim();
    return userObj.toString().trim();
  };

  const activeChatId = activeChat ? getUserId(activeChat) : null;
  const currentMessages = activeChatId ? (chatHistory[activeChatId] || []) : [];

  useEffect(() => {
    setShowEmojiPicker(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, currentMessages]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  // 📷 FILE / IMAGE UPLOAD HANDLER
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatId) return;

    const formData = new FormData();
    formData.append('file', file); 

    try {
      const response = await apiRequest('/messages/upload', { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) {
        const errorHtml = await response.text();
        console.error("SERVER CRASH HTML:", errorHtml.substring(0, 300));
        throw new Error(`HTTP Error ${response.status}: Route not found or server crashed`);
      }
      
      const data = await response.json();
      if (data.success) {
        const messageData = {
          receiverId: activeChatId,
          text: '📷 File/Image', 
          messageType: 'image', 
          fileUrl: data.fileUrl
        };
        
        const res = await apiRequest('/messages', { method: 'POST', body: messageData });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const savedData = await res.json();
        if (savedData.success) {
           const savedMessage = { ...savedData.data, senderId: currentUserId, receiverId: activeChatId };
           if (socket) socket.emit('send-message', savedMessage);
           
           setChatHistory((prev) => ({
             ...prev, [activeChatId]: [...(prev[activeChatId] || []), savedMessage]
           }));

           setContacts((prevContacts) => {
             const filtered = prevContacts.filter((c) => getUserId(c) !== activeChatId);
             const existing = prevContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
             return [{ ...existing, lastMessage: '📷 Image', time: 'Just now' }, ...filtered];
           });
        }
      }
    } catch (err) { 
      console.error("Image Upload error:", err.message); 
      alert("Failed to upload image. Backend returned 404 (Route not found).");
    } finally {
      e.target.value = null; 
    }
  };

  // 🎙️ AUDIO RECORDING HANDLERS 🆕
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCancelledRef.current = false; // Reset cancel flag

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        // 🆕 ക്യാൻസൽ ചെയ്തതാണെങ്കിൽ ബാക്കെൻഡിലേക്ക് അയക്കേണ്ടതില്ല
        if (isCancelledRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-message.webm');

        try {
          const response = await apiRequest('/messages/upload', { method: 'POST', body: formData });
          
          if (!response.ok) {
            const errText = await response.text();
            console.error("AUDIO BACKEND ERROR:", errText.substring(0, 250));
            throw new Error(`Server returned status ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            const messageData = {
              receiverId: activeChatId, text: '🎙️ Audio Message', messageType: 'audio', fileUrl: data.fileUrl
            };
            const res = await apiRequest('/messages', { method: 'POST', body: messageData });
            const savedData = await res.json();

            if (savedData.success) {
               const savedMessage = { ...savedData.data, senderId: currentUserId, receiverId: activeChatId };
               if (socket) socket.emit('send-message', savedMessage);
               
               setChatHistory((prev) => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), savedMessage] }));

               setContacts((prevContacts) => {
                 const filtered = prevContacts.filter((c) => getUserId(c) !== activeChatId);
                 const existing = prevContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
                 return [{ ...existing, lastMessage: '🎙️ Audio Message', time: 'Just now' }, ...filtered];
               });
            }
          }
        } catch (err) { 
          console.error("Audio upload error:", err); 
          alert("Voice message upload failed: Check if backend /upload route is live.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

    } catch (err) {
      alert("Please allow microphone permissions to record voice messages.");
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
    clearInterval(recordingIntervalRef.current);
    setRecordingTime(0);
  };

  // ✉️ SEND TEXT MESSAGE HANDLER
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !activeChatId) return;

    const messageText = newMessage;
    setNewMessage(''); 
    setShowEmojiPicker(false);

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId, senderId: currentUserId, receiverId: activeChatId,
      text: messageText, messageType: 'text', createdAt: new Date().toISOString(), status: 'sent'
    };

    setChatHistory((prev) => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMessage] }));

    setContacts((prevContacts) => {
      const filtered = prevContacts.filter((c) => getUserId(c) !== activeChatId);
      const existing = prevContacts.find((c) => getUserId(c) === activeChatId) || activeChat;
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
          ...prev, [activeChatId]: prev[activeChatId].map(msg => msg._id === tempId ? savedMessage : msg)
        }));
      }
    } catch (error) { console.error("Error sending message:", error); }
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
      {/* Header */}
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
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 ${theme.iconHover} rounded-full transition-colors`} title="Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${theme.chatBg} space-y-3 relative`} onClick={() => showEmojiPicker && setShowEmojiPicker(false)}>
        {currentMessages.map((msg, index) => {
          const isMyMessage = getUserId(msg.senderId || msg.sender) === currentUserId;
          const tickColor = msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]';
          
          return (
            <div key={msg._id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1`}>
              <div className={`max-w-[85%] sm:max-w-[70%] w-fit relative px-3 pt-1.5 pb-2 text-[15px] shadow-sm ${
                isMyMessage ? `${theme.msgMine} rounded-lg rounded-tr-none` : `${theme.msgOther} rounded-lg rounded-tl-none`   
              }`}>
                {(msg.messageType === 'call' || msg.callDetails?.callType) ? (
                  <div className="flex items-center gap-3 pr-8 pb-2 mt-1">
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
                  <div className="flex items-center gap-2 pb-1 pr-6">
                     <Mic size={18} />
                     <span>Voice Message</span>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap break-words text-left leading-relaxed">{msg.text}</span>
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

      {showEmojiPicker && (
        <div className="absolute bottom-[75px] left-4 z-50 shadow-xl">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={isDarkMode ? 'dark' : 'light'} lazyLoadEmojis={true} />
        </div>
      )}

      <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*,application/pdf" />

      <form onSubmit={handleSendMessage} className={`px-2 sm:px-4 py-3 ${theme.inputBar} flex items-center gap-2 sm:gap-3 shrink-0`}>
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
          className={`flex-1 ${theme.inputBg} ${theme.textPrimary} px-4 py-2 rounded-lg outline-none text-[15px]`}
          disabled={isRecording}
        />

        {newMessage.trim() ? (
          <button type="submit" className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#029173] transition-colors shrink-0">
            <Send size={20} />
          </button>
        ) : isRecording ? (
          // 🆕 പുതിയ ഓഡിയോ റെക്കോർഡിങ് UI (Cancel & Send Buttons)
          <div className="flex items-center gap-3 bg-red-100 text-red-600 px-3 py-1.5 rounded-full shrink-0">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-sm font-bold min-w-[20px]">{recordingTime}s</span>
            
            <button type="button" onClick={cancelRecording} className="p-1.5 bg-white hover:bg-gray-200 rounded-full text-red-500 transition-colors shadow-sm" title="Cancel Recording">
              <X size={16} />
            </button>

            <button type="button" onClick={sendRecording} className="p-1.5 bg-[#00a884] hover:bg-[#029173] rounded-full text-white transition-colors shadow-sm" title="Send Audio">
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        ) : (
          <Mic size={24} className={`${theme.iconColor} cursor-pointer shrink-0`} onClick={startRecording} />
        )}
      </form>
    </div>
  );
};

export default ChatWindow;
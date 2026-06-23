import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';

const VideoCall = ({ 
  socket, 
  currentUserId, 
  activeChatId, 
  activeChatName = "User", 
  activeChatAvatar,        
  incomingSignal, 
  onEndCall, 
  callType = 'video',
  isCaller // 🚀 PRO FIX: Caller ആണോ Receiver ആണോ എന്ന് തിരിച്ചറിയാൻ
}) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [mediaError, setMediaError] = useState(null); 
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio'); 
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const startTimeRef = useRef(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);
  const hasEndedRef = useRef(false);

  // 🎵 AUDIO REFS
  const ringtoneRef = useRef(null);
  const ringbackRef = useRef(null);

  // 🎵 Safe Client-Side Audio Initialization
  useEffect(() => {
    ringtoneRef.current = new Audio('/sounds/ringtone.mp3');
    ringbackRef.current = new Audio('/sounds/ringback.mp3');
    
    ringtoneRef.current.loop = true;
    ringbackRef.current.loop = true;

    // Cleanup audio on component unmount
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      if (ringbackRef.current) {
        ringbackRef.current.pause();
        ringbackRef.current.currentTime = 0;
      }
    };
  }, []);

  // 🎵 Play/Pause Audio based on Call Status
  useEffect(() => {
    if (!ringtoneRef.current || !ringbackRef.current) return;

    // കോൾ കണക്ട് ആയിട്ടില്ലെങ്കിൽ സൗണ്ട് പ്ലേ ചെയ്യുക
    if (!callAccepted) {
      if (isCaller) {
        // വിളിക്കുന്ന ആളാണെങ്കിൽ Ringback കേൾപ്പിക്കുക
        ringbackRef.current.play().catch(e => console.log("Ringback play blocked by browser:", e));
      } else {
        // കോൾ വരുന്ന ആളാണെങ്കിൽ Ringtone കേൾപ്പിക്കുക
        ringtoneRef.current.play().catch(e => console.log("Ringtone play blocked by browser:", e));
      }
    } else {
      // കോൾ അറ്റൻഡ് ചെയ്താൽ എല്ലാ സൗണ്ടും നിർത്തുക
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringbackRef.current.pause();
      ringbackRef.current.currentTime = 0;
    }
  }, [isCaller, callAccepted]);

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
  }, []);

  // 🚀 PRO FIX: കോൾ കട്ട് ചെയ്യുന്ന പ്രോസസ്സ് രണ്ടുപേരിലും സിംഗിൾ ടൈം ആക്കാൻ ഒരു കോമൺ ഫങ്ക്ഷൻ
  const endCallSequence = useCallback((duration) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    // 🎵 Force stop sounds on end call
    if (ringtoneRef.current) ringtoneRef.current.pause();
    if (ringbackRef.current) ringbackRef.current.pause();

    stopAllTracks();
    if (connectionRef.current) {
      try {
        connectionRef.current.destroy();
      } catch (err) {
        console.log("Peer already destroyed");
      }
    }
    // 💡 ഇവിടെ നമ്മൾ duration-ൊപ്പം 'isCaller' കൂടി അയക്കുന്നു.
    onEndCall(duration, isCaller);
  }, [isCaller, onEndCall, stopAllTracks]);

  // 1. സോക്കറ്റ് ഇവന്റുകൾ കേൾക്കാനുള്ള എഫക്റ്റ്
  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = (data) => {
      console.log("✅ [WebRTC] Call accepted signal received!");
      setCallAccepted(true);
      if (connectionRef.current && !connectionRef.current.destroyed) {
        connectionRef.current.signal(data.signal || data);
      }
    };

    const handleCallEnded = () => {
      console.log("🚫 [WebRTC] Remote user ended the call");
      const duration = startTimeRef.current ? Math.round((new Date() - startTimeRef.current) / 1000) : 0;
      endCallSequence(duration);
    };

    if (isCaller) {
      socket.on('call-accepted', handleCallAccepted);
    }
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, isCaller, endCallSequence]);

  // 2. ക്യാമറ/മൈക്ക് പെർമിഷൻ എടുക്കാനും, Caller ആണെങ്കിൽ കോൾ വിളിക്കാനും
  useEffect(() => {
    let active = true;
    const mediaConstraints = {
      video: callType === 'video',
      audio: true
    };

    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((currentStream) => {
        if (!active) {
          currentStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = currentStream;
        setStream(currentStream);

        if (isCaller) {
          const peer = new Peer({ 
            initiator: true, 
            trickle: false, 
            stream: currentStream,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
              ]
            }
          });

          connectionRef.current = peer;

          peer.on('signal', (data) => {
            if (!socket) return;
            socket.emit('call-user', { 
              userToCall: activeChatId, 
              signalData: data, 
              from: currentUserId, 
              callType 
            });
          });

          peer.on('stream', (remoteUserStream) => {
            console.log("✅ [WebRTC] Remote stream attached!");
            if (active) {
              setRemoteStream(remoteUserStream);
              setCallAccepted(true);
            }
          });

          peer.on('connect', () => {
            console.log("🔗 [WebRTC] P2P Connection Established!");
            startTimeRef.current = new Date();
          });

          peer.on('error', (err) => {
            console.error("[WebRTC] Error:", err);
          });
        }
      })
      .catch(err => {
        console.error("Media access failed:", err);
        setMediaError("Camera or Microphone permission denied.");
      });

    return () => {
      active = false;
      if (!hasEndedRef.current) {
        stopAllTracks();
        if (connectionRef.current) {
          connectionRef.current.destroy();
        }
      }
    };
  }, [callType, activeChatId, currentUserId, socket, isCaller, stopAllTracks]);

  // കോൾ അറ്റൻഡ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ (Receiver-ന് വേണ്ടി)
  const answerCall = () => {
    setCallAccepted(true);
    
    // 🎵 അറ്റൻഡ് ചെയ്താൽ ഉടൻ റിംഗ്‌ടോൺ നിർത്തുന്നു
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    
    const peer = new Peer({ 
      initiator: false, 
      trickle: false, 
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    connectionRef.current = peer;

    peer.on('signal', (data) => {
      socket.emit('accept-call', { signal: data, to: activeChatId });
    });

    peer.on('stream', (remoteUserStream) => {
      console.log("✅ [WebRTC] Remote stream attached!");
      setRemoteStream(remoteUserStream);
    });

    peer.on('connect', () => {
      console.log("🔗 [WebRTC] P2P Connection Established!");
      startTimeRef.current = new Date();
    });

    peer.signal(incomingSignal);
  };

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted, isSpeakerOn]);

  const toggleMic = () => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream && stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const toggleSpeaker = () => {
    if (userVideo.current) {
      userVideo.current.muted = isSpeakerOn; 
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  const leaveCall = () => {
    const duration = startTimeRef.current ? Math.round((new Date() - startTimeRef.current) / 1000) : 0;
    if (socket) {
      socket.emit('end-call', { to: activeChatId });
    }
    endCallSequence(duration);
  };

  return (
    <div className="absolute inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center font-sans select-none">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Media Error State */}
        {mediaError && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Media Access Error</h2>
            <p className="text-slate-400 mb-6">{mediaError}</p>
            <button onClick={leaveCall} className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-500">
              Close Call
            </button>
          </div>
        )}

        {/* Main Screen */}
        {callAccepted && remoteStream ? (
          callType === 'video' ? (
            <video playsInline ref={userVideo} autoPlay muted={!isSpeakerOn} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6">
              {activeChatAvatar ? (
                <img src={activeChatAvatar} alt={activeChatName} className="w-32 h-32 rounded-full border-4 border-emerald-500/50 shadow-lg shadow-emerald-950 object-cover" />
              ) : (
                <div className="w-32 h-32 bg-emerald-600/20 border-2 border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center text-4xl font-black shadow-lg shadow-emerald-950">
                  {activeChatName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col items-center">
                <h2 className="text-white text-2xl font-bold">{activeChatName}</h2>
                <div className="text-emerald-400 font-bold text-sm tracking-widest uppercase mt-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> Ongoing Audio Call
                </div>
              </div>
              <audio ref={userVideo} autoPlay playsInline muted={!isSpeakerOn} />
            </div>
          )
        ) : !isCaller && !callAccepted ? (
          <div className="flex flex-col items-center space-y-8 z-50">
            {activeChatAvatar ? (
              <img src={activeChatAvatar} alt={activeChatName} className="w-32 h-32 rounded-full border-4 border-slate-700 animate-bounce object-cover shadow-2xl" />
            ) : (
              <div className="w-32 h-32 bg-slate-900 border-2 border-slate-700 text-slate-400 rounded-full flex items-center justify-center text-4xl font-black animate-bounce shadow-2xl">
                {activeChatName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex flex-col items-center text-center">
              <h2 className="text-white text-3xl font-bold mb-2">{activeChatName}</h2>
              <p className="text-emerald-400 font-medium text-lg tracking-wider animate-pulse">
                Incoming {callType} call...
              </p>
            </div>

            <div className="flex items-center gap-10 mt-8">
              <button 
                onClick={leaveCall} 
                className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95"
                title="Reject"
              >
                <PhoneOff size={28} />
              </button>

              <button 
                onClick={answerCall} 
                disabled={!stream}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${!stream ? 'bg-emerald-800/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'}`}
                title="Accept"
              >
                <Phone size={28} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {activeChatAvatar ? (
              <img src={activeChatAvatar} alt={activeChatName} className="w-24 h-24 rounded-full border-2 border-slate-700 animate-pulse object-cover" />
            ) : (
              <div className="w-24 h-24 bg-slate-900 border border-slate-800 text-slate-400 rounded-full flex items-center justify-center text-3xl font-black animate-pulse">
                {activeChatName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col items-center text-center">
              <h2 className="text-white text-xl font-bold">{activeChatName}</h2>
              <div className="text-slate-400 font-medium text-sm tracking-wider animate-bounce mt-2">
                Calling {callType.toUpperCase()}...
              </div>
            </div>
          </div>
        )}

        {/* Local Video Overlay */}
        {stream && callType === 'video' && (
          <div className={`absolute top-6 right-6 w-28 sm:w-36 h-40 sm:h-52 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl transition-all duration-300 ${!callAccepted && !isCaller ? 'opacity-0 pointer-events-none' : 'z-10'}`}>
            {isVideoOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500">
                <VideoOff size={24} />
              </div>
            ) : (
              <video playsInline ref={myVideo} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
            )}
          </div>
        )}

        {/* Bottom Control Bar */}
        {(callAccepted || isCaller) && (
          <div className="absolute bottom-8 flex items-center gap-4 sm:gap-6 px-6 py-3.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-full shadow-2xl z-20">
            <button onClick={toggleMic} className={`p-3.5 rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white'}`} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button onClick={toggleSpeaker} className={`p-3.5 rounded-full transition-all active:scale-95 ${!isSpeakerOn ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white'}`} title={isSpeakerOn ? "Speaker Off" : "Speaker On"}>
              {!isSpeakerOn ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {callType === 'video' && (
              <button onClick={toggleVideo} className={`p-3.5 rounded-full transition-all active:scale-95 ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white'}`} title={isVideoOff ? "Start Video" : "Stop Video"}>
                {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
              </button>
            )}

            <button onClick={leaveCall} className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg shadow-red-600/30 transition-all active:scale-95" title="End Call">
              <PhoneOff size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VideoCall;
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, VolumeX } from 'lucide-react';

const VideoCall = ({ socket, currentUserId, activeChatId, incomingSignal, onEndCall, callType = 'video' }) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio'); 
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const startTimeRef = useRef(null);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const streamRef = useRef(null);

  // Stale Closures പൂർണ്ണമായി ഒഴിവാക്കാൻ പ്രോപ്പുകളെ റെഫറൻസുകളിലേക്ക് മാറ്റുന്നു
  const socketRef = useRef(socket);
  const activeChatIdRef = useRef(activeChatId);
  const currentUserIdRef = useRef(currentUserId);
  const onEndCallRef = useRef(onEndCall);
  const incomingSignalRef = useRef(incomingSignal);

  useEffect(() => {
    socketRef.current = socket;
    activeChatIdRef.current = activeChatId;
    currentUserIdRef.current = currentUserId;
    onEndCallRef.current = onEndCall;
    incomingSignalRef.current = incomingSignal;
  }, [socket, activeChatId, currentUserId, onEndCall, incomingSignal]);

  // Local Video Playback
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
      myVideo.current.play().catch(err => console.warn("Local video play error:", err));
    }
  }, [stream, isVideoOff]);

  // Remote Video/Audio Playback
  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
      userVideo.current.play().catch(err => {
        console.warn("Autoplay blocked by browser:", err);
      });
    }
  }, [remoteStream, callAccepted]);

  useEffect(() => {
    let active = true;

    const mediaConstraints = {
      video: callType === 'video',
      audio: true
    };

    const handleCallAccepted = (data) => {
      console.log("✅ Call accepted signal received!");
      setCallAccepted(true);
      if (connectionRef.current && !connectionRef.current.destroyed) {
        // 💡 FIX 1: ബാക്ക്എൻഡിൽ നിന്ന് വരുന്നത് സിഗ്നൽ ഒബ്ജക്റ്റ് ആണെങ്കിൽ അത് വേർതിരിച്ചെടുക്കുന്നു
        const signalData = data.signal ? data.signal : data;
        connectionRef.current.signal(signalData);
      }
    };

    const handleCallEnded = () => {
      console.log("🚫 Remote user ended the call");
      onEndCallRef.current(0); 
    };

    if (!incomingSignalRef.current) {
      socketRef.current.on('call-accepted', handleCallAccepted);
    }
    socketRef.current.on('call-ended', handleCallEnded);

    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((currentStream) => {
        if (!active) {
          currentStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = currentStream;
        setStream(currentStream);

        const peer = new Peer({ 
          initiator: !incomingSignalRef.current, 
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
          if (incomingSignalRef.current) {
            // 💡 FIX 2: വിളിച്ച ആളുടെ യഥാർത്ഥ ഐഡിയിലേക്ക് (from) സിഗ്നൽ തിരികെ അയക്കുന്നു
            const callerId = incomingSignalRef.current.from || activeChatIdRef.current;
            socketRef.current.emit('accept-call', { signal: data, to: callerId });
          } else {
            socketRef.current.emit('call-user', { 
              userToCall: activeChatIdRef.current, 
              signalData: data, 
              from: currentUserIdRef.current, 
              callType 
            });
          }
        });

        peer.on('stream', (userStream) => {
          console.log("✅ Remote stream received!"); 
          if (active) {
            setRemoteStream(userStream);
          }
        });

        peer.on('connect', () => {
          startTimeRef.current = new Date();
        });

        if (incomingSignalRef.current) {
          setCallAccepted(true);
          // 💡 FIX 3: incomingSignal-ൽ നിന്ന് കൃത്യമായ 'signal' ഡാറ്റ മാത്രം എടുത്ത് peer-ലേക്ക് പാസ്സ് ചെയ്യുന്നു
          const actualSignal = incomingSignalRef.current.signal ? incomingSignalRef.current.signal : incomingSignalRef.current;
          peer.signal(actualSignal);
        }
      })
      .catch(err => {
        console.error("Permission denied:", err);
        if (active) onEndCallRef.current(0); 
      });

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.off('call-accepted', handleCallAccepted);
        socketRef.current.off('call-ended', handleCallEnded);
      }
      
      if (connectionRef.current) connectionRef.current.destroy();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [callType]);

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
    const endTime = new Date();
    const duration = startTimeRef.current ? Math.round((endTime - startTimeRef.current) / 1000) : 0;
    
    socketRef.current.emit('end-call', { to: activeChatIdRef.current });

    if (connectionRef.current) connectionRef.current.destroy();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    onEndCallRef.current(duration);
  };

  return (
    <div className="absolute inset-0 bg-gray-900 z-[100] flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        
        {callAccepted ? (
          callType === 'video' ? (
            <video playsInline ref={userVideo} autoPlay muted={!isSpeakerOn} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-white">
              <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-4xl mb-4 font-bold uppercase">
                {activeChatId ? activeChatId.slice(-2) : 'AU'}
              </div>
              <div className="text-xl animate-pulse">On Audio Call...</div>
              
              <audio ref={userVideo} autoPlay playsInline muted={!isSpeakerOn} />
            </div>
          )
        ) : (
          <div className="text-white text-2xl animate-pulse">Calling...</div>
        )}

        {stream && callType === 'video' && (
          <div className="absolute top-6 right-6 w-32 h-48 bg-gray-850 rounded-xl overflow-hidden border-2 border-white shadow-lg z-10">
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-gray-400">
                <VideoOff size={24} />
              </div>
            )}
            <video 
              playsInline 
              ref={myVideo} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`} 
            />
          </div>
        )}

        {/* Control Bar */}
        <div className="absolute bottom-10 flex gap-6 px-6 py-4 bg-slate-800/80 backdrop-blur-md rounded-full shadow-2xl z-20">
          <button onClick={toggleMic} className={`p-4 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-600/50 text-white'}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button onClick={toggleSpeaker} className={`p-4 rounded-full ${!isSpeakerOn ? 'bg-red-500/20 text-red-500' : 'bg-gray-600/50 text-white'}`}>
            {!isSpeakerOn ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          {callType === 'video' && (
            <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-gray-600/50 text-white'}`}>
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>
          )}

          <button onClick={leaveCall} className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
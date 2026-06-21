import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, VolumeX } from 'lucide-react';

const VideoCall = ({ socket, currentUserId, activeChatId, incomingSignal, onEndCall, callType = 'video' }) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio'); 
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // 🔊 Speaker State

  // 💡 കോൾ ടൈമിംഗ് ട്രാക്ക് ചെയ്യാൻ
  const startTimeRef = useRef(null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]);

  useEffect(() => {
    let active = true;

    // 💡 ഓഡിയോ കോൾ ആണെങ്കിൽ video: false ആക്കുന്നു
    const mediaConstraints = {
      video: callType === 'video',
      audio: true
    };

    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((currentStream) => {
        if (!active) return;
        setStream(currentStream);

        const peer = new Peer({ 
          initiator: !incomingSignal, 
          trickle: false, 
          stream: currentStream 
        });

        connectionRef.current = peer;

        peer.on('signal', (data) => {
          if (incomingSignal) {
            socket.emit('accept-call', { signal: data, to: activeChatId });
          } else {
            socket.emit('call-user', { userToCall: activeChatId, signalData: data, from: currentUserId, callType });
          }
        });

        peer.on('stream', (userStream) => {
          setRemoteStream(userStream);
        });

        // 💡 കോൾ കണക്ട് ആകുമ്പോൾ സമയം നോട്ട് ചെയ്യുന്നു
        peer.on('connect', () => {
          startTimeRef.current = new Date();
        });

        if (incomingSignal) {
          setCallAccepted(true);
          peer.signal(incomingSignal);
        } else {
          socket.on('call-accepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
          });
        }
      })
      .catch(err => {
        console.error("Permission denied:", err);
        onEndCall(0); 
      });

    return () => {
      active = false;
      if (connectionRef.current) connectionRef.current.destroy();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [incomingSignal, activeChatId, socket, currentUserId, callType]);

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

  // 🔊 Speaker ON/OFF ചെയ്യാനുള്ള ഫംഗ്ഷൻ
  const toggleSpeaker = () => {
    if (userVideo.current) {
      userVideo.current.muted = isSpeakerOn; // ടോഗിൾ ചെയ്യുന്നു
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  const leaveCall = () => {
    const endTime = new Date();
    const duration = startTimeRef.current ? Math.round((endTime - startTimeRef.current) / 1000) : 0;
    
    console.log(`Call Duration: ${duration} seconds`);

    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    
    // 💡 കോൾ ടൈം ചാറ്റിൽ മെസ്സേജ് ആയി സേവ് ചെയ്യാൻ ഡ്യൂറേഷൻ കൂടി പാസ്സ് ചെയ്യുന്നു
    onEndCall(duration);
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
                {activeChatId.slice(-2)}
              </div>
              <div className="text-xl animate-pulse">On Audio Call...</div>
              
              {/* 🔊 ഓഡിയോ കോൾ കേൾക്കാൻ വേണ്ടിയുള്ള ഹിഡൻ ടാഗ് ഇവിടെ ആഡ് ചെയ്തു */}
              <audio ref={userVideo} autoPlay playsInline muted={!isSpeakerOn} />
            </div>
          )
        ) : (
          <div className="text-white text-2xl animate-pulse">Calling...</div>
        )}

        {/* Local Video - വീഡിയോ കോളിന് മാത്രം കാണിക്കുന്നു */}
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

        {/* 🛠️ Control Bar */}
        <div className="absolute bottom-10 flex gap-6 px-6 py-4 bg-slate-800/80 backdrop-blur-md rounded-full shadow-2xl z-20">
          {/* Mute/Unmute Mic */}
          <button onClick={toggleMic} className={`p-4 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-600/50 text-white'}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* 🔊 New Speaker Button (Audio/Video രണ്ട് കോളിലും കാണിക്കും) */}
          <button onClick={toggleSpeaker} className={`p-4 rounded-full ${!isSpeakerOn ? 'bg-red-500/20 text-red-500' : 'bg-gray-600/50 text-white'}`}>
            {!isSpeakerOn ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          {/* Video Toggle */}
          {callType === 'video' && (
            <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-gray-600/50 text-white'}`}>
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>
          )}

          {/* End Call Button */}
          <button onClick={leaveCall} className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
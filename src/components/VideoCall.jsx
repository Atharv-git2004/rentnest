import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

const VideoCall = ({ socket, currentUserId, activeChatId, incomingSignal, onEndCall, callType = 'video' }) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio'); 

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // സ്വന്തം വീഡിയോ സ്ട്രീം കണക്ട് ചെയ്യുന്നു
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, isVideoOff]); // 👈 ക്യാമറ ടോഗിൾ ചെയ്യുമ്പോൾ റീ-കണക്ട് ഉറപ്പാക്കാൻ ഡിപെൻഡൻസി ചേർത്തു

  // മറ്റേ ആളുടെ വീഡിയോ സ്ട്രീം കണക്ട് ചെയ്യുന്നു
  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]);

  useEffect(() => {
    let active = true;

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
        console.error("Microphone/Camera permission denied:", err);
        onEndCall(); 
      });

    return () => {
      active = false;
      if (connectionRef.current) connectionRef.current.destroy();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [incomingSignal, activeChatId, socket, currentUserId, callType]);

  // മൈക്ക് ഓൺ/ഓഫ് ഫങ്ഷൻ
  const toggleMic = () => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // ക്യാമറ ഓൺ/ഓഫ് ഫങ്ഷൻ
  const toggleVideo = () => {
    if (stream && stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const leaveCall = () => {
    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    onEndCall();
  };

  return (
    <div className="absolute inset-0 bg-gray-900 z-[100] flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Remote User Video / Avatar */}
        {callAccepted ? (
          callType === 'video' ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-4xl text-white mb-4 uppercase font-bold">
                U
              </div>
              <div className="text-white text-xl animate-pulse">In Audio Call...</div>
            </div>
          )
        ) : (
          <div className="text-white text-2xl animate-pulse">Calling...</div>
        )}

        {/* Local User Video (Your face) */}
        {stream && callType === 'video' && (
          <div className="absolute top-6 right-6 w-32 h-48 bg-gray-850 rounded-xl overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-slate-800">
            {/* ക്യാമറ ഓഫ് ആണെങ്കിൽ കാണിക്കേണ്ട UI */}
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-gray-400 z-10">
                <VideoOff size={24} className="mb-1" />
                <span className="text-[10px] font-bold">Camera Off</span>
              </div>
            )}
            {/* വീഡിയോ ടാഗ് എപ്പോഴും ഇവിടെ ഉണ്ടായിരിക്കും, ക്യാമറ ഓഫ് ചെയ്യുമ്പോൾ hidden ആകും */}
            <video 
              playsInline 
              ref={myVideo} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`} 
            />
          </div>
        )}

        {/* കോൾ കൺട്രോൾ ബട്ടണുകൾ */}
        <div className="absolute bottom-10 flex gap-6 px-6 py-4 bg-slate-800/80 backdrop-blur-md rounded-full shadow-2xl z-20">
          {/* മ്യൂട്ട് ബട്ടൺ */}
          <button 
            onClick={toggleMic} 
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-600/50 text-white hover:bg-gray-600'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* ക്യാമറ ടോഗിൾ ബട്ടൺ (വീഡിയോ കോളിൽ മാത്രം കാണിക്കും) */}
          {callType === 'video' && (
            <button 
              onClick={toggleVideo} 
              className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-600/50 text-white hover:bg-gray-600'}`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>
          )}

          {/* കോൾ കട്ട് ചെയ്യാനുള്ള ബട്ടൺ */}
          <button 
            onClick={leaveCall} 
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform transform hover:scale-110 shadow-lg"
          >
            <PhoneOff size={24} />
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default VideoCall;
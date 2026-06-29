import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // ലോഗിൻ ചെയ്ത യൂസറിനെ തിരിച്ചറിയാൻ

const SocketContext = createContext();

// Custom hook to use socket
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    // 💡 Extract the ID as a primitive string outside the effect
    const currentUserId = user ? (user._id || user.id)?.toString() : null;

    useEffect(() => {
        // യൂസർ ലോഗിൻ അല്ലെങ്കിലോ ലോഗൗട്ട് ചെയ്താലോ ഒന്നും ചെയ്യേണ്ടതില്ല (പഴയ സോക്കറ്റ് ഉണ്ടെങ്കിൽ ക്ലോസ് ചെയ്യും)
        if (!currentUserId) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        console.log("🔌 Initializing connection for User ID:", currentUserId);
        
        // 💡 ഇവിടെയാണ് മാറ്റം വരുത്തിയിരിക്കുന്നത്. Render ലിങ്കിന് പകരം Localhost ബാക്ക്-എൻഡ് യുആർഎൽ നൽകി.
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

        // പുതിയ കണക്ഷൻ ഉണ്ടാക്കുന്നു
        const newSocket = io(SOCKET_URL, {
            query: { userId: currentUserId }, 
            // Render-ലും ലോക്കൽഹോസ്റ്റിലും കണക്ഷൻ ഡ്രോപ്പ് ആകാതിരിക്കാൻ പോളിങ് കൂടി ചേർക്കുന്നു
            transports: ['polling', 'websocket'],
            autoConnect: true,
            reconnectionAttempts: 5, 
            reconnectionDelay: 2000  
        });
        
        setSocket(newSocket);

        // Connection Events Listeners
        newSocket.on("connect", () => {
            console.log("✅ Socket connected successfully! Socket ID:", newSocket.id);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("⚠️ Socket disconnected due to:", reason);
        });

        newSocket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err.message);
        });

        // Cleanup function: കോമ്പോണന്റ് അൺമൗണ്ട് ആകുമ്പോഴോ യൂസർ മാറുമ്പോഴോ കണക്ഷൻ കട്ട് ചെയ്യുക
        return () => {
            console.log("🛑 Disconnecting socket and cleaning up...");
            newSocket.off("connect");
            newSocket.off("disconnect");
            newSocket.off("connect_error");
            newSocket.disconnect();
        };
    }, [currentUserId]); 

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
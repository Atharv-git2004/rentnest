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
        
        // Render URL അല്ലെങ്കിൽ Localhost (എൻവിറോൺമെന്റ് വേരിയബിൾ ഉപയോഗിക്കാം)
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://rentnest-backend-civ9.onrender.com";

        // പുതിയ കണക്ഷൻ ഉണ്ടാക്കുന്നു
        const newSocket = io(SOCKET_URL, {
            query: { userId: currentUserId }, 
            // 💡 Note: transports: ["websocket"] ഞാൻ ഒഴിവാക്കി. 
            // Render-ൽ കണക്ഷൻ എറർ വരുന്നത് ഒഴിവാക്കാൻ ഡിഫോൾട്ട് രീതി (polling -> websocket) ഉപയോഗിക്കുന്നതാണ് നല്ലത്.
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
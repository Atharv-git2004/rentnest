import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; 

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    // 💡 Extract the ID as a primitive string outside the effect
    const currentUserId = user ? (user._id || user.id)?.toString() : null;

    useEffect(() => {
        // If there is no user logged in, don't do anything
        if (!currentUserId) return;

        let newSocket;
        console.log("🔌 Initializing connection for User ID:", currentUserId);
        
        // 💡 മാറ്റം വരുത്തിയ ഭാഗം: localhost മാറ്റി പുതിയ Render ലിങ്ക് നൽകി.
        // ശ്രദ്ധിക്കുക: Socket-ന് '/api' ഇല്ലാത്ത മെയിൻ ലിങ്ക് ആണ് വേണ്ടത്.
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://rentnest-backend-civ9.onrender.com";

        newSocket = io(SOCKET_URL, {
            query: { userId: currentUserId }, 
            transports: ["websocket"], 
            autoConnect: true,
            reconnectionAttempts: 5, 
            reconnectionDelay: 2000  
        });
        
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ Socket connected successfully! Socket ID:", newSocket.id);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("⚠️ Socket disconnected due to:", reason);
        });

        newSocket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err.message);
        });

        // Cleanup function
        return () => {
            if (newSocket) {
                console.log("🛑 Disconnecting socket and cleaning up...");
                newSocket.off("connect");
                newSocket.off("disconnect");
                newSocket.off("connect_error");
                newSocket.disconnect();
                setSocket(null); 
            }
        };
    }, [currentUserId]); 

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
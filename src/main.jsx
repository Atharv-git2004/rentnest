import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { GoogleOAuthProvider } from '@react-oauth/google';

// AuthProvider ഉം SocketProvider ഉം ഇവിടെ ഇംപോർട്ട് ചെയ്യുന്നു
import { AuthProvider } from './context/AuthContext.jsx';
// 💡 നിങ്ങളുടെ SocketContext ഫയൽ ഉള്ള കൃത്യമായ പാത്ത് ഇവിടെ കൊടുക്കുക
import { SocketProvider } from './context/SocketContext.jsx'; 

const GOOGLE_CLIENT_ID = "532480409678-d6givfpqbi16tceg8lupdjnk96ukvpq8.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        {/* 💡 SocketProvider ഇവിടെ App-നെ റാപ്പ് ചെയ്ത് നൽകുന്നു */}
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
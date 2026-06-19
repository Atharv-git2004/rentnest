import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { GoogleOAuthProvider } from '@react-oauth/google'; // 💡 ഗൂഗിൾ പ്രൊവൈഡർ ഇംപോർട്ട് ചെയ്തു

// AuthProvider ഇവിടെ നൽകുന്നു, SocketProvider നമ്മൾ App.jsx-ൽ കൊടുത്തിട്ടുണ്ട്.
import { AuthProvider } from './context/AuthContext.jsx';

// നമ്മൾ ഗൂഗിൾ ക്ലൗഡ് കൺസോളിൽ നിന്ന് എടുത്ത നിങ്ങളുടെ Client ID
const GOOGLE_CLIENT_ID = "532480409678-d6givfpqbi16tceg8lupdjnk96ukvpq8.apps.googleusercontent.com";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> {/* 💡 ഗൂഗിൾ പ്രൊവൈഡർ ഇവിടെ റാപ്പ് ചെയ്തു */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
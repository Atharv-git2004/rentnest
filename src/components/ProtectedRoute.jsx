import React from 'react';
import { Navigate, Link } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing userInfo:', error);
      return null;
    }
  };

  const userInfo = getStoredUser();

  // DEBUGGING: കൺസോളിൽ ഇത് വരുന്നുണ്ടോ എന്ന് നോക്കുക
  console.log("Full User Info from LocalStorage:", userInfo);

  // 1️⃣ ലോഗിൻ ചെയ്തിട്ടില്ലെങ്കിൽ ലോഗിൻ പേജിലേക്ക് വിടുക
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ റോൾ കണ്ടെത്താൻ നോക്കുന്നു (userInfo.role OR userInfo.user.role)
  const userRole = userInfo?.role || userInfo?.user?.role;
  
  console.log("Detected Role:", userRole);

  // 3️⃣ റോൾ ഇല്ലെങ്കിൽ അല്ലെങ്കിൽ അനുവാദമില്ലാത്ത റോൾ ആണെങ്കിൽ
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>🚫</div>
          <h1 style={styles.errorTitle}>Access Denied</h1>
          <p style={styles.errorText}>ഈ പേജ് കാണാനുള്ള അനുവാദം നിങ്ങൾക്കില്ല.</p>
          <p style={styles.subText}>
            നിങ്ങൾ ലോഗിൻ ചെയ്തിരിക്കുന്നത് <strong>'{userRole || 'undefined'}'</strong> എന്ന റോളിലാണ്. 
            ഇത് അഡ്മിൻ ആക്സസിന് യോജിച്ചതല്ല.
          </p>
          <div style={styles.btnGroup}>
            <Link to="/" style={styles.homeBtn}>Back to Home</Link>
            <button 
              onClick={() => { localStorage.removeItem('userInfo'); window.location.href = '/login'; }} 
              style={styles.loginBtn}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // എല്ലാം ശരിയാണെങ്കിൽ മാത്രം കമ്പോണന്റ് കാണിക്കുക
  return children;
};

const styles = {
  deniedContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', padding: '20px' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' },
  iconCircle: { fontSize: '40px', marginBottom: '20px' },
  errorTitle: { fontSize: '24px', fontWeight: '800', marginBottom: '10px' },
  errorText: { color: '#ef4444', marginBottom: '10px' },
  subText: { color: '#64748b', fontSize: '14px', marginBottom: '20px' },
  btnGroup: { display: 'flex', gap: '10px', justifyContent: 'center' },
  homeBtn: { padding: '10px 20px', borderRadius: '8px', backgroundColor: '#e2e8f0', textDecoration: 'none', color: '#333' },
  loginBtn: { padding: '10px 20px', borderRadius: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }
};

export default ProtectedRoute;
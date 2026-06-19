import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ആപ്പ് ലോഡ് ചെയ്യുമ്പോൾ localStorage-ൽ നിന്ന് യൂസർ വിവരങ്ങൾ എടുക്കുന്നു
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Login ഫങ്ഷൻ
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  // Logout ഫങ്ഷൻ
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    window.location.href = '/login'; // ലോഗൗട്ടിന് ശേഷം ലോഗിൻ പേജിലേക്ക്
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
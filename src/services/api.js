/**
 * services/api.js
 * Professional API Request Service with robust error handling and auto Content-Type management.
 */

const BASE_URL = import.meta.env?.VITE_API_URL || 'https://rentnest-backend-civ9.onrender.com/api';

export const apiRequest = async (endpoint, options = {}) => {
  // എപ്പൊഴും endpoint '/' വെച്ചാണ് തുടങ്ങുന്നത് എന്ന് ഉറപ്പാക്കാൻ
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${safeEndpoint}`;
  
  const headers = { ...options.headers };

  // 💡 Auto-manage Body and Content-Type
  if (options.body) {
    if (options.body instanceof FormData) {
      // ബ്രൗസർ സ്വയം ബൗണ്ടറി സഹിതം Content-Type സെറ്റ് ചെയ്തോളും
      delete headers['Content-Type']; 
    } else {
      // ഒബ്ജക്റ്റ് ആണെങ്കിൽ JSON ആക്കി മാറ്റുക
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
      // JSON Content-Type ഉറപ്പാക്കുക
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  // ലോക്കൽ സ്റ്റോറേജിൽ നിന്ന് ടോക്കൺ എടുക്കുന്നു
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser?.token) {
        headers['Authorization'] = `Bearer ${parsedUser.token}`;
      }
    }
  } catch (e) {
    console.warn("⚠️ Error reading token from localStorage:", e);
  }

  console.log(`🚀 API Request: [${options.method || 'GET'}] ${url}`);

  try {
    return await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(`❌ API Request Error on ${endpoint}:`, error);
    
    // നെറ്റ്‌വർക്ക് ഫെയിൽ ആയാലും ആപ്പ് ക്രാഷ് ആകാതിരിക്കാൻ സേഫ് ഒബ്ജക്റ്റ് നൽകുന്നു
    return {
      ok: false,
      status: 503,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ 
        success: false,
        message: "Network connection failed. Server might be down or unreachable.", 
        error: error.message 
      }),
      text: async () => "Network connection failed."
    };
  }
};
/**
 * services/api.js
 * Professional API Request Service with robust error handling, auto Content-Type management,
 * and Token Expiry (401) handling.
 */

// ട്രെയിലിംഗ് സ്ലാഷ് (Trailing slash) ഒഴിവാക്കുന്നു
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const apiRequest = async (endpoint, options = {}) => {
  
  // 1. URL കൃത്യമായി സെറ്റ് ചെയ്യാൻ (Double slashes & Duplicate /api/ ഒഴിവാക്കുന്നു)
  let url = `${BASE_URL}/${endpoint}`;
  
  // http:// ലെ ഡബിൾ സ്ലാഷ് നിലനിർത്തിക്കൊണ്ട് മറ്റ് ഡബിൾ സ്ലാഷുകൾ സിംഗിൾ സ്ലാഷ് ആക്കുന്നു
  url = url.replace(/([^:]\/)\/+/g, "$1");
  
  // VITE_API_URL-ലും endpoint-ലും 'api' വന്നാൽ ഉണ്ടാകുന്ന '/api/api/' പ്രശ്നം പരിഹരിക്കാൻ
  url = url.replace(/\/api\/api\//g, '/api/');
  
  // URL-ൽ ഒരിടത്തും /api ഇല്ലെങ്കിൽ അത് ചേർത്ത് കൊടുക്കാൻ (ആവശ്യമെങ്കിൽ മാത്രം)
  const urlObj = new URL(url);
  if (!urlObj.pathname.startsWith('/api')) {
    url = url.replace(urlObj.pathname, `/api${urlObj.pathname}`);
  }

  const headers = { ...options.headers };

  // 2. Auto-manage Body and Content-Type
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

  // 3. ലോക്കൽ സ്റ്റോറേജിൽ നിന്ന് ടോക്കൺ എടുക്കുന്നു
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
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 4. Handle Token Expiry (401 Unauthorized)
    if (response.status === 401) {
      console.warn("⚠️ Session expired. Logging out...");
      localStorage.removeItem('userInfo');
      window.location.href = '/login'; // ടോക്കൺ എക്സ്പയർ ആയാൽ ലോഗിൻ പേജിലേക്ക് വിടാൻ
      return response;
    }

    return response;
    
  } catch (error) {
    console.error(`❌ API Request Error on ${endpoint}:`, error);
    
    // 5. നെറ്റ്‌വർക്ക് ഫെയിൽ ആയാലും ആപ്പ് ക്രാഷ് ആകാതിരിക്കാൻ സേഫ് ഒബ്ജക്റ്റ് നൽകുന്നു
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
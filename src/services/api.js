/**
 * API Request Service
 * എല്ലാ ബാക്ക്-എൻഡ് കോളുകൾക്കും വേണ്ടി ഉപയോഗിക്കുന്ന കോമൺ ഫങ്ഷൻ
 */

// 💡 നിങ്ങളുടെ ബാക്കെൻഡ് URL കൃത്യമാണെന്ന് ഉറപ്പുവരുത്തുക
const BASE_URL = import.meta.env?.VITE_API_URL || 'https://rentnest-backend-civ9.onrender.com/api';

export const apiRequest = async (endpoint, options = {}) => {
  // Ensure endpoint starts with a slash
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${safeEndpoint}`;
  
  const headers = { ...options.headers };

  // 💡 ഫോം ഡാറ്റ ആണെങ്കിൽ Content-Type ബ്രൗസർ സ്വയം സെറ്റ് ചെയ്യണം
  // അല്ലാത്ത പക്ഷം JSON ആയി മാറ്റുക
  if (options.body instanceof FormData) {
    delete headers['Content-Type']; 
  } else if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  // ലോക്കൽ സ്റ്റോറേജിൽ നിന്ന് ടോക്കൺ എടുത്ത് ഹെഡ്ഡറിൽ ചേർക്കുന്നു
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser && parsedUser.token) {
        headers['Authorization'] = `Bearer ${parsedUser.token}`;
      }
    } catch (e) {
      console.error("Error parsing user info from localStorage:", e);
    }
  }

  // ഡീബഗ്ഗിങ്ങിന് വേണ്ടി മാത്രം (URL കൃത്യമാണോ എന്ന് നോക്കാൻ)
  console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;

  } catch (error) {
    console.error(`❌ API Request Error on ${endpoint}:`, error);
    
    // നെറ്റ്‌വർക്ക് എറർ ഉണ്ടായാലും ആപ്പ് ക്രാഷ് ആകാതിരിക്കാൻ 
    return {
      ok: false,
      status: 500,
      json: async () => ({ 
        success: false,
        message: "Network connection failed. Server might be down.", 
        error: error.message 
      }),
      text: async () => "Network connection failed."
    };
  }
};
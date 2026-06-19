/**
 * API Request Service
 * എല്ലാ ബാക്ക്-എൻഡ് കോളുകൾക്കും വേണ്ടി ഉപയോഗിക്കുന്ന കോമൺ ഫങ്ഷൻ
 */

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    ...options.headers,
  };

  // 💡 മാറ്റം 1: ബോഡി ഒരു പ്ലെയിൻ ഒബ്‌ജക്റ്റ് ആണെങ്കിൽ ഓട്ടോമാറ്റിക് ആയി stringify ചെയ്യും.
  // ഇനി കോമ്പോണന്റുകളിൽ JSON.stringify() എന്ന് പ്രത്യേകം എഴുതേണ്ടതില്ല.
  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  // FormData അല്ലാത്ത പക്ഷം മാത്രം 'application/json' സെറ്റ് ചെയ്യുന്നു.
  if (!(options.body instanceof FormData)) {
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;

  } catch (error) {
    console.error("API Request Error:", error);
    
    // 💡 മാറ്റം 2 (പ്രധാനം): നെറ്റ്‌വർക്ക് എറർ ഉണ്ടായാലും ആപ്പ് ക്രാഷ് ആകാതിരിക്കാൻ 
    // ഒരു ഫേക്ക് json() ഫങ്ക്ഷൻ കൂടി അടങ്ങിയ ഒബ്‌ജക്റ്റ് റിട്ടേൺ ചെയ്യുന്നു.
    return {
      ok: false,
      status: 500,
      json: async () => ({ 
        message: "Network connection failed. Server might be down.", 
        error: error.message 
      })
    };
  }
};
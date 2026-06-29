const envUrl = import.meta.env.VITE_API_URL || 'https://rentnest-backend-civ9.onrender.com/api';

// Ensure no trailing slashes on the base URL.
const BASE_URL = envUrl.replace(/\/+$/, '');

export const apiRequest = async (endpoint, options = {}) => {
  
  // 1. Properly format the URL
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${BASE_URL}/${cleanEndpoint}`;

  // 2. Safely manage Headers using the built-in Headers API to avoid case-sensitivity issues
  const headers = new Headers(options.headers || {});
  
  // Create a new fetch options object so we don't mutate the original options passed in
  const fetchOptions = { ...options };

  // 3. Auto-manage Body and Content-Type
  if (fetchOptions.body) {
    if (fetchOptions.body instanceof FormData) {
      // The browser automatically sets the Content-Type with the correct boundary for FormData
      headers.delete('Content-Type'); 
    } else if (typeof fetchOptions.body === 'object' && fetchOptions.body !== null) {
      // Convert object to JSON string if it's a valid object
      fetchOptions.body = JSON.stringify(fetchOptions.body);
      
      // Ensure JSON Content-Type is set
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  // 4. Retrieve token from localStorage
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser?.token) {
        headers.set('Authorization', `Bearer ${parsedUser.token}`);
      }
    }
  } catch (e) {
    console.warn("⚠️ Error reading token from localStorage:", e);
  }

  // Attach the finalized headers to our fetch options
  fetchOptions.headers = headers;

  console.log(`🚀 API Request: [${fetchOptions.method || 'GET'}] ${url}`);

  try {
    const response = await fetch(url, fetchOptions);

    // 5. Handle Token Expiry (401 Unauthorized)
    if (response.status === 401) {
      console.warn("⚠️ Session expired. Logging out...");
      localStorage.removeItem('userInfo');
      window.location.href = '/login'; 
      return response;
    }

    return response;
    
  } catch (error) {
    console.error(`❌ API Request Error on ${endpoint}:`, error);
    
    // 6. Return a safe fallback response to prevent the app from crashing
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
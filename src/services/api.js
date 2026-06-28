/**
 * services/api.js
 * Professional API Request Service with robust error handling, auto Content-Type management,
 * and Token Expiry (401) handling.
 */

// Ensure no trailing slashes on the base URL.
// Defaults to localhost:5000/api for local development if VITE_API_URL is not set in Vercel
const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = envUrl.replace(/\/+$/, '');

export const apiRequest = async (endpoint, options = {}) => {
  
  // 1. Properly format the URL
  // Remove any leading slashes from the endpoint to prevent double slashes (e.g., //users)
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${BASE_URL}/${cleanEndpoint}`;

  const headers = { ...options.headers };

  // 2. Auto-manage Body and Content-Type
  if (options.body) {
    if (options.body instanceof FormData) {
      // The browser automatically sets the Content-Type with the correct boundary for FormData
      delete headers['Content-Type']; 
    } else {
      // Convert object to JSON string if necessary
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
      // Ensure JSON Content-Type is set
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  // 3. Retrieve token from localStorage
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
      window.location.href = '/login'; // Redirect to login page on token expiry
      return response;
    }

    return response;
    
  } catch (error) {
    console.error(`❌ API Request Error on ${endpoint}:`, error);
    
    // 5. Return a safe fallback response to prevent the app from crashing on network failures
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
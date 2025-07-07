// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// In development, use relative URLs (proxied by Vite)
// In production, use the full API URL from environment variable
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (import.meta.env.DEV) {
    // Development: use relative URLs (Vite dev server will proxy to localhost:3000)
    return `/${cleanEndpoint}`;
  } else {
    // Production: use environment variable or relative URLs as fallback
    if (API_BASE_URL) {
      return `${API_BASE_URL}/${cleanEndpoint}`;
    } else {
      // Fallback to relative URLs (works if frontend and backend are on same domain)
      return `/${cleanEndpoint}`;
    }
  }
};

export const config = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}; 
// API utility functions for better error handling and token management

export const makeAuthenticatedRequest = async (url, options = {}, token) => {
  if (!token) {
    throw new Error('No authentication token available');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Authentication failed: ${errorData.message || 'Token invalid'}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error.message.includes('Authentication failed') || error.message.includes('Token invalid')) {
    return 'Session expired. Please login again.';
  }
  
  if (error.message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection.';
  }
  
  return error.message || fallbackMessage;
};

export const retryWithBackoff = async (fn, maxRetries = 2, delay = 1000) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries || error.message.includes('Authentication failed')) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

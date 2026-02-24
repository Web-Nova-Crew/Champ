// API Service - Connects to Estato Backend
// Uses local proxy to avoid CORS issues

// Use local proxy in browser, direct URL on server
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/proxy'  // Browser: use Next.js API proxy
  : 'https://champ-y6eg.onrender.com/api';  // Server: direct connection

// Flag to track if API is available
let apiAvailable = true;

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Helper to set auth token
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

// Helper to clear auth token
export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  }
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  // If API was previously unavailable, return early
  if (!apiAvailable) {
    return { success: false, error: 'API not available. Using local mode.' };
  }

  try {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || data.message || 'Request failed' };
    }

    return { success: true, data };
  } catch (error: any) {
    console.warn('API Error:', error.message || error);
    
    // If it's a network/CORS error, mark API as unavailable
    if (error.name === 'TypeError' || error.name === 'AbortError') {
      console.warn('Backend API not reachable. Falling back to Supabase/mock mode.');
      apiAvailable = false;
    }
    
    return { success: false, error: 'Network error. Using offline mode.' };
  }
}

// Check if API is available
export const isApiAvailable = () => apiAvailable;

// Reset API availability (for retry)
export const resetApiAvailability = () => {
  apiAvailable = true;
};

// ============ AUTH API ============

export const authApi = {
  // Register new user
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data?.token) {
      setAuthToken(result.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
      }
    }

    return result;
  },

  // Logout
  logout: () => {
    clearAuthToken();
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/users/profile');
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Check if logged in
  isLoggedIn: (): boolean => {
    return !!getAuthToken();
  },

  // Get stored user data
  getStoredUser: () => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

// ============ PROPERTIES API ============

export const propertiesApi = {
  // Get all properties with filters
  getProperties: async (filters?: {
    propertyType?: string;
    transactionType?: string;
    minPrice?: number;
    maxPrice?: number;
    area?: string;
    search?: string;
    city?: string;
    bedrooms?: number;
    bathrooms?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiRequest(`/properties${queryString ? `?${queryString}` : ''}`);
  },

  // Get single property
  getProperty: async (id: string) => {
    return apiRequest(`/properties/${id}`);
  },

  // Get featured properties
  getFeatured: async () => {
    return apiRequest('/properties?featured=true');
  },

  // Create property
  createProperty: async (propertyData: any) => {
    return apiRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  // Update property
  updateProperty: async (id: string, propertyData: any) => {
    return apiRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },

  // Delete property
  deleteProperty: async (id: string) => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // Get user's properties
  getMyProperties: async () => {
    return apiRequest('/properties/my-listings');
  },
};

// ============ SAVED PROPERTIES API ============

export const savedPropertiesApi = {
  // Get saved properties
  getSaved: async () => {
    return apiRequest('/saved-properties');
  },

  // Save property
  saveProperty: async (propertyId: string) => {
    return apiRequest('/saved-properties', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  // Remove saved property
  removeSaved: async (propertyId: string) => {
    return apiRequest(`/saved-properties/${propertyId}`, {
      method: 'DELETE',
    });
  },

  // Check if property is saved
  isSaved: async (propertyId: string) => {
    return apiRequest(`/saved-properties/check/${propertyId}`);
  },
};

// ============ USERS API ============

export const usersApi = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  // Update profile
  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    bio?: string;
  }) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Delete account
  deleteAccount: async () => {
    const result = await apiRequest('/users/profile', {
      method: 'DELETE',
    });
    if (result.success) {
      clearAuthToken();
    }
    return result;
  },
};

// ============ BOOKINGS API ============

export const bookingsApi = {
  // Get user's bookings
  getBookings: async () => {
    return apiRequest('/bookings');
  },

  // Create booking/schedule visit
  createBooking: async (bookingData: {
    propertyId: string;
    date: string;
    time: string;
    notes?: string;
  }) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel booking
  cancelBooking: async (id: string) => {
    return apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ ADMIN API ============

export const adminApi = {
  // Get dashboard stats
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  // Get all users
  getUsers: async () => {
    return apiRequest('/admin/users');
  },

  // Get all properties (admin)
  getAllProperties: async () => {
    return apiRequest('/admin/properties');
  },

  // Update property status
  updatePropertyStatus: async (id: string, status: string) => {
    return apiRequest(`/admin/properties/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete user
  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authApi,
  properties: propertiesApi,
  savedProperties: savedPropertiesApi,
  users: usersApi,
  bookings: bookingsApi,
  admin: adminApi,
};

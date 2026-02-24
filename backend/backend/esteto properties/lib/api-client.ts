// Real Backend API Client for Admin Panel
// Connects to the deployed backend at https://champ-y6eg.onrender.com

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://champ-y6eg.onrender.com/api';

// Admin credentials - Real admin user in database
// Password: Admin@123 (for real backend login)
// Demo password: admin123 (for offline demo mode)
const DEMO_ADMIN = {
  email: 'admin@estato.com',
  password: 'admin123', // Demo password for offline mode
  realPassword: 'Admin@123', // Real password for backend
  token: 'demo-admin-token-12345',
  user: {
    id: '27144234-ceca-4721-92b0-a1b392ad0d55',
    email: 'admin@estato.com',
    name: 'Estato Admin',
    role: 'admin',
    user_type: 'admin',
  }
};

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Auth
  async login(email: string, password: string) {
    // Check for demo credentials (offline mode)
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      this.setToken(DEMO_ADMIN.token);
      return {
        success: true,
        data: {
          token: DEMO_ADMIN.token,
          accessToken: DEMO_ADMIN.token,
          user: DEMO_ADMIN.user,
        },
        message: 'Demo login successful',
      };
    }

    // Try real backend login
    try {
      const response = await this.request<{ token: string; accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.success && response.data) {
        const token = response.data.accessToken || response.data.token;
        if (token) {
          this.setToken(token);
        }
        
        // For admin user, also set admin role in response
        if (email === DEMO_ADMIN.email) {
          response.data.user = {
            ...response.data.user,
            role: 'admin',
            user_type: 'admin',
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      // If backend is unreachable and using admin email with either password, allow demo login
      if (email === DEMO_ADMIN.email && (password === DEMO_ADMIN.password || password === DEMO_ADMIN.realPassword)) {
        this.setToken(DEMO_ADMIN.token);
        return {
          success: true,
          data: {
            token: DEMO_ADMIN.token,
            user: DEMO_ADMIN.user,
          },
          message: 'Demo login successful (offline mode)',
        };
      }
      return {
        success: false,
        error: 'Unable to connect to server. Please try again.',
      };
    }
  }

  async logout() {
    this.clearToken();
    return { success: true };
  }

  async getMe() {
    // Check for demo token
    const token = this.getToken();
    if (token === DEMO_ADMIN.token) {
      return {
        success: true,
        data: DEMO_ADMIN.user,
      };
    }
    
    return this.request('/auth/me');
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/admin/stats');
  }

  async getDashboard() {
    return this.request('/admin/dashboard');
  }

  // Analytics
  async getAnalytics(timeRange: string = '30d') {
    return this.request(`/admin/analytics?timeRange=${timeRange}`);
  }

  // Properties - Try admin endpoint first, fall back to public
  async getProperties(status?: string) {
    const query = status ? `?status=${status}` : '';
    
    // Try admin endpoint first (requires auth)
    const adminResponse = await this.request(`/admin/properties${query}`);
    if (adminResponse.success) {
      return adminResponse;
    }
    
    // Fall back to public endpoint with showAll flag
    return this.request(`/properties?showAll=true${status ? `&status=${status}` : ''}`);
  }

  // Get all properties including pending (for admin view)
  async getAllProperties() {
    // Try admin endpoint
    const adminResponse = await this.request('/admin/properties');
    if (adminResponse.success) {
      return adminResponse;
    }
    
    // Fall back - fetch from public with all statuses
    return this.request('/properties?showAll=true');
  }

  async getProperty(id: string) {
    return this.request<{
      id: string;
      title: string;
      description?: string;
      property_type?: string;
      type?: string;
      transaction_type?: string;
      listing_type?: 'sale' | 'rent';
      price: number;
      location?: string;
      city?: string;
      area?: string;
      bedrooms?: number;
      bathrooms?: number;
      size?: number;
      sqft?: number;
      images?: string[];
      amenities?: string[];
      owner_id?: string;
      owner_name?: string;
      owner_email?: string;
      owner_phone?: string;
      status?: string;
      is_featured?: boolean;
      featured?: boolean;
      created_at?: string;
      updated_at?: string;
    }>(`/properties/${id}`);
  }

  async approveProperty(id: string) {
    return this.request(`/admin/properties/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectProperty(id: string, reason?: string) {
    return this.request(`/admin/properties/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async addPropertyComment(id: string, comment: string, status?: string) {
    return this.request(`/admin/properties/${id}/comment`, {
      method: 'PUT',
      body: JSON.stringify({ comment, status }),
    });
  }

  async updatePropertyStatus(id: string, status: string) {
    return this.request(`/admin/properties/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/admin/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers() {
    return this.request('/admin/users');
  }

  async verifyUser(id: string) {
    return this.request(`/admin/users/${id}/verify`, {
      method: 'PUT',
    });
  }

  async suspendUser(id: string) {
    return this.request(`/admin/users/${id}/suspend`, {
      method: 'PUT',
    });
  }

  async activateUser(id: string) {
    return this.request(`/admin/users/${id}/activate`, {
      method: 'PUT',
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Agents
  async getAgents() {
    return this.request('/admin/agents');
  }

  async approveAgent(id: string) {
    return this.request(`/admin/agents/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectAgent(id: string, reason?: string) {
    return this.request(`/admin/agents/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Bookings
  async getBookings(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/bookings${query}`);
  }

  async updateBookingStatus(id: string, status: string) {
    return this.request(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Reports
  async getReports() {
    return this.request('/admin/reports');
  }

  async resolveReport(id: string, notes?: string) {
    return this.request(`/admin/reports/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution_notes: notes }),
    });
  }

  async dismissReport(id: string, notes?: string) {
    return this.request(`/admin/reports/${id}/dismiss`, {
      method: 'PUT',
      body: JSON.stringify({ resolution_notes: notes }),
    });
  }

  // Public Properties (no auth required)
  async getPublicProperties(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request(`/properties?${params.toString()}`);
  }

  async getFeaturedProperties() {
    return this.request('/properties/featured');
  }
}

export const apiClient = new ApiClient();
export default apiClient;

/**
 * API Client System
 * Handles communication with KSAP API and mock servers
 */

import { apiConfig, ApiModeSwitch } from './api-config';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
}

/**
 * Main API Client Class
 */
class ApiClient {
  private authTokens: AuthTokens | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  /**
   * Authentication Methods
   */
  async authenticate(usernameOrEmail: string, password: string): Promise<ApiResponse<AuthTokens>> {
    // Try JSON login endpoint first (preferred)
    let response = await this.request<AuthTokens>('/api/v1/auth/login/json', {
      method: 'POST',
      body: {
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@example.com`,
        password
      },
      requireAuth: false
    });

    // If JSON endpoint fails, try form-data endpoint
    if (!response.success && response.status === 404) {
      response = await this.request<AuthTokens>('/api/v1/auth/login', {
        method: 'POST',
        body: {
          username: usernameOrEmail,
          password,
          grant_type: 'password'
        },
        requireAuth: false
      });
    }

    if (response.success && response.data) {
      this.setTokens(response.data);
    }

    return response;
  }

  async refreshToken(): Promise<boolean> {
    if (!this.authTokens) return false;

    try {
      const response = await this.request<AuthTokens>('/api/v1/auth/refresh', {
        method: 'POST',
        requireAuth: false, // Prevent infinite recursion
        headers: {
          'Authorization': `${this.authTokens.token_type} ${this.authTokens.access_token}`
        }
      });

      if (response.success && response.data) {
        this.setTokens(response.data);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  logout(): void {
    this.authTokens = null;
    this.tokenExpiry = null;
    this.clearTokensFromStorage();
  }

  isAuthenticated(): boolean {
    return this.authTokens !== null && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return false;
    return Date.now() >= this.tokenExpiry;
  }

  private setTokens(tokens: AuthTokens): void {
    this.authTokens = tokens;
    this.tokenExpiry = tokens.expires_in 
      ? Date.now() + (tokens.expires_in * 1000)
      : Date.now() + (3600 * 1000); // Default 1 hour
    this.saveTokensToStorage();
  }

  private saveTokensToStorage(): void {
    if (typeof window !== 'undefined' && this.authTokens) {
      localStorage.setItem('ksap_tokens', JSON.stringify({
        tokens: this.authTokens,
        expiry: this.tokenExpiry
      }));
    }
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ksap_tokens');
      if (stored) {
        try {
          const { tokens, expiry } = JSON.parse(stored);
          this.authTokens = tokens;
          this.tokenExpiry = expiry;
          
          // Clean up if expired
          if (this.isTokenExpired()) {
            this.logout();
          }
        } catch (error) {
          console.error('Failed to load stored tokens:', error);
          localStorage.removeItem('ksap_tokens');
        }
      }
    }
  }

  private clearTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ksap_tokens');
    }
  }

  /**
   * Core Request Method
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config = apiConfig.getConfig();
    const url = `${config.baseUrl}${endpoint}`;
    
    // Handle authentication
    if (options.requireAuth !== false && this.isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed && this.isAuthenticated()) {
        return {
          status: 401,
          success: false,
          error: 'Authentication required'
        };
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      ...config.headers,
      ...options.headers
    };

    // Add auth token if available and required
    if (options.requireAuth !== false && this.authTokens) {
      headers.Authorization = `${this.authTokens.token_type} ${this.authTokens.access_token}`;
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
      signal: AbortSignal.timeout(options.timeout || config.timeout),
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    // Execute request with retries
    const maxRetries = options.retries ?? config.retries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        const responseData = await this.handleResponse<T>(response);
        
        // Log API calls in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🌐 API ${options.method || 'GET'} ${endpoint}:`, {
            status: response.status,
            mode: config.mode,
            success: responseData.success
          });
        }

        return responseData;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on auth errors
        if (error instanceof Error && error.message.includes('401')) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    return {
      status: 0,
      success: false,
      error: lastError?.message || 'Request failed'
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T | undefined;
    let error: string | undefined;

    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (parseError) {
      error = 'Invalid JSON response';
    }

    if (!response.ok) {
      // Handle API error responses
      if (data && typeof data === 'object' && 'detail' in data) {
        error = (data as any).detail;
      } else {
        error = `HTTP ${response.status}: ${response.statusText}`;
      }
    }

    return {
      data,
      error,
      status: response.status,
      success: response.ok && !error
    };
  }

  /**
   * Convenience Methods
   */
  async get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * Utility Methods
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      tokens: this.authTokens,
      expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry) : null
    };
  }

  switchMode(mode: 'mock' | 'real' | 'auto') {
    switch (mode) {
      case 'mock':
        ApiModeSwitch.useMock();
        break;
      case 'real':
        ApiModeSwitch.useReal();
        break;
      case 'auto':
        ApiModeSwitch.useAuto();
        break;
    }
  }

  getConfig() {
    return {
      ...apiConfig.getConfig(),
      ...ApiModeSwitch.getStatus()
    };
  }

  updateConfig(updates: Partial<{ baseUrl: string; timeout: number; retries: number }>) {
    // Note: This method is primarily for testing purposes
    // In production, config should be managed through apiConfig
    apiConfig.updateConfig(updates);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).apiClient = apiClient;
}
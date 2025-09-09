import { LoginCredentials, AuthResponse } from '../../types/auth'
import { apiClient } from '../api-client'

class AuthClient {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.authenticate(credentials.username, credentials.password)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed')
    }

    // Determine role based on username (for testing purposes)
    const getUserRole = (username: string): string => {
      if (username.toLowerCase().includes('admin')) return 'admin';
      if (username.toLowerCase().includes('approver')) return 'approver';
      return 'user';
    };

    // Transform API client response to match AuthResponse interface
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: {
        id: '1', // TODO: Get from actual API response
        username: credentials.username,
        email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@example.com`,
        role: getUserRole(credentials.username),
        isActive: true
      }
    }
  }

  async logout(): Promise<void> {
    // Use apiClient for consistent URL handling
    try {
      await apiClient.post('/api/v1/auth/logout')
    } catch (error) {
      // Log error but don't throw - logout should always succeed locally
      console.warn('Logout API call failed:', error)
    }
    // Always clear local auth state
    apiClient.logout()
  }

  async getCurrentUser(token: string): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/api/v1/auth/me')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get current user')
    }

    return response.data
  }

  // All authenticated requests now use apiClient for consistency
}

export const authClient = new AuthClient()
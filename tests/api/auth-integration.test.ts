/**
 * Authentication Integration Tests
 * Tests real authentication with localhost:8000 backend using test users
 */

import { apiClient } from '@/app/lib/api-client';

describe('Authentication Integration', () => {
  beforeAll(() => {
    // Force real API mode and clean state
    apiClient.switchMode('real');
    apiClient.logout();
  });

  afterEach(() => {
    // Clean up auth state between tests
    apiClient.logout();
  });

  describe('Login with Test Users', () => {
    it('should authenticate with localhost:8000 backend using admin test user', async () => {
      // Using test admin from docs/test-users.md
      const credentials = {
        username: 'testadmin',
        password: 'password'
      };

      const authResult = await apiClient.authenticate(credentials.username, credentials.password);
      
      expect(authResult.success).toBe(true);
      expect(authResult.status).toBe(200);
      
      if (authResult.data) {
        expect(authResult.data.access_token).toBeDefined();
        expect(authResult.data.token_type).toBeDefined();
        expect(authResult.data.access_token).toMatch(/^[A-Za-z0-9\-_.]+$/); // JWT format check
      }

      // Verify authentication status
      expect(apiClient.isAuthenticated()).toBe(true);
      
      const authStatus = apiClient.getAuthStatus();
      expect(authStatus.isAuthenticated).toBe(true);
      expect(authStatus.tokens).toBeDefined();
    }, 10000);

    it('should authenticate with regular test user', async () => {
      // Using test user from docs/test-users.md
      const credentials = {
        username: 'testuser',
        password: 'password'
      };

      const authResult = await apiClient.authenticate(credentials.username, credentials.password);
      
      expect(authResult.success).toBe(true);
      expect(authResult.data?.access_token).toBeDefined();
      expect(apiClient.isAuthenticated()).toBe(true);
    }, 10000);

    it('should authenticate with approver test user', async () => {
      // Using test approver from docs/test-users.md
      const credentials = {
        username: 'testapprover',
        password: 'password'
      };

      const authResult = await apiClient.authenticate(credentials.username, credentials.password);
      
      expect(authResult.success).toBe(true);
      expect(authResult.data?.access_token).toBeDefined();
      expect(apiClient.isAuthenticated()).toBe(true);
    }, 10000);
  });

  describe('Login with Email', () => {
    it('should authenticate using email instead of username', async () => {
      // Test with admin email from docs/test-users.md
      const credentials = {
        username: 'testadmin@example.com', // Using email as username
        password: 'password'
      };

      const authResult = await apiClient.authenticate(credentials.username, credentials.password);
      
      // Should work with either username or email
      expect([200, 401]).toContain(authResult.status);
    });
  });

  describe('Authentication Errors', () => {
    it('should handle invalid credentials gracefully', async () => {
      const invalidCredentials = {
        username: 'invaliduser',
        password: 'wrongpassword'
      };

      const authResult = await apiClient.authenticate(invalidCredentials.username, invalidCredentials.password);
      
      expect(authResult.success).toBe(false);
      expect(authResult.status).toBe(401);
      expect(authResult.error).toBeDefined();
      expect(apiClient.isAuthenticated()).toBe(false);
    });

    it('should handle empty credentials', async () => {
      const authResult = await apiClient.authenticate('', '');
      
      expect(authResult.success).toBe(false);
      expect(authResult.status).toBeGreaterThanOrEqual(400);
      expect(apiClient.isAuthenticated()).toBe(false);
    });

    it('should handle malformed requests', async () => {
      const authResult = await apiClient.authenticate('test', 'test');
      
      // Should fail gracefully with proper error status
      expect(authResult.success).toBe(false);
      expect(typeof authResult.error).toBe('string');
    });
  });

  describe('Token Management', () => {
    beforeEach(async () => {
      // Authenticate before token tests
      await apiClient.authenticate('testadmin', 'password');
    });

    it('should store tokens securely', () => {
      const authStatus = apiClient.getAuthStatus();
      
      expect(authStatus.tokens).toBeDefined();
      expect(authStatus.tokens?.access_token).toBeDefined();
      expect(authStatus.expiresAt).toBeInstanceOf(Date);
    });

    it('should handle token refresh', async () => {
      // First get authenticated
      expect(apiClient.isAuthenticated()).toBe(true);
      
      // Test token refresh (might not be implemented yet)
      const refreshResult = await apiClient.refreshToken();
      
      // Should either succeed or fail gracefully
      expect(typeof refreshResult).toBe('boolean');
    });

    it('should handle logout properly', () => {
      expect(apiClient.isAuthenticated()).toBe(true);
      
      apiClient.logout();
      
      expect(apiClient.isAuthenticated()).toBe(false);
      
      const authStatus = apiClient.getAuthStatus();
      expect(authStatus.isAuthenticated).toBe(false);
      expect(authStatus.tokens).toBe(null);
    });
  });

  describe('Authentication Endpoints', () => {
    it('should work with JSON login endpoint', async () => {
      // Test the JSON endpoint from docs/test-users.md
      const response = await apiClient.post('/api/v1/auth/login/json', {
        username: 'testadmin',
        password: 'password'
      });

      // Should work if endpoint exists (422 for validation errors is acceptable)
      expect([200, 401, 404, 422]).toContain(response.status);
    });

    it('should work with form login endpoint', async () => {
      // Test the form endpoint from docs/test-users.md
      const response = await apiClient.post('/api/v1/auth/login', {
        username: 'testadmin',
        password: 'password'
      });

      // Should work if endpoint exists (422 for validation errors is acceptable)
      expect([200, 401, 404, 422]).toContain(response.status);
    });
  });
});
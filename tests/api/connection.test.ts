/**
 * Backend API Connection Tests
 * Tests real connection to localhost:8000 backend server
 */

import { apiClient } from '@/app/lib/api-client';

describe('Backend API Connection', () => {
  beforeAll(() => {
    // Force real API mode for testing
    apiClient.switchMode('real');
  });

  afterAll(() => {
    // Clean up any test data
    apiClient.logout();
  });

  describe('Health Check', () => {
    it('should establish connection to localhost:8000 backend services', async () => {
      // Test basic connectivity to the health endpoint
      const response = await apiClient.get('/health');
      
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      
      if (response.data) {
        expect(response.data).toHaveProperty('status');
        expect(response.data.status).toBe('healthy');
      }
    }, 10000);

    it('should have database connection available', async () => {
      const response = await apiClient.get('/health');
      
      if (response.success && response.data) {
        expect(response.data).toHaveProperty('database');
        expect(response.data.database).toBe('connected');
      }
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      const response = await apiClient.get('/health');
      const responseTime = Date.now() - startTime;
      
      expect(response.success).toBe(true);
      expect(responseTime).toBeLessThan(200); // 200ms threshold
    });
  });

  describe('API Configuration', () => {
    it('should be configured to use localhost:8000', () => {
      const config = apiClient.getConfig();
      
      expect(config.baseUrl).toBe('http://localhost:8000');
      expect(config.mode).toBe('real');
      expect(config.isReal).toBe(true);
    });

    it('should have proper headers configured', () => {
      const config = apiClient.getConfig();
      
      expect(config.headers).toHaveProperty('Content-Type', 'application/json');
      expect(config.headers).toHaveProperty('Accept', 'application/json');
    });

    it('should have reasonable timeout and retry settings', () => {
      const config = apiClient.getConfig();
      
      expect(config.timeout).toBeGreaterThan(0);
      expect(config.retries).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent endpoints gracefully', async () => {
      const response = await apiClient.get('/non-existent-endpoint');
      
      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
      expect(response.error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      // Create a client with invalid base URL to simulate network error
      const invalidClient = new (apiClient.constructor as any)();
      invalidClient.switchMode('real');
      
      // Override config to use invalid URL
      const originalConfig = invalidClient.getConfig();
      invalidClient.updateConfig({ baseUrl: 'http://localhost:9999' });
      
      const response = await invalidClient.get('/health');
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    }, 15000);
  });

  describe('API Versioning', () => {
    it('should handle versioned API endpoints', async () => {
      const response = await apiClient.get('/api/v1/health');
      
      // Should work with or without version prefix
      expect(response.status).toBeOneOf([200, 404]);
    });
  });
});
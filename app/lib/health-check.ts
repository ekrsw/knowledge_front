/**
 * Health Check Utilities
 * Tests connection and health of localhost:8000 backend
 */

import { apiClient, ApiResponse } from './api-client';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  backend_url: string;
  database?: 'connected' | 'disconnected' | 'unknown';
  response_time_ms: number;
  timestamp: string;
  services?: {
    auth: boolean;
    api: boolean;
    websocket?: boolean;
  };
  version?: string;
  uptime?: string;
}

export class HealthChecker {
  private static instance: HealthChecker;
  private lastCheck: HealthStatus | null = null;
  private lastCheckTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): HealthChecker {
    if (!this.instance) {
      this.instance = new HealthChecker();
    }
    return this.instance;
  }

  /**
   * Check backend health with caching
   */
  async checkHealth(force = false): Promise<HealthStatus> {
    const now = Date.now();
    
    // Return cached result if recent and not forced
    if (!force && this.lastCheck && (now - this.lastCheckTime) < this.CACHE_DURATION) {
      return this.lastCheck;
    }

    const startTime = now;
    const config = apiClient.getConfig();

    try {
      // Try multiple health endpoints
      let response = await this.tryHealthEndpoint('/health');
      
      if (!response.success) {
        response = await this.tryHealthEndpoint('/api/v1/health');
      }
      
      if (!response.success) {
        response = await this.tryHealthEndpoint('/status');
      }

      const responseTime = Date.now() - startTime;
      
      if (response.success && response.data) {
        this.lastCheck = {
          status: 'healthy',
          backend_url: config.baseUrl,
          database: response.data.database || 'unknown',
          response_time_ms: responseTime,
          timestamp: new Date().toISOString(),
          services: {
            auth: true,
            api: true,
            websocket: response.data.websocket || false
          },
          version: response.data.version,
          uptime: response.data.uptime
        };
      } else {
        throw new Error(response.error || 'Health check failed');
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.lastCheck = {
        status: 'unhealthy',
        backend_url: config.baseUrl,
        database: 'unknown',
        response_time_ms: responseTime,
        timestamp: new Date().toISOString(),
        services: {
          auth: false,
          api: false,
          websocket: false
        }
      };
    }

    this.lastCheckTime = now;
    return this.lastCheck;
  }

  private async tryHealthEndpoint(endpoint: string): Promise<ApiResponse> {
    try {
      return await apiClient.get(endpoint, { timeout: 5000, retries: 0 });
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Quick connectivity test
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Test specific service availability
   */
  async testService(service: 'auth' | 'articles' | 'users'): Promise<boolean> {
    try {
      switch (service) {
        case 'auth':
          const authResponse = await apiClient.get('/api/v1/auth/status');
          return authResponse.success;
          
        case 'articles':
          const articlesResponse = await apiClient.get('/api/v1/articles', { 
            headers: { 'Accept': 'application/json' } 
          });
          return [200, 401].includes(articlesResponse.status); // 401 is OK - just means need auth
          
        case 'users':
          const usersResponse = await apiClient.get('/api/v1/users/me');
          return [200, 401].includes(usersResponse.status); // 401 is OK - just means need auth
          
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Comprehensive system check
   */
  async runFullCheck(): Promise<{
    overall: 'healthy' | 'unhealthy' | 'degraded';
    backend: HealthStatus;
    services: {
      auth: boolean;
      articles: boolean;
      users: boolean;
    };
    recommendations: string[];
  }> {
    const backend = await this.checkHealth(true);
    const services = {
      auth: await this.testService('auth'),
      articles: await this.testService('articles'), 
      users: await this.testService('users')
    };

    const serviceCount = Object.values(services).filter(Boolean).length;
    const recommendations: string[] = [];

    let overall: 'healthy' | 'unhealthy' | 'degraded';

    if (backend.status === 'unhealthy') {
      overall = 'unhealthy';
      recommendations.push('Backend server is not responding. Check if localhost:8000 is running.');
    } else if (serviceCount === 0) {
      overall = 'unhealthy';
      recommendations.push('No API services are responding. Check API endpoints.');
    } else if (serviceCount < 3) {
      overall = 'degraded';
      recommendations.push(`Only ${serviceCount}/3 services responding. Some features may not work.`);
    } else {
      overall = 'healthy';
    }

    if (!services.auth) {
      recommendations.push('Authentication service unavailable. Login may not work.');
    }

    if (backend.response_time_ms > 1000) {
      recommendations.push('Backend response time is slow. Consider checking server performance.');
    }

    return {
      overall,
      backend,
      services,
      recommendations
    };
  }

  /**
   * Get cached health status
   */
  getLastHealthStatus(): HealthStatus | null {
    return this.lastCheck;
  }

  /**
   * Clear health check cache
   */
  clearCache(): void {
    this.lastCheck = null;
    this.lastCheckTime = 0;
  }
}

// Export singleton instance
export const healthChecker = HealthChecker.getInstance();

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).healthChecker = healthChecker;
}
/**
 * API Configuration System
 * Handles switching between mock and real API servers
 */

export type ApiMode = 'mock' | 'real' | 'auto';

export interface ApiConfig {
  mode: ApiMode;
  baseUrl: string;
  timeout: number;
  retries: number;
  enableMocking: boolean;
  headers: Record<string, string>;
}

/**
 * Environment-based API configuration
 */
class ApiConfigManager {
  private config: ApiConfig;

  constructor() {
    this.config = this.initializeConfig();
  }

  private initializeConfig(): ApiConfig {
    const mode = this.getApiMode();
    const baseUrl = this.getBaseUrl(mode);
    
    return {
      mode,
      baseUrl,
      timeout: 30000,
      retries: 3,
      enableMocking: mode === 'mock' || (mode === 'auto' && process.env.NODE_ENV === 'development'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };
  }

  private getApiMode(): ApiMode {
    // Check explicit environment variable first
    const envMode = process.env.NEXT_PUBLIC_API_MODE as ApiMode;
    if (envMode && ['mock', 'real', 'auto'].includes(envMode)) {
      return envMode;
    }

    // Auto-detect based on environment
    return process.env.NODE_ENV === 'production' ? 'real' : 'auto';
  }

  private getBaseUrl(mode: ApiMode): string {
    if (mode === 'mock') {
      return '/api/mock';
    }

    // Use real API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not set, falling back to localhost:8000');
      return 'http://localhost:8000';
    }

    return apiUrl;
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setMode(mode: ApiMode): void {
    this.config.mode = mode;
    this.config.baseUrl = this.getBaseUrl(mode);
    this.config.enableMocking = mode === 'mock' || (mode === 'auto' && process.env.NODE_ENV === 'development');
  }

  isMockingEnabled(): boolean {
    return this.config.enableMocking;
  }

  isRealApiMode(): boolean {
    return this.config.mode === 'real' || (this.config.mode === 'auto' && process.env.NODE_ENV === 'production');
  }
}

export const apiConfig = new ApiConfigManager();

/**
 * Runtime API mode switching utilities
 */
export const ApiModeSwitch = {
  /**
   * Switch to mock API mode
   */
  useMock: () => {
    apiConfig.setMode('mock');
    console.log('🔄 Switched to Mock API mode');
  },

  /**
   * Switch to real API mode
   */
  useReal: () => {
    apiConfig.setMode('real');
    console.log('🔄 Switched to Real API mode');
  },

  /**
   * Switch to auto mode (environment-based)
   */
  useAuto: () => {
    apiConfig.setMode('auto');
    console.log('🔄 Switched to Auto API mode');
  },

  /**
   * Get current API configuration status
   */
  getStatus: () => {
    const config = apiConfig.getConfig();
    return {
      mode: config.mode,
      baseUrl: config.baseUrl,
      isMocking: config.enableMocking,
      isReal: apiConfig.isRealApiMode(),
    };
  }
};

/**
 * Development helper - expose to window in development
 */
if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
  (window as any).ApiModeSwitch = ApiModeSwitch;
}
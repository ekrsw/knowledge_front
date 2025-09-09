const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom config for API integration tests (no MSW)
const apiJestConfig = {
  // Use API-specific setup that disables MSW
  setupFilesAfterEnv: ['<rootDir>/tests/api-setup.ts'],
  
  // Setup files for MSW v2 (not used in API tests)
  setupFiles: ['<rootDir>/tests/jest.polyfills.ts'],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test match patterns - only API integration tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/api/**/*.test.{js,jsx,ts,tsx}',
  ],

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/lib/(.*)$': '<rootDir>/app/lib/$1',
    '^@/types/(.*)$': '<rootDir>/app/types/$1',
    '^@/stores/(.*)$': '<rootDir>/app/stores/$1',
    '^@/hooks/(.*)$': '<rootDir>/app/hooks/$1',
  },

  // Coverage collection
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/layout.tsx',
    '!app/**/page.tsx',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Longer timeout for API integration tests (network calls)
  testTimeout: 15000,
  
  // Display name for this config
  displayName: 'API Integration Tests',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(apiJestConfig)
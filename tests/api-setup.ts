/**
 * Test setup for API integration tests
 * Disables MSW to allow real backend connections
 */

import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// DO NOT import MSW server for API integration tests
// These tests should connect to real backend at localhost:8000

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []

  constructor() {}
  
  disconnect() {}
  
  observe() {}
  
  unobserve() {}
  
  takeRecords() { return [] }
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  
  disconnect() {}
  
  observe() {}
  
  unobserve() {}
}

// Mock localStorage for browser environment simulation
const mockLocalStorage = {
  getItem: jest.fn().mockImplementation((key: string) => {
    // Return null by default for clean test state
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
})

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: mockLocalStorage,
})

// Set environment variables for API integration tests
process.env.NEXT_PUBLIC_API_MODE = 'real'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
process.env.NODE_ENV = 'test'

// Use cross-fetch for real backend connections in test environment
// This prevents JSDOM CORS restrictions on localhost
global.fetch = require('cross-fetch')

// Mock next/navigation for API tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
  }),
  usePathname: () => '/',
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks()
  mockLocalStorage.getItem.mockClear()
  mockLocalStorage.setItem.mockClear()
  mockLocalStorage.removeItem.mockClear()
  mockLocalStorage.clear.mockClear()
})

// Additional API test helpers
global.beforeEach(() => {
  // Clear any stored auth tokens between tests
  mockLocalStorage.clear()
})

// Increase timeout for API tests (network calls can be slower)
jest.setTimeout(15000)

console.log('🧪 API Integration Test Setup: MSW disabled, real backend connections enabled')
console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('🔧 API Mode:', process.env.NEXT_PUBLIC_API_MODE)
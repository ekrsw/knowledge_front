'use client'

import React, { useState, useEffect } from 'react'
import { ApiModeSwitch, apiConfig } from '../../lib/api-config'
import { ApiServices, AuthService } from '../../lib/api-services'
import { apiClient } from '../../lib/api-client'

export default function ApiIntegrationDemo() {
  const [apiStatus, setApiStatus] = useState(ApiModeSwitch.getStatus())
  const [authStatus, setAuthStatus] = useState(AuthService.getAuthStatus())
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update status when component mounts
  useEffect(() => {
    updateStatus()
  }, [])

  const updateStatus = () => {
    setApiStatus(ApiModeSwitch.getStatus())
    setAuthStatus(AuthService.getAuthStatus())
  }

  const switchApiMode = (mode: 'mock' | 'real' | 'auto') => {
    try {
      apiClient.switchMode(mode)
      updateStatus()
      setError(null)
    } catch (err) {
      setError(`Failed to switch to ${mode} mode: ${err}`)
    }
  }

  const testEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET', testData?: any) => {
    setLoading(true)
    setError(null)
    
    try {
      let response
      
      switch (endpoint) {
        case 'auth_status':
          response = AuthService.getAuthStatus()
          break
          
        case 'api_config':
          response = apiClient.getConfig()
          break
          
        case 'test_connection':
          response = await apiClient.get('/health')
          break
          
        case 'login':
          response = await AuthService.login('demo@example.com', 'password123')
          if (response.success) {
            updateStatus()
          }
          break
          
        case 'current_user':
          response = await AuthService.getCurrentUser()
          break
          
        case 'articles':
          response = await ApiServices.articles.getArticles({ page: 1, per_page: 5 })
          break
          
        case 'categories':
          response = await ApiServices.categories.getCategories()
          break
          
        case 'search':
          response = await ApiServices.search.search({ q: 'test', limit: 5 })
          break
          
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`)
      }
      
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: response.success !== false,
          data: response,
          timestamp: new Date().toISOString()
        }
      }))
      
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))
      setError(`Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    AuthService.logout()
    updateStatus()
    setTestResults({})
  }

  const clearResults = () => {
    setTestResults({})
    setError(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4" style={{color: '#000000', fontWeight: '900'}}>API Integration Demo</h1>
        <p className="text-gray-600 mb-6" style={{color: '#4b5563'}}>
          Interactive demonstration of the KSAP API integration system with mock/real server switching.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="text-red-800 font-medium">Error:</div>
            <div className="text-red-600">{error}</div>
          </div>
        )}
      </div>

      {/* API Configuration Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4" style={{color: '#000000', fontWeight: '700'}}>API Configuration</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h3 className="font-medium" style={{color: '#000000', fontWeight: '600'}}>Current Status</h3>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              <div>Mode: <span className="font-bold text-blue-600">{apiStatus.mode}</span></div>
              <div>Base URL: <span className="text-gray-600">{apiStatus.baseUrl}</span></div>
              <div>Mocking: <span className={apiStatus.isMocking ? 'text-green-600' : 'text-red-600'}>
                {apiStatus.isMocking ? 'Enabled' : 'Disabled'}
              </span></div>
              <div>Real API: <span className={apiStatus.isReal ? 'text-green-600' : 'text-gray-600'}>
                {apiStatus.isReal ? 'Active' : 'Inactive'}
              </span></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Authentication Status</h3>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              <div>Authenticated: <span className={authStatus.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {authStatus.isAuthenticated ? 'Yes' : 'No'}
              </span></div>
              {authStatus.tokens && (
                <div>Token Type: <span className="text-gray-600">{authStatus.tokens.token_type}</span></div>
              )}
              {authStatus.expiresAt && (
                <div>Expires: <span className="text-gray-600">{authStatus.expiresAt.toLocaleTimeString()}</span></div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Switch API Mode</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => switchApiMode('mock')}
              className={`px-4 py-2 rounded font-medium ${
                apiStatus.mode === 'mock'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Mock Mode
            </button>
            <button
              onClick={() => switchApiMode('real')}
              className={`px-4 py-2 rounded font-medium ${
                apiStatus.mode === 'real'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Real API Mode
            </button>
            <button
              onClick={() => switchApiMode('auto')}
              className={`px-4 py-2 rounded font-medium ${
                apiStatus.mode === 'auto'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Auto Mode
            </button>
          </div>
          <p className="text-sm text-gray-500">
            <strong>Mock:</strong> Use MSW mock data • 
            <strong> Real:</strong> Connect to localhost:8000 • 
            <strong> Auto:</strong> Mock in dev, Real in prod
          </p>
        </div>
      </div>

      {/* API Testing Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">API Testing</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {/* System Tests */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600">SYSTEM</h3>
            <button
              onClick={() => testEndpoint('api_config')}
              className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              disabled={loading}
            >
              API Config
            </button>
            <button
              onClick={() => testEndpoint('test_connection')}
              className="w-full px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded"
              disabled={loading}
            >
              Test Connection
            </button>
          </div>

          {/* Auth Tests */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600">AUTHENTICATION</h3>
            <button
              onClick={() => testEndpoint('auth_status')}
              className="w-full px-3 py-2 text-sm bg-green-100 hover:bg-green-200 rounded"
              disabled={loading}
            >
              Auth Status
            </button>
            <button
              onClick={() => testEndpoint('login')}
              className="w-full px-3 py-2 text-sm bg-green-100 hover:bg-green-200 rounded"
              disabled={loading}
            >
              Demo Login
            </button>
            <button
              onClick={() => testEndpoint('current_user')}
              className="w-full px-3 py-2 text-sm bg-green-100 hover:bg-green-200 rounded"
              disabled={loading}
            >
              Current User
            </button>
          </div>

          {/* Data Tests */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600">DATA ENDPOINTS</h3>
            <button
              onClick={() => testEndpoint('articles')}
              className="w-full px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 rounded"
              disabled={loading}
            >
              Get Articles
            </button>
            <button
              onClick={() => testEndpoint('categories')}
              className="w-full px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 rounded"
              disabled={loading}
            >
              Get Categories
            </button>
            <button
              onClick={() => testEndpoint('search')}
              className="w-full px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 rounded"
              disabled={loading}
            >
              Search Test
            </button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {authStatus.isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
              disabled={loading}
            >
              Logout
            </button>
          )}
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
            disabled={loading}
          >
            Clear Results
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Testing...</span>
          </div>
        )}
      </div>

      {/* Test Results Panel */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-4">
            {Object.entries(testResults).map(([endpoint, result]) => (
              <div key={endpoint} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium uppercase tracking-wide text-sm">{endpoint.replace('_', ' ')}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-3 overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(result.success ? result.data : { error: result.error }, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions Panel */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">How to Use</h2>
        <div className="text-sm text-blue-700 space-y-2">
          <div><strong>1. Switch API Mode:</strong> Choose between Mock (MSW), Real (localhost:8000), or Auto mode</div>
          <div><strong>2. Test Connection:</strong> Verify the selected API endpoint is responding</div>
          <div><strong>3. Authentication:</strong> Try the demo login to test JWT authentication flow</div>
          <div><strong>4. Data Endpoints:</strong> Test various KSAP API endpoints to see responses</div>
          <div><strong>5. Development Console:</strong> Open browser devtools to see API calls and network activity</div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded border">
          <h3 className="font-medium mb-1">Developer Access:</h3>
          <code className="text-xs text-gray-600">
            window.ApiModeSwitch.useReal() // Switch to real API<br/>
            window.apiClient.getConfig() // Get current configuration
          </code>
        </div>
      </div>
    </div>
  )
}
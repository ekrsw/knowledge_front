#!/usr/bin/env node
/**
 * Backend Connectivity Check Script
 * Verifies localhost:8000 backend is available for Phase 1 testing
 */

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function checkBackendConnection() {
  info('Checking backend connectivity at localhost:8000...');
  
  const endpoints = [
    'http://localhost:8000/health',
    'http://localhost:8000/api/v1/health',
    'http://localhost:8000/',
    'http://localhost:8000/api/v1/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      info(`Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const status = response.status;
      const text = await response.text().catch(() => 'No response body');
      
      if (status >= 200 && status < 400) {
        success(`${endpoint} - Status: ${status}`);
        if (text && text !== 'No response body') {
          console.log(`   Response: ${text.substring(0, 100)}...`);
        }
        return true;
      } else {
        warning(`${endpoint} - Status: ${status} (${text.substring(0, 50)})`);
      }
      
    } catch (err) {
      warning(`${endpoint} - Connection failed: ${err.message}`);
    }
  }
  
  return false;
}

async function main() {
  console.log('🔍 Backend Connectivity Check\n');
  
  const isConnected = await checkBackendConnection();
  
  console.log('\n' + '='.repeat(50));
  
  if (isConnected) {
    success('Backend is available and responding!');
    console.log('\n✅ Ready to run Phase 1 API integration tests');
    console.log('   Run: npm run test:api');
    process.exit(0);
  } else {
    error('Backend is not available at localhost:8000');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the backend server at localhost:8000');
    console.log('2. Verify it responds to /health or /api/v1/health');
    console.log('3. Run this script again to verify');
    console.log('4. Then run: npm run test:api');
    process.exit(1);
  }
}

// Run the check
main().catch((err) => {
  error(`Script failed: ${err.message}`);
  process.exit(1);
});
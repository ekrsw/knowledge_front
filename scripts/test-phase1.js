#!/usr/bin/env node
/**
 * Phase 1 Backend Integration Test Script
 * Validates connection to localhost:8000 backend with test users
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Phase 1: Backend API Connection & Foundation Test\n');

// Colors for console output
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

// Check if backend is running
async function checkBackendHealth() {
  info('Checking backend health at localhost:8000...');
  
  try {
    const response = await fetch('http://localhost:8000/health').catch(() => null);
    
    if (!response) {
      // Try alternate endpoints
      const altResponse = await fetch('http://localhost:8000/api/v1/health').catch(() => null);
      
      if (!altResponse) {
        error('Backend not responding at localhost:8000');
        error('Please start the backend server before running Phase 1 tests');
        process.exit(1);
      }
      
      success('Backend responding at /api/v1/health');
      return true;
    }
    
    success('Backend responding at /health');
    return true;
  } catch (err) {
    error(`Backend connection failed: ${err.message}`);
    return false;
  }
}

// Verify environment configuration
function checkEnvironmentConfig() {
  info('Checking environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    error('.env.local file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('localhost:8000')) {
    error('.env.local does not contain localhost:8000 configuration');
    return false;
  }
  
  if (!envContent.includes('NEXT_PUBLIC_API_MODE=real')) {
    warning('.env.local may not be set to real API mode');
  }
  
  success('Environment configuration looks good');
  return true;
}

// Check test user file
function checkTestUsers() {
  info('Checking test users configuration...');
  
  const testUsersPath = path.join(process.cwd(), 'docs', 'test-users.md');
  if (!fs.existsSync(testUsersPath)) {
    error('docs/test-users.md file not found');
    return false;
  }
  
  const testUsersContent = fs.readFileSync(testUsersPath, 'utf8');
  
  const requiredUsers = ['testadmin', 'testuser', 'testapprover'];
  const missingUsers = requiredUsers.filter(user => !testUsersContent.includes(user));
  
  if (missingUsers.length > 0) {
    error(`Missing test users: ${missingUsers.join(', ')}`);
    return false;
  }
  
  success('Test users configuration found');
  return true;
}

// Run API integration tests
function runAPITests() {
  info('Running API integration tests...');
  
  try {
    execSync('npm run test:api', {
      stdio: 'inherit',
      timeout: 30000
    });
    success('API integration tests completed');
    return true;
  } catch (err) {
    error('API integration tests failed');
    warning('Some tests may fail if backend endpoints are not implemented yet');
    return false;
  }
}

// Check TypeScript compilation
function checkTypeScript() {
  info('Checking TypeScript compilation...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    success('TypeScript compilation successful');
    return true;
  } catch (err) {
    error('TypeScript compilation failed');
    console.log(err.stdout?.toString() || err.message);
    return false;
  }
}

// Main test function
async function runPhase1Tests() {
  console.log('Phase 1 Implementation Validation');
  console.log('===================================\n');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Environment Configuration
  total++;
  if (checkEnvironmentConfig()) {
    passed++;
  }
  
  // Test 2: Test Users Configuration  
  total++;
  if (checkTestUsers()) {
    passed++;
  }
  
  // Test 3: Backend Health Check
  total++;
  if (await checkBackendHealth()) {
    passed++;
  }
  
  // Test 4: TypeScript Compilation
  total++;
  if (checkTypeScript()) {
    passed++;
  }
  
  // Test 5: API Integration Tests
  total++;
  if (runAPITests()) {
    passed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Phase 1 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    success('🎉 Phase 1: Backend API Connection & Foundation - ALL TESTS PASSED!');
    console.log('\n✅ Ready to proceed to Phase 2: Core Application Development');
  } else {
    warning('⚠️  Some Phase 1 tests failed. Please address issues before proceeding.');
    
    if (passed >= 3) {
      info('Core functionality appears working. Failed tests may be due to incomplete backend implementation.');
    }
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Ensure localhost:8000 backend is running');
  console.log('2. Verify test users can authenticate');
  console.log('3. Test API endpoints manually if needed');  
  console.log('4. Proceed to Phase 2 implementation');
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runPhase1Tests().catch((err) => {
  error(`Test runner failed: ${err.message}`);
  process.exit(1);
});
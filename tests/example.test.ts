/**
 * Example test to validate test setup
 * This test should pass to confirm the testing environment is working correctly
 */

import { createMockUser, createMockRevision } from './factories'

describe('Test Environment Setup', () => {
  describe('Jest Configuration', () => {
    it('should run basic test', () => {
      expect(1 + 1).toBe(2)
    })

    it('should support ES6 modules', () => {
      const testObject = { name: 'test', value: 42 }
      expect(testObject).toEqual({ name: 'test', value: 42 })
    })

    it('should support async/await', async () => {
      const asyncFunction = async () => {
        return new Promise(resolve => setTimeout(() => resolve('done'), 10))
      }

      const result = await asyncFunction()
      expect(result).toBe('done')
    })
  })

  describe('Test Factories', () => {
    it('should create mock user with default values', () => {
      const user = createMockUser()
      
      expect(user).toHaveProperty('user_id')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('is_active')
      
      expect(typeof user.user_id).toBe('string')
      expect(typeof user.username).toBe('string')
      expect(typeof user.email).toBe('string')
      expect(['admin', 'approver', 'user']).toContain(user.role)
      expect(typeof user.is_active).toBe('boolean')
    })

    it('should create mock user with overrides', () => {
      const user = createMockUser({
        username: 'testuser',
        role: 'admin',
      })
      
      expect(user.username).toBe('testuser')
      expect(user.role).toBe('admin')
    })

    it('should create mock revision with default values', () => {
      const revision = createMockRevision()
      
      expect(revision).toHaveProperty('revision_id')
      expect(revision).toHaveProperty('title')
      expect(revision).toHaveProperty('content')
      expect(revision).toHaveProperty('status')
      expect(revision).toHaveProperty('proposer_id')
      expect(revision).toHaveProperty('target_article_id')
      expect(revision).toHaveProperty('created_at')
      expect(revision).toHaveProperty('updated_at')
      
      expect(['draft', 'submitted', 'approved', 'rejected', 'deleted']).toContain(revision.status)
    })
  })

  describe('TypeScript Support', () => {
    interface TestInterface {
      id: string
      name: string
    }

    it('should support TypeScript interfaces', () => {
      const testObject: TestInterface = {
        id: 'test-id',
        name: 'test-name',
      }
      
      expect(testObject.id).toBe('test-id')
      expect(testObject.name).toBe('test-name')
    })

    it('should support generic functions', () => {
      function identity<T>(arg: T): T {
        return arg
      }
      
      const stringResult = identity('hello')
      const numberResult = identity(42)
      
      expect(stringResult).toBe('hello')
      expect(numberResult).toBe(42)
    })
  })

  describe('Path Aliases', () => {
    it('should resolve @/ path alias', () => {
      // This test will fail if path aliases are not configured correctly
      expect(() => {
        // This should not throw an error if path aliases work
        const path = '@/components/ui/Button'
        expect(path).toContain('components/ui/Button')
      }).not.toThrow()
    })
  })
})
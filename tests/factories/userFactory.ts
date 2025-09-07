import { faker } from '@faker-js/faker'

export interface User {
  user_id: string
  username: string
  email: string
  role: 'admin' | 'approver' | 'user'
  is_active: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

/**
 * Factory function to create mock User objects
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    user_id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: 'user',
    is_active: true,
    ...overrides,
  }
}

/**
 * Factory function to create mock login credentials
 */
export function createMockCredentials(overrides?: Partial<LoginCredentials>): LoginCredentials {
  return {
    username: faker.internet.username(),
    password: faker.internet.password(),
    ...overrides,
  }
}

/**
 * Factory function to create mock auth response
 */
export function createMockAuthResponse(userOverrides?: Partial<User>): AuthResponse {
  return {
    access_token: faker.string.alphanumeric(32),
    token_type: 'bearer',
    user: createMockUser(userOverrides),
  }
}

/**
 * Predefined test users based on test-users.md
 */
export const TEST_USERS = {
  admin: createMockUser({
    user_id: 'admin-user-id',
    username: 'testadmin',
    email: 'testadmin@example.com',
    role: 'admin',
  }),
  approver: createMockUser({
    user_id: 'approver-user-id',
    username: 'testapprover',
    email: 'testapprover@example.com',
    role: 'approver',
  }),
  user: createMockUser({
    user_id: 'regular-user-id',
    username: 'testuser',
    email: 'testuser@example.com',
    role: 'user',
  }),
}

/**
 * Predefined test credentials
 */
export const TEST_CREDENTIALS = {
  admin: { username: 'testadmin', password: 'password' },
  approver: { username: 'testapprover', password: 'password' },
  user: { username: 'testuser', password: 'password' },
  invalid: { username: 'invalid', password: 'invalid' },
}
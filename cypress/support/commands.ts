// cypress/support/commands.ts

/// <reference types="cypress" />

// Custom commands for the knowledge workflow system

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test user credentials
       * @example cy.loginAs('admin')
       */
      loginAs(role: 'admin' | 'approver' | 'user'): Chainable<Element>
      
      /**
       * Custom command to get element by test id
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to wait for API call to complete
       * @example cy.waitForApi('GET', '/api/v1/revisions')
       */
      waitForApi(method: string, url: string): Chainable<Interception>
      
      /**
       * Custom command to mock API responses
       * @example cy.mockApi('GET', '/api/v1/revisions', { fixture: 'revisions.json' })
       */
      mockApi(method: string, url: string, response: any): Chainable<null>
    }
  }
}

// Test user credentials from test-users.md
const TEST_CREDENTIALS = {
  admin: { username: 'testadmin', password: 'password' },
  approver: { username: 'testapprover', password: 'password' },
  user: { username: 'testuser', password: 'password' },
}

/**
 * Login with test user credentials
 */
Cypress.Commands.add('loginAs', (role: 'admin' | 'approver' | 'user') => {
  const credentials = TEST_CREDENTIALS[role]
  
  cy.session(
    [role],
    () => {
      cy.visit('/login')
      cy.get('[data-testid="username-input"]').type(credentials.username)
      cy.get('[data-testid="password-input"]').type(credentials.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Wait for redirect to dashboard
      cy.url().should('not.include', '/login')
      cy.url().should('include', '/')
    },
    {
      validate: () => {
        // Validate that we're still logged in
        cy.request('/api/v1/auth/me').its('status').should('eq', 200)
      },
    }
  )
  
  // Visit the homepage after login
  cy.visit('/')
})

/**
 * Get element by test id
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

/**
 * Wait for specific API call
 */
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  return cy.wait(`@${method}${url.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`)
})

/**
 * Mock API responses
 */
Cypress.Commands.add('mockApi', (method: string, url: string, response: any) => {
  const alias = `${method}${url.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`
  
  cy.intercept(method, url, response).as(alias)
  
  return cy.wrap(null)
})
// cypress/support/component.ts

import './commands'
import { mount } from '@cypress/react'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Global configuration for component tests
Cypress.config('defaultCommandTimeout', 10000)
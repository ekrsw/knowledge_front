# Code Style and Conventions

## File Organization
- **App Router**: Uses `app/` directory structure (Next.js 13+)
- **Components**: Organized in `app/components/` with subfolders (ui, auth, features)
- **Types**: TypeScript definitions in `app/types/`
- **Utilities**: Helper functions in `app/lib/`
- **Tests**: Separate `tests/` directory for unit tests, `cypress/` for E2E

## Naming Conventions
- **Components**: PascalCase (e.g., `LoginForm.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Types**: PascalCase with descriptive names
- **CSS Classes**: Tailwind CSS utility classes

## Code Patterns
- **'use client'**: Client components explicitly marked
- **TypeScript**: Strict mode enabled, proper typing required
- **React Patterns**: Functional components with hooks
- **State Management**: Zustand stores for global state
- **Error Handling**: Comprehensive error boundaries

## Import Organization
- External libraries first
- Internal modules with `@/` path alias
- Components and utilities with relative paths
- Type-only imports properly marked

## Testing Patterns
- **TDD Approach**: Tests first, implementation second
- **Component Testing**: React Testing Library patterns
- **E2E Testing**: Cypress with proper selectors
- **API Testing**: Separate Jest configuration
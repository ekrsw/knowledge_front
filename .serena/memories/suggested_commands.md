# Essential Development Commands

## Development Workflow
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build with Turbopack optimization
- `npm start` - Start production server

## Code Quality
- `npm run lint` - ESLint with Next.js TypeScript config
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Jest in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:api` - Run API integration tests (separate config)

## Phase-Specific Testing
- `npm run test:phase1` - Run Phase 1 TDD validation
- `npm run check-backend` - Validate backend connectivity

## E2E Testing
- `npm run cypress` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests headlessly  
- `npm run e2e` - Open E2E tests
- `npm run component` - Open component tests

## System Commands (Darwin)
- `ls` - List directory contents
- `find . -name "*.tsx"` - Find React components
- `grep -r "useState"` - Search for React hooks
- `git status` - Check git status
- `git log --oneline` - View commit history
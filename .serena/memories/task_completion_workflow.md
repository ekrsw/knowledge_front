# Task Completion Workflow

## Quality Gates
1. **Code Implementation**: Follow TDD approach (tests first)
2. **Linting**: Run `npm run lint` - must pass with zero errors
3. **Unit Tests**: Run `npm test` - all tests must pass
4. **Type Checking**: TypeScript compilation must succeed
5. **Build Verification**: `npm run build` must complete successfully

## Backend Integration Verification
- **API Connectivity**: `npm run check-backend` validates localhost:8000 connection
- **Integration Tests**: `npm run test:api` for backend API interaction
- **Phase Testing**: `npm run test:phase1` for current phase validation

## Deployment Readiness
- All tests passing (unit, integration, E2E)
- No TypeScript errors
- No ESLint violations  
- Production build successful
- Backend connectivity confirmed

## Documentation Updates
- Update technical documentation in `docs/`
- Update component documentation if applicable
- Maintain CLAUDE.md for development guidance

## Git Workflow
- Feature branches for all development
- Commit messages following conventional format
- Code review before main branch merge
- Clean commit history with meaningful messages
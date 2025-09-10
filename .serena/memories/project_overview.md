# Knowledge Management System - Frontend Project Overview

## Project Purpose
Enterprise knowledge management frontend application built with Next.js 15, integrating with a localhost:8000 backend API for document management, user authentication, and workflow approvals.

## Tech Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Zustand for client state
- **Data Fetching**: TanStack React Query v5
- **Testing**: Jest + Testing Library, Cypress E2E, Playwright
- **Build Tool**: Turbopack for development and production

## Key Dependencies
- @tanstack/react-query: Server state management
- zustand: Client state management  
- clsx: CSS class management
- @faker-js/faker: Test data generation
- msw: API mocking for tests

## Current Implementation Status
- **Phase 1**: TDD Foundation completed (Button, Input components)
- **Phase 2**: Core Application Development (current target)
- **Phase 3**: Advanced features and quality optimization
- Backend API integration with localhost:8000 server
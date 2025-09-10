# Phase 2 Implementation Plan

## Overview
Implement Phase 2 of the Knowledge Management System frontend with TDD approach and real backend integration.

## Core Features Required

### 1. Revision List Screen (修正案一覧画面)
- **Purpose**: Display comprehensive list of all revisions
- **Features**: Filtering, sorting, status tracking, actions
- **Components**: RevisionList, RevisionListItem, FilterPanel
- **API Integration**: GET /api/v1/revisions with query params

### 2. New Creation Screen (新規作成画面) 
- **Purpose**: Create new articles/revisions
- **Features**: Rich form, draft saving, validation, file attachments
- **Components**: NewCreation, ArticleForm, DraftManager
- **API Integration**: POST /api/v1/articles, POST /api/v1/revisions

### 3. Pending Approval Screen (承認待ち画面)
- **Purpose**: Manage approval workflow
- **Features**: Approval queue, approve/reject actions, comments
- **Components**: PendingApproval, ApprovalActions, CommentSystem
- **API Integration**: GET /api/v1/pending-approvals, POST /api/v1/approve

## Task Breakdown

### Phase 2.1: Type Definitions & API Contracts
- [ ] Create revision types (Revision, RevisionStatus, etc.)
- [ ] Create article types (Article, Category, etc.) 
- [ ] Create approval types (ApprovalRequest, ApprovalAction, etc.)
- [ ] API client methods for revision operations
- [ ] API client methods for article operations
- [ ] API client methods for approval operations

### Phase 2.2: Revision List Screen
- [ ] RevisionList component (TDD)
- [ ] RevisionListItem component (TDD)  
- [ ] FilterPanel component (TDD)
- [ ] Revision list page (/revisions)
- [ ] Integration tests
- [ ] Accessibility tests

### Phase 2.3: New Creation Screen
- [ ] NewCreation component (TDD)
- [ ] ArticleForm component (TDD)
- [ ] DraftManager utility (TDD)
- [ ] FileUpload component (TDD)
- [ ] New creation page (/revisions/new)
- [ ] Integration tests
- [ ] Accessibility tests

### Phase 2.4: Pending Approval Screen  
- [ ] PendingApproval component (TDD)
- [ ] ApprovalActions component (TDD)
- [ ] CommentSystem component (TDD)
- [ ] Pending approval page (/revisions/pending)
- [ ] Integration tests
- [ ] Accessibility tests

### Phase 2.5: Integration & Polish
- [ ] Navigation integration
- [ ] Error boundary implementation
- [ ] Loading state management
- [ ] Responsive design validation
- [ ] E2E tests with Cypress
- [ ] Performance optimization

## Technical Requirements

### TDD Approach
- Write tests first for all components
- Follow existing test patterns (see authStore.test.ts)
- Use React Testing Library + Jest
- Mock backend API calls with MSW

### Backend Integration
- Use existing apiClient for all HTTP requests
- Handle authentication with existing authStore
- Real localhost:8000 backend integration
- Proper error handling and retry logic

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Performance
- React Query for server state management
- Optimistic updates where appropriate
- Proper loading states
- Error recovery

## File Structure Plan

```
app/
├── types/
│   ├── revision.ts
│   ├── article.ts
│   └── approval.ts
├── components/
│   └── features/
│       ├── RevisionList.tsx
│       ├── NewCreation.tsx
│       ├── PendingApproval.tsx
│       ├── ArticleForm.tsx
│       ├── FilterPanel.tsx
│       ├── ApprovalActions.tsx
│       └── CommentSystem.tsx
├── lib/
│   └── api/
│       ├── revisions.ts
│       ├── articles.ts
│       └── approvals.ts
└── revisions/
    ├── page.tsx
    ├── new/
    │   └── page.tsx
    └── pending/
        └── page.tsx

tests/
├── components/
│   └── features/
│       ├── RevisionList.test.tsx
│       ├── NewCreation.test.tsx
│       ├── PendingApproval.test.tsx
│       ├── ArticleForm.test.tsx
│       ├── FilterPanel.test.tsx
│       ├── ApprovalActions.test.tsx
│       └── CommentSystem.test.tsx
└── integration/
    ├── revision-list.test.tsx
    ├── new-creation.test.tsx
    └── pending-approval.test.tsx
```

## Implementation Notes

- Follow existing patterns from Button, Input components
- Use Zustand for local state management
- Integrate with React Query for server state
- Maintain TypeScript strict mode compliance
- Implement proper loading states and error boundaries
- Ensure mobile-responsive design with Tailwind CSS v4
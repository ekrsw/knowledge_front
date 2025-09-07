import { faker } from '@faker-js/faker'

export interface Revision {
  revision_id: string
  title: string
  content: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'deleted'
  proposer_id: string
  target_article_id: string
  created_at: string
  updated_at: string
  submitted_at?: string
  approved_at?: string
}

export interface RevisionFormData {
  title: string
  content: string
  target_article_id: string
}

export interface RevisionWithNames extends Revision {
  proposer_name: string
  target_article_title: string
}

export interface ApprovalQueueItem extends Revision {
  priority: 'low' | 'medium' | 'high'
  days_pending: number
}

/**
 * Factory function to create mock Revision objects
 */
export function createMockRevision(overrides?: Partial<Revision>): Revision {
  const createdAt = faker.date.past()
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() })
  
  return {
    revision_id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected'] as const),
    proposer_id: faker.string.uuid(),
    target_article_id: faker.string.uuid(),
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    ...overrides,
  }
}

/**
 * Factory function to create mock revision form data
 */
export function createMockRevisionFormData(overrides?: Partial<RevisionFormData>): RevisionFormData {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    target_article_id: faker.string.uuid(),
    ...overrides,
  }
}

/**
 * Factory function to create mock revision with names
 */
export function createMockRevisionWithNames(overrides?: Partial<RevisionWithNames>): RevisionWithNames {
  const baseRevision = createMockRevision(overrides)
  
  return {
    ...baseRevision,
    proposer_name: faker.person.fullName(),
    target_article_title: faker.lorem.sentence(),
    ...overrides,
  }
}

/**
 * Factory function to create mock approval queue item
 */
export function createMockApprovalQueueItem(overrides?: Partial<ApprovalQueueItem>): ApprovalQueueItem {
  const baseRevision = createMockRevision({ status: 'submitted', ...overrides })
  
  return {
    ...baseRevision,
    priority: faker.helpers.arrayElement(['low', 'medium', 'high'] as const),
    days_pending: faker.number.int({ min: 1, max: 30 }),
    ...overrides,
  }
}

/**
 * Factory function to create multiple mock revisions
 */
export function createMockRevisions(count: number, overrides?: Partial<Revision>): Revision[] {
  return Array.from({ length: count }, () => createMockRevision(overrides))
}

/**
 * Factory function to create revisions with different statuses
 */
export function createMockRevisionsWithStatuses(): Revision[] {
  return [
    createMockRevision({ 
      status: 'draft', 
      title: 'ドラフト修正案',
      created_at: '2024-01-01T00:00:00Z',
    }),
    createMockRevision({ 
      status: 'submitted', 
      title: '提出済み修正案',
      created_at: '2024-01-02T00:00:00Z',
      submitted_at: '2024-01-02T00:00:00Z',
    }),
    createMockRevision({ 
      status: 'approved', 
      title: '承認済み修正案',
      created_at: '2024-01-03T00:00:00Z',
      submitted_at: '2024-01-03T00:00:00Z',
      approved_at: '2024-01-04T00:00:00Z',
    }),
    createMockRevision({ 
      status: 'rejected', 
      title: '却下された修正案',
      created_at: '2024-01-05T00:00:00Z',
      submitted_at: '2024-01-05T00:00:00Z',
    }),
  ]
}

/**
 * Factory function to create revision for specific user
 */
export function createMockUserRevision(userId: string, overrides?: Partial<Revision>): Revision {
  return createMockRevision({
    proposer_id: userId,
    ...overrides,
  })
}
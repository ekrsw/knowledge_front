// Re-export all factory functions for easy importing
export * from './userFactory'
export * from './revisionFactory'
export * from './articleFactory'

// Common factory helpers
import { faker } from '@faker-js/faker'

/**
 * Generate a mock ID
 */
export function generateMockId(): string {
  return faker.string.uuid()
}

/**
 * Generate a mock date in ISO string format
 */
export function generateMockDate(options?: {
  past?: boolean
  future?: boolean
  refDate?: Date
}): string {
  const { past = false, future = false, refDate = new Date() } = options || {}
  
  if (past) {
    return faker.date.past({ refDate }).toISOString()
  }
  
  if (future) {
    return faker.date.future({ refDate }).toISOString()
  }
  
  return faker.date.recent({ refDate }).toISOString()
}

/**
 * Generate mock Japanese text
 */
export function generateMockJapaneseText(options?: {
  type?: 'word' | 'sentence' | 'paragraph'
  count?: number
}): string {
  const { type = 'sentence', count = 1 } = options || {}
  
  // For now, use Lorem ipsum as faker doesn't have Japanese locale
  // In a real project, you might want to create a custom Japanese text generator
  switch (type) {
    case 'word':
      return faker.lorem.words(count)
    case 'sentence':
      return faker.lorem.sentences(count)
    case 'paragraph':
      return faker.lorem.paragraphs(count)
    default:
      return faker.lorem.sentence()
  }
}

/**
 * Generate mock error response
 */
export function createMockErrorResponse(
  message: string = 'An error occurred',
  status: number = 500
) {
  return {
    detail: message,
    status,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Generate mock API response with pagination
 */
export function createMockPaginatedResponse<T>(
  data: T[],
  options?: {
    page?: number
    limit?: number
    total?: number
  }
) {
  const { page = 1, limit = 50, total = data.length } = options || {}
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      has_next: page * limit < total,
      has_prev: page > 1,
    },
  }
}
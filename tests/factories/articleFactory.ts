import { faker } from '@faker-js/faker'

export interface Article {
  article_id: string
  article_number: string
  title: string
  content: string
  info_category: string
  approval_group: string
  created_at: string
  updated_at: string
}

export interface ArticleFormData {
  article_number: string
  title: string
  content: string
  info_category: string
  approval_group: string
}

/**
 * Factory function to create mock Article objects
 */
export function createMockArticle(overrides?: Partial<Article>): Article {
  const createdAt = faker.date.past()
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() })
  
  return {
    article_id: faker.string.uuid(),
    article_number: `ART-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(5),
    info_category: faker.helpers.arrayElement([
      'general',
      'technical',
      'policy',
      'procedure',
      'guideline',
    ]),
    approval_group: faker.helpers.arrayElement([
      'default',
      'technical',
      'management',
      'legal',
      'security',
    ]),
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    ...overrides,
  }
}

/**
 * Factory function to create mock article form data
 */
export function createMockArticleFormData(overrides?: Partial<ArticleFormData>): ArticleFormData {
  return {
    article_number: `ART-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    info_category: faker.helpers.arrayElement([
      'general',
      'technical',
      'policy',
    ]),
    approval_group: faker.helpers.arrayElement([
      'default',
      'technical',
      'management',
    ]),
    ...overrides,
  }
}

/**
 * Factory function to create multiple mock articles
 */
export function createMockArticles(count: number, overrides?: Partial<Article>): Article[] {
  return Array.from({ length: count }, () => createMockArticle(overrides))
}

/**
 * Factory function to create articles with different categories
 */
export function createMockArticlesByCategory(): Article[] {
  const categories = ['general', 'technical', 'policy', 'procedure', 'guideline']
  
  return categories.map(category => 
    createMockArticle({
      info_category: category,
      title: `${category} 記事のタイトル`,
    })
  )
}

/**
 * Factory function to create articles with different approval groups
 */
export function createMockArticlesByApprovalGroup(): Article[] {
  const groups = ['default', 'technical', 'management', 'legal', 'security']
  
  return groups.map(group => 
    createMockArticle({
      approval_group: group,
      title: `${group} グループの記事`,
    })
  )
}
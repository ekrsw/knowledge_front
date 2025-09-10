'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', description: 'Component demos' },
    { href: '/revisions', label: 'Revisions', description: 'View all revisions' },
    { href: '/revisions/new', label: 'Create Article', description: 'Create new content' },
    { href: '/revisions/pending', label: 'Pending Approvals', description: 'Review pending items' }
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className={`bg-white shadow-sm border-b ${className}`} aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Knowledge Management System
              </h1>
            </div>
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50 border-primary-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <div className="flex flex-col items-start">
                    <span>{item.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-600">
              Phase 2: Knowledge Management Frontend
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
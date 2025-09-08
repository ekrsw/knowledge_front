import { SearchAndFilter } from '../components/features/SearchAndFilter'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search & Filter Test</h1>
        <SearchAndFilter />
      </div>
    </div>
  )
}
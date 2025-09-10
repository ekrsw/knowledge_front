'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { articlesApi } from '../../lib/api/articles'
import { CreateArticleRequest, Category } from '../../types/article'

interface FormData {
  title: string
  content: string
  category_id: string
  tags: string[]
}

interface FormErrors {
  title?: string
  content?: string
  category_id?: string
  tags?: string
}

export function NewCreation() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category_id: '',
    tags: []
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [tagsInput, setTagsInput] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch categories
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => articlesApi.getCategories(),
    select: (response) => response.data
  })

  // Set default category when categories load
  useEffect(() => {
    if (categoriesResponse && categoriesResponse.length > 0 && !formData.category_id) {
      setFormData(prev => ({
        ...prev,
        category_id: categoriesResponse[0].category_id
      }))
    }
  }, [categoriesResponse, formData.category_id])

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: (data: CreateArticleRequest) => articlesApi.createArticle(data),
    onSuccess: (response) => {
      if (response.success) {
        setSuccessMessage('Article created successfully!')
        resetForm()
      } else {
        setErrorMessage(response.error || 'Unknown error')
      }
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Unknown error')
    }
  })

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (data: Omit<FormData, 'category_id'> & { category_id: string }) => 
      articlesApi.saveDraft(data),
    onSuccess: (response) => {
      if (response.success) {
        setSuccessMessage('Draft saved successfully!')
      } else {
        setErrorMessage(response.error || 'Unknown error')
      }
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Unknown error')
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category_id: categoriesResponse?.[0]?.category_id || '',
      tags: []
    })
    setTagsInput('')
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
    
    // Clear messages
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    handleInputChange('tags', tags)
  }

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    // For draft saving, we don't require all fields to be filled
    if (!saveAsDraft && !validateForm()) return

    const submitData: CreateArticleRequest = {
      title: formData.title,
      content: formData.content,
      category_id: formData.category_id,
      tags: formData.tags,
      save_as_draft: saveAsDraft
    }

    if (saveAsDraft) {
      saveDraftMutation.mutate({
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
        tags: formData.tags
      })
    } else {
      createArticleMutation.mutate(submitData)
    }
  }

  const isLoading = createArticleMutation.isPending || saveDraftMutation.isPending

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading categories...</span>
      </div>
    )
  }

  if (categoriesError || !categoriesResponse) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Categories</h3>
          <p className="text-sm mt-1">Unable to load article categories.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form 
        role="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(false)
        }}
        className="space-y-6"
        noValidate
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm font-semibold">Failed to create article</p>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Title Field */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          required
          aria-required="true"
          placeholder="Enter article title"
        />

        {/* Content Field */}
        <div className="w-full">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.content 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            required
            aria-required="true"
            rows={12}
            placeholder="Enter article content..."
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.content}
            </p>
          )}
        </div>

        {/* Category Field */}
        <div className="w-full">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="category"
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.category_id 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            required
            aria-required="true"
          >
            {categoriesResponse.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.category_id}
            </p>
          )}
        </div>

        {/* Tags Field */}
        <Input
          label="Tags"
          value={tagsInput}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="Enter tags separated by commas (e.g., react, typescript, tutorial)"
          helperText="Separate multiple tags with commas"
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            loading={saveDraftMutation.isPending}
          >
            Save as Draft
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            loading={createArticleMutation.isPending}
          >
            Create Article
          </Button>
        </div>
      </form>
    </div>
  )
}
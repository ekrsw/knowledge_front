'use client'

import { useState } from 'react'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleSubmit = () => {
    setIsLoading(true)
    
    // Simple email validation for demo
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address')
      setIsLoading(false)
      return
    }
    
    setEmailError('')
    
    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false)
      alert(`Form submitted with email: ${email}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              TDD Component Demo
            </h1>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Testing our Button and Input components built with TDD
            </p>
          </div>

          <div className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText="Enter your email address"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Enter your password"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!email || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setEmail('')
                  setPassword('')
                  setEmailError('')
                }}
              >
                Clear
              </Button>
            </div>

            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Button Variants</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>

              <div className="space-y-2">
                <Button variant="primary" size="md" className="w-full">Medium Button</Button>
                <Button variant="primary" size="lg" className="w-full">Large Button</Button>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Input States</h3>
              
              <div className="space-y-4">
                <Input
                  label="Normal Input"
                  placeholder="Enter some text"
                  helperText="This is helper text"
                />
                
                <Input
                  label="Error State"
                  error="This field is required"
                  placeholder="This has an error"
                />
                
                <Input
                  label="Required Field"
                  required
                  placeholder="This field is required"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
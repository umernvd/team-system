import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Home() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  if (error) {
    console.log('Auth0 error:', error)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Team Roster</h1>
      <p className="text-gray-500 text-lg mb-8 text-center max-w-md">
        Manage your team's employees. Add, edit, and track everyone in one place.
      </p>
      <button
        onClick={() => loginWithRedirect()}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
      >
        Get Started
      </button>
    </div>
  )
}

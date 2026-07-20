import { useAuth0 } from '@auth0/auth0-react'

export default function Profile() {
  const { user, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 mt-8">
      <div className="bg-white rounded shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>

        <div className="flex flex-col items-center mb-6">
          {user?.picture && (
            <img
              src={user.picture}
              alt="avatar"
              className="w-20 h-20 rounded-full mb-3"
            />
          )}
          <h3 className="text-lg font-semibold text-gray-700">
            {user?.name || user?.nickname || 'User'}
          </h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-700">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Email Verified</span>
            <span className="text-gray-700">{user?.email_verified ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Auth0 ID</span>
            <span className="text-gray-700 text-xs truncate max-w-[200px]">{user?.sub}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Updated At</span>
            <span className="text-gray-700">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

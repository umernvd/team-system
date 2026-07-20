import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getEmployees } from '../api'
import { audience } from '../config'
import EmployeeTable from '../components/EmployeeTable'
import AddEmployeeForm from '../components/AddEmployeeForm'

export default function Dashboard() {
  const { getAccessTokenSilently } = useAuth0()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const accessToken = await getAccessTokenSilently({
        authorizationParams: { audience }
      })
      console.log("accesstoken", accessToken)
      setToken(accessToken)
      const result = await getEmployees(accessToken)
      console.log('dashboard fetch result:', result)
      if (result.success) {
        setEmployees(result.data)
      } else {
        setError(result.message || 'Failed to fetch employees')
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="mb-6">
        <AddEmployeeForm onRefresh={fetchEmployees} token={token} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow-sm border">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-md font-semibold text-gray-700">Employees</h3>
        </div>
        {employees.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No employees yet. Add one above!
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onRefresh={fetchEmployees}
            token={token}
          />
        )}
      </div>
    </div>
  )
}

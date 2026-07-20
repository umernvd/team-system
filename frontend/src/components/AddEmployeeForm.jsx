import { useState } from 'react'
import { createEmployee } from '../api'
import { usePermissions } from '../hooks/usePermissions'

export default function AddEmployeeForm({ onRefresh, token }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { can } = usePermissions()
  if (!can('create')) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !role.trim() || !department.trim()) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    const result = await createEmployee(token, { name, role, department })
    setLoading(false)

    if (result.success) {
      setName('')
      setRole('')
      setDepartment('')
      onRefresh()
    } else {
      const msg = result.errors ? result.errors.join(', ') : result.message
      setError(msg || 'Failed to add employee')
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm border">
      <h3 className="text-md font-semibold mb-3 text-gray-700">Add Employee</h3>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="John"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1">Role</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Developer"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1">Department</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Engineering"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  )
}

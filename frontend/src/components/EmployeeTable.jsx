import { useState } from 'react'
import { deleteEmployee } from '../api'
import EditEmployeeModal from './EditEmployeeModal'
import { usePermissions } from '../hooks/usePermissions'

export default function EmployeeTable({ employees, onRefresh, token }) {
  const [editing, setEditing] = useState(null)
  const { can } = usePermissions()

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return
    const result = await deleteEmployee(token, id)
    if (result.success) {
      onRefresh()
    } else {
      alert(result.message || 'Failed to delete')
    }
  }

  return (
    <div>
      {editing && (
        <EditEmployeeModal
          employee={editing}
          token={token}
          onClose={() => setEditing(null)}
          onRefresh={onRefresh}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border-b text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left p-3 border-b text-sm font-semibold text-gray-600">Role</th>
              <th className="text-left p-3 border-b text-sm font-semibold text-gray-600">Department</th>
              <th className="text-left p-3 border-b text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50">
                <td className="p-3 border-b text-sm">{emp.name}</td>
                <td className="p-3 border-b text-sm">{emp.role}</td>
                <td className="p-3 border-b text-sm">{emp.department}</td>
                <td className="p-3 border-b text-sm flex gap-2">
                  {can('update') && (
                    <button
                      onClick={() => setEditing(emp)}
                      className="bg-yellow-500 text-black px-3 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                  )}
                  {can('delete') && (
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                  {!can('update') && !can('delete') && (
                    <span className="text-xs text-gray-400">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

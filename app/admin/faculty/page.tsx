'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Position {
  id: string
  name: string
  details?: string
  minCredits: number
}

interface Faculty {
  id: string
  name: string
  email: string
  position: Position
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [showPositionForm, setShowPositionForm] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    email: '',
    password: '',
    positionId: ''
  })
  const [positionFormData, setPositionFormData] = useState({
    name: '',
    details: '',
    minCredits: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      router.push('/')
      return
    }
    
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [facultyResponse, positionsResponse] = await Promise.all([
        fetch('/api/admin/faculty'),
        fetch('/api/admin/positions')
      ])
      
      if (facultyResponse.ok) {
        const facultyData = await facultyResponse.json()
        setFaculty(facultyData)
      }
      
      if (positionsResponse.ok) {
        const positionsData = await positionsResponse.json()
        setPositions(positionsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingFaculty 
        ? `/api/admin/faculty/${editingFaculty.id}`
        : '/api/admin/faculty'
      const method = editingFaculty ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facultyFormData),
      })

      if (response.ok) {
        resetFacultyForm()
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${editingFaculty ? 'update' : 'create'} faculty`)
      }
    } catch (error) {
      alert(`Failed to ${editingFaculty ? 'update' : 'create'} faculty`)
    }
  }

  const resetFacultyForm = () => {
    setFacultyFormData({
      name: '',
      email: '',
      password: '',
      positionId: ''
    })
    setShowFacultyForm(false)
    setEditingFaculty(null)
  }

  const handleEditFaculty = (faculty: Faculty) => {
    setFacultyFormData({
      name: faculty.name,
      email: faculty.email,
      password: '', // Don't pre-fill password for security
      positionId: faculty.position.id
    })
    setEditingFaculty(faculty)
    setShowFacultyForm(true)
  }

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) return
    
    setDeleting(facultyId)
    try {
      const response = await fetch(`/api/admin/faculty/${facultyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete faculty')
      }
    } catch (error) {
      alert('Failed to delete faculty')
    } finally {
      setDeleting(null)
    }
  }

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingPosition 
        ? `/api/admin/positions/${editingPosition.id}`
        : '/api/admin/positions'
      const method = editingPosition ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionFormData),
      })

      if (response.ok) {
        resetPositionForm()
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${editingPosition ? 'update' : 'create'} position`)
      }
    } catch (error) {
      alert(`Failed to ${editingPosition ? 'update' : 'create'} position`)
    }
  }

  const resetPositionForm = () => {
    setPositionFormData({
      name: '',
      details: '',
      minCredits: ''
    })
    setShowPositionForm(false)
    setEditingPosition(null)
  }

  const handleEditPosition = (position: Position) => {
    setPositionFormData({
      name: position.name,
      details: position.details || '',
      minCredits: position.minCredits.toString()
    })
    setEditingPosition(position)
    setShowPositionForm(true)
  }

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to delete this position? This action cannot be undone.')) return
    
    setDeleting(positionId)
    try {
      const response = await fetch(`/api/admin/positions/${positionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete position')
      }
    } catch (error) {
      alert('Failed to delete position')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-800 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold">Faculty Management</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => showPositionForm ? resetPositionForm() : setShowPositionForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
              >
                {showPositionForm ? 'Cancel' : 'Add Position'}
              </button>
              <button
                onClick={() => showFacultyForm ? resetFacultyForm() : setShowFacultyForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                {showFacultyForm ? 'Cancel' : 'Add Faculty'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        {showPositionForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingPosition ? 'Edit Position' : 'Add New Position'}
            </h2>
            <form onSubmit={handlePositionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position Name</label>
                  <input
                    type="text"
                    required
                    value={positionFormData.name}
                    onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Credits</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={positionFormData.minCredits}
                    onChange={(e) => setPositionFormData({ ...positionFormData, minCredits: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <textarea
                  value={positionFormData.details}
                  onChange={(e) => setPositionFormData({ ...positionFormData, details: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  {editingPosition ? 'Update Position' : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showFacultyForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
            </h2>
            <form onSubmit={handleFacultySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={facultyFormData.name}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={facultyFormData.email}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password {editingFaculty && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingFaculty}
                    value={facultyFormData.password}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <select
                    required
                    value={facultyFormData.positionId}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, positionId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Position</option>
                    {positions.map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faculty List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Faculty Members ({faculty.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {faculty.map((member) => (
                <div key={member.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <p className="text-xs text-gray-400">{member.position.name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditFaculty(member)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(member.id)}
                        disabled={deleting === member.id}
                        className="text-red-600 hover:text-red-900 text-sm disabled:text-gray-400"
                      >
                        {deleting === member.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positions List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Positions ({positions.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {positions.map((position) => (
                <div key={position.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{position.name}</h3>
                      <p className="text-sm text-gray-500">Min Credits: {position.minCredits}</p>
                      {position.details && (
                        <p className="text-xs text-gray-400 mt-1">{position.details}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPosition(position)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePosition(position.id)}
                        disabled={deleting === position.id}
                        className="text-red-600 hover:text-red-900 text-sm disabled:text-gray-400"
                      >
                        {deleting === position.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
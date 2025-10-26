'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Position {
  id: string
  name: string
}

interface Faculty {
  id: string
  name: string
  position: Position
}

interface Course {
  id: string
  courseName: string
  courseCode: string
}

interface ElectiveCourse {
  id: string
  courseName: string
  courseCode: string
  description: string
  credits: number
  status: string
  createdAt: string
  updatedAt: string
  faculty: Faculty
  course?: Course
}

export default function FacultyElectivesPage() {
  const [electives, setElectives] = useState<ElectiveCourse[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingElective, setEditingElective] = useState<ElectiveCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    description: '',
    credits: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'faculty') {
      router.push('/')
      return
    }
    
    setUser(parsedUser)
    fetchElectives(parsedUser.id)
  }, [router])

  const fetchElectives = async (facultyId: string) => {
    try {
      const response = await fetch(`/api/faculty/electives?facultyId=${facultyId}`)
      if (response.ok) {
        const data = await response.json()
        setElectives(data)
      }
    } catch (error) {
      console.error('Failed to fetch electives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const url = editingElective 
        ? `/api/faculty/electives/${editingElective.id}`
        : '/api/faculty/electives'
      const method = editingElective ? 'PUT' : 'POST'
      
      const payload = editingElective 
        ? formData
        : { ...formData, facultyId: user.id }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        resetForm()
        fetchElectives(user.id)
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${editingElective ? 'update' : 'create'} elective`)
      }
    } catch (error) {
      alert(`Failed to ${editingElective ? 'update' : 'create'} elective`)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseCode: '',
      description: '',
      credits: ''
    })
    setShowForm(false)
    setEditingElective(null)
  }

  const handleEdit = (elective: ElectiveCourse) => {
    if (elective.status !== 'PENDING') {
      alert('You can only edit pending electives')
      return
    }
    
    setFormData({
      courseName: elective.courseName,
      courseCode: elective.courseCode,
      description: elective.description,
      credits: elective.credits.toString()
    })
    setEditingElective(elective)
    setShowForm(true)
  }

  const handleDelete = async (electiveId: string) => {
    if (!confirm('Are you sure you want to delete this elective proposal?')) return
    
    setDeleting(electiveId)
    try {
      const response = await fetch(`/api/faculty/electives/${electiveId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchElectives(user.id)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete elective')
      }
    } catch (error) {
      alert('Failed to delete elective')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                onClick={() => router.push('/faculty/dashboard')}
                className="text-blue-600 hover:text-blue-800 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold">Elective Proposals</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => showForm ? resetForm() : setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                {showForm ? 'Cancel' : 'Propose Elective'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {editingElective ? 'Edit Elective Proposal' : 'Propose New Elective'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <input
                    type="text"
                    required
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Advanced Machine Learning"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Code</label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., CS501"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  placeholder="Detailed description of the course content, objectives, and prerequisites..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credits</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : (editingElective ? 'Update Proposal' : 'Submit Proposal')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Your Elective Proposals ({electives.length})</h2>
          </div>
          
          {electives.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {electives.map((elective) => (
                <div key={elective.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{elective.courseName}</h3>
                        <span className="text-sm text-gray-500">({elective.courseCode})</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(elective.status)}`}>
                          {elective.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{elective.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{elective.credits} credits</span>
                        <span>Submitted: {new Date(elective.createdAt).toLocaleDateString()}</span>
                        {elective.updatedAt !== elective.createdAt && (
                          <span>Updated: {new Date(elective.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {elective.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleEdit(elective)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(elective.id)}
                            disabled={deleting === elective.id}
                            className="text-red-600 hover:text-red-900 text-sm disabled:text-gray-400"
                          >
                            {deleting === elective.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                      {elective.status === 'APPROVED' && elective.course && (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ Added to Course Catalog
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">You haven't proposed any electives yet.</p>
              <p className="text-sm text-gray-400 mt-2">Click "Propose Elective" to submit your first proposal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
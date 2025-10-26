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
  email: string
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

export default function AdminElectivesPage() {
  const [electives, setElectives] = useState<ElectiveCourse[]>([])
  const [filteredElectives, setFilteredElectives] = useState<ElectiveCourse[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
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
    
    fetchElectives()
  }, [router])

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredElectives(electives)
    } else {
      setFilteredElectives(electives.filter(e => e.status === statusFilter))
    }
  }, [electives, statusFilter])

  const fetchElectives = async () => {
    try {
      const response = await fetch('/api/admin/electives')
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

  const handleStatusUpdate = async (electiveId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this elective proposal?`)) return
    
    setUpdating(electiveId)
    try {
      const response = await fetch(`/api/admin/electives/${electiveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchElectives()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${newStatus.toLowerCase()} elective`)
      }
    } catch (error) {
      alert(`Failed to ${newStatus.toLowerCase()} elective`)
    } finally {
      setUpdating(null)
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

  const getStatusCounts = () => {
    const counts = electives.reduce((acc, elective) => {
      acc[elective.status] = (acc[elective.status] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
    
    return {
      PENDING: counts.PENDING || 0,
      APPROVED: counts.APPROVED || 0,
      REJECTED: counts.REJECTED || 0,
      ALL: electives.length
    }
  }

  const statusCounts = getStatusCounts()

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
              <h1 className="text-xl font-semibold">Elective Proposals</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">All ({statusCounts.ALL})</option>
                <option value="PENDING">Pending ({statusCounts.PENDING})</option>
                <option value="APPROVED">Approved ({statusCounts.APPROVED})</option>
                <option value="REJECTED">Rejected ({statusCounts.REJECTED})</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.ALL}</div>
            <div className="text-sm text-gray-500">Total Proposals</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</div>
            <div className="text-sm text-gray-500">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{statusCounts.APPROVED}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{statusCounts.REJECTED}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">
              {statusFilter === 'ALL' ? 'All Elective Proposals' : `${statusFilter} Proposals`} 
              ({filteredElectives.length})
            </h2>
          </div>
          
          {filteredElectives.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredElectives.map((elective) => (
                <div key={elective.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{elective.courseName}</h3>
                        <span className="text-sm text-gray-500">({elective.courseCode})</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(elective.status)}`}>
                          {elective.status}
                        </span>
                        <span className="text-xs text-gray-500">{elective.credits} credits</span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">{elective.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          <strong>Proposed by:</strong> {elective.faculty.name} ({elective.faculty.position.name})
                        </span>
                        <span>
                          <strong>Email:</strong> {elective.faculty.email}
                        </span>
                        <span>
                          <strong>Submitted:</strong> {new Date(elective.createdAt).toLocaleDateString()}
                        </span>
                        {elective.updatedAt !== elective.createdAt && (
                          <span>
                            <strong>Updated:</strong> {new Date(elective.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {elective.status === 'APPROVED' && elective.course && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Added to course catalog as {elective.course.courseCode}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {elective.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(elective.id, 'APPROVED')}
                            disabled={updating === elective.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {updating === elective.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(elective.id, 'REJECTED')}
                            disabled={updating === elective.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {updating === elective.id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {elective.status === 'REJECTED' && (
                        <button
                          onClick={() => handleStatusUpdate(elective.id, 'APPROVED')}
                          disabled={updating === elective.id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {updating === elective.id ? 'Processing...' : 'Approve'}
                        </button>
                      )}
                      {elective.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(elective.id, 'REJECTED')}
                          disabled={updating === elective.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                        >
                          {updating === elective.id ? 'Processing...' : 'Revoke'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                {statusFilter === 'ALL' 
                  ? 'No elective proposals found.' 
                  : `No ${statusFilter.toLowerCase()} proposals found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
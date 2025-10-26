'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  courseName: string
  courseCode: string
  credits: number
}

interface Faculty {
  id: string
  name: string
  email: string
  position: {
    name: string
  }
}

interface SessionCourse {
  id: string
  course: Course
}

interface SessionFaculty {
  id: string
  faculty: Faculty
}

interface Session {
  id: string
  name: string
  details?: string
  isActive: boolean
  maxCourses: number
  maxElectives: number
  sessionCourses: SessionCourse[]
  sessionFaculties: SessionFaculty[]
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showFacultyModal, setShowFacultyModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    isActive: true,
    maxCourses: '5',
    maxElectives: '2'
  })
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([])
  const [removing, setRemoving] = useState<string | null>(null)
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
      const [sessionsResponse, coursesResponse, facultyResponse] = await Promise.all([
        fetch('/api/admin/sessions'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/faculty')
      ])
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
      }
      
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData)
      }
      
      if (facultyResponse.ok) {
        const facultyData = await facultyResponse.json()
        setFaculty(facultyData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          name: '',
          details: '',
          isActive: true,
          maxCourses: '5',
          maxElectives: '2'
        })
        setShowForm(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create session')
      }
    } catch (error) {
      alert('Failed to create session')
    }
  }

  const handleAddCourses = async () => {
    if (!selectedSession || selectedCourses.length === 0) return
    
    try {
      const response = await fetch(`/api/admin/sessions/${selectedSession}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseIds: selectedCourses }),
      })

      if (response.ok) {
        setSelectedCourses([])
        setShowCourseModal(false)
        setSelectedSession(null)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add courses')
      }
    } catch (error) {
      alert('Failed to add courses')
    }
  }

  const handleAddFaculty = async () => {
    if (!selectedSession || selectedFaculty.length === 0) return
    
    try {
      const response = await fetch(`/api/admin/sessions/${selectedSession}/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facultyIds: selectedFaculty }),
      })

      if (response.ok) {
        setSelectedFaculty([])
        setShowFacultyModal(false)
        setSelectedSession(null)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add faculty')
      }
    } catch (error) {
      alert('Failed to add faculty')
    }
  }

  const handleRemoveCourse = async (sessionId: string, courseId: string) => {
    if (!confirm('Are you sure you want to remove this course from the session?')) return
    
    const removeKey = `course-${courseId}`
    setRemoving(removeKey)
    
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/courses`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove course')
      }
    } catch (error) {
      alert('Failed to remove course')
    } finally {
      setRemoving(null)
    }
  }

  const handleRemoveFaculty = async (sessionId: string, facultyId: string) => {
    if (!confirm('Are you sure you want to remove this faculty from the session?')) return
    
    const removeKey = `faculty-${facultyId}`
    setRemoving(removeKey)
    
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/faculty`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facultyId }),
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove faculty')
      }
    } catch (error) {
      alert('Failed to remove faculty')
    } finally {
      setRemoving(null)
    }
  }

  const getAvailableCourses = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return courses
    
    const sessionCourseIds = session.sessionCourses.map(sc => sc.course.id)
    return courses.filter(course => !sessionCourseIds.includes(course.id))
  }

  const getAvailableFaculty = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return faculty
    
    const sessionFacultyIds = session.sessionFaculties.map(sf => sf.faculty.id)
    return faculty.filter(f => !sessionFacultyIds.includes(f.id))
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
              <h1 className="text-xl font-semibold">Session Management</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                {showForm ? 'Cancel' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Create New Session</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Courses per Faculty</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="20"
                    value={formData.maxCourses}
                    onChange={(e) => setFormData({ ...formData, maxCourses: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Electives per Faculty</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="10"
                    value={formData.maxElectives}
                    onChange={(e) => setFormData({ ...formData, maxElectives: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active Session
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">{session.name}</h2>
                    <p className="text-sm text-gray-500">{session.details}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Max {session.maxCourses} courses
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Max {session.maxElectives} electives
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSession(session.id)
                        setShowCourseModal(true)
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Add Courses
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSession(session.id)
                        setShowFacultyModal(true)
                      }}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      Add Faculty
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Courses ({session.sessionCourses.length})
                    </h3>
                    <div className="space-y-2">
                      {session.sessionCourses.length > 0 ? (
                        session.sessionCourses.map((sc) => (
                          <div key={sc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{sc.course.courseName}</span>
                              <span className="text-xs text-gray-500 ml-2">({sc.course.courseCode})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{sc.course.credits} credits</span>
                              <button
                                onClick={() => handleRemoveCourse(session.id, sc.course.id)}
                                disabled={removing === `course-${sc.course.id}`}
                                className="text-red-600 hover:text-red-800 text-xs disabled:text-gray-400"
                                title="Remove course"
                              >
                                {removing === `course-${sc.course.id}` ? '...' : '✕'}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic p-2">No courses assigned</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Faculty ({session.sessionFaculties.length})
                    </h3>
                    <div className="space-y-2">
                      {session.sessionFaculties.length > 0 ? (
                        session.sessionFaculties.map((sf) => (
                          <div key={sf.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{sf.faculty.name}</span>
                              <span className="text-xs text-gray-500 block">{sf.faculty.position.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveFaculty(session.id, sf.faculty.id)}
                              disabled={removing === `faculty-${sf.faculty.id}`}
                              className="text-red-600 hover:text-red-800 text-xs disabled:text-gray-400"
                              title="Remove faculty"
                            >
                              {removing === `faculty-${sf.faculty.id}` ? '...' : '✕'}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic p-2">No faculty assigned</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Courses to Session</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getAvailableCourses(selectedSession).length > 0 ? (
                getAvailableCourses(selectedSession).map((course) => (
                  <label key={course.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCourses([...selectedCourses, course.id])
                        } else {
                          setSelectedCourses(selectedCourses.filter(id => id !== course.id))
                        }
                      }}
                      className="mr-2"
                    />
                    <div>
                      <span className="text-sm">{course.courseName} ({course.courseCode})</span>
                      <span className="text-xs text-gray-500 block">{course.credits} credits</span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic p-2">All courses are already assigned to this session</div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowCourseModal(false)
                  setSelectedSession(null)
                  setSelectedCourses([])
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourses}
                disabled={selectedCourses.length === 0 || getAvailableCourses(selectedSession).length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Modal */}
      {showFacultyModal && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Faculty to Session</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getAvailableFaculty(selectedSession).length > 0 ? (
                getAvailableFaculty(selectedSession).map((member) => (
                  <label key={member.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFaculty.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFaculty([...selectedFaculty, member.id])
                        } else {
                          setSelectedFaculty(selectedFaculty.filter(id => id !== member.id))
                        }
                      }}
                      className="mr-2"
                    />
                    <div>
                      <span className="text-sm">{member.name}</span>
                      <span className="text-xs text-gray-500 block">{member.position.name}</span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic p-2">All faculty are already assigned to this session</div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowFacultyModal(false)
                  setSelectedSession(null)
                  setSelectedFaculty([])
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaculty}
                disabled={selectedFaculty.length === 0 || getAvailableFaculty(selectedSession).length === 0}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  courseName: string
  courseCode: string
  credits: number
}

interface SessionCourse {
  id: string
  course: Course
}

interface CourseChoice {
  id: string
  preferenceOrder: number
  sessionCourse: SessionCourse
}

interface Session {
  id: string
  name: string
  details?: string
  maxCourses: number
  sessionCourses: SessionCourse[]
}

interface SessionFaculty {
  id: string
  session: Session
  courseChoices: CourseChoice[]
}

export default function FacultyPreferencesPage() {
  const [sessionFaculties, setSessionFaculties] = useState<SessionFaculty[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
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
    fetchSessions(parsedUser.id)
  }, [router])

  const fetchSessions = async (facultyId: string) => {
    try {
      const response = await fetch(`/api/faculty/sessions?facultyId=${facultyId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionFaculties(data)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = async (sessionFacultyId: string, coursePreferences: { sessionCourseId: string; preferenceOrder: number }[]) => {
    setSaving(sessionFacultyId)
    try {
      const response = await fetch('/api/faculty/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionFacultyId,
          coursePreferences
        }),
      })

      if (response.ok) {
        // Refresh data
        fetchSessions(user.id)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save preferences')
      }
    } catch (error) {
      alert('Failed to save preferences')
    } finally {
      setSaving(null)
    }
  }

  const PreferenceSelector = ({ sessionFaculty }: { sessionFaculty: SessionFaculty }) => {
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])
    const [preferences, setPreferences] = useState<{ [key: string]: number }>({})
    const [validationError, setValidationError] = useState<string>('')

    useEffect(() => {
      // Initialize with existing preferences
      const existingPrefs: { [key: string]: number } = {}
      const existingSelected: string[] = []

      sessionFaculty.courseChoices.forEach(choice => {
        existingPrefs[choice.sessionCourse.id] = choice.preferenceOrder
        existingSelected.push(choice.sessionCourse.id)
      })

      setPreferences(existingPrefs)
      setSelectedCourses(existingSelected)
    }, [sessionFaculty])

    // Calculate current total credits
    const totalCredits = selectedCourses.reduce((total, id) => {
      const course = sessionFaculty.session.sessionCourses.find(sc => sc.id === id)
      return total + (course?.course.credits || 0)
    }, 0)

    // Get faculty position requirements
    const minCredits = user?.position?.minCredits || 0
    const maxCourses = sessionFaculty.session.maxCourses || 5

    // Validation checks
    useEffect(() => {
      if (selectedCourses.length > maxCourses) {
        setValidationError(`Cannot select more than ${maxCourses} courses`)
      } else if (selectedCourses.length > 0 && totalCredits < minCredits) {
        setValidationError(`Need at least ${minCredits} credits (currently ${totalCredits})`)
      } else {
        setValidationError('')
      }
    }, [selectedCourses, totalCredits, minCredits, maxCourses])

    const handleCourseToggle = (sessionCourseId: string) => {
      if (selectedCourses.includes(sessionCourseId)) {
        // Remove course and reorder remaining preferences
        const removedOrder = preferences[sessionCourseId]
        setSelectedCourses(prev => prev.filter(id => id !== sessionCourseId))
        setPreferences(prev => {
          const newPrefs = { ...prev }
          delete newPrefs[sessionCourseId]

          // Reorder remaining preferences to fill gaps
          Object.keys(newPrefs).forEach(courseId => {
            if (newPrefs[courseId] > removedOrder) {
              newPrefs[courseId] = newPrefs[courseId] - 1
            }
          })

          return newPrefs
        })
      } else {
        // Check if we can add more courses
        if (selectedCourses.length >= maxCourses) {
          alert(`You can only select up to ${maxCourses} courses for this session.`)
          return
        }
        
        // Add course with next available preference order
        const existingOrders = Object.values(preferences)
        const nextOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 1
        setSelectedCourses(prev => [...prev, sessionCourseId])
        setPreferences(prev => ({
          ...prev,
          [sessionCourseId]: nextOrder
        }))
      }
    }

    const handlePreferenceOrderChange = (sessionCourseId: string, newOrder: number) => {
      setPreferences(prev => {
        const newPrefs = { ...prev }

        // Find if another course already has this preference order
        const existingCourseWithOrder = Object.keys(newPrefs).find(
          courseId => courseId !== sessionCourseId && newPrefs[courseId] === newOrder
        )

        // If another course has this order, swap them
        if (existingCourseWithOrder) {
          const currentOrder = newPrefs[sessionCourseId]
          newPrefs[existingCourseWithOrder] = currentOrder
        }

        // Set the new order for the current course
        newPrefs[sessionCourseId] = newOrder

        return newPrefs
      })
    }

    const handleSave = () => {
      const coursePreferences = selectedCourses.map(sessionCourseId => ({
        sessionCourseId,
        preferenceOrder: preferences[sessionCourseId]
      }))

      handlePreferenceChange(sessionFaculty.id, coursePreferences)
    }

    const getSortedSelectedCourses = () => {
      return selectedCourses
        .map(id => ({
          id,
          course: sessionFaculty.session.sessionCourses.find(sc => sc.id === id)!,
          order: preferences[id]
        }))
        .sort((a, b) => a.order - b.order)
    }

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">{sessionFaculty.session.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              Max {maxCourses} courses • Min {minCredits} credits required
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving === sessionFaculty.id || !!validationError}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving === sessionFaculty.id ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{validationError}</p>
          </div>
        )}

        {sessionFaculty.session.details && (
          <p className="text-sm text-gray-600 mb-4">{sessionFaculty.session.details}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Courses */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Available Courses</h4>
            <div className="space-y-2">
              {sessionFaculty.session.sessionCourses.map((sessionCourse) => {
                const isSelected = selectedCourses.includes(sessionCourse.id)
                const preferenceOrder = preferences[sessionCourse.id]

                return (
                  <label key={sessionCourse.id} className={`flex items-center p-2 border rounded cursor-pointer transition-all duration-200 ${isSelected
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'hover:bg-gray-50 border-gray-200'
                    }`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCourseToggle(sessionCourse.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{sessionCourse.course.courseName}</span>
                      <div className="text-xs text-gray-500">
                        {sessionCourse.course.courseCode} • {sessionCourse.course.credits} credits
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {preferenceOrder}
                      </div>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Selected Preferences */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Your Preferences ({selectedCourses.length} selected • {
                  selectedCourses.reduce((total, id) => {
                    const course = sessionFaculty.session.sessionCourses.find(sc => sc.id === id)
                    return total + (course?.course.credits || 0)
                  }, 0)
                } credits)
              </h4>
              {selectedCourses.length > 1 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" title="Changing a preference order will automatically swap positions with the existing course at that rank">
                  💡 Tip: Rankings auto-swap
                </div>
              )}
            </div>
            <div className="space-y-2">
              {selectedCourses.length > 0 ? (
                getSortedSelectedCourses().map((item, index) => (
                  <div key={item.id} className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded transition-all duration-200 hover:bg-blue-100">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {item.order}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.course.course.courseName}</span>
                      <div className="text-xs text-gray-500">{item.course.course.courseCode} • {item.course.course.credits} credits</div>
                    </div>
                    <select
                      value={item.order}
                      onChange={(e) => handlePreferenceOrderChange(item.id, parseInt(e.target.value))}
                      className="ml-2 text-xs border rounded px-2 py-1 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Change preference order (will swap with existing course if needed)"
                    >
                      {Array.from({ length: selectedCourses.length }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>#{num}</option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic p-2">No courses selected</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
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
              <h1 className="text-xl font-semibold">Course Preferences</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {sessionFaculties.length > 0 ? (
            sessionFaculties.map((sessionFaculty) => (
              <PreferenceSelector key={sessionFaculty.id} sessionFaculty={sessionFaculty} />
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">You are not assigned to any active sessions yet.</p>
              <p className="text-sm text-gray-400 mt-2">Contact your administrator to be added to a session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
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

interface Session {
  id: string
  name: string
  details?: string
  isActive: boolean
}

interface Course {
  id: string
  courseName: string
  courseCode: string
}

interface ElectiveProposal {
  id: string
  courseName: string
  courseCode?: string
  description: string
  credits: number
  status: string
  createdAt: string
  course?: Course
}

interface SessionFaculty {
  id: string
  session: Session
  faculty: Faculty
  courseChoices: CourseChoice[]
  electiveProposals: ElectiveProposal[]
}

export default function AdminPreferencesPage() {
  const [sessionFaculties, setSessionFaculties] = useState<SessionFaculty[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [loading, setLoading] = useState(true)
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
      const [preferencesResponse, sessionsResponse] = await Promise.all([
        fetch('/api/admin/preferences'),
        fetch('/api/admin/sessions')
      ])
      
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json()
        setSessionFaculties(preferencesData)
      }
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferencesForSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/preferences?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionFaculties(data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const handleSessionFilter = (sessionId: string) => {
    setSelectedSession(sessionId)
    if (sessionId) {
      fetchPreferencesForSession(sessionId)
    } else {
      fetchData()
    }
  }

  const getElectiveStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedBySession = sessionFaculties.reduce((acc, sf) => {
    const sessionId = sf.session.id
    if (!acc[sessionId]) {
      acc[sessionId] = {
        session: sf.session,
        faculties: []
      }
    }
    acc[sessionId].faculties.push(sf)
    return acc
  }, {} as { [key: string]: { session: Session; faculties: SessionFaculty[] } })

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
              <h1 className="text-xl font-semibold">Faculty Course Preferences</h1>
            </div>
            <div className="flex items-center">
              <select
                value={selectedSession}
                onChange={(e) => handleSessionFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Sessions</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} {session.isActive ? '(Active)' : '(Inactive)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {Object.keys(groupedBySession).length > 0 ? (
            Object.values(groupedBySession).map(({ session, faculties }) => (
              <div key={session.id} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium">{session.name}</h2>
                      {session.details && (
                        <p className="text-sm text-gray-500">{session.details}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          {faculties.reduce((sum, sf) => sum + sf.courseChoices.length, 0)} course preferences
                        </span>
                        <span>
                          {faculties.reduce((sum, sf) => sum + sf.electiveProposals.length, 0)} elective proposals
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {faculties.map((sessionFaculty) => (
                      <div key={sessionFaculty.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-900">{sessionFaculty.faculty.name}</h3>
                          <p className="text-xs text-gray-500">{sessionFaculty.faculty.email}</p>
                          <p className="text-xs text-gray-400">{sessionFaculty.faculty.position.name}</p>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Course Preferences */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">
                              Course Preferences ({sessionFaculty.courseChoices.length})
                            </h4>
                            {sessionFaculty.courseChoices.length > 0 ? (
                              <div className="space-y-1">
                                {sessionFaculty.courseChoices.map((choice) => (
                                  <div key={choice.id} className="flex items-center text-xs">
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full mr-2 font-medium">
                                      {choice.preferenceOrder}
                                    </span>
                                    <div className="flex-1">
                                      <span className="font-medium">{choice.sessionCourse.course.courseName}</span>
                                      <div className="text-gray-500">
                                        {choice.sessionCourse.course.courseCode} • {choice.sessionCourse.course.credits} credits
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic">No preferences submitted</div>
                            )}
                          </div>

                          {/* Elective Proposals */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">
                              Elective Proposals ({sessionFaculty.electiveProposals.length})
                            </h4>
                            {sessionFaculty.electiveProposals.length > 0 ? (
                              <div className="space-y-2">
                                {sessionFaculty.electiveProposals.map((elective) => (
                                  <div key={elective.id} className="bg-gray-50 rounded p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-900">{elective.courseName}</span>
                                      <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${getElectiveStatusColor(elective.status)}`}>
                                        {elective.status}
                                      </span>
                                    </div>
                                    {elective.courseCode && (
                                      <div className="text-xs text-gray-600 mb-1">
                                        Code: {elective.courseCode}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500 mb-1">
                                      {elective.credits} credits
                                    </div>
                                    <div className="text-xs text-gray-500" style={{ 
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}>
                                      {elective.description}
                                    </div>
                                    {elective.status === 'APPROVED' && elective.course && (
                                      <div className="text-xs text-green-600 mt-1">
                                        ✓ Added to catalog
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic">No electives proposed</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No faculty preferences found.</p>
              <p className="text-sm text-gray-400 mt-2">
                {selectedSession 
                  ? 'No faculty are assigned to the selected session or have submitted preferences.'
                  : 'No faculty have been assigned to any sessions yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
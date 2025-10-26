'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FacultyDashboard() {
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
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Faculty Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-gray-700 font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.position?.name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Course Preferences */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📚</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Course Preferences
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Order Your Courses
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button
                    onClick={() => router.push('/faculty/preferences')}
                    className="font-medium text-blue-700 hover:text-blue-900"
                  >
                    Set course preferences →
                  </button>
                </div>
              </div>
            </div>

            {/* Elective Proposals */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">💡</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Elective Proposals
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Propose New Electives
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-700 hover:text-green-900">
                    Submit elective proposal →
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Info */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.position?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Minimum Credits</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.position?.minCredits}</dd>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
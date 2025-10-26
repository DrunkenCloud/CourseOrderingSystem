'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  courseName: string
  courseCode: string
  details?: string
  credits: number
  isElective: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    details: '',
    credits: '',
    isElective: false
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
    
    fetchCourses()
  }, [router])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse.id}`
        : '/api/admin/courses'
      const method = editingCourse ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        resetForm()
        fetchCourses()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${editingCourse ? 'update' : 'create'} course`)
      }
    } catch (error) {
      alert(`Failed to ${editingCourse ? 'update' : 'create'} course`)
    }
  }

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseCode: '',
      details: '',
      credits: '',
      isElective: false
    })
    setShowForm(false)
    setEditingCourse(null)
  }

  const handleEdit = (course: Course) => {
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      details: course.details || '',
      credits: course.credits.toString(),
      isElective: course.isElective
    })
    setEditingCourse(course)
    setShowForm(true)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return
    
    setDeleting(courseId)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourses()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete course')
      }
    } catch (error) {
      alert('Failed to delete course')
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
              <h1 className="text-xl font-semibold">Course Management</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => showForm ? resetForm() : setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                {showForm ? 'Cancel' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Code</label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credits</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isElective"
                    checked={formData.isElective}
                    onChange={(e) => setFormData({ ...formData, isElective: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="isElective" className="ml-2 text-sm text-gray-700">
                    Is Elective Course
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">All Courses ({courses.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.courseCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.isElective 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {course.isElective ? 'Elective' : 'Core'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.details || 'No details'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          disabled={deleting === course.id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                        >
                          {deleting === course.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Star,
  TrendingUp,
  Target,
  Calendar,
  AlertCircle,
} from "lucide-react"

export default function CourseManagementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage courses, content, and learning materials
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              24
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Active Courses
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              18
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              1,247
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Avg. Rating
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              4.8
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Message */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Course Management Coming Soon
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            This section is under development and will be available soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Course Management Features
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Soon you'll be able to create, edit, and manage courses with advanced features including:
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Course Creation</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create new courses with rich content, videos, and interactive elements
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Edit className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Content Management</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Edit course content, add lessons, and manage learning materials
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Student Management</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Track student progress, manage enrollments, and view analytics
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Analytics</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  View detailed analytics and performance metrics for each course
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Reviews & Ratings</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage student reviews and course ratings
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Scheduling</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Schedule course releases and manage availability
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <Button variant="outline" className="mr-4">
                <Eye className="w-4 h-4 mr-2" />
                View Demo
              </Button>
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Get Notified
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Course List */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
          <CardDescription>
            Sample course data for demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Introduction to React", students: 156, rating: 4.8, status: "active" },
              { title: "Advanced JavaScript", students: 89, rating: 4.9, status: "active" },
              { title: "Python for Beginners", students: 234, rating: 4.7, status: "active" },
              { title: "Data Science Fundamentals", students: 67, rating: 4.6, status: "draft" },
            ].map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {course.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.students} students
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {course.rating}
                      </span>
                      <Badge className={course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

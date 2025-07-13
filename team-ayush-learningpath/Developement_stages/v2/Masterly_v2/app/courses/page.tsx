"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Star, Search, Filter, BookOpen, Play, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Course } from "@/lib/types/courses"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, selectedCategory, selectedLevel])

  const fetchCourses = async () => {
    try {
      const backendCourses = await apiClient.getCourses()

      const formattedCourses = backendCourses.map((course) => ({
        ...course,
        isEnrolled: course.userEnrollment?.enrolled || false, // ✅ map properly here
      }))

      setCourses(formattedCourses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const filterCourses = () => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    if (selectedLevel !== "all") {
      filtered = filtered.filter((course) => course.level === selectedLevel)
    }

    setFilteredCourses(filtered)
  }

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourse(courseId)
      await apiClient.enrollInCourse(courseId)

      // Update the course in the local state
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
              ...course,
              isEnrolled: true,
              progress: 0,
              studentsEnrolled: course.stats.enrollments + 1,
            }
            : course
        )
      )

      toast({
        title: "Success!",
        description: "You have successfully enrolled in the course.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEnrollingCourse(null)
    }
  }

  const categories = [...new Set(courses.map((course) => course.category))]
  const levels = [...new Set(courses.map((course) => course.level))]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Courses</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover and enroll in our comprehensive courses designed to advance your skills
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course._id}
            className="group hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800/80 dark:border-gray-700"
          >
            <div className="relative">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-t-lg" />
            </div>

            <CardContent className="p-6">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{course.stats?.averageRating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{course.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.instructor.name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.stats.totalDuration || "N/A"}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{(course.stats?.totalStudents || 0).toLocaleString()} students</span>
                  </span>
                  <Badge variant="outline">{course.level}</Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {course.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${course.pricing?.discountPrice ?? course.pricing.amount}
                    </span>
                    {course.pricing?.originalPrice > (course.pricing?.discountPrice ?? course.pricing.amount) && (
                      <span className="text-sm text-gray-500 line-through">
                        ${course.pricing.originalPrice}
                      </span>
                    )}
                  </div>

                  {course.userEnrollment?.enrolled || course.isEnrolled ? (
                    <Link href={`/courses/${course.slug}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingCourse === course._id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {enrollingCourse === course._id ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search criteria or browse all available courses.
          </p>
        </div>
      )}
    </div>
  )
}

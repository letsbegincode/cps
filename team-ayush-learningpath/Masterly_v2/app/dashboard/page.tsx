"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Trophy, Target, Clock, TrendingUp, Play, CheckCircle, Brain, Calendar, Award, LogOut } from 'lucide-react'
import Link from "next/link"
import { useAuthStore } from "@/lib/auth"
import apiClient from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { DashboardData } from "@/lib/types/dashboard"

// interface DashboardData {
//   user: {
//     name: string
//     avatar: string | null
//     level: number
//     plan: string
//   }
//   stats: {
//     coursesEnrolled: number
//     conceptsMastered: number
//     currentStreak: number
//     totalStudyTime: number
//   }
//   weeklyProgress: {
//     conceptsLearned: number
//     quizzesCompleted: number
//     studyTimeHours: number
//   }
//   recentCourses: Array<{
//     title: string
//     progress: number
//     nextLesson: string
//     timeSpent: string
//     concepts: { completed: number; total: number }
//   }>
//   achievements: Array<{
//     title: string
//     date: string
//     type: string
//   }>
//   upcomingTests: Array<{
//     title: string
//     date: string
//     duration: string
//   }>
// }

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  console.log("User:", user)
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return  // Wait for auth to resolve
      try {
        const response = await apiClient.getDashboardData()
        if (response.success) {
          setDashboardData(response.data)
        }
      } catch (err) {
        console.error("Dashboard loading failed:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])  // Only fetch when user is available

  const handleLogout = () => {
    logout()
  }

  const achievementIcons = {
    course: Trophy,
    streak: Target,
    quiz: Brain,
    speed: TrendingUp,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p>Failed to load dashboard data</p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.profile.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Continue your learning journey</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/learning-paths">
                <Brain className="w-4 h-4 mr-2" />
                Create Learning Path
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.profile?.avatar && user.profile.avatar !== "null"
                          ? user.profile.avatar
                          : ""
                      }
                      alt="User avatar"
                    />
                    <AvatarFallback className="bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-muted-foreground"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.profile.fullName || user.profile.displayName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-800/80 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.coursesEnrolled}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/80 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concepts Mastered</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.conceptsMastered}</div>
              <p className="text-xs text-muted-foreground">+12 this week</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/80 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/80 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalStudyTime}h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="w-5 h-5 mr-2 text-blue-600" />
                  Continue Learning
                </CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentCourses.map((course, index) => (
                  <div
                    key={index}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                      <Badge variant="secondary">{course.progress}% Complete</Badge>
                    </div>

                    <Progress value={course.progress} className="mb-3" />

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <span>Next: {course.nextLesson}</span>
                      <span>{course.timeSpent} spent</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {course.concepts.completed}/{course.concepts.total} concepts
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/courses/${course.title.toLowerCase().replace(/\s+/g, "-")}`}>Continue</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Path Recommendation */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-gray-800/90 dark:to-gray-700/90 dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                  <Brain className="w-5 h-5 mr-2" />
                  Recommended Learning Path
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Based on your progress and goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      Full Stack Developer Path
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Complete your journey from algorithms to system design with our curated path
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-900 dark:text-white">DSA Fundamentals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">System Design</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-500 rounded-full"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Backend Development</span>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href="/learning-paths">View Full Path</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.achievements.map((achievement, index) => {
                  const IconComponent = achievementIcons[achievement.type as keyof typeof achievementIcons] || Trophy
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <IconComponent className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{achievement.title}</span>
                    </div>
                  )
                })}
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href="/progress?tab=achievements">View All Achievements</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tests */}
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Upcoming Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.upcomingTests.map((test, index) => (
                  <div key={index} className="border dark:border-gray-700 rounded-lg p-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{test.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                      <span>{test.date}</span>
                      <span>{test.duration}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href="/mock-tests">View All Tests</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Concepts Learned</span>
                    <span className="font-medium">{dashboardData.weeklyProgress.conceptsLearned}</span>
                  </div>
                  <Progress value={Math.min((dashboardData.weeklyProgress.conceptsLearned / 15) * 100, 100)} />

                  <div className="flex items-center justify-between text-sm">
                    <span>Quizzes Completed</span>
                    <span className="font-medium">{dashboardData.weeklyProgress.quizzesCompleted}</span>
                  </div>
                  <Progress value={Math.min((dashboardData.weeklyProgress.quizzesCompleted / 10) * 100, 100)} />

                  <div className="flex items-center justify-between text-sm">
                    <span>Study Time</span>
                    <span className="font-medium">{dashboardData.weeklyProgress.studyTimeHours}h</span>
                  </div>
                  <Progress value={Math.min((dashboardData.weeklyProgress.studyTimeHours / 20) * 100, 100)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

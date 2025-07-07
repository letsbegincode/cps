"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Play,
  CheckCircle,
  Clock,
  Users,
  Star,
  BookOpen,
  FileText,
  Video,
  Code,
  Share,
  Heart,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Trophy,
  Target,
  Brain,
  Zap,
  Award,
  TrendingUp,
  Layers,
  Lock,
  Unlock,
  Eye,
  BookMarked,
  Timer,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Check,
  X,
  RotateCcw,
  List,
  GraduationCap,
  TestTube,
  BrainCircuit,
  Circle,
  Database,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"
import { use } from "react"
import React from "react"

interface Concept {
  _id: string
  title: string
  description: string
  complexity: number
  estLearningTimeHours: number
  masteryScore: number
  status: 'not_started' | 'in_progress' | 'completed'
  mastered: boolean
  timeSpent: number
  attempts: number
  isUnlocked: boolean
}

interface Topic {
  id: number
  title: string
  description: string
  icon: string
  concepts: Concept[]
  overallMastery: number
  totalConcepts: number
  completedConcepts: number
  estimatedHours: number
}

interface CourseDashboard {
  course: {
    _id: string
    title: string
    description: string
    thumbnail: string
    level: string
    estimatedDuration: number
    topics: Topic[]
  }
  userProgress: {
    status: string
    overallProgress: number
    conceptsCompleted: number
    totalConcepts: number
    totalTimeSpent: number
    enrolledAt: string
    lastAccessedAt: string
  }
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [courseData, setCourseData] = useState<CourseDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    loadCourseDashboard()
  }, [resolvedParams.id])

  const loadCourseDashboard = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getCourseDashboard(resolvedParams.id)
      
      if (response.success) {
        setCourseData(response.data)
      } else {
        setError(response.message || 'Failed to load course')
      }
    } catch (err) {
      console.error('Error loading course dashboard:', err)
      setError('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  const enrollInCourse = async () => {
    try {
      setEnrolling(true)
      const response = await apiClient.enrollInCourseLearning(resolvedParams.id)
      
      if (response.success) {
        setShowEnrollmentDialog(false)
        await loadCourseDashboard() // Reload to get updated progress
      } else {
        setError(response.message || 'Failed to enroll in course')
      }
    } catch (err) {
      console.error('Error enrolling in course:', err)
      setError('Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  const startLearning = () => {
    if (!courseData) return
    
    // Find the first unlocked concept or start from the beginning
    let firstConcept = null
    for (const topic of courseData.course.topics) {
      for (const concept of topic.concepts) {
        if (concept.isUnlocked || concept.status === 'not_started') {
          firstConcept = concept
          break
        }
      }
      if (firstConcept) break
    }
    
    if (firstConcept) {
      router.push(`/courses/${resolvedParams.id}/concepts/${firstConcept._id}`)
    }
  }

  const takeTest = () => {
    // Open quiz platform with course test questions
    router.push(`/quiz-platform?courseId=${resolvedParams.id}&testType=course_test`)
  }

  const takeMockTest = () => {
    // Open quiz platform with course mock test questions
    router.push(`/quiz-platform?courseId=${resolvedParams.id}&testType=mock_test`)
  }

  const getMasteryColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getMasteryLabel = (score: number) => {
    if (score >= 80) return "Mastered"
    if (score >= 60) return "Good"
    if (score > 0) return "In Progress"
    return "Not Started"
  }

  const getMasteryIcon = (score: number) => {
    if (score >= 80) return <Trophy className="w-4 h-4 text-green-600" />
    if (score >= 60) return <CheckCircle className="w-4 h-4 text-yellow-600" />
    if (score > 0) return <Clock className="w-4 h-4 text-blue-600" />
    return <Circle className="w-4 h-4 text-gray-400" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case 'in_progress': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case 'completed': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'target': Target,
      'brain': Brain,
      'database': Database,
      'layers': Layers,
      'code': Code,
      'book': BookOpen,
      'trophy': Trophy,
      'zap': Zap,
      'trending': TrendingUp,
      'list': List,
      'graduation': GraduationCap,
      'test': TestTube,
      'circuit': BrainCircuit,
    }
    return iconMap[iconName.toLowerCase()] || BookOpen
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Course</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={() => router.push('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  const { course, userProgress } = courseData
  const isEnrolled = userProgress.status !== 'not_enrolled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/courses" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              ← Back to Courses
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {course.level}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {course.estimatedDuration} hours
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {course.topics.length} topics
                </Badge>
                <Badge className={`${getStatusColor(userProgress.status)}`}>
                  {userProgress.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{userProgress.overallProgress}%</span>
                    </div>
                    <Progress value={userProgress.overallProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Concepts Completed</div>
                      <div className="font-semibold">{userProgress.conceptsCompleted}/{userProgress.totalConcepts}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
                      <div className="font-semibold">{Math.round(userProgress.totalTimeSpent / 60)}h</div>
                    </div>
                  </div>
                  
                  {!isEnrolled ? (
                    <Button 
                      onClick={() => setShowEnrollmentDialog(true)}
                      className="w-full"
                      size="lg"
                    >
                      Enroll Now
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        onClick={startLearning}
                        className="w-full"
                        size="lg"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Course Actions - 4 Options */}
        {isEnrolled && (
          <div className="mb-8">
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Course Actions</CardTitle>
                <CardDescription>Choose how you want to proceed with this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setShowTopics(!showTopics)}
                  >
                    <List className="w-8 h-8" />
                    <span>Show Topics</span>
                  </Button>
                  
                  <Button
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push(`/courses/${resolvedParams.id}/learn`)}
                  >
                    <GraduationCap className="w-8 h-8" />
                    <span>Continue Learning</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/learning-paths')}
                  >
                    <Target className="w-8 h-8" />
                    <span>Learning Path</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/mock-tests')}
                  >
                    <BrainCircuit className="w-8 h-8" />
                    <span>Mock Test</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Course Topics (Hidden by default, shown when "Show Topics" is clicked) */}
        {showTopics && isEnrolled && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Course Topics
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTopics(false)}
              >
                Hide Topics
              </Button>
            </div>
            
            {course.topics.map((topic, index) => (
              <Card key={topic.id} className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      {React.createElement(getIconComponent(topic.icon), {
                        className: "w-6 h-6 text-blue-600 dark:text-blue-400"
                      })}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {topic.completedConcepts}/{topic.totalConcepts} completed
                      </div>
                      <div className="font-semibold">
                        {topic.overallMastery.toFixed(1)}% mastery
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {topic.concepts.map((concept) => (
                      <div 
                        key={concept._id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {concept.isUnlocked ? (
                              <Unlock className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{concept.title}</h4>
                              {getMasteryIcon(concept.masteryScore)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {concept.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Complexity: {concept.complexity}/5</span>
                              <span>Time: {concept.estLearningTimeHours}h</span>
                              <span>Attempts: {concept.attempts}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-semibold ${getMasteryColor(concept.masteryScore)}`}>
                              {concept.masteryScore}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getMasteryLabel(concept.masteryScore)}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => router.push(`/courses/${resolvedParams.id}/concepts/${concept._id}`)}
                            disabled={!concept.isUnlocked}
                          >
                            {concept.mastered ? 'Review' : 'Start Learning'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
            <DialogDescription>
              Start your learning journey with this comprehensive course. You'll get access to all concepts, quizzes, and progress tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="text-sm space-y-1">
                <li>• Access to {course.topics.length} topics</li>
                <li>• {course.topics.reduce((sum, t) => sum + t.concepts.length, 0)} concepts to master</li>
                <li>• Interactive quizzes and assessments</li>
                <li>• Progress tracking and achievements</li>
                <li>• Certificate upon completion</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowEnrollmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={enrollInCourse} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

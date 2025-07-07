"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
  Lock,
  Unlock,
  BookOpen,
  Video,
  FileText,
  TestTube,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Target,
  Brain,
  Zap,
  Award,
  TrendingUp,
  Layers,
  Eye,
  BookMarked,
  Timer,
  BarChart3,
  X,
  RotateCcw,
  List,
  GraduationCap,
  TestTube as TestTubeIcon,
  BrainCircuit,
  ChevronRight,
  ChevronDown,
  Circle,
  Database,
  ChevronUp,
  ExternalLink,
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
  prerequisites?: string[]
  content?: {
    description: string
    videoUrl?: string
    articleUrl?: string
  }
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

interface CourseLearning {
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
  sequentialConcepts: Concept[]
}

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [courseData, setCourseData] = useState<CourseLearning | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
  const [showConceptDetails, setShowConceptDetails] = useState(false)
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [conceptProgress, setConceptProgress] = useState<{
    descriptionRead: boolean
    videoWatched: boolean
    quizPassed: boolean
    attempts: number
  }>({
    descriptionRead: false,
    videoWatched: false,
    quizPassed: false,
    attempts: 0
  })
  
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    loadCourseLearning()
  }, [resolvedParams.id])

  const loadCourseLearning = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getCourseLearning(resolvedParams.id)
      
      if (response.success) {
        setCourseData(response.data)
        // Find the first unlocked concept or start from beginning
        const firstUnlockedIndex = response.data.sequentialConcepts.findIndex(
          concept => concept.isUnlocked || concept.status === 'not_started'
        )
        if (firstUnlockedIndex !== -1) {
          setCurrentConceptIndex(firstUnlockedIndex)
        }
      } else {
        setError(response.message || 'Failed to load course learning')
      }
    } catch (err) {
      console.error('Error loading course learning:', err)
      setError('Failed to load course learning data')
    } finally {
      setLoading(false)
    }
  }

  const markDescriptionRead = async () => {
    if (!courseData) return
    
    try {
      const concept: Concept = courseData.sequentialConcepts[currentConceptIndex]
      const response = await apiClient.updateConceptProgress(concept._id, 'mark_description_read', {
        courseId: resolvedParams.id
      })
      
      if (response.success) {
        setConceptProgress(prev => ({ ...prev, descriptionRead: true }))
        await loadCourseLearning() // Reload to get updated progress
      }
    } catch (err) {
      console.error('Error marking description as read:', err)
    }
  }

  const markVideoWatched = async () => {
    if (!courseData) return
    
    try {
      const concept: Concept = courseData.sequentialConcepts[currentConceptIndex]
      const response = await apiClient.updateConceptProgress(concept._id, 'mark_video_watched', {
        courseId: resolvedParams.id,
        watchTime: 100 // This should be tracked from video player
      })
      
      if (response.success) {
        setConceptProgress(prev => ({ ...prev, videoWatched: true }))
        await loadCourseLearning() // Reload to get updated progress
      }
    } catch (err) {
      console.error('Error marking video as watched:', err)
    }
  }

  const startQuiz = () => {
    if (!courseData) return
    
    const concept: Concept = courseData.sequentialConcepts[currentConceptIndex]
    router.push(`/quiz-platform?conceptId=${concept._id}&courseId=${resolvedParams.id}&testType=concept_quiz`)
  }

  const nextConcept = () => {
    if (courseData && currentConceptIndex < courseData.sequentialConcepts.length - 1) {
      setCurrentConceptIndex(prev => prev + 1)
      setConceptProgress({
        descriptionRead: false,
        videoWatched: false,
        quizPassed: false,
        attempts: 0
      })
      setExpandedDescription(false)
    }
  }

  const previousConcept = () => {
    if (currentConceptIndex > 0) {
      setCurrentConceptIndex(prev => prev - 1)
      setConceptProgress(prev => ({
        descriptionRead: false,
        videoWatched: false,
        quizPassed: false,
        attempts: 0
      }))
      setExpandedDescription(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'target': Target,
      'brain': Brain,
      'database': Database,
      'layers': Layers,
      'code': BookOpen,
      'book': BookOpen,
      'trophy': Trophy,
      'zap': Zap,
      'trending': TrendingUp,
      'list': List,
      'graduation': GraduationCap,
      'test': TestTubeIcon,
      'circuit': BrainCircuit,
    }
    return iconMap[iconName.toLowerCase()] || BookOpen
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case 'in_progress': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case 'not_started': return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
          <Button onClick={() => router.push(`/courses/${resolvedParams.id}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  const { course, userProgress, sequentialConcepts } = courseData
  const currentConcept = sequentialConcepts[currentConceptIndex]
  const progress = ((currentConceptIndex + 1) / sequentialConcepts.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/courses/${resolvedParams.id}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              ← Back to Course
            </Link>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title} - Learning Path
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Concept {currentConceptIndex + 1} of {sequentialConcepts.length}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Progress</div>
              <div className="text-2xl font-bold text-blue-600">{userProgress.overallProgress}%</div>
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Concept List */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Learning Sequence</CardTitle>
                <CardDescription>Follow the concepts in order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sequentialConcepts.map((concept, index) => (
                    <div
                      key={concept._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        index === currentConceptIndex
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : concept.isUnlocked
                            ? "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60"
                      }`}
                      onClick={() => {
                        if (concept.isUnlocked) {
                          setCurrentConceptIndex(index)
                          setConceptProgress({
                            descriptionRead: false,
                            videoWatched: false,
                            quizPassed: false,
                            attempts: 0
                          })
                          setExpandedDescription(false)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {concept.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : concept.isUnlocked ? (
                            <Unlock className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-sm">{concept.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {concept.status.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(concept.status)}>
                          {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Concept */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentConcept.title}</CardTitle>
                    <CardDescription>{currentConcept.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(currentConcept.status)}>
                    {currentConcept.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Concept Description - Expandable */}
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          conceptProgress.descriptionRead 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {conceptProgress.descriptionRead ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Concept Description</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Understand the concept fundamentals
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedDescription(!expandedDescription)}
                        >
                          {expandedDescription ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant={conceptProgress.descriptionRead ? "outline" : "default"}
                          size="sm"
                          onClick={markDescriptionRead}
                          disabled={conceptProgress.descriptionRead}
                        >
                          {conceptProgress.descriptionRead ? "Completed" : "Mark as Read"}
                        </Button>
                      </div>
                    </div>
                    
                    {expandedDescription && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {currentConcept.content?.description || currentConcept.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Learning */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          conceptProgress.videoWatched 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {conceptProgress.videoWatched ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Video Learning</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Visual learning and examples
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {currentConcept.content?.videoUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(currentConcept.content?.videoUrl, '_blank')}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Watch
                          </Button>
                        )}
                        
                        <Button
                          variant={conceptProgress.videoWatched ? "outline" : "default"}
                          size="sm"
                          onClick={markVideoWatched}
                          disabled={conceptProgress.videoWatched}
                        >
                          {conceptProgress.videoWatched ? "Completed" : "Mark as Watched"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quiz Section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          conceptProgress.quizPassed 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {conceptProgress.quizPassed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <TestTubeIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Knowledge Check</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Test your understanding (Mastery required: 75%)
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={conceptProgress.quizPassed ? "outline" : "default"}
                        size="sm"
                        onClick={startQuiz}
                        disabled={!conceptProgress.descriptionRead || !conceptProgress.videoWatched}
                      >
                        {conceptProgress.quizPassed ? "Completed" : "Start Quiz"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <Separator />
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={previousConcept}
                    disabled={currentConceptIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={nextConcept}
                    disabled={currentConceptIndex === sequentialConcepts.length - 1 || !conceptProgress.quizPassed}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
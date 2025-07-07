"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Video,
  Code,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"

interface ConceptContent {
  _id: string
  title: string
  description: string
  contentBlocks: Array<{
    type: string
    data: string
  }>
  articleContent: {
    intro: string
    levels: Array<{
      level: string
      sections: Array<{
        heading: string
        content: string
        codeExamples: Array<{
          language: string
          code: string
          explanation: string
        }>
        complexityAnalysis: {
          timeComplexity: string
          spaceComplexity: string
          explanation: string
        }
        notes: string[]
        imageUrl: string
      }>
    }>
  }
  quiz: Array<{
    questionText: string
    options: string[]
    correctAnswerIndex: number
    explanation: string
  }>
  Test_Questions: Array<{
    id: number
    topic: string
    difficulty: string
    question: string
    options: string[]
    correct: number
    explanation: string
    tags: string[]
  }>
  complexity: number
  estLearningTimeHours: number
  prerequisites: string[]
  relatedConcepts: string[]
}

interface ConceptProgress {
  masteryScore: number
  status: 'not_started' | 'in_progress' | 'completed'
  mastered: boolean
  timeSpent: number
  attempts: number
  lastUpdated: string
}

interface Navigation {
  nextConcept: string | null
  prevConcept: string | null
  currentIndex: number
  totalConcepts: number
}

interface ConceptLearningData {
  concept: ConceptContent
  progress: ConceptProgress
  navigation: Navigation
}

export default function ConceptLearningPage({ 
  params 
}: { 
  params: { id: string; conceptId: string } 
}) {
  const [conceptData, setConceptData] = useState<ConceptLearningData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("content")
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [videoWatched, setVideoWatched] = useState(false)
  const [articleRead, setArticleRead] = useState(false)
  
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    loadConceptData()
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [params.conceptId])

  useEffect(() => {
    // Update progress when user interacts with content
    if (videoWatched || articleRead) {
      updateProgress()
    }
  }, [videoWatched, articleRead])

  const loadConceptData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getConceptLearningPage(params.id, params.conceptId)
      
      if (response.success) {
        setConceptData(response.data)
        // Initialize quiz answers array
        const questions = response.data.concept.quiz || response.data.concept.Test_Questions || []
        setQuizAnswers(new Array(questions.length).fill(-1))
      } else {
        setError(response.message || 'Failed to load concept')
      }
    } catch (err) {
      console.error('Error loading concept:', err)
      setError('Failed to load concept data')
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async () => {
    try {
      const actions = []
      if (videoWatched) actions.push('video_watched')
      if (articleRead) actions.push('article_read')
      
      for (const action of actions) {
        await apiClient.updateConceptProgress(params.conceptId, action, {
          timeSpent: Math.ceil(timeSpent / 60) // Convert to minutes
        })
      }
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = answerIndex
    setQuizAnswers(newAnswers)
  }

  const submitQuiz = async () => {
    try {
      const questions = conceptData?.concept.quiz || conceptData?.concept.Test_Questions || []
      const validAnswers = quizAnswers.filter(answer => answer !== -1)
      
      if (validAnswers.length !== questions.length) {
        setError('Please answer all questions before submitting')
        return
      }

      const response = await apiClient.submitQuizResults(
        params.conceptId, 
        quizAnswers, 
        Math.ceil(timeSpent / 60)
      )

      if (response.success) {
        setQuizScore(response.data.score)
        setQuizSubmitted(true)
        await loadConceptData() // Reload to get updated progress
      } else {
        setError(response.message || 'Failed to submit quiz')
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError('Failed to submit quiz')
    }
  }

  const resetQuiz = () => {
    setQuizAnswers(new Array((conceptData?.concept.quiz || conceptData?.concept.Test_Questions || []).length).fill(-1))
    setQuizSubmitted(false)
    setQuizScore(null)
  }

  const navigateToConcept = (conceptId: string | null) => {
    if (conceptId) {
      router.push(`/courses/${params.id}/concepts/${conceptId}`)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
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

  if (error || !conceptData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Concept</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={() => router.push(`/courses/${params.id}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  const { concept, progress, navigation } = conceptData
  const questions = concept.quiz || concept.Test_Questions || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href={`/courses/${params.id}`} 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {concept.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {concept.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Complexity: {concept.complexity}/5
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {concept.estLearningTimeHours}h estimated
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {questions.length} questions
                </Badge>
                <Badge className={`${getMasteryColor(progress.masteryScore)} bg-opacity-10`}>
                  {progress.masteryScore}% Mastery
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
                      <span>Mastery Score</span>
                      <span>{progress.masteryScore}%</span>
                    </div>
                    <Progress value={progress.masteryScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Status</div>
                      <div className="font-semibold capitalize">{progress.status}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Attempts</div>
                      <div className="font-semibold">{progress.attempts}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
                      <div className="font-semibold">{Math.round(progress.timeSpent)}m</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Position</div>
                      <div className="font-semibold">{navigation.currentIndex}/{navigation.totalConcepts}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {navigation.prevConcept && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateToConcept(navigation.prevConcept)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}
                    {navigation.nextConcept && (
                      <Button 
                        size="sm"
                        onClick={() => navigateToConcept(navigation.nextConcept)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Learning Content</TabsTrigger>
            <TabsTrigger value="quiz">Quiz & Assessment</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Video Content */}
            {concept.contentBlocks?.some(block => block.type === 'video') && (
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video Tutorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {concept.contentBlocks.find(block => block.type === 'video')?.data ? (
                      <iframe
                        src={concept.contentBlocks.find(block => block.type === 'video')?.data}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        onLoad={() => setVideoWatched(true)}
                      />
                    ) : (
                      <div className="text-center">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Video content not available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Article Content */}
            {concept.articleContent && (
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  {concept.articleContent.intro && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                      <p className="text-gray-700 dark:text-gray-300">{concept.articleContent.intro}</p>
                    </div>
                  )}
                  
                  {concept.articleContent.levels?.map((level, levelIndex) => (
                    <div key={levelIndex} className="mb-8">
                      {level.level && (
                        <h3 className="text-xl font-semibold mb-4">{level.level}</h3>
                      )}
                      
                      {level.sections?.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-6">
                          {section.heading && (
                            <h4 className="text-lg font-medium mb-3">{section.heading}</h4>
                          )}
                          
                          {section.content && (
                            <div 
                              className="text-gray-700 dark:text-gray-300 mb-4"
                              onMouseEnter={() => setArticleRead(true)}
                            >
                              {section.content}
                            </div>
                          )}
                          
                          {section.codeExamples?.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="mb-4">
                              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {example.language}
                                  </span>
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                                <pre className="text-sm overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                              {example.explanation && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {example.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                          
                          {section.complexityAnalysis && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                              <h5 className="font-medium mb-2">Complexity Analysis</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                                  <span className="font-medium ml-2">{section.complexityAnalysis.timeComplexity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Space:</span>
                                  <span className="font-medium ml-2">{section.complexityAnalysis.spaceComplexity}</span>
                                </div>
                              </div>
                              {section.complexityAnalysis.explanation && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {section.complexityAnalysis.explanation}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {section.notes?.length > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                              <h5 className="font-medium mb-2">Important Notes</h5>
                              <ul className="text-sm space-y-1">
                                {section.notes.map((note, noteIndex) => (
                                  <li key={noteIndex} className="text-gray-700 dark:text-gray-300">
                                    • {note}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            {!showQuiz ? (
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Concept Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quiz Instructions:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• {questions.length} questions to test your understanding</li>
                      <li>• Each question has only one correct answer</li>
                      <li>• You need 80% or higher to master this concept</li>
                      <li>• You can retake the quiz if needed</li>
                      <li>• Your progress will be saved automatically</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">80%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Passing Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{progress.attempts}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Previous Attempts</div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setShowQuiz(true)} className="w-full" size="lg">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {quizSubmitted ? 'Quiz Results' : 'Concept Assessment'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {quizSubmitted && quizScore !== null ? (
                    <div className="text-center space-y-4">
                      <div className={`text-6xl font-bold ${getMasteryColor(quizScore)}`}>
                        {quizScore}%
                      </div>
                      <div className="text-xl text-gray-600 dark:text-gray-300">
                        {quizScore >= 80 ? 'Congratulations! You mastered this concept!' : 'Keep practicing to master this concept.'}
                      </div>
                      <Badge className={`${quizScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                        {quizScore >= 80 ? 'Mastered!' : 'In Progress'}
                      </Badge>
                      
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={resetQuiz}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retake Quiz
                        </Button>
                        {navigation.nextConcept && (
                          <Button onClick={() => navigateToConcept(navigation.nextConcept)}>
                            Next Concept
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <h4 className="font-semibold mb-4">
                            Question {questionIndex + 1}: {question.questionText || question.question}
                          </h4>
                          
                          <div className="space-y-3">
                            {(question.options || []).map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                  quizAnswers[questionIndex] === optionIndex
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  value={optionIndex}
                                  checked={quizAnswers[questionIndex] === optionIndex}
                                  onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                                  className="mr-3"
                                />
                                <span className="text-gray-700 dark:text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowQuiz(false)}>
                          Cancel
                        </Button>
                        <Button onClick={submitQuiz} className="flex-1">
                          Submit Quiz
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {concept.prerequisites?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Prerequisites</h4>
                    <div className="space-y-2">
                      {concept.prerequisites.map((prereq, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">{prereq}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {concept.relatedConcepts?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Related Concepts</h4>
                    <div className="space-y-2">
                      {concept.relatedConcepts.map((related, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Link className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            {related}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2">Learning Tips</h4>
                  <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Take notes while reading the content</li>
                    <li>• Practice with the code examples</li>
                    <li>• Review the complexity analysis</li>
                    <li>• Take the quiz to test your understanding</li>
                    <li>• Revisit this concept if you need a refresher</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

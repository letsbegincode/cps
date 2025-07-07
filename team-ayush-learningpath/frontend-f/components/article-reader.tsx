"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb, Play, Trophy, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { toast } from "sonner"

interface Article {
  id: number
  title: string
  readTime: string
  content: string
  read: boolean
}

interface ArticleReaderProps {
  articles: Article[]
}

export function ArticleReader({ articles }: ArticleReaderProps) {
  const [currentArticle, setCurrentArticle] = useState(articles[0])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedArticles, setCompletedArticles] = useState<Set<number>>(new Set())
  const [isCompleting, setIsCompleting] = useState(false)

  // Calculate progress
  const progress = (completedArticles.size / articles.length) * 100
  const isLastArticle = currentIndex === articles.length - 1
  const isCurrentCompleted = completedArticles.has(currentArticle.id)

  const markAsComplete = async () => {
    if (isCompleting) return
    
    setIsCompleting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Add to completed set
    setCompletedArticles(prev => new Set([...prev, currentArticle.id]))
    
    // Show success message
    toast.success("Section completed! 🎉", {
      description: `Great job completing "${currentArticle.title}"`,
      duration: 3000,
    })
    
    setIsCompleting(false)
    
    // Auto-advance to next section if not the last
    if (!isLastArticle) {
      setTimeout(() => {
        nextArticle()
      }, 1000)
    }
  }

  const nextArticle = () => {
    if (currentIndex < articles.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setCurrentArticle(articles[nextIndex])
    }
  }

  const prevArticle = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentArticle(articles[prevIndex])
    }
  }

  const goToArticle = (article: Article, index: number) => {
    setCurrentArticle(article)
    setCurrentIndex(index)
  }

  // Get next incomplete article
  const getNextIncompleteArticle = () => {
    const nextIncomplete = articles.findIndex((article, index) => 
      index > currentIndex && !completedArticles.has(article.id)
    )
    return nextIncomplete !== -1 ? nextIncomplete : currentIndex
  }

  const goToNextIncomplete = () => {
    const nextIndex = getNextIncompleteArticle()
    if (nextIndex !== currentIndex) {
      goToArticle(articles[nextIndex], nextIndex)
    }
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Enhanced Article Content */}
      <div className="lg:col-span-3">
        <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCurrentCompleted 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                      : "bg-gradient-to-r from-blue-500 to-purple-600"
                  }`}>
                    {isCurrentCompleted ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center space-x-2">
                      <span>{currentArticle.title}</span>
                      {isCurrentCompleted && (
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{currentArticle.readTime}</span>
                      </span>
                      {isCurrentCompleted && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={prevArticle} 
                  disabled={currentIndex === 0}
                  className="shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextArticle}
                  disabled={currentIndex === articles.length - 1}
                  className="shadow-sm"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <style jsx global>{`
                .prose {
                  color: #374151;
                }
                .dark .prose {
                  color: #d1d5db;
                }
                .prose h1 {
                  color: #1f2937;
                  font-size: 2.25rem;
                  font-weight: 800;
                  margin-top: 0;
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                }
                .dark .prose h1 {
                  color: #f9fafb;
                }
                .prose h2 {
                  color: #374151;
                  font-size: 1.875rem;
                  font-weight: 700;
                  margin-top: 2.5rem;
                  margin-bottom: 1rem;
                  padding-bottom: 0.5rem;
                  border-bottom: 2px solid #e5e7eb;
                }
                .dark .prose h2 {
                  color: #e5e7eb;
                  border-bottom-color: #4b5563;
                }
                .prose h3 {
                  color: #4b5563;
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-top: 2rem;
                  margin-bottom: 0.75rem;
                }
                .dark .prose h3 {
                  color: #d1d5db;
                }
                .prose p {
                  margin-top: 1.25rem;
                  margin-bottom: 1.25rem;
                  line-height: 1.75;
                }
                .prose ul {
                  margin-top: 1.25rem;
                  margin-bottom: 1.25rem;
                }
                .prose li {
                  margin-top: 0.5rem;
                  margin-bottom: 0.5rem;
                }
                .prose blockquote {
                  border-left: 4px solid #3b82f6;
                  padding-left: 1rem;
                  margin: 1.5rem 0;
                  font-style: italic;
                  background: #f8fafc;
                  padding: 1rem;
                  border-radius: 0.5rem;
                }
                .dark .prose blockquote {
                  background: #1f2937;
                  border-left-color: #60a5fa;
                }
                .prose code {
                  background: #f3f4f6;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.375rem;
                  font-size: 0.875rem;
                  color: #dc2626;
                }
                .dark .prose code {
                  background: #374151;
                  color: #f87171;
                }
                .prose pre {
                  background: #1f2937;
                  color: #f9fafb;
                  padding: 1.5rem;
                  border-radius: 0.75rem;
                  overflow-x: auto;
                  margin: 1.5rem 0;
                  border: 1px solid #374151;
                }
                .prose pre code {
                  background: transparent;
                  padding: 0;
                  color: inherit;
                }
                .prose table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1.5rem 0;
                }
                .prose th {
                  background: #f9fafb;
                  padding: 0.75rem;
                  text-align: left;
                  font-weight: 600;
                  border: 1px solid #e5e7eb;
                }
                .dark .prose th {
                  background: #374151;
                  border-color: #4b5563;
                }
                .prose td {
                  padding: 0.75rem;
                  border: 1px solid #e5e7eb;
                }
                .dark .prose td {
                  border-color: #4b5563;
                }
                .prose hr {
                  border: none;
                  border-top: 2px solid #e5e7eb;
                  margin: 2rem 0;
                }
                .dark .prose hr {
                  border-top-color: #4b5563;
                }
                .prose strong {
                  color: #1f2937;
                  font-weight: 700;
                }
                .dark .prose strong {
                  color: #f9fafb;
                }
                .prose a {
                  color: #3b82f6;
                  text-decoration: underline;
                  text-decoration-thickness: 2px;
                  text-underline-offset: 2px;
                }
                .prose a:hover {
                  color: #2563eb;
                }
              `}</style>
              <ReactMarkdown>{currentArticle.content}</ReactMarkdown>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Progress:</span> {completedArticles.size} of {articles.length} completed
                  </div>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!isCurrentCompleted ? (
                    <Button 
                      onClick={markAsComplete} 
                      disabled={isCompleting}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                    >
                      {isCompleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                      {!isLastArticle && (
                        <Button 
                          onClick={goToNextIncomplete}
                          variant="outline"
                          className="shadow-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Article List */}
      <div>
        <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Target className="w-5 h-5 text-purple-500" />
              <span>Learning Path</span>
            </CardTitle>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {completedArticles.size} of {articles.length} completed
              </div>
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {articles.map((article, index) => {
              const isCompleted = completedArticles.has(article.id)
              const isCurrent = currentArticle.id === article.id
              
              return (
                <div
                  key={article.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-md"
                      : isCompleted
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  }`}
                  onClick={() => goToArticle(article, index)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                      {isCurrent ? (
                        <Play className="w-4 h-4 text-white" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm mb-1 ${
                        isCurrent
                          ? "text-gray-900 dark:text-white"
                          : isCompleted
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {article.title}
                        {isCompleted && (
                          <Sparkles className="w-3 h-3 text-yellow-500 inline ml-1" />
                        )}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </span>
                        {isCompleted && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            <Trophy className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Enhanced Quick Tips Card */}
        <Card className="mt-6 dark:bg-gray-800/80 dark:border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>Learning Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Take notes while reading</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Practice with code examples</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Test your knowledge with quizzes</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Apply concepts to real projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Celebration Card */}
        {progress === 100 && (
          <Card className="mt-6 dark:bg-gray-800/80 dark:border-gray-700 shadow-lg border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You've completed all sections! You're ready to move to the next concept.
              </p>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

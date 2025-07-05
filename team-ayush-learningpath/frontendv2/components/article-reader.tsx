"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, FileText, ArrowLeft, ArrowRight } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Article {
  id: number
  title: string
  readTime: string
  content: string
  read: boolean
}

interface ArticleReaderProps {
  articles: Article[]
  onArticleComplete?: (articleId: number) => void
}

export function ArticleReader({ articles, onArticleComplete }: ArticleReaderProps) {
  const [currentArticle, setCurrentArticle] = useState(articles[0])
  const [readArticles, setReadArticles] = useState<Set<number>>(new Set())

  const markAsRead = (articleId: number) => {
    setReadArticles((prev) => new Set([...prev, articleId]))
    if (onArticleComplete) {
      onArticleComplete(articleId)
    }
  }

  const goToNextArticle = () => {
    const currentIndex = articles.findIndex((article) => article.id === currentArticle.id)
    if (currentIndex < articles.length - 1) {
      setCurrentArticle(articles[currentIndex + 1])
    }
  }

  const goToPreviousArticle = () => {
    const currentIndex = articles.findIndex((article) => article.id === currentArticle.id)
    if (currentIndex > 0) {
      setCurrentArticle(articles[currentIndex - 1])
    }
  }

  const isCurrentArticleRead = readArticles.has(currentArticle.id) || currentArticle.read

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Article Content */}
      <div className="lg:col-span-3">
        <Card className="dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white mb-2">{currentArticle.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentArticle.readTime}</span>
                  </span>
                  {isCurrentArticleRead && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Read
                    </Badge>
                  )}
                </div>
              </div>
              {!isCurrentArticleRead && (
                <Button variant="outline" size="sm" onClick={() => markAsRead(currentArticle.id)}>
                  Mark as Read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown>{currentArticle.content}</ReactMarkdown>
              </div>
            </ScrollArea>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={goToPreviousArticle}
                disabled={articles.findIndex((a) => a.id === currentArticle.id) === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                {articles.findIndex((a) => a.id === currentArticle.id) + 1} of {articles.length}
              </span>

              <Button
                variant="outline"
                onClick={goToNextArticle}
                disabled={articles.findIndex((a) => a.id === currentArticle.id) === articles.length - 1}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article List */}
      <div>
        <Card className="dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Articles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentArticle.id === article.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setCurrentArticle(article)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {index + 1}. {article.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <span>{article.readTime}</span>
                      {(readArticles.has(article.id) || article.read) && (
                        <Badge variant="outline" className="text-xs">
                          Read
                        </Badge>
                      )}
                    </div>
                  </div>

                  {(readArticles.has(article.id) || article.read) && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, FileText, Video, Code, BookOpen, ArrowLeft, Trophy, Target, Zap, Brain, Clock, Star, ExternalLink, ChevronRight, ChevronDown, Shield, BarChart3 } from "lucide-react"
import Link from "next/link"
import { VideoPlayer } from "@/components/video-player"
import { ArticleReader } from "@/components/article-reader"

interface Concept {
  _id: string
  title: string
  Concept: string
  Level: string
  Category: string
  Concept_Type: string
  Est_Learning_Time_Hours: number
  Is_Fundamental: boolean
  Learning_Resources: string
  Related_Concepts: string[]
  prerequisites: string[]
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
  articleContent: {
    intro: string
    levels: Array<{
      level: string
      sections: Array<{
        heading: string
        content: string
        codeExamples?: Array<{
          language: string
          code: string
          explanation: string
        }>
        complexityAnalysis?: {
          timeComplexity: string
          spaceComplexity: string
          explanation: string
        }
        notes?: string[]
        imageUrl?: string
      }>
    }>
  }
}

export default function ConceptPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("content")
  const [concept, setConcept] = useState<Concept | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const courseId = params.id as string
  const conceptId = params.conceptId as string

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/concepts/${conceptId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch concept')
        }
        const data = await response.json()
        setConcept(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept')
      } finally {
        setLoading(false)
      }
    }

    if (conceptId) {
      fetchConcept()
    }
  }, [conceptId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !concept) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="p-6">
          <Card className="dark:bg-gray-800/80 dark:border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Concept Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {error || "The concept you're looking for doesn't exist."}
              </p>
              <Button asChild>
                <Link href="/learning-paths">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Learning Paths
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Convert MongoDB concept to the format expected by existing components
  const convertToArticleFormat = () => {
    if (!concept.articleContent) return []
    
    const articles = []
    
    // Add introduction as first article
    if (concept.articleContent.intro) {
      articles.push({
        id: 1,
        title: "Introduction",
        readTime: "5 min read",
        content: `# ${concept.title}

${concept.articleContent.intro}

---

## What You'll Learn

- **Core Concepts**: Understanding the fundamental principles
- **Practical Examples**: Real-world code examples
- **Best Practices**: Industry-standard approaches
- **Common Pitfalls**: What to avoid and why

---

## Prerequisites

Before diving into ${concept.title}, make sure you have:
- Basic programming knowledge
- Understanding of fundamental concepts
- A development environment ready

---

## Learning Path

This guide follows a structured approach:
1. **Basic Understanding** - Core concepts and definitions
2. **Implementation** - How to use it in practice
3. **Advanced Topics** - Complex scenarios and optimizations
4. **Real-world Applications** - Where and how it's used

---

`,
        read: false,
      })
    }
    
    // Add content from each level
    concept.articleContent.levels.forEach((level, levelIndex) => {
      level.sections.forEach((section, sectionIndex) => {
        let content = `# ${section.heading}

> **Level**: ${level.level} | **Estimated Time**: 10-15 minutes

${section.content}

---

## Key Points

- **Definition**: Clear understanding of the concept
- **Usage**: When and how to apply it
- **Benefits**: Why it's important
- **Considerations**: What to keep in mind

---

`
        
        // Add code examples with better formatting
        if (section.codeExamples && section.codeExamples.length > 0) {
          content += `## Code Examples

Here are practical examples to help you understand the concepts:

`
          section.codeExamples.forEach((example, idx) => {
            const language = example.language || 'text'
            const code = example.code || ''
            const explanation = example.explanation || ''
            
            content += `### Example ${idx + 1}: ${language}

**Description**: ${explanation}

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Output**:
\`\`\`
// Sample output will appear here
\`\`\`

**Explanation**:
- This example demonstrates ${explanation.toLowerCase()}
- Key points to remember
- Common use cases

---

`
          })
        }
        
        // Add complexity analysis with better formatting
        if (section.complexityAnalysis) {
          const timeComplexity = section.complexityAnalysis.timeComplexity || 'N/A'
          const spaceComplexity = section.complexityAnalysis.spaceComplexity || 'N/A'
          const explanation = section.complexityAnalysis.explanation || ''
          
          content += `## Performance Analysis

| Aspect | Complexity | Description |
|--------|------------|-------------|
| **Time Complexity** | ${timeComplexity} | ${explanation} |
| **Space Complexity** | ${spaceComplexity} | Memory usage considerations |

### Performance Tips

- **Optimization**: How to improve performance
- **Trade-offs**: When to use vs. when to avoid
- **Best Practices**: Recommended approaches

---

`
        }
        
        // Add notes with better formatting
        if (section.notes && section.notes.length > 0) {
          content += `## Important Notes

> ⚠️ **Important**: Pay attention to these key points

`
          section.notes.forEach((note, noteIndex) => {
            if (note) {
              content += `### Note ${noteIndex + 1}

${note}

`
            }
          })
          
          content += `---

`
        }
        
        // Add practice section
        content += `## Practice Exercises

### Exercise 1: Basic Implementation
Try implementing the basic concept we just learned.

### Exercise 2: Advanced Usage
Apply the concept to a more complex scenario.

### Exercise 3: Real-world Application
Think of a real-world problem where this concept would be useful.

---

## Summary

**What we covered:**
- ✅ ${section.heading}
- ✅ Key concepts and principles
- ✅ Practical examples
- ✅ Performance considerations
- ✅ Best practices

**Next steps:**
- Practice with the exercises above
- Try implementing in your own projects
- Explore related concepts

---

## Related Topics

- [Previous Topic](#)
- [Next Topic](#)
- [Advanced Concepts](#)

---

`
        
        articles.push({
          id: articles.length + 1,
          title: `${level.level}: ${section.heading}`,
          readTime: "12 min read",
          content,
          read: false,
        })
      })
    })
    
    // Add a comprehensive summary article
    if (articles.length > 1) {
      articles.push({
        id: articles.length + 1,
        title: "Complete Guide Summary",
        readTime: "8 min read",
        content: `# Complete Guide: ${concept.title}

## 🎯 What You've Learned

Congratulations! You've completed the comprehensive guide on **${concept.title}**. Here's a summary of everything we covered:

### Core Concepts
- **Definition**: ${concept.title} is ${concept.Concept_Type.toLowerCase()}
- **Category**: ${concept.Category}
- **Level**: ${concept.Level}
- **Learning Time**: ${concept.Est_Learning_Time_Hours} hours

### Key Takeaways

1. **Fundamental Understanding**: You now understand the basic principles
2. **Practical Application**: You can implement the concepts in real code
3. **Performance Awareness**: You know about time and space complexity
4. **Best Practices**: You understand industry-standard approaches

---

## 📚 Knowledge Check

### Quick Quiz
1. What is the main purpose of ${concept.title}?
2. When would you use this concept?
3. What are the performance considerations?

### Self-Assessment
- [ ] I can explain the concept to someone else
- [ ] I can write code using this concept
- [ ] I understand the performance implications
- [ ] I can identify when to use this approach

---

## 🚀 Next Steps

### Immediate Actions
1. **Practice**: Try the exercises from each section
2. **Implement**: Use this concept in a small project
3. **Explore**: Look into related concepts and advanced topics

### Long-term Learning
- **Projects**: Build something using this concept
- **Research**: Read about advanced applications
- **Community**: Share your knowledge with others

---

## 📖 Additional Resources

### Documentation
- [Official Documentation](#)
- [Community Guides](#)
- [Video Tutorials](#)

### Practice Platforms
- [Coding Challenges](#)
- [Interactive Tutorials](#)
- [Project Ideas](#)

---

## 🎉 Congratulations!

You've successfully completed the **${concept.title}** learning path. You now have a solid foundation to build upon.

**Remember**: Learning is a continuous journey. Keep practicing, building, and exploring!

---

*This guide is part of the comprehensive learning path designed to help you master programming concepts effectively.*

`,
        read: false,
      })
    }
    
    return articles
  }

  const articles = convertToArticleFormat()

  const handleTakeQuiz = () => {
    // Open quiz in a new window with concept ID, same as learning paths
    const quizUrl = `/quiz?conceptId=${conceptId}`
    const quizWindow = window.open(quizUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    if (quizWindow) {
      quizWindow.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/learning-paths" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Learning Paths
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-300">{concept.Category}</span>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-900 dark:text-white">{concept.title}</span>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
            <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{concept.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{concept.Concept_Type} • {concept.Level}</p>
                  </div>
                </div>
                
                {concept.articleContent?.intro && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
                    {concept.articleContent.intro.substring(0, 200)}...
                  </p>
                )}
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-right">
                  <Badge variant="outline" className="text-sm mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {concept.Est_Learning_Time_Hours}h
                  </Badge>
                  {concept.Is_Fundamental && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-sm">
                      <Star className="w-3 h-3 mr-1" />
                      Fundamental
              </Badge>
                  )}
                </div>
                <Button variant="outline" asChild className="shadow-sm">
                  <Link href="/learning-paths">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Learning Paths
                </Link>
              </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Overview */}
        <Card className="mb-8 dark:bg-gray-800/80 dark:border-gray-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Content Sections</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {articles.length}
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Ready to start learning</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Code className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Code Examples</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {concept.articleContent?.levels.reduce((acc, level) => 
                    acc + level.sections.reduce((secAcc, section) => 
                      secAcc + (section.codeExamples?.length || 0), 0), 0) || 0}
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Interactive examples</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Quiz Questions</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {concept.Test_Questions?.length || 0}
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Test your knowledge</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
            <TabsTrigger value="content" className="flex items-center space-x-3 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <FileText className="w-5 h-5" />
              <span>Learning Content ({articles.length} sections)</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center space-x-3 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <BookOpen className="w-5 h-5" />
              <span>Quiz ({concept.Test_Questions?.length || 0} questions)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <ArticleReader articles={articles} />
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            {concept.Test_Questions && concept.Test_Questions.length > 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Test Your Knowledge?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Take the quiz to assess your understanding of <strong>{concept.title}</strong>. 
                    The quiz contains {concept.Test_Questions.length} questions and will open in a new window.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button 
                      onClick={handleTakeQuiz}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg px-8 py-3"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Start Quiz
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setActiveTab("content")}
                      className="px-8 py-3"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Quiz Features</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Timed Questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Anti-cheating</span>
                        </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Detailed Analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No Quiz Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-md">
                    This concept doesn't have any quiz questions yet. Focus on the learning content and practice with the exercises provided.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" asChild>
                      <Link href="/learning-paths">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Learning Paths
                      </Link>
                    </Button>
                    <Button onClick={() => setActiveTab("content")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                    </div>
                  </CardContent>
                </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Brain,
  Target,
  Clock, 
  Award, 
  Play, 
  Lock, 
  Unlock, 
  AlertTriangle,
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Users, 
  RefreshCw, 
  BookOpen,
  TrendingUp,
  BarChart3,
  Zap,
  Code,
  Database,
  Search,
  Layers,
  Cpu,
  Home,
  Settings,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Network,
  Trophy,
  Server,
  Cloud,
  Loader2,
  TreePine,
  ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'
import { apiService, Concept, RecommendationResponse } from "@/lib/api"
import { useAuth } from "../context/AuthContext"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface Topic {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  masteryLevel: number
  isCompleted: boolean
  isPrerequisite: boolean
  estimatedHours: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  icon: any
  iconName?: string
  locked?: boolean
}

interface Course {
  id: string
  title: string
  description: string
  totalTopics: number
  completedTopics: number
  masteryScore: number
  icon: any
  color: string
}

// Mock courses for now - these could be fetched from API later
const availableCourses: Course[] = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Master DSA through proven community learning patterns",
    totalTopics: 12,
    completedTopics: 8,
    masteryScore: 7.2,
    icon: Code,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "web-dev",
    title: "Full Stack Web Development",
    description: "Complete web development from frontend to backend",
    totalTopics: 20,
    completedTopics: 12,
    masteryScore: 6.8,
    icon: Globe,
    color: "from-green-500 to-teal-600",
  },
  {
    id: "system-design",
    title: "System Design",
    description: "Learn to design scalable distributed systems",
    totalTopics: 12,
    completedTopics: 3,
    masteryScore: 4.5,
    icon: Database,
    color: "from-orange-500 to-red-600",
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description: "From basics to advanced ML algorithms",
    totalTopics: 18,
    completedTopics: 0,
    masteryScore: 0,
    icon: Brain,
    color: "from-purple-500 to-pink-600",
  },
]

export default function CustomPathGenerator() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Add debugging to see what's happening
  console.log('Auth state:', { user, isAuthenticated, isLoading });
  
  const [selectedGoal, setSelectedGoal] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [pathType, setPathType] = useState<"course" | "topic">("course")
  const [generatedPath, setGeneratedPath] = useState<Topic[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [revisionThreshold] = useState(7)
  const [alternativeRoutes, setAlternativeRoutes] = useState<Topic[][]>([])
  const [selectedRoute, setSelectedRoute] = useState<number>(0)
  const [searchResults, setSearchResults] = useState<Concept[]>([])
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [userProgress, setUserProgress] = useState<Record<string, number>>({})
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [showTopicModal, setShowTopicModal] = useState(false)

  // Fetch user progress on component mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;
      // Debug log to confirm user and user._id
      console.log('DEBUG fetchUserProgress: user:', user, 'user._id:', user._id);
      try {
        const progress = await apiService.getUserProgress(user._id);
        const progressMap: Record<string, number> = {};
        progress.forEach(p => {
          progressMap[p.conceptId] = p.score;
        });
        setUserProgress(progressMap);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

    fetchUserProgress();
  }, [user]);

  // Icon mapping for restoration
  const iconMap: Record<string, any> = {
    Target,
    BookOpen,
    TrendingUp,
    Zap,
    Code,
    Database,
    Search,
    Brain,
    Globe,
    Network,
    Trophy,
    Server,
    Cloud,
    TreePine,
    ArrowUpDown
  };

  // Function to restore icon from saved data
  const restoreIcon = (iconName: string) => {
    return iconMap[iconName] || Target; // Default to Target if icon not found
  };

  // Load saved learning path on component mount
  useEffect(() => {
    const loadSavedLearningPath = async () => {
      if (!user) return;
      
      try {
        // First try to load from backend
        const savedPath = await apiService.getSavedLearningPath();
        if (savedPath) {
          console.log('Loading saved learning path from backend:', savedPath);
          setPathType(savedPath.pathType);
          setSelectedGoal(savedPath.selectedGoal || "");
          setSelectedConcept(savedPath.selectedConcept ? { _id: savedPath.selectedConcept } as Concept : null);
          
          // Restore icons in generated path
          const restoredPath = savedPath.generatedPath.map((topic: any) => ({
            ...topic,
            icon: typeof topic.icon === 'string' ? restoreIcon(topic.icon) : (topic.iconName ? restoreIcon(topic.iconName) : Target)
          }));
          setGeneratedPath(restoredPath);
          
          // Restore icons in alternative routes
          const restoredAlternatives = savedPath.alternativeRoutes.map((route: any[]) => 
            route.map((topic: any) => ({
              ...topic,
              icon: typeof topic.icon === 'string' ? restoreIcon(topic.icon) : (topic.iconName ? restoreIcon(topic.iconName) : Target)
            }))
          );
          setAlternativeRoutes(restoredAlternatives || []);
          setSelectedRoute(savedPath.selectedRoute || 0);
          return;
        }
      } catch (error) {
        console.log('No saved learning path in backend, trying localStorage');
      }

      // Fallback to localStorage
      try {
        const savedPath = localStorage.getItem('learningPath');
        if (savedPath) {
          const parsedPath = JSON.parse(savedPath);
          console.log('Loading saved learning path from localStorage:', parsedPath);
          setPathType(parsedPath.pathType);
          setSelectedGoal(parsedPath.selectedGoal || "");
          setSelectedConcept(parsedPath.selectedConcept ? { _id: parsedPath.selectedConcept } as Concept : null);
          
          // Restore icons in generated path
          const restoredPath = parsedPath.generatedPath.map((topic: any) => ({
            ...topic,
            icon: typeof topic.icon === 'string' ? restoreIcon(topic.icon) : (topic.iconName ? restoreIcon(topic.iconName) : Target)
          }));
          setGeneratedPath(restoredPath);
          
          // Restore icons in alternative routes
          const restoredAlternatives = parsedPath.alternativeRoutes.map((route: any[]) => 
            route.map((topic: any) => ({
              ...topic,
              icon: typeof topic.icon === 'string' ? restoreIcon(topic.icon) : (topic.iconName ? restoreIcon(topic.iconName) : Target)
            }))
          );
          setAlternativeRoutes(restoredAlternatives || []);
          setSelectedRoute(parsedPath.selectedRoute || 0);
        }
      } catch (error) {
        console.error('Error loading learning path from localStorage:', error);
      }
    };

    loadSavedLearningPath();
  }, [user]);

  // Search concepts when user types
  useEffect(() => {
    const searchConcepts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      console.log('Searching for concepts:', searchQuery);

      setIsSearching(true)
      try {
        const concepts = await apiService.searchConcepts(searchQuery)
        console.log('Search results:', concepts);
        setSearchResults(concepts)
      } catch (error) {
        console.error('Error searching concepts:', error)
        toast({
          title: "Error",
          description: "Failed to search concepts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchConcepts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const generateCustomPath = async () => {
    console.log('generateCustomPath called with auth state:', { user, isAuthenticated, isLoading });
    
    if (isLoading) {
      toast({
        title: "Loading",
        description: "Please wait while we check your authentication status.",
      })
      return
    }
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate personalized learning paths.",
        variant: "destructive",
      })
      return
    }

    console.log('Generate path called with:', {
      user: user._id,
      pathType,
      selectedConcept: selectedConcept?._id,
      selectedGoal
    });

    setIsGenerating(true)

    try {
      if (pathType === "topic" && selectedConcept) {
        console.log('Calling recommendation API with:', {
          goalConceptId: selectedConcept._id,
          currentConceptId: "root"
        });

        // Get recommendation for specific topic
        const response = await apiService.getRecommendation(
          selectedConcept._id,
          "root" // Assuming we start from root concept
        )

        console.log('Recommendation response:', response);

        // Transform the API response to match our Topic interface
        const transformedPath = response.bestPath.detailedPath.map((item, index) => {
          const masteryLevel = userProgress[item.conceptId] || 0;
          const isCompleted = masteryLevel >= 0.7; // Consider completed if mastery >= 70%
          
          return {
          id: item.conceptId,
          title: item.title,
          description: `Step ${index + 1} towards ${selectedConcept.title}`,
          courseId: "custom",
          courseName: "Custom Learning Path",
            masteryLevel: masteryLevel * 10, // Convert 0-1 scale to 0-10 scale for display
            isCompleted,
          isPrerequisite: item.locked,
            estimatedHours: 2, // Default estimate - could be enhanced with actual concept data
          difficulty: "Intermediate" as const,
          icon: Target,
          iconName: "Target", // Add icon name for serialization
          locked: item.locked,
          };
        });

        setGeneratedPath(transformedPath)

        // Transform alternative paths
        const transformedAlternatives = response.allPaths.slice(1).map(path => 
          path.detailedPath.map((item, index) => {
            const masteryLevel = userProgress[item.conceptId] || 0;
            const isCompleted = masteryLevel >= 0.7;
            
            return {
            id: item.conceptId,
            title: item.title,
            description: `Alternative step ${index + 1}`,
            courseId: "custom",
            courseName: "Custom Learning Path",
              masteryLevel: masteryLevel * 10,
              isCompleted,
            isPrerequisite: item.locked,
            estimatedHours: 2,
            difficulty: "Intermediate" as const,
            icon: Target,
            iconName: "Target", // Add icon name for serialization
            locked: item.locked,
            };
          })
        )

        setAlternativeRoutes(transformedAlternatives)
        setSelectedRoute(0)

        // Save learning path to backend and localStorage
        // Convert icons to strings for serialization
        const serializedPath = transformedPath.map(topic => ({
          ...topic,
          icon: topic.iconName || "Target" // Save icon name instead of component
        }));
        
        const serializedAlternatives = transformedAlternatives.map(route => 
          route.map(topic => ({
            ...topic,
            icon: topic.iconName || "Target" // Save icon name instead of component
          }))
        );
        
        const pathData = {
          pathType,
          selectedGoal,
          selectedConcept: selectedConcept._id,
          generatedPath: serializedPath,
          alternativeRoutes: serializedAlternatives,
          selectedRoute: 0
        };

        try {
          await apiService.saveLearningPath(pathData);
          localStorage.setItem('learningPath', JSON.stringify(pathData));
          console.log('Learning path saved successfully');
        } catch (error) {
          console.error('Failed to save learning path:', error);
          // Fallback to localStorage only
          localStorage.setItem('learningPath', JSON.stringify(pathData));
        }

        toast({
          title: "Path Generated!",
          description: `Found ${transformedPath.length} steps to master ${selectedConcept.title}`,
        })
      } else if (pathType === "course" && selectedGoal) {
        // For course-based paths, use collaborative learning approach
        const courseTopics = generateCollaborativeCoursePath(selectedGoal)
        
        // Apply user progress to the collaborative path
        const pathWithProgress = courseTopics.map(topic => {
          const masteryLevel = userProgress[topic.id] || 0;
          const isCompleted = masteryLevel >= 0.7; // Consider completed if mastery >= 70%
          
          return {
            ...topic,
            masteryLevel: masteryLevel * 10, // Convert 0-1 scale to 0-10 scale for display
            isCompleted,
          };
        });
        
        setGeneratedPath(pathWithProgress)
        setAlternativeRoutes([])
        setSelectedRoute(0)

        // Save learning path to backend and localStorage
        // Convert icons to strings for serialization
        const serializedPath = pathWithProgress.map(topic => ({
          ...topic,
          icon: topic.iconName || "Target" // Save icon name instead of component
        }));
        
        const pathData = {
          pathType,
          selectedGoal,
          selectedConcept: undefined,
          generatedPath: serializedPath,
          alternativeRoutes: [],
          selectedRoute: 0
        };

        try {
          await apiService.saveLearningPath(pathData);
          localStorage.setItem('learningPath', JSON.stringify(pathData));
          console.log('Learning path saved successfully');
        } catch (error) {
          console.error('Failed to save learning path:', error);
          // Fallback to localStorage only
          localStorage.setItem('learningPath', JSON.stringify(pathData));
        }

        toast({
          title: "Collaborative Course Path Generated!",
          description: `Generated learning path for ${availableCourses.find(c => c.id === selectedGoal)?.title} based on community learning patterns`,
        })
      }
    } catch (error) {
      console.error('Error generating path:', error)
      toast({
        title: "Error",
        description: "Failed to generate learning path. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Collaborative-based course path generator
  const generateCollaborativeCoursePath = (courseId: string): Topic[] => {
    const course = availableCourses.find(c => c.id === courseId);
    
    if (courseId === "dsa") {
      // Data Structures & Algorithms - Collaborative learning path
      return [
        {
          id: "fundamentals",
          title: "Programming Fundamentals",
          description: "Variables, loops, functions, and basic problem-solving",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 20,
          difficulty: "Beginner" as const,
          icon: BookOpen,
          iconName: "BookOpen",
        },
      {
        id: "arrays",
          title: "Arrays & Strings",
          description: "Linear data structures, array operations, and string manipulation",
        courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
        isPrerequisite: false,
          estimatedHours: 25,
          difficulty: "Beginner" as const,
        icon: Target,
        iconName: "Target",
      },
      {
        id: "linked-lists",
        title: "Linked Lists",
          description: "Singly, doubly, and circular linked lists with implementations",
        courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
        isCompleted: false,
        isPrerequisite: false,
          estimatedHours: 18,
          difficulty: "Beginner" as const,
        icon: TrendingUp,
        iconName: "TrendingUp",
      },
            {
          id: "stacks-queues",
          title: "Stacks & Queues",
          description: "LIFO and FIFO data structures with real-world applications",
        courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 15,
          difficulty: "Beginner" as const,
          icon: Zap,
          iconName: "Zap",
        },
        {
          id: "trees",
          title: "Trees & Binary Trees",
          description: "Tree data structures, traversal algorithms, and binary search trees",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 30,
          difficulty: "Intermediate" as const,
          icon: Target,
          iconName: "Target",
        },
        {
          id: "graphs",
          title: "Graphs & Graph Algorithms",
          description: "Graph representations, BFS, DFS, and shortest path algorithms",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 35,
          difficulty: "Intermediate" as const,
          icon: Network,
          iconName: "Network",
        },
        {
          id: "sorting",
          title: "Sorting Algorithms",
          description: "Bubble, selection, insertion, merge, quick, and heap sort",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 28,
          difficulty: "Intermediate" as const,
          icon: Target,
          iconName: "Target",
        },
        {
          id: "searching",
          title: "Searching Algorithms",
          description: "Linear search, binary search, and advanced search techniques",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 20,
          difficulty: "Intermediate" as const,
          icon: Search,
          iconName: "Search",
        },
        {
          id: "dynamic-programming",
          title: "Dynamic Programming",
          description: "Memoization, tabulation, and classic DP problems",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 40,
          difficulty: "Advanced" as const,
          icon: Brain,
          iconName: "Brain",
        },
        {
          id: "greedy",
          title: "Greedy Algorithms",
          description: "Greedy approach, optimal substructure, and greedy choice property",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 25,
          difficulty: "Advanced" as const,
          icon: Target,
          iconName: "Target",
        },
        {
          id: "advanced-data-structures",
          title: "Advanced Data Structures",
          description: "Heaps, tries, segment trees, and advanced tree structures",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 35,
          difficulty: "Advanced" as const,
          icon: Database,
        },
        {
          id: "competitive-programming",
          title: "Competitive Programming",
          description: "Problem-solving strategies, time complexity, and optimization",
          courseId: courseId,
          courseName: course?.title || "DSA",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 50,
          difficulty: "Advanced" as const,
          icon: Trophy,
        }
      ];
    } else if (courseId === "web-dev") {
      // Full Stack Web Development path
      return [
        {
          id: "html-css",
          title: "HTML & CSS Fundamentals",
          description: "Web markup, styling, and responsive design principles",
          courseId: courseId,
          courseName: course?.title || "Web Development",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 30,
          difficulty: "Beginner" as const,
          icon: Globe,
        },
        {
          id: "javascript",
          title: "JavaScript Programming",
          description: "ES6+, DOM manipulation, and modern JavaScript features",
          courseId: courseId,
          courseName: course?.title || "Web Development",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 40,
          difficulty: "Beginner" as const,
          icon: Code,
        },
        {
          id: "react",
          title: "React.js Framework",
          description: "Component-based architecture, hooks, and state management",
          courseId: courseId,
          courseName: course?.title || "Web Development",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 45,
          difficulty: "Intermediate" as const,
          icon: Zap,
        },
        {
          id: "node-express",
          title: "Node.js & Express.js",
          description: "Server-side JavaScript, REST APIs, and backend development",
          courseId: courseId,
          courseName: course?.title || "Web Development",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 35,
          difficulty: "Intermediate" as const,
          icon: Server,
        },
        {
          id: "database",
          title: "Database Design",
          description: "SQL, NoSQL, database modeling, and data relationships",
          courseId: courseId,
          courseName: course?.title || "Web Development",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 30,
          difficulty: "Intermediate" as const,
          icon: Database,
        },
        {
          id: "deployment",
          title: "Deployment & DevOps",
          description: "Cloud platforms, CI/CD, and production deployment",
          courseId: courseId,
          courseName: course?.title || "Web Development",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 25,
          difficulty: "Advanced" as const,
          icon: Cloud,
        }
      ];
    } else if (courseId === "system-design") {
      // System Design path
      return [
        {
          id: "distributed-systems",
          title: "Distributed Systems",
          description: "System architecture, scalability, and distributed computing",
          courseId: courseId,
          courseName: course?.title || "System Design",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 40,
          difficulty: "Advanced" as const,
          icon: Network,
        },
        {
          id: "microservices",
          title: "Microservices Architecture",
          description: "Service decomposition, communication, and deployment",
          courseId: courseId,
          courseName: course?.title || "System Design",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 35,
          difficulty: "Advanced" as const,
          icon: Server,
        },
        {
          id: "scalability",
          title: "Scalability Patterns",
          description: "Load balancing, caching, and horizontal scaling",
          courseId: courseId,
          courseName: course?.title || "System Design",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 30,
          difficulty: "Advanced" as const,
          icon: TrendingUp,
        }
      ];
    } else if (courseId === "machine-learning") {
      // Machine Learning path
      return [
        {
          id: "python-ml",
          title: "Python for ML",
          description: "Python programming, NumPy, Pandas, and data manipulation",
          courseId: courseId,
          courseName: course?.title || "Machine Learning",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 35,
          difficulty: "Beginner" as const,
          icon: Code,
        },
        {
          id: "statistics",
          title: "Statistics & Probability",
          description: "Statistical concepts, probability theory, and data analysis",
          courseId: courseId,
          courseName: course?.title || "Machine Learning",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 40,
          difficulty: "Intermediate" as const,
          icon: BarChart3,
        },
        {
          id: "supervised-learning",
          title: "Supervised Learning",
          description: "Linear regression, classification, and model evaluation",
          courseId: courseId,
          courseName: course?.title || "Machine Learning",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 45,
          difficulty: "Intermediate" as const,
          icon: Brain,
        },
        {
          id: "unsupervised-learning",
          title: "Unsupervised Learning",
          description: "Clustering, dimensionality reduction, and association rules",
          courseId: courseId,
          courseName: course?.title || "Machine Learning",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 35,
          difficulty: "Advanced" as const,
          icon: Network,
        },
        {
          id: "deep-learning",
          title: "Deep Learning",
          description: "Neural networks, CNN, RNN, and deep learning frameworks",
          courseId: courseId,
          courseName: course?.title || "Machine Learning",
          masteryLevel: 0,
          isCompleted: false,
          isPrerequisite: false,
          estimatedHours: 50,
          difficulty: "Advanced" as const,
          icon: Brain,
        }
      ];
    }
    
    // Default fallback
    return [
      {
        id: "intro",
        title: "Course Introduction",
        description: "Get started with the fundamentals",
        courseId: courseId,
        courseName: course?.title || "Course",
        masteryLevel: 0,
        isCompleted: false,
        isPrerequisite: false,
        estimatedHours: 10,
        difficulty: "Beginner" as const,
        icon: BookOpen,
      }
    ];
  }

  // Find the next incomplete topic in the current path
  const getNextIncompleteTopic = () => {
    const currentPath = selectedRoute === 0 ? generatedPath : alternativeRoutes[selectedRoute - 1] || generatedPath
    return currentPath.find((topic) => !topic.isCompleted && !topic.locked)
  }

  // Handle topic click - show options for unlocked topics
  const handleTopicClick = (topic: Topic) => {
    if (topic.locked) {
      toast({
        title: "Topic Locked",
        description: "Complete prerequisites to unlock this topic",
        variant: "destructive",
      })
      return
    }

    setSelectedTopic(topic)
    setShowTopicModal(true)
  }

  // Navigate to learning content
  const handleLearnContent = () => {
    if (!selectedTopic) return
    
    // Navigate to the learning content page
    window.open(`/courses/${selectedTopic.courseId}/concepts/${selectedTopic.id}`, '_blank')
    setShowTopicModal(false)
    setSelectedTopic(null)
  }

  // Navigate to quiz
  const handleTakeQuiz = () => {
    setShowTopicModal(false)
    // Open quiz in a new window with concept ID
    const quizUrl = selectedTopic?.id 
      ? `/quiz?conceptId=${selectedTopic.id}`
      : '/quiz'
    const quizWindow = window.open(quizUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    if (quizWindow) {
      quizWindow.focus()
    }
  }

  const getStatusColor = (topic: Topic) => {
    if (topic.locked) return "from-red-500 to-red-600"
    if (topic.isCompleted) return "from-green-500 to-emerald-600"
    if (topic.masteryLevel >= revisionThreshold) return "from-blue-500 to-indigo-600"
    if (topic.masteryLevel > 0) return "from-yellow-500 to-orange-600"
    return "from-gray-400 to-gray-500"
  }

  const getStatusIcon = (topic: Topic) => {
    if (topic.locked) return <Lock className="w-5 h-5 text-white" />
    if (topic.isCompleted) return <CheckCircle className="w-5 h-5 text-white" />
    if (topic.masteryLevel >= revisionThreshold) return <Play className="w-5 h-5 text-white" />
    if (topic.masteryLevel > 0) return <RefreshCw className="w-5 h-5 text-white" />
    return <Lock className="w-5 h-5 text-white" />
  }

  const getStatusLabel = (topic: Topic) => {
    if (topic.locked) return "Locked"
    if (topic.isCompleted) return "Completed"
    if (topic.masteryLevel >= revisionThreshold) return "Ready"
    if (topic.masteryLevel > 0) return "Needs Revision"
    return "Not Started"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/learning-paths"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Custom Learning Path</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Generate a personalized learning journey based on your goals
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>AI-Generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Adaptive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-6 gap-8 h-[calc(100vh-200px)]">
          {/* Configuration Panel - Now wider */}
          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-xl">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <span>AI Path Generator</span>
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Configure your learning preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Path Type Selection */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-gray-900 dark:text-white">Learning Approach</label>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant={pathType === "course" ? "default" : "outline"}
                      onClick={() => setPathType("course")}
                      className="justify-start h-12 text-left"
                      size="lg"
                    >
                      <BookOpen className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">Complete Course</div>
                        <div className="text-xs opacity-70">Full curriculum path</div>
                      </div>
                    </Button>
                    <Button
                      variant={pathType === "topic" ? "default" : "outline"}
                      onClick={() => setPathType("topic")}
                      className="justify-start h-12 text-left"
                      size="lg"
                    >
                      <Target className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">Specific Topic</div>
                        <div className="text-xs opacity-70">Focused learning</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Course Selection */}
                {pathType === "course" && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-900 dark:text-white">Target Course</label>
                    
                    {/* Collaborative Learning Info */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Collaborative Learning</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        This path is based on learning patterns from thousands of successful students in the community.
                      </p>
                    </div>
                    
                    <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose your learning goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            <div className="flex items-center space-x-3 py-2">
                              <course.icon className="w-5 h-5" />
                              <div>
                                <div className="font-medium">{course.title}</div>
                                <div className="text-xs text-gray-500">{course.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Topic Search */}
                {pathType === "topic" && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-900 dark:text-white">Search Topic</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="e.g., Stacks, React, Machine Learning..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 text-base"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                      )}
                    </div>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((concept) => (
                          <div
                            key={concept._id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedConcept?._id === concept._id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                            onClick={() => setSelectedConcept(concept)}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">{concept.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{concept.description}</div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Level: {concept.level || "Intermediate"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Complexity: {concept.complexity}/5
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Search for any topic you want to master
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={generateCustomPath}
                  disabled={isGenerating || (!selectedGoal && !selectedConcept)}
                  className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                      Generating Your Path...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Generate Learning Path
                    </>
                  )}
                </Button>

                {/* Test Backend Connection */}
                <Button
                  onClick={async () => {
                    try {
                      const concepts = await apiService.getAllConcepts();
                      toast({
                        title: "Backend Connected!",
                        description: `Found ${concepts.length} concepts in database`,
                      });
                    } catch (error) {
                      toast({
                        title: "Backend Error",
                        description: "Failed to connect to backend. Make sure the server is running.",
                        variant: "destructive",
                      });
                    }
                  }}
                  variant="outline"
                  className="w-full h-10 text-sm"
                  size="sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Test Backend Connection
                </Button>
              </CardContent>
            </Card>

            {/* Current Progress */}
            <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 dark:text-white text-lg">Your Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{course.title}</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {course.completedTopics}/{course.totalTopics}
                      </span>
                    </div>
                    <Progress value={(course.completedTopics / course.totalTopics) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Mastery: {course.masteryScore.toFixed(1)}/10</span>
                      <span>{Math.round((course.completedTopics / course.totalTopics) * 100)}% Complete</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Generated Path Visualization */}
          {generatedPath.length > 0 ? (
            <div className="lg:col-span-4">
              <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg h-full flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-xl">
                        <Target className="w-6 h-6 text-blue-500" />
                        <span>Your Custom Learning Path</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Follow this AI-generated path to achieve your goals
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {(selectedRoute === 0
                              ? generatedPath
                              : alternativeRoutes[selectedRoute - 1] || generatedPath
                          ).length} topics
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {(selectedRoute === 0
                            ? generatedPath
                            : alternativeRoutes[selectedRoute - 1] || generatedPath
                          ).reduce((acc, topic) => acc + topic.estimatedHours, 0)}
                          h
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Route Selection Tabs */}
                {alternativeRoutes.length > 0 && (
                  <div className="flex-shrink-0 px-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                      <Button
                        variant={selectedRoute === 0 ? "default" : "outline"}
                        onClick={() => setSelectedRoute(0)}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Recommended Path
                      </Button>
                      {alternativeRoutes.map((route, index) => (
                        <Button
                          key={index}
                          variant={selectedRoute === index + 1 ? "default" : "outline"}
                          onClick={() => setSelectedRoute(index + 1)}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {index === 0 && "Easy First"}
                          {index === 1 && "Time Optimized"}
                          {index === 2 && "Mastery Focused"}
                          {index > 2 && `Route ${index + 1}`}
                        </Button>
                      ))}
                    </div>

                    {/* Route Description */}
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      {selectedRoute === 0 &&
                        "AI-recommended balanced approach considering prerequisites and difficulty"}
                      {selectedRoute === 1 && "Start with easier topics to build confidence gradually"}
                      {selectedRoute === 2 && "Minimize total learning time with shorter topics first"}
                      {selectedRoute === 3 && "Focus on improving weakest areas first"}
                    </div>
                  </div>
                )}

                <CardContent className="flex-1 overflow-y-auto px-8">
                  {/* Beautiful Path Visualization with dynamic layout */}
                  <div className="relative min-h-full py-8">
                    {/* Start Indicator */}
                    <div className="flex justify-center mb-8">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg">
                        <Play className="w-4 h-4" />
                        <span className="font-semibold text-sm">START YOUR JOURNEY</span>
                      </div>
                    </div>

                    {/* Dynamic Grid Layout based on path length */}
                    <div
                      className={`
      grid gap-8 max-w-full mx-auto
      ${
        generatedPath.length <= 3
          ? "grid-cols-1 max-w-2xl"
          : generatedPath.length <= 6
            ? "grid-cols-2 max-w-5xl"
            : "grid-cols-3 max-w-7xl"
      }
    `}
                    >
                      {(selectedRoute === 0
                        ? generatedPath
                        : alternativeRoutes[selectedRoute - 1] || generatedPath
                      ).map((topic, index) => (
                        <div key={topic.id} className="relative">
                          {/* Topic Card - Full width within grid */}
                          <div className="flex justify-center">
                            <div
                              onClick={() => handleTopicClick(topic)}
                              className="group relative block w-full max-w-sm cursor-pointer"
                            >
                              <div
                                className={`
                  relative p-5 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer w-full
                  ${
                    topic.locked
                      ? "border-red-300 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-600"
                      : topic.masteryLevel > 0 && topic.masteryLevel < revisionThreshold
                        ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-600"
                        : topic.isCompleted
                          ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600"
                          : "border-gray-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600"
                  }
                  hover:border-blue-400 dark:hover:border-blue-500
                `}
                              >
                                {/* Step Number */}
                                <div className="absolute -top-3 -left-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-sm">{index + 1}</span>
                                  </div>
                                </div>

                                {/* Floating Status Badge */}
                                <div className="absolute -top-2 -right-2">
                                  <div
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${getStatusColor(topic)} flex items-center justify-center shadow-lg`}
                                  >
                                    {getStatusIcon(topic)}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                  <div className="flex items-start space-x-3">
                                    <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-700/80 shadow-sm">
                                      {typeof topic.icon === 'function' ? 
                                        React.createElement(topic.icon, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" }) :
                                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                        {topic.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {topic.description}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Badges */}
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <Badge className={getDifficultyColor(topic.difficulty)} variant="secondary">
                                      {topic.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {topic.estimatedHours}h
                                    </Badge>
                                    {selectedTopic?.masteryLevel && selectedTopic.masteryLevel > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        <Award className="w-3 h-3 mr-1" />
                                        {selectedTopic.masteryLevel.toFixed(1)}/10
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Status Messages */}
                                  {topic.locked && (
                                    <div className="flex items-center space-x-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                      <Lock className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                      <span className="text-xs text-red-700 dark:text-red-300">
                                        Prerequisites required
                                      </span>
                                    </div>
                                  )}
                                  {topic.masteryLevel > 0 && topic.masteryLevel < revisionThreshold && !topic.locked && (
                                    <div className="flex items-center space-x-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                      <span className="text-xs text-yellow-700 dark:text-yellow-300">
                                        Revision recommended
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>
                          </div>

                          {/* Connection Arrow - Only show if not the last item and in appropriate positions */}
                          {index <
                            (selectedRoute === 0
                              ? generatedPath
                              : alternativeRoutes[selectedRoute - 1] || generatedPath
                            ).length -
                              1 && (
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                              <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg animate-pulse">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Finish Indicator */}
                    <div className="flex justify-center mt-12">
                      <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full shadow-lg">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold">CONGRATULATIONS! PATH COMPLETED</span>
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Route Comparison */}
                  {alternativeRoutes.length > 0 && (
                    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Compare All Routes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Main Route */}
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Recommended</div>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                            <div>{generatedPath.length} topics</div>
                            <div>{generatedPath.reduce((acc, topic) => acc + topic.estimatedHours, 0)}h total</div>
                            <div>Balanced approach</div>
                          </div>
                        </div>

                        {/* Alternative Routes */}
                        {alternativeRoutes.map((route, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {index === 0 && "Easy First"}
                              {index === 1 && "Time Optimized"}
                              {index === 2 && "Mastery Focused"}
                            </div>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                              <div>{route.length} topics</div>
                              <div>{route.reduce((acc, topic) => acc + topic.estimatedHours, 0)}h total</div>
                              <div>
                                {index === 0 && "Confidence building"}
                                {index === 1 && "Quick completion"}
                                {index === 2 && "Skill improvement"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Path Progress Summary */}
                  {generatedPath.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Path Progress Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {generatedPath.length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Total Topics</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {generatedPath.filter(topic => topic.isCompleted).length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {generatedPath.filter(topic => topic.locked).length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Locked</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {Math.round((generatedPath.filter(topic => topic.isCompleted).length / generatedPath.length) * 100)}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Progress</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collaborative Learning Statistics */}
                  {pathType === "course" && generatedPath.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Community Learning Insights
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {Math.round(generatedPath.reduce((acc, topic) => acc + topic.estimatedHours, 0) * 0.8)}h
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Avg. Completion Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            94%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            12.5k
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Students Completed</div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded text-xs text-gray-600 dark:text-gray-300">
                        💡 <strong>Pro tip:</strong> Most successful students complete 2-3 topics per week and practice regularly.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Fixed at bottom */}
                  <div className="sticky bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t pt-4 mt-8">
                    <div className="flex items-center justify-center space-x-3">
                      {getNextIncompleteTopic() ? (
                        <Button
                          asChild
                          className="shadow-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Link
                            href={`/courses/${getNextIncompleteTopic()?.courseId}/concepts/${getNextIncompleteTopic()?.id}`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning: {getNextIncompleteTopic()?.title}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Link href={`/courses/${generatedPath[0]?.courseId}/concepts/${generatedPath[0]?.id}`}>
                            <Award className="w-4 h-4 mr-2" />
                            Review Completed Path
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" onClick={generateCustomPath} className="shadow-lg">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Keep the existing empty state exactly the same
            <div className="lg:col-span-4">
              <Card className="dark:bg-gray-800/80 dark:border-gray-700 shadow-lg h-full">
                <CardContent className="flex flex-col items-center justify-center h-full">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <Brain className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto" />
                      <Sparkles className="w-8 h-8 text-blue-500 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Ready to Create Your Path?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Configure your learning goals and let our AI generate a personalized learning journey tailored
                        just for you.
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Goal-Oriented</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4" />
                        <span>AI-Powered</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Adaptive</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Topic Options Modal */}
      <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedTopic?.icon && typeof selectedTopic.icon === 'function' && React.createElement(selectedTopic.icon, { className: "w-5 h-5 text-blue-600" })}
              <span>{selectedTopic?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTopic?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Topic Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(selectedTopic?.difficulty || "Beginner")} variant="secondary">
                  {selectedTopic?.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedTopic?.estimatedHours}h
                </Badge>
              </div>
              {selectedTopic?.masteryLevel && selectedTopic.masteryLevel > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {selectedTopic.masteryLevel.toFixed(1)}/10
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleLearnContent}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Learn Content
                <span className="text-xs ml-2 opacity-80">Study the material</span>
              </Button>

              <Button
                onClick={handleTakeQuiz}
                variant="outline"
                className="w-full h-12 border-2 border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                size="lg"
              >
                <Target className="w-5 h-5 mr-3" />
                Take Quiz Directly
                <span className="text-xs ml-2 opacity-80">Test your knowledge</span>
              </Button>
            </div>

            {/* Pro Tips */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Pro Tip:</strong> {(selectedTopic?.masteryLevel ?? 0) > 0 
                    ? "You've made progress on this topic. Consider taking the quiz to assess your current level."
                    : "Start with the learning content to build a strong foundation before attempting the quiz."
                  }
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
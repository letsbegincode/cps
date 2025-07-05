export interface DashboardData {
    user: {
      name: string
      avatar?: string | null
      level: number
      plan: string
    }
    stats: {
      coursesEnrolled: number
      conceptsMastered: number
      currentStreak: number
      totalStudyTime: number
    }
    recentCourses: Array<{
      title: string
      progress: number
      nextLesson: string
      timeSpent: string
      concepts: {
        completed: number
        total: number
      }
    }>
    achievements: Array<{
      title: string
      date: string
      type: string
    }>
    upcomingTests: Array<{
      title: string
      date: string
      duration: string
    }>
    weeklyProgress: {
      conceptsLearned: number
      quizzesCompleted: number
      studyTimeHours: number
    }
  }
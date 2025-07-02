const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Concept {
  _id: string;
  title: string;
  description: string;
  complexity: number;
  estLearningTimeHours: number;
  prerequisites: string[];
  level?: string;
  category?: string;
  Test_Questions?: QuizQuestion[];
}

export interface UserConceptProgress {
  conceptId: string;
  score: number;
  attempts: number;
  lastUpdated: string;
}

export interface RecommendationPath {
  conceptId: string;
  title: string;
  locked: boolean;
  prerequisiteMasteries: {
    prerequisiteId: string;
    score: number;
  }[];
}

export interface RecommendationResponse {
  bestPath: {
    path: string[];
    detailedPath: RecommendationPath[];
    totalCost: number;
  };
  allPaths: Array<{
    path: string[];
    detailedPath: RecommendationPath[];
    totalCost: number;
  }>;
}

export interface QuizQuestion {
  id: number;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  tags: string[];
}

export interface ConceptQuiz {
  conceptTitle: string;
  conceptId: string;
  questions: QuizQuestion[];
  totalQuestions: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Search concepts by title
  async searchConcepts(query: string): Promise<Concept[]> {
    return this.request<Concept[]>(`/concepts/search?q=${encodeURIComponent(query)}`);
  }

  // Get all concepts for dropdown
  async getAllConcepts(): Promise<Concept[]> {
    return this.request<Concept[]>('/concepts');
  }

  // Get concept-specific quiz questions
  async getConceptQuiz(conceptId: string): Promise<ConceptQuiz> {
    return this.request<ConceptQuiz>(`/concepts/${conceptId}/quiz`);
  }

  // Get recommendation path
  async getRecommendation(
    goalConceptId: string, 
    currentConceptId: string
  ): Promise<RecommendationResponse> {
    console.log('Getting recommendation with params:', { goalConceptId, currentConceptId });
    return this.request<RecommendationResponse>(
      `/recommendation/${goalConceptId}?currentConceptId=${currentConceptId}`
    );
  }

  // Get user progress for mastery levels
  async getUserProgress(userId: string): Promise<UserConceptProgress[]> {
    return this.request<UserConceptProgress[]>(`/users/${userId}/progress`);
  }

  // Get user progress for a specific concept
  async getUserConceptProgress(userId: string, conceptId: string): Promise<number> {
    try {
      const progress = await this.request<UserConceptProgress[]>(`/users/${userId}/progress`);
      const conceptProgress = progress.find(p => p.conceptId === conceptId);
      return conceptProgress ? conceptProgress.score : 0;
    } catch (error) {
      console.error('Error fetching user concept progress:', error);
      return 0;
    }
  }

  // Get current user (for authentication)
  async getCurrentUser(): Promise<{ _id: string; firstName: string; lastName: string; email: string }> {
    return this.request('/auth/me');
  }

  // Login user
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Register user
  async register(userData: { firstName: string; lastName: string; email: string; password: string }): Promise<{ user: any; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Logout user
  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService(); 
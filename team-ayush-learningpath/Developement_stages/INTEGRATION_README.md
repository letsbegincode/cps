# Backend-Frontend Integration for Recommendation System

## Overview
This document describes the integration between the backend recommendation system and the Masterly frontend for the learning paths feature.

## Backend Components

### 1. Recommendation Controller (`controllers/recommendationController.ts`)
- **Endpoint**: `GET /api/recommendation/:userId/:goalConceptId?currentConceptId=root`
- **Function**: Generates personalized learning paths based on user progress and concept prerequisites
- **Response**: Returns best path and alternative paths with detailed information

### 2. Concept Controller (`controllers/conceptController.ts`)
- **Endpoint**: `GET /api/concepts/search?q=query`
- **Function**: Searches concepts by title for the topic selection feature
- **Response**: Returns matching concepts with metadata

### 3. User Progress Model (`models/userConceptProgress.ts`)
- **Structure**: Tracks user mastery levels for each concept (0-1 scale)
- **Usage**: Used by recommendation algorithm to calculate optimal paths

### 4. Concept Model (`models/conceptModel.ts`)
- **Structure**: Contains concept metadata including prerequisites, complexity, and learning time
- **Usage**: Forms the knowledge graph for path generation

## Frontend Components

### 1. Learning Paths Page (`Masterly/frontend/app/learning-paths/page.tsx`)
- **Feature**: AI-powered custom learning path generator
- **Integration**: 
  - Searches concepts using backend API
  - Generates personalized paths using recommendation endpoint
  - Displays visual learning path with progress indicators

### 2. API Service (`Masterly/frontend/lib/api.ts`)
- **Functions**:
  - `searchConcepts(query)`: Search for concepts
  - `getRecommendation(userId, goalConceptId, currentConceptId)`: Get personalized path
  - `getUserProgress(userId)`: Fetch user mastery levels
  - `getUserConceptProgress(userId, conceptId)`: Get specific concept progress

## Integration Flow

1. **User Authentication**: User must be logged in to access personalized recommendations
2. **Topic Selection**: User searches and selects a target topic
3. **Path Generation**: Frontend calls recommendation API with user ID and goal concept
4. **Progress Integration**: User's existing mastery levels are fetched and displayed
5. **Visualization**: Learning path is displayed with:
   - Locked/unlocked states based on prerequisites
   - Mastery levels and completion status
   - Alternative route options
   - Progress summary

## Key Features

### Real-time Progress Tracking
- Fetches user progress on component mount
- Displays actual mastery levels (0-10 scale)
- Shows completion status based on 70% mastery threshold

### Visual Learning Path
- Dynamic grid layout based on path length
- Color-coded status indicators (locked, completed, in-progress)
- Connection arrows showing learning sequence
- Progress summary with statistics

### Alternative Routes
- Shows multiple path options from recommendation algorithm
- Route comparison with different strategies
- Easy switching between recommended paths

## Database Requirements

### MongoDB Collections
- `concepts`: Concept metadata and prerequisites
- `users`: User authentication and profile data
- `userconceptprogresses`: User mastery levels for each concept

### Required Fields
- Concepts must have: `title`, `description`, `prerequisites`, `complexity`
- User progress must track: `conceptId`, `score` (0-1), `attempts`

## Testing

### Backend Testing
1. Start MongoDB on `localhost:27017/personalized_learning`
2. Start backend server: `cd backend && npm start`
3. Test with Postman: `GET /api/recommendation/:userId/:goalConceptId`

### Frontend Testing
1. Start frontend: `cd Masterly/frontend && npm run dev`
2. Navigate to `/learning-paths`
3. Use "Test Backend Connection" button to verify API connectivity
4. Search for concepts and generate learning paths

## Error Handling

### Backend Errors
- Missing parameters return 400 status
- No paths found return 404 status
- Server errors return 500 status

### Frontend Errors
- Authentication required for personalized features
- Network errors show user-friendly messages
- Graceful fallback for missing data

## Future Enhancements

1. **Enhanced Concept Data**: Include actual learning time estimates
2. **Difficulty Mapping**: Map complexity to difficulty levels
3. **Progress Persistence**: Save generated paths for later reference
4. **Path Optimization**: Real-time path updates based on progress
5. **Social Features**: Share and compare learning paths

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured for frontend origin
2. **Authentication**: Verify user is logged in before making API calls
3. **Database Connection**: Check MongoDB connection and collection names
4. **API Endpoints**: Verify all required endpoints are properly routed

### Debug Steps
1. Check browser console for API errors
2. Verify backend server is running on correct port
3. Test API endpoints directly with Postman
4. Check database for required data 
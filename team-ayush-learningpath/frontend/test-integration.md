# Integration Test Guide

This guide helps you verify that the frontend is properly integrated with the backend recommendation system.

## Prerequisites

1. **Backend Server**: Ensure the backend is running on `http://localhost:5000`
2. **Database**: Make sure MongoDB is running and has some concept data
3. **Frontend**: Start the frontend with `npm run dev`

## Test Steps

### 1. Backend Health Check

First, verify the backend is accessible:

```bash
curl http://localhost:5000/api/concepts
```

Expected response: Array of concepts or empty array `[]`

### 2. Frontend Authentication

1. Navigate to `http://localhost:3000/login`
2. Try logging in with test credentials
3. Verify you're redirected to dashboard after successful login

### 3. Learning Path Generation

1. Navigate to `http://localhost:3000/learning-paths`
2. Test the "Specific Topic" approach:
   - Select "Specific Topic" radio button
   - Type a concept name in the search box (e.g., "Arrays", "React", "Machine Learning")
   - Verify search results appear
   - Select a concept from the results
   - Click "Generate Learning Path"
   - Verify a path is generated and displayed

### 4. API Integration Verification

Open browser developer tools and check the Network tab:

1. **Search Request**: Should see a request to `/api/concepts/search?q=your_search_term`
2. **Recommendation Request**: Should see a request to `/api/recommendation/:userId/:goalConceptId`
3. **Response Format**: Verify the response contains the expected data structure

### 5. Error Handling Test

1. **Network Error**: Disconnect from internet and try generating a path
2. **Invalid Search**: Try searching for non-existent concepts
3. **Unauthenticated**: Try accessing without logging in

Expected behavior: User-friendly error messages should be displayed

## Expected API Responses

### Concept Search Response
```json
[
  {
    "_id": "concept_id",
    "title": "Concept Title",
    "description": "Concept description",
    "complexity": 3,
    "estLearningTimeHours": 2.5,
    "level": "Intermediate",
    "category": "Programming"
  }
]
```

### Recommendation Response
```json
{
  "bestPath": {
    "path": ["concept1", "concept2", "concept3"],
    "detailedPath": [
      {
        "conceptId": "concept1",
        "title": "Concept 1",
        "locked": false,
        "prerequisiteMasteries": []
      }
    ],
    "totalCost": 1.5
  },
  "allPaths": [...]
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Authentication Errors**: Verify session cookies are being sent
3. **Empty Search Results**: Check if concepts exist in the database
4. **Path Generation Fails**: Verify user ID and concept IDs are valid

### Debug Steps

1. **Check Backend Logs**: Look for errors in the backend console
2. **Check Frontend Console**: Look for JavaScript errors
3. **Network Tab**: Verify API requests are being made correctly
4. **Database**: Check if concepts exist in MongoDB

### Environment Variables

Ensure these are set correctly:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend (.env)
CLIENT_URL=http://localhost:3000
```

## Success Criteria

✅ Backend responds to health check  
✅ Frontend can authenticate users  
✅ Concept search returns results  
✅ Learning paths are generated  
✅ Paths are displayed correctly  
✅ Error handling works properly  
✅ UI is responsive and functional  

## Performance Testing

1. **Search Performance**: Test with large datasets
2. **Path Generation**: Test with complex concept graphs
3. **UI Responsiveness**: Test on different screen sizes
4. **Loading States**: Verify loading indicators work correctly

## Security Testing

1. **Authentication**: Verify unauthenticated users can't access protected features
2. **Input Validation**: Test with malicious search queries
3. **Session Management**: Test session expiration and renewal
4. **CORS**: Verify only allowed origins can access the API 
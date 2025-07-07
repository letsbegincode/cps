# Masterly - AI-Powered Learning Path Generator

This is the frontend for the Masterly learning platform, featuring an AI-powered custom learning path generator that integrates with the backend recommendation system.

## Features

- **AI-Powered Learning Paths**: Generate personalized learning journeys based on your goals
- **Real-time Concept Search**: Search for specific topics to master
- **Multiple Learning Approaches**: Choose between complete course paths or focused topic learning
- **Alternative Routes**: Get multiple path options optimized for different learning styles
- **Progress Tracking**: Visual progress indicators and mastery levels
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Integration with Backend

The frontend is fully integrated with the backend recommendation system:

### API Endpoints Used

1. **Concept Search**: `/api/concepts/search?q=query`
   - Searches for concepts by title
   - Returns concept details including complexity and learning time

2. **Recommendation Generation**: `/api/recommendation/:userId/:goalConceptId?currentConceptId=root`
   - Generates personalized learning paths
   - Returns best path and alternative routes
   - Considers user progress and prerequisites

3. **User Progress**: `/api/users/:userId/progress`
   - Fetches user's concept mastery levels
   - Used for personalized recommendations

4. **Authentication**: `/api/auth/*`
   - Login/logout functionality
   - User session management

### How It Works

1. **User Authentication**: Users must be logged in to generate personalized paths
2. **Concept Search**: Users can search for specific topics they want to master
3. **Path Generation**: The system calls the backend recommendation API to generate optimal learning paths
4. **Path Visualization**: The frontend displays the generated paths with beautiful visualizations
5. **Progress Tracking**: Users can see their progress and mastery levels for each concept

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend server running on `http://localhost:5000` (or set `NEXT_PUBLIC_API_URL`)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Login**: Navigate to `/login` and sign in with your credentials
2. **Access Learning Paths**: Go to `/learning-paths`
3. **Choose Learning Approach**:
   - **Complete Course**: Select a course for a full curriculum path
   - **Specific Topic**: Search for a particular concept to master
4. **Generate Path**: Click "Generate Learning Path" to get AI-powered recommendations
5. **Follow the Path**: Use the visual path to guide your learning journey

## File Structure

```
app/
├── learning-paths/
│   └── page.tsx          # Main learning path generator
├── login/
│   └── page.tsx          # Authentication page
└── layout.tsx            # Root layout with providers

lib/
├── api.ts               # API service for backend communication
├── auth-context.tsx     # Authentication context
└── utils.ts            # Utility functions

components/
└── ui/                 # Reusable UI components
```

## Key Components

### Learning Path Generator (`/learning-paths`)

- **Configuration Panel**: Choose learning approach and search for topics
- **Path Visualization**: Beautiful visual representation of learning paths
- **Alternative Routes**: Multiple path options with different optimization strategies
- **Progress Overview**: Current progress across different courses

### API Service (`lib/api.ts`)

- Handles all communication with the backend
- Type-safe interfaces for API responses
- Error handling and authentication

### Authentication Context (`lib/auth-context.tsx`)

- Manages user authentication state
- Provides login/logout functionality
- Handles session persistence

## Backend Integration Details

The frontend seamlessly integrates with the backend recommendation system:

1. **Concept Search**: Real-time search with debouncing
2. **Path Generation**: Calls the recommendation controller with user and goal parameters
3. **Progress Integration**: Uses user progress to personalize recommendations
4. **Error Handling**: Graceful error handling with user-friendly messages

## Development

### Adding New Features

1. **New API Endpoints**: Add methods to `lib/api.ts`
2. **UI Components**: Create reusable components in `components/ui/`
3. **Pages**: Add new pages in the `app/` directory
4. **Styling**: Use Tailwind CSS for consistent styling

### Testing

1. **Backend Integration**: Ensure backend is running and accessible
2. **Authentication**: Test login flow and session management
3. **Path Generation**: Test with different search queries and user scenarios
4. **Responsive Design**: Test on different screen sizes

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Check if backend is running and `NEXT_PUBLIC_API_URL` is set correctly
2. **Authentication Issues**: Clear browser cookies and try logging in again
3. **Search Not Working**: Check backend concept search endpoint
4. **Path Generation Fails**: Verify user authentication and concept IDs

### Debug Mode

Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG=true
```

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Add proper error handling
4. Test thoroughly before submitting changes
5. Update documentation for new features

## License

This project is part of the Masterly learning platform. 
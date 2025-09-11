# NEXA AI Frontend-Backend Integration

This document explains the complete integration between the NEXA AI frontend and backend systems.

## 🏗️ Architecture Overview

The frontend is now fully integrated with the ASKit backend API, providing a complete ChatGPT-like widget solution with RAG (Retrieval Augmented Generation) capabilities.

### Key Components

1. **Dashboard** - Main user interface showing websites, stats, and widgets
2. **Website Management** - CRUD operations for websites and crawling
3. **Widget Configuration** - Complete widget customization and management
4. **API Integration** - Comprehensive service layer for backend communication

## 🔗 API Integration

### Base Configuration
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Authentication
- JWT-based authentication with Bearer tokens
- Automatic token refresh and error handling
- Google OAuth integration support

### Available Services

#### User Service
- `getWebsites()` - Get user's websites with pagination
- `getWebsiteDetails(id)` - Get specific website details
- `addWebsite(data)` - Add new website for crawling
- `updateWebsite(id, data)` - Update website information
- `deleteWebsite(id)` - Delete website and associated data
- `getUserStats()` - Get user statistics

#### Crawling Service
- `startCrawl(options)` - Start website crawling with configuration
- `getJobStatus(jobId)` - Get crawling job status and progress
- `getQueueStats()` - Get queue statistics
- `clearQueue()` - Clear crawling queue

#### Widget Service
- `getWidgetConfig(websiteId)` - Get widget configuration
- `updateWidgetConfig(websiteId, config)` - Update widget settings
- `createWidget(websiteId)` - Create widget for website
- `regenerateApiKey(websiteId)` - Regenerate widget API key
- `getWidgetStats(websiteId)` - Get widget usage statistics
- `testWidget(websiteId, data)` - Test widget functionality

#### Widget Public API
- `sendChatMessage(data, apiKey)` - Send chat message to widget
- `getWidgetPublicConfig(apiKey)` - Get widget configuration for embedding
- `sendWidgetStats(data, apiKey)` - Send usage statistics
- `submitFeedback(data, apiKey)` - Submit user feedback

## 📱 User Interface Components

### Dashboard (`/dashboard`)
- **Real-time Statistics**: Shows total websites, active websites, widgets, and processing jobs
- **Website Management**: Table view with status, crawl progress, and actions
- **Quick Actions**: Easy access to chatbot and analytics features
- **Add Website Modal**: Form to add new websites with crawling options

### Website Detail (`/website/:websiteId`)
- **Overview Tab**: Website statistics and widget status
- **Crawl Details Tab**: Crawling configuration and exclude patterns
- **Actions Tab**: Re-crawl, download data, and danger zone actions
- **Progress Tracking**: Real-time crawl progress for active jobs

### Widget Configuration (`/widget/:websiteId/config`)
- **General Settings**: Basic widget configuration (title, messages, behavior)
- **Appearance**: Theme, colors, position, size, and visual settings
- **Advanced Settings**: Rate limits, session timeout, domain restrictions
- **Integration**: API key management and embed code generation
- **Analytics**: Widget usage statistics and performance metrics

## 🔧 Features Implemented

### ✅ Complete Backend Integration
- All Postman API endpoints integrated
- Comprehensive error handling with retry logic
- Automatic token management and refresh
- Real-time data updates with polling

### ✅ Website Management
- Add websites with crawling configuration
- View crawling progress in real-time
- Update website metadata
- Delete websites with confirmation
- Filter and pagination support

### ✅ Widget System
- Create widgets for websites
- Complete configuration interface
- Theme and appearance customization
- Rate limiting and security settings
- Domain restrictions
- API key management with regeneration
- Embed code generation

### ✅ Advanced Features
- Progress tracking for crawling jobs
- Real-time statistics and analytics
- Error boundaries and loading states
- Responsive design for all screen sizes
- Copy-to-clipboard functionality
- Form validation and user feedback

## 🚀 Getting Started

1. **Start the Backend Server**
   ```bash
   # Make sure your backend is running on http://localhost:3000
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Start the Frontend**
   ```bash
   npm run dev
   ```

4. **Test the Integration**
   - Register a new user account
   - Add a website for crawling
   - Create and configure a widget
   - Test the widget functionality

## 📊 Data Flow

1. **User Registration/Login** → JWT token stored → Dashboard access
2. **Add Website** → Crawling job started → Progress tracking → Completion
3. **Create Widget** → Configuration → API key generation → Embed code
4. **Widget Usage** → Public API calls → Statistics tracking → Analytics

## 🛠️ API Error Handling

The frontend includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Auto-redirect to login
- **Server Errors**: User-friendly error messages
- **Rate Limiting**: Proper handling of 429 responses
- **Validation Errors**: Form-level error display

## 🔒 Security Features

- JWT token-based authentication
- Automatic token cleanup on errors
- Domain-restricted widget access
- API key rotation capability
- CORS-ready configuration
- XSS protection in forms

## 📈 Monitoring & Analytics

The dashboard provides real-time monitoring of:
- Website crawling status and progress
- Widget performance and usage
- User engagement metrics
- System health indicators
- Queue status and job processing

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live progress tracking and status updates  
- **Interactive Forms**: Comprehensive validation and feedback
- **Loading States**: Spinners and progress indicators
- **Error States**: Graceful error handling with retry options
- **Empty States**: Helpful guidance for new users

## 🔄 Future Enhancements

- Real-time WebSocket connections for live updates
- Advanced analytics and reporting
- Bulk operations for websites and widgets
- A/B testing for widget configurations
- Multi-language support
- Dark/light theme toggle
- Export functionality for data and analytics

---

The frontend is now fully integrated with the backend API, providing a complete, production-ready solution for website chatbot management with AI-powered responses.

# Widget System API Documentation

## Overview
The Widget System enables website owners to embed intelligent chat widgets powered by their crawled content. The system consists of two main API groups: Widget Management (for configuration) and Widget API (for embedded functionality).

## Widget Management API
**Base URL**: `http://localhost:3000/widget`

### Authentication
All management endpoints require user authentication:
```
Authorization: Bearer <jwt_token>
```

---

## Widget Management Endpoints

### 1. Get Widget Configuration
Retrieve widget configuration for a specific website.

**Endpoint**: `GET /widget/website/:websiteId`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `websiteId`: MongoDB ObjectId of the website

**Success Response** (200):
```json
{
  "message": "Widget configuration retrieved successfully",
  "widget": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "websiteId": "64f5a1b2c3d4e5f6a7b8c9d2",
    "widgetId": "widget_abc123def456",
    "apiKey": "nexa_widget_789xyz123abc",
    "isActive": true,
    "config": {
      "theme": "auto",
      "primaryColor": "#8B5CF6",
      "position": "bottom-right",
      "size": "medium",
      "autoOpen": false,
      "showWelcomeMessage": true,
      "welcomeMessage": "Hello! How can I help you today?",
      "placeholder": "Type your question here...",
      "title": "NEXA Assistant",
      "subtitle": "Ask me anything about this website",
      "avatar": null,
      "showPoweredBy": true,
      "maxMessages": 50,
      "sessionTimeout": 1800,
      "allowFileUploads": false,
      "allowFeedback": true
    },
    "allowedDomains": ["example.com", "*.example.com"],
    "rateLimits": {
      "messagesPerMinute": 10,
      "messagesPerHour": 100
    },
    "stats": {
      "totalMessages": 245,
      "totalConversations": 89,
      "averageRating": 4.2,
      "totalRatings": 34
    },
    "embedCode": "<script src=\"https://widget.nexa.ai/widget.js\" data-widget-id=\"widget_abc123def456\" data-api-key=\"nexa_widget_789xyz123abc\"></script>",
    "scriptUrl": "https://widget.nexa.ai/widget.js?id=widget_abc123def456",
    "createdAt": "2025-09-11T08:30:00.000Z",
    "updatedAt": "2025-09-11T10:15:00.000Z"
  }
}
```

**Error Responses**:
```json
// 404 - Website not found
{
  "error": "Website not found",
  "message": "Website not found or you do not have permission to access it"
}

// 404 - Widget not found
{
  "error": "Widget not found",
  "message": "No widget configuration found for this website"
}
```

---

### 2. Update Widget Configuration
Update widget settings and appearance.

**Endpoint**: `PUT /widget/website/:websiteId`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "isActive": true,
  "allowedDomains": ["example.com", "*.example.com", "staging.example.com"],
  "config": {
    "theme": "dark",
    "primaryColor": "#FF6B6B",
    "position": "bottom-left",
    "size": "large",
    "autoOpen": true,
    "showWelcomeMessage": true,
    "welcomeMessage": "Welcome! I'm here to help you navigate our website.",
    "placeholder": "Ask me anything...",
    "title": "Help Assistant",
    "subtitle": "Powered by NEXA",
    "avatar": "https://example.com/avatar.png",
    "showPoweredBy": false,
    "maxMessages": 100,
    "sessionTimeout": 3600,
    "allowFileUploads": true,
    "allowFeedback": true
  },
  "rateLimits": {
    "messagesPerMinute": 15,
    "messagesPerHour": 200
  }
}
```

**Allowed Config Updates**:
- `theme`: `"light"`, `"dark"`, `"auto"`
- `primaryColor`: Valid hex color code
- `position`: `"bottom-right"`, `"bottom-left"`, `"top-right"`, `"top-left"`
- `size`: `"small"`, `"medium"`, `"large"`
- `autoOpen`: Boolean - automatically open widget on page load
- `showWelcomeMessage`: Boolean - show welcome message
- `welcomeMessage`: String (max 200 chars)
- `placeholder`: String (max 100 chars)
- `title`: String (max 50 chars)
- `subtitle`: String (max 100 chars)
- `avatar`: URL string or null
- `showPoweredBy`: Boolean - show "Powered by NEXA" branding
- `maxMessages`: Number (1-200) - max messages in conversation history
- `sessionTimeout`: Number (300-7200) - session timeout in seconds
- `allowFileUploads`: Boolean - enable file upload feature
- `allowFeedback`: Boolean - enable rating/feedback system

**Success Response** (200):
```json
{
  "message": "Widget configuration updated successfully",
  "widget": {
    // Updated widget object with embedCode and scriptUrl
  }
}
```

---

### 3. Create Widget for Website
Create a new widget for an existing completed website.

**Endpoint**: `POST /widget/website/:websiteId/create`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (201):
```json
{
  "message": "Widget created successfully",
  "widget": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "widgetId": "widget_new123abc456",
    "apiKey": "nexa_widget_456def789ghi",
    "embedCode": "<script src=\"https://widget.nexa.ai/widget.js\" data-widget-id=\"widget_new123abc456\" data-api-key=\"nexa_widget_456def789ghi\"></script>",
    "scriptUrl": "https://widget.nexa.ai/widget.js?id=widget_new123abc456",
    "config": {
      // Default configuration
    }
  }
}
```

**Error Responses**:
```json
// 400 - Website not ready
{
  "error": "Website not ready",
  "message": "Widget can only be created for completed websites"
}

// 409 - Widget already exists
{
  "error": "Widget already exists",
  "message": "A widget already exists for this website"
}
```

---

### 4. Regenerate Widget API Key
Generate a new API key for the widget (invalidates the old one).

**Endpoint**: `POST /widget/website/:websiteId/regenerate-key`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "message": "API key regenerated successfully",
  "apiKey": "nexa_widget_new789abc123def"
}
```

**⚠️ Important**: After regenerating, update the embed code on your website.

---

### 5. Get Widget Statistics
Retrieve analytics and usage statistics for the widget.

**Endpoint**: `GET /widget/website/:websiteId/stats`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "stats": {
    "totalMessages": 1247,
    "totalConversations": 234,
    "averageRating": 4.3,
    "totalRatings": 89,
    "messagesLast24h": 45,
    "conversationsLast24h": 12,
    "popularQuestions": [
      "How do I contact support?",
      "What are your business hours?",
      "How can I track my order?"
    ],
    "responseTime": {
      "average": 250,
      "median": 180
    },
    "satisfactionRate": 0.87
  },
  "website": {
    "url": "https://example.com",
    "domain": "example.com",
    "title": "Example Website"
  }
}
```

---

### 6. Test Widget Functionality
Test widget configuration and connectivity (development endpoint).

**Endpoint**: `POST /widget/website/:websiteId/test`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "message": "Test question for the widget"
}
```

**Success Response** (200):
```json
{
  "message": "Widget test successful",
  "config": {
    "title": "NEXA Assistant",
    "theme": "auto",
    "position": "bottom-right"
  },
  "testMessage": "Test question for the widget",
  "website": "https://example.com"
}
```

---

## Widget API (Embedded Functionality)
**Base URL**: `http://localhost:3000/widget`

### Authentication
Widget API uses API key authentication:
```
X-Widget-API-Key: nexa_widget_your_api_key_here
```

---

## Widget API Endpoints

### 1. Chat with Widget
Process user messages through the RAG system.

**Endpoint**: `POST /widget/chat`

**Headers**: 
- `X-Widget-API-Key: <widget_api_key>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "message": "What are your business hours?",
  "sessionId": "session_123abc456def",
  "websiteUrl": "https://example.com/contact",
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

**Success Response** (200):
```json
{
  "answer": "Our business hours are Monday through Friday from 9 AM to 6 PM EST. We're closed on weekends and major holidays.",
  "sources": [
    {
      "url": "https://example.com/contact",
      "title": "Contact Us - Example Website",
      "snippet": "Business hours: Monday-Friday 9 AM to 6 PM EST"
    },
    {
      "url": "https://example.com/support",
      "title": "Support Information",
      "snippet": "Our support team is available during regular business hours"
    }
  ],
  "sessionId": "session_123abc456def",
  "timestamp": "2025-09-11T10:30:05.000Z",
  "confidence": 0.95,
  "widget": {
    "title": "NEXA Assistant",
    "sessionTimeout": 1800
  }
}
```

**Error Responses**:
```json
// 400 - Missing message
{
  "error": "Message required",
  "message": "Please provide a message"
}

// 403 - Widget inactive
{
  "error": "Widget inactive",
  "message": "This chat widget is currently disabled"
}

// 503 - Service unavailable
{
  "error": "Service unavailable",
  "message": "The knowledge base is not ready yet. Please try again later."
}
```

---

### 2. Get Widget Configuration
Retrieve safe configuration for the embedded widget.

**Endpoint**: `GET /widget/config`

**Headers**: `X-Widget-API-Key: <widget_api_key>`

**Success Response** (200):
```json
{
  "config": {
    "title": "NEXA Assistant",
    "subtitle": "Ask me anything about this website",
    "theme": "auto",
    "primaryColor": "#8B5CF6",
    "position": "bottom-right",
    "size": "medium",
    "autoOpen": false,
    "showWelcomeMessage": true,
    "welcomeMessage": "Hello! How can I help you today?",
    "placeholder": "Type your question here...",
    "avatar": null,
    "showPoweredBy": true,
    "maxMessages": 50,
    "sessionTimeout": 1800,
    "allowFileUploads": false,
    "allowFeedback": true
  },
  "websiteInfo": {
    "domain": "example.com",
    "title": "Example Website"
  },
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

---

### 3. Submit Feedback
Allow users to rate and provide feedback on widget responses.

**Endpoint**: `POST /widget/feedback`

**Headers**: 
- `X-Widget-API-Key: <widget_api_key>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "rating": 4,
  "comment": "Very helpful response, thanks!",
  "sessionId": "session_123abc456def"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Thank you for your feedback!",
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

**Error Responses**:
```json
// 403 - Feedback disabled
{
  "error": "Feedback disabled",
  "message": "Feedback is not enabled for this widget"
}

// 400 - Invalid rating
{
  "error": "Invalid rating",
  "message": "Rating must be between 1 and 5"
}
```

---

### 4. Widget Analytics
Track widget usage and interactions.

**Endpoint**: `POST /widget/stats`

**Headers**: 
- `X-Widget-API-Key: <widget_api_key>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "sessionId": "session_123abc456def",
  "action": "conversation_started",
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

**Actions**: 
- `widget_opened`: Widget was displayed to user
- `conversation_started`: User initiated a conversation
- `message_sent`: User sent a message (tracked automatically in chat endpoint)

**Success Response** (200):
```json
{
  "success": true,
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

---

### 5. Widget Health Check
Verify widget connectivity and status.

**Endpoint**: `GET /widget/health`

**Headers**: `X-Widget-API-Key: <widget_api_key>`

**Success Response** (200):
```json
{
  "status": "ok",
  "widget": {
    "id": "widget_abc123def456",
    "domain": "example.com",
    "active": true
  },
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

---

## Widget Integration Guide

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- NEXA Widget Integration -->
    <script 
        src="https://widget.nexa.ai/widget.js" 
        data-widget-id="widget_abc123def456" 
        data-api-key="nexa_widget_789xyz123abc"
        data-theme="auto"
        data-position="bottom-right"
        async>
    </script>
</body>
</html>
```

### Advanced JavaScript Integration

```javascript
// Load widget dynamically
function loadNexaWidget() {
  const script = document.createElement('script');
  script.src = 'https://widget.nexa.ai/widget.js';
  script.setAttribute('data-widget-id', 'widget_abc123def456');
  script.setAttribute('data-api-key', 'nexa_widget_789xyz123abc');
  script.setAttribute('data-theme', 'dark');
  script.setAttribute('data-position', 'bottom-left');
  script.setAttribute('data-auto-open', 'true');
  script.async = true;
  document.head.appendChild(script);
}

// Initialize when page is ready
document.addEventListener('DOMContentLoaded', loadNexaWidget);

// Widget API interface
window.NexaWidget = {
  // Open widget programmatically
  open: () => window.postMessage({ type: 'NEXA_OPEN' }, '*'),
  
  // Close widget
  close: () => window.postMessage({ type: 'NEXA_CLOSE' }, '*'),
  
  // Send message programmatically
  sendMessage: (message) => window.postMessage({ 
    type: 'NEXA_SEND_MESSAGE', 
    message 
  }, '*'),
  
  // Listen to widget events
  onMessage: (callback) => {
    window.addEventListener('message', (event) => {
      if (event.data.type && event.data.type.startsWith('NEXA_')) {
        callback(event.data);
      }
    });
  }
};

// Usage examples
NexaWidget.onMessage((event) => {
  switch (event.type) {
    case 'NEXA_WIDGET_LOADED':
      console.log('NEXA Widget loaded successfully');
      break;
    case 'NEXA_CONVERSATION_STARTED':
      analytics.track('Widget Conversation Started');
      break;
    case 'NEXA_MESSAGE_SENT':
      analytics.track('Widget Message Sent', { message: event.message });
      break;
  }
});
```

### React Integration

```jsx
import { useEffect, useRef } from 'react';

const NexaWidget = ({ 
  widgetId, 
  apiKey, 
  theme = 'auto', 
  position = 'bottom-right' 
}) => {
  const scriptRef = useRef(null);

  useEffect(() => {
    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://widget.nexa.ai/widget.js';
    script.setAttribute('data-widget-id', widgetId);
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-position', position);
    script.async = true;
    
    document.head.appendChild(script);
    scriptRef.current = script;

    // Cleanup
    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [widgetId, apiKey, theme, position]);

  return null; // Widget is rendered by the script
};

// Usage
const App = () => {
  return (
    <div>
      {/* Your app content */}
      <NexaWidget 
        widgetId="widget_abc123def456"
        apiKey="nexa_widget_789xyz123abc"
        theme="dark"
        position="bottom-right"
      />
    </div>
  );
};
```

---

## Widget Customization

### Theme Customization
```css
/* Custom CSS for widget styling */
.nexa-widget {
  --nexa-primary-color: #8B5CF6;
  --nexa-secondary-color: #F3F4F6;
  --nexa-text-color: #1F2937;
  --nexa-border-radius: 12px;
  --nexa-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Dark theme overrides */
.nexa-widget[data-theme="dark"] {
  --nexa-primary-color: #A855F7;
  --nexa-secondary-color: #1F2937;
  --nexa-text-color: #F9FAFB;
}

/* Custom positioning */
.nexa-widget[data-position="bottom-right"] {
  bottom: 20px;
  right: 20px;
}

.nexa-widget[data-position="bottom-left"] {
  bottom: 20px;
  left: 20px;
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | `"auto"` | Widget theme: `light`, `dark`, `auto` |
| `primaryColor` | string | `"#8B5CF6"` | Primary color (hex) |
| `position` | string | `"bottom-right"` | Widget position on page |
| `size` | string | `"medium"` | Widget size: `small`, `medium`, `large` |
| `autoOpen` | boolean | `false` | Auto-open on page load |
| `showWelcomeMessage` | boolean | `true` | Show welcome message |
| `welcomeMessage` | string | `"Hello! How can I help you today?"` | Welcome message text |
| `placeholder` | string | `"Type your question here..."` | Input placeholder |
| `title` | string | `"NEXA Assistant"` | Widget title |
| `subtitle` | string | `"Ask me anything about this website"` | Widget subtitle |
| `avatar` | string/null | `null` | Avatar image URL |
| `showPoweredBy` | boolean | `true` | Show "Powered by NEXA" |
| `maxMessages` | number | `50` | Max conversation history |
| `sessionTimeout` | number | `1800` | Session timeout (seconds) |
| `allowFileUploads` | boolean | `false` | Enable file uploads |
| `allowFeedback` | boolean | `true` | Enable rating system |

---

## Security & Rate Limiting

### API Key Security
- **Keep API keys secure**: Never expose API keys in client-side code
- **Use HTTPS**: Always serve widgets over HTTPS
- **Domain restrictions**: Configure allowed domains in widget settings
- **Regular rotation**: Regenerate API keys periodically

### Rate Limits
Default rate limits per widget:
- **Messages per minute**: 10
- **Messages per hour**: 100
- **Conversations per day**: 50

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1694436660
```

### Error Handling
```javascript
// Robust error handling for widget API
async function sendWidgetMessage(message, sessionId) {
  try {
    const response = await fetch('/widget/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-API-Key': 'your_api_key_here'
      },
      body: JSON.stringify({
        message,
        sessionId,
        websiteUrl: window.location.href,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      } else if (response.status === 403) {
        throw new Error('Widget is currently disabled.');
      } else if (response.status === 503) {
        throw new Error('Service is temporarily unavailable.');
      } else {
        throw new Error('Failed to send message. Please try again.');
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Widget API error:', error);
    return {
      error: true,
      message: error.message || 'An unexpected error occurred.'
    };
  }
}
```

---

## Analytics & Monitoring

### Widget Analytics
Track important metrics:
```javascript
// Custom analytics integration
window.NexaWidget.onMessage((event) => {
  switch (event.type) {
    case 'NEXA_WIDGET_LOADED':
      gtag('event', 'widget_loaded', {
        widget_id: event.widgetId,
        website: window.location.hostname
      });
      break;
      
    case 'NEXA_CONVERSATION_STARTED':
      gtag('event', 'widget_conversation_started', {
        session_id: event.sessionId
      });
      break;
      
    case 'NEXA_MESSAGE_SENT':
      gtag('event', 'widget_message_sent', {
        message_length: event.message.length,
        session_id: event.sessionId
      });
      break;
      
    case 'NEXA_RESPONSE_RECEIVED':
      gtag('event', 'widget_response_received', {
        response_time: event.responseTime,
        confidence: event.confidence,
        sources_count: event.sources.length
      });
      break;
  }
});
```

### Performance Monitoring
```javascript
// Performance monitoring
const widgetPerformance = {
  loadTime: null,
  responseTime: null,
  
  measureLoadTime() {
    const startTime = performance.now();
    window.NexaWidget.onMessage((event) => {
      if (event.type === 'NEXA_WIDGET_LOADED') {
        this.loadTime = performance.now() - startTime;
        console.log(`Widget loaded in ${this.loadTime}ms`);
      }
    });
  },
  
  measureResponseTime(startTime) {
    return (responseTime) => {
      this.responseTime = responseTime - startTime;
      console.log(`Response received in ${this.responseTime}ms`);
    };
  }
};

widgetPerformance.measureLoadTime();
```

---

## Troubleshooting

### Common Issues

**1. Widget not loading**
```javascript
// Debug widget loading
console.log('Widget script loaded:', !!document.querySelector('[data-widget-id]'));
console.log('API key present:', document.querySelector('[data-api-key]')?.getAttribute('data-api-key'));
```

**2. API key errors**
```json
{
  "error": "Invalid API key",
  "message": "Widget API key is invalid or inactive"
}
```
**Solution**: Verify API key and regenerate if necessary

**3. CORS issues**
```javascript
// Enable CORS for widget domain
// Add to your server configuration
app.use(cors({
  origin: ['https://widget.nexa.ai', 'https://your-domain.com'],
  credentials: true
}));
```

**4. Rate limiting**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```
**Solution**: Implement proper rate limiting on client side

### Debug Mode
Enable widget debug mode:
```html
<script 
    src="https://widget.nexa.ai/widget.js" 
    data-widget-id="your_widget_id"
    data-api-key="your_api_key"
    data-debug="true">
</script>
```

---

## Best Practices

### 1. Performance Optimization
- Load widget asynchronously
- Lazy load widget content
- Minimize API calls
- Cache configuration data

### 2. User Experience
- Provide clear error messages
- Show loading states
- Implement proper fallbacks
- Test on mobile devices

### 3. Security
- Never expose API keys in client code
- Implement proper domain validation
- Use HTTPS everywhere
- Monitor for suspicious activity

### 4. Accessibility
- Ensure keyboard navigation
- Provide proper ARIA labels
- Support screen readers
- Test with assistive technologies

---

**Last Updated**: September 2025  
**API Version**: 1.0.0

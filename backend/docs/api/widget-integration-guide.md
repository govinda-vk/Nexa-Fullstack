# Widget Integration Guide for Frontend Developers

## Overview

This guide explains how NEXA's AI chat widgets are automatically created after website scraping and how to integrate them into client websites. The widget system provides an embeddable chat interface powered by the website's crawled content.

## Table of Contents

1. [Automatic Widget Creation Process](#automatic-widget-creation-process)
2. [API Routes & Responses](#api-routes--responses)
3. [Widget Integration](#widget-integration)
4. [Configuration Options](#configuration-options)
5. [Error Handling](#error-handling)
6. [Testing & Debugging](#testing--debugging)
7. [Production Considerations](#production-considerations)

---

## Automatic Widget Creation Process

### Flow Overview

```
Website Submission → Crawling → Content Processing → Widget Auto-Creation → Ready for Embed
```

### Step-by-Step Process

1. **Website Ingestion**: User submits website URL via `/ingest` endpoint
2. **Background Processing**: System crawls, processes, and vectorizes website content
3. **Automatic Widget Creation**: Upon successful completion, a widget is automatically created
4. **Widget Availability**: Widget becomes immediately available for embedding

### Timeline

- **Typical Duration**: 2-5 minutes for small websites (1-10 pages)
- **Status Tracking**: Monitor via websocket or polling the website status endpoint
- **Widget Ready**: When website status becomes `'completed'`, widget is automatically available

---

## API Routes & Responses

### Base URL
```
Production: https://api.nexa.ai
Development: http://localhost:3000
```

### Authentication
All management endpoints require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

---

### 1. Get Widget Configuration

**Endpoint**: `GET /widget/website/:websiteId`

**Purpose**: Retrieve widget details for a completed website

**Request**:
```bash
curl -X GET "http://localhost:3000/widget/website/64f5a1b2c3d4e5f6a7b8c9d2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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
    
    // 🎯 INTEGRATION CODE - Use these fields
    "embedCode": "<script src=\"http://localhost:3000/widget/widget_abc123def456/script.js\"></script>",
    "scriptUrl": "http://localhost:3000/widget/widget_abc123def456/script.js",
    
    // Configuration
    "config": {
      "theme": "auto",
      "primaryColor": "#8B5CF6",
      "position": "bottom-right",
      "size": "medium",
      "autoOpen": false,
      "showWelcomeMessage": true,
      "welcomeMessage": "Hello! How can I help you today?",
      "placeholder": "Type your message...",
      "title": "example.com Assistant",
      "subtitle": "AI-powered support",
      "avatar": null,
      "showPoweredBy": true,
      "maxMessages": 100,
      "sessionTimeout": 30,
      "allowFileUploads": false,
      "allowFeedback": true
    },
    
    // Access Control
    "allowedDomains": [],
    
    // Rate Limiting
    "rateLimits": {
      "messagesPerMinute": 10,
      "messagesPerHour": 100
    },
    
    // Analytics
    "stats": {
      "totalMessages": 0,
      "totalConversations": 0,
      "averageRating": 0,
      "totalRatings": 0
    },
    
    "createdAt": "2025-09-11T08:30:00.000Z",
    "updatedAt": "2025-09-11T08:30:00.000Z"
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

// 404 - Widget not found (website not processed yet)
{
  "error": "Widget not found", 
  "message": "No widget configuration found for this website"
}
```

---

### 2. Manual Widget Creation (Optional)

**Endpoint**: `POST /widget/website/:websiteId/create`

**Purpose**: Manually create widget if automatic creation failed

**Request**:
```bash
curl -X POST "http://localhost:3000/widget/website/64f5a1b2c3d4e5f6a7b8c9d2/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (201):
```json
{
  "message": "Widget created successfully",
  "widget": {
    // Same structure as GET response above
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

### 3. Update Widget Configuration

**Endpoint**: `PUT /widget/website/:websiteId`

**Purpose**: Customize widget appearance and behavior

**Request**:
```bash
curl -X PUT "http://localhost:3000/widget/website/64f5a1b2c3d4e5f6a7b8c9d2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "theme": "dark",
      "primaryColor": "#FF6B6B",
      "position": "bottom-left",
      "title": "Custom Help Assistant",
      "welcomeMessage": "Welcome! How can I assist you today?"
    }
  }'
```

---

### 4. Widget Script Endpoint (Public)

**Endpoint**: `GET /widget/:widgetId/script.js`

**Purpose**: Serves the actual widget JavaScript (no authentication required)

**CORS Headers**: Fully configured for cross-origin embedding

**Example**: `http://localhost:3000/widget/widget_abc123def456/script.js`

---

### 5. Widget Chat API (Public)

**Endpoint**: `POST /api/widget/:widgetId/chat`

**Purpose**: Handle chat messages from embedded widgets

**Request**:
```json
{
  "message": "What are your business hours?",
  "sessionId": "session_abc123_1694418600000"
}
```

**Response**:
```json
{
  "answer": "Our business hours are Monday through Friday, 9 AM to 6 PM EST.",
  "sources": [
    {
      "url": "https://example.com/contact",
      "textPreview": "Business hours: Monday through Friday..."
    }
  ],
  "sessionId": "session_abc123_1694418600000",
  "timestamp": "2025-09-11T10:30:00.000Z",
  "confidence": 0.95
}
```

---

## Widget Integration

### Method 1: Embed Code (Recommended)

Copy the `embedCode` field from the API response and paste it into your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    
    <main>
        <p>Website content here...</p>
    </main>

    <!-- 🎯 NEXA Widget Integration - Place before closing </body> tag -->
    <script src="http://localhost:3000/widget/widget_abc123def456/script.js"></script>
</body>
</html>
```

### Method 2: Direct Script Include

Alternative approach using the `scriptUrl`:

```html
<script src="http://localhost:3000/widget/widget_abc123def456/script.js" async></script>
```

### Method 3: Dynamic Loading (React/Vue/Angular)

For SPAs, load the widget programmatically:

```javascript
// React useEffect, Vue mounted, Angular ngOnInit
function loadNexaWidget(scriptUrl) {
  const script = document.createElement('script');
  script.src = scriptUrl;
  script.async = true;
  script.onload = () => console.log('NEXA Widget loaded');
  script.onerror = () => console.error('Failed to load NEXA Widget');
  document.head.appendChild(script);
}

// Usage
loadNexaWidget('http://localhost:3000/widget/widget_abc123def456/script.js');
```

### React Component Example

```jsx
import { useEffect, useState } from 'react';

function NexaWidget({ websiteId }) {
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWidget() {
      try {
        const response = await fetch(`/widget/website/${websiteId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWidget(data.widget);
          
          // Load widget script
          const script = document.createElement('script');
          script.src = data.widget.scriptUrl;
          script.async = true;
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error('Failed to load widget:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWidget();
  }, [websiteId]);

  if (loading) return <div>Loading chat widget...</div>;
  if (!widget) return <div>Chat widget unavailable</div>;

  return (
    <div className="widget-container">
      {/* Widget loads automatically via script */}
      <div className="widget-info">
        <p>Chat Assistant: {widget.config.title}</p>
        <p>Status: {widget.isActive ? 'Active' : 'Inactive'}</p>
      </div>
    </div>
  );
}
```

---

## Configuration Options

### Appearance Settings

```json
{
  "theme": "auto",           // "light" | "dark" | "auto"
  "primaryColor": "#8B5CF6", // Any valid CSS color
  "position": "bottom-right", // "bottom-right" | "bottom-left" | "top-right" | "top-left"
  "size": "medium"           // "small" | "medium" | "large"
}
```

### Behavior Settings

```json
{
  "autoOpen": false,                    // Auto-open on page load
  "showWelcomeMessage": true,
  "welcomeMessage": "Custom greeting",
  "placeholder": "Ask me anything...",
  "maxMessages": 100,                   // Messages per session
  "sessionTimeout": 30                  // Minutes
}
```

### Branding Settings

```json
{
  "title": "Custom Assistant",
  "subtitle": "Powered by AI",
  "avatar": "https://example.com/avatar.png",
  "showPoweredBy": true                 // Show "Powered by NEXA"
}
```

### Access Control

```json
{
  "allowedDomains": [
    "mywebsite.com",
    "*.mywebsite.com",
    "staging.mywebsite.com"
  ]
}
```

---

## Error Handling

### Common Scenarios

1. **Widget Not Found**: Website hasn't finished processing
2. **Widget Inactive**: Widget was disabled by user
3. **Domain Restricted**: Widget not allowed on current domain
4. **Rate Limited**: Too many messages sent

### Implementation

```javascript
// Check if widget loaded successfully
window.addEventListener('nexaWidgetLoaded', function(e) {
  console.log('Widget loaded successfully:', e.detail);
});

window.addEventListener('nexaWidgetError', function(e) {
  console.error('Widget error:', e.detail);
  // Show fallback contact form or support email
});

// Fallback for script loading errors
function loadWidgetWithFallback(scriptUrl) {
  const script = document.createElement('script');
  script.src = scriptUrl;
  script.async = true;
  
  script.onload = () => {
    console.log('✅ NEXA Widget loaded successfully');
  };
  
  script.onerror = () => {
    console.error('❌ Failed to load NEXA Widget');
    // Show fallback UI
    showFallbackSupport();
  };
  
  document.head.appendChild(script);
}

function showFallbackSupport() {
  // Display alternative contact methods
  const fallback = document.createElement('div');
  fallback.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; 
                background: #f3f4f6; padding: 15px; border-radius: 8px;">
      <p>Chat temporarily unavailable</p>
      <a href="mailto:support@example.com">Contact Support</a>
    </div>
  `;
  document.body.appendChild(fallback);
}
```

---

## Testing & Debugging

### Development Checklist

- [ ] Website crawling completed successfully
- [ ] Widget API returns valid configuration
- [ ] Embed code copied correctly
- [ ] Script loads without CORS errors
- [ ] Widget appears on page
- [ ] Chat functionality works
- [ ] Responses are relevant to website content

### Debug Tools

```javascript
// Check if widget is loaded
console.log('NEXA Widget:', window.NexaWidget);

// Get widget configuration
fetch('/widget/website/YOUR_WEBSITE_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(data => console.log('Widget config:', data));

// Test widget endpoint directly
console.log('Widget script URL:', 'http://localhost:3000/widget/WIDGET_ID/script.js');
```

### Browser Console Debugging

```javascript
// Monitor widget events
window.addEventListener('nexaWidgetEvent', function(e) {
  console.log('Widget event:', e.detail);
});

// Check widget status
if (window.NexaWidget) {
  console.log('Widget status:', window.NexaWidget.getStatus());
}
```

---

## Production Considerations

### Performance

- Widget script loads asynchronously (non-blocking)
- Cached for 1 hour (`Cache-Control: public, max-age=3600`)
- Minimal impact on page load times

### Security

- CORS headers properly configured
- API key authentication for chat endpoint
- Domain restrictions available
- Rate limiting enforced

### SEO Impact

- Zero impact on SEO (JavaScript only)
- No additional HTML in page source
- Loads after initial page render

### Browser Compatibility

- Modern browsers (ES6+ support required)
- Mobile responsive design
- Touch-friendly interface

### Monitoring

```javascript
// Track widget usage
window.addEventListener('nexaWidgetMessage', function(e) {
  // Send analytics event
  gtag('event', 'widget_message', {
    'widget_id': e.detail.widgetId,
    'message_count': e.detail.messageCount
  });
});
```

---

## Quick Reference

### Essential Fields from API Response

```javascript
const response = await fetch('/widget/website/WEBSITE_ID');
const { widget } = await response.json();

// 🎯 Use these for integration:
widget.embedCode    // Ready-to-paste HTML snippet
widget.scriptUrl    // Direct script URL
widget.isActive     // Widget status
widget.config       // Appearance & behavior settings
```

### Minimal Integration

```html
<!-- Paste this anywhere in your HTML -->
<script>/* EMBED_CODE_FROM_API_RESPONSE */</script>
```

### Support

- **Documentation**: Full API docs at `/docs/api/`
- **Testing**: Use Postman collection for API testing
- **Issues**: Check widget console logs and API responses

---

*This guide covers the complete widget integration process. For additional customization options or advanced use cases, refer to the full API documentation.*

# ASKit Backend Documentation

Welcome to the comprehensive documentation for ASKit Backend - a powerful RAG (Retrieval-Augmented Generation) system that enables website owners to create intelligent chatbots for their websites.

## 📚 Table of Contents

### API Documentation
- [Authentication API](./api/authentication.md) - User registration, login, OAuth, and profile management
- [User Management API](./api/user-management.md) - Website management and user operations
- [Widget API](./api/widget-api.md) - Widget configuration and embedded chat functionality
- [Core API](./api/core-api.md) - Content ingestion and RAG query endpoints

### Database Models
- [Models Overview](./models/models-overview.md) - Complete database schema documentation including User, Website, and Widget models

### Core Features
- [Core Features](./features/core-features.md) - Comprehensive guide to RAG system, web crawling, embeddings, vector database, and job queue implementation

### Utilities & Middleware
- [Utilities Overview](./utilities/utilities-overview.md) - Authentication middleware, rate limiting, SSRF protection, configuration management, and security utilities

### Setup & Deployment Guides
- [Installation & Setup](./guides/setup.md) - Complete development environment setup and configuration
- [Deployment Guide](./guides/deployment.md) - Production deployment strategies, Docker, cloud platforms, and monitoring
- [API Testing Guide](./guides/api-testing.md) - Comprehensive testing strategies, tools, unit tests, integration tests, and load testing

### Developer Resources
- [Postman Collection](./postman/README.md) - Complete API testing collection with 35+ endpoints, environment setup, and usage guide
- [Collection File](./postman/askit-backend.postman_collection.json) - Ready-to-import Postman collection
- [Environment File](./postman/askit-backend.postman_environment.json) - Pre-configured environment variables

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/webcrafter011/Nexa-backend.git
   cd askit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

ASKit Backend is built with:
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **Pinecone** - Vector database for embeddings
- **BullMQ & Redis** - Job queue system
- **Passport.js** - Authentication (Local & Google OAuth)
- **JWT** - Stateless authentication
- **Puppeteer** - Web scraping
- **OpenAI API** - Embeddings and completions

## 📊 Key Features

### 🔐 Authentication System
- Email/password registration and login
- Google OAuth integration
- JWT-based stateless authentication
- User profile management
- Secure password handling with bcrypt

### 🌐 Website Management
- Intelligent web crawling
- Content chunking and processing
- Vector embeddings generation
- Website status tracking
- Metadata extraction

### 💬 Widget System
- Embeddable chat widgets
- Customizable themes and styling
- Domain-based access control
- Real-time conversation handling
- Performance analytics

### 🤖 RAG Implementation
- Context-aware question answering
- Semantic search with vector similarity
- Content relevance ranking
- Streaming responses
- Conversation history

### ⚡ Performance & Scalability
- Background job processing
- Rate limiting and abuse prevention
- SSRF protection
- Efficient caching strategies
- Horizontal scaling support

## 🔗 Related Resources

- [Frontend Repository](https://github.com/webcrafter011/askit-frontend)
- [Widget Library](https://github.com/webcrafter011/askit-widget)
- [API Reference](https://api.askit.io/docs)
- [Live Demo](https://askit.io)

## 📞 Support

For support and questions:
- 📧 Email: support@askit.io
- 💬 Discord: [Join our community](https://discord.gg/askit)
- 📚 Docs: [Documentation site](https://docs.askit.io)
- 🐛 Issues: [GitHub Issues](https://github.com/webcrafter011/Nexa-backend/issues)

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**License**: ISC

# ASKit Backend API

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white)](https://pinecone.io/)

A powerful **Retrieval-Augmented Generation (RAG)** backend system that enables website owners to create intelligent AI chatbots for their websites. ASKit automatically crawls, processes, and indexes website content to provide contextually accurate answers to user queries through an embeddable widget.

## 🚀 Features

### 🧠 **RAG System**
- **Intelligent Content Processing**: Automatically crawls and chunks website content
- **Vector Embeddings**: Converts content into high-dimensional vectors using Google's Generative AI
- **Semantic Search**: Retrieves relevant content based on semantic similarity
- **AI-Powered Responses**: Generates contextually accurate answers using Google's Gemini API

### 🌐 **Website Management**
- **Multi-Website Support**: Manage multiple websites per user account
- **Automated Crawling**: Intelligent web crawler with robots.txt compliance
- **Content Chunking**: Smart text segmentation for optimal embedding performance
- **Real-time Processing**: Background job queue for efficient content ingestion

### 🛡️ **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Easy sign-in with Google accounts
- **Rate Limiting**: Configurable API rate limiting
- **SSRF Protection**: Advanced Server-Side Request Forgery protection
- **Input Validation**: Comprehensive request validation and sanitization

### 📊 **Widget System**
- **Embeddable Chat Widget**: Easy-to-integrate JavaScript widget for any website
- **Customizable UI**: Configurable appearance and behavior
- **Real-time Responses**: Fast, contextual answers from indexed content
- **Analytics Ready**: Built-in usage tracking and monitoring

### ⚡ **Performance & Scalability**
- **Redis Caching**: High-performance caching layer
- **Background Jobs**: Asynchronous processing with BullMQ
- **Vector Database**: Pinecone for lightning-fast similarity search
- **Optimized Queries**: Efficient database operations and indexing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Crawler   │    │   Job Queue     │    │  Vector Store   │
│   (Puppeteer)   │───▶│   (BullMQ)      │───▶│   (Pinecone)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content       │    │   Embeddings    │    │   RAG System    │
│   Processing    │───▶│   Generation    │───▶│   (Gemini AI)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Redis Cache   │    │   Express API   │
│   (Database)    │    │   (Session)     │    │   (REST API)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js | JavaScript runtime environment |
| **Framework** | Express.js | Web application framework |
| **Database** | MongoDB | Primary data storage |
| **Cache** | Redis | Session storage and caching |
| **Vector DB** | Pinecone | Vector similarity search |
| **Queue** | BullMQ | Background job processing |
| **AI/ML** | Google Generative AI | Embeddings and text generation |
| **Web Scraping** | Puppeteer | Dynamic content crawling |
| **Authentication** | Passport.js | OAuth and JWT authentication |
| **Security** | Helmet.js | Security headers and protection |

## 📦 Installation

### Prerequisites

- **Node.js** >= 16.0.0
- **MongoDB** >= 5.0
- **Redis** >= 6.0
- **Google Cloud API Key** (for Generative AI)
- **Pinecone API Key** (for vector database)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/webcrafter011/Nexa-backend.git
   cd askit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/askit
   REDIS_URL=redis://localhost:6379
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-session-secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # AI Services
   GOOGLE_API_KEY=your-google-generative-ai-key
   
   # Vector Database
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=your-pinecone-environment
   PINECONE_INDEX_NAME=your-index-name
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 🚀 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/google` | Google OAuth login |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/profile` | Get user profile |

### Website Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/websites` | Add website |
| `GET` | `/api/user/websites` | List user websites |
| `DELETE` | `/api/user/websites/:id` | Delete website |
| `POST` | `/api/user/websites/:id/crawl` | Start crawling |

### Widget API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/widgets` | Create widget |
| `GET` | `/api/widgets` | List widgets |
| `PUT` | `/api/widgets/:id` | Update widget |
| `DELETE` | `/api/widgets/:id` | Delete widget |
| `POST` | `/api/widget/query` | Query widget (public) |

### RAG System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rag/query` | Ask question |
| `POST` | `/api/ingest` | Manual content ingestion |
| `GET` | `/api/jobs/stats` | Queue statistics |

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load tests
npm run test:load
```

### API Testing with Postman
Import the provided Postman collection:
- Collection: `docs/postman/askit-backend.postman_collection.json`
- Environment: `docs/postman/askit-backend.postman_environment.json`

### Manual Testing
```bash
# Test server endpoint
npm run test-frontend
```

## 📊 Monitoring & Logging

### Health Check
```bash
GET /api/health
```

### Queue Monitoring
```bash
GET /api/jobs/stats
```

### Logs
- Application logs: `morgan` middleware for HTTP logging
- Error logs: Centralized error handling with detailed stack traces
- Job logs: BullMQ job status and processing logs

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `GOOGLE_API_KEY` | Google Generative AI API key | Required |
| `PINECONE_API_KEY` | Pinecone API key | Required |

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable in `src/utils/rateLimit.js`

### CORS Configuration
- Configurable origins in `src/server.js`
- Default: Allows all origins in development

## 📁 Project Structure

```
askit-backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.js     # MongoDB configuration
│   │   └── passport.js     # Authentication strategies
│   ├── jobs/               # Background job processing
│   │   ├── ingestProducer.js
│   │   └── ingestWorker.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # Database models
│   │   ├── User.js
│   │   ├── Website.js
│   │   └── Widget.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── widget.js
│   │   └── widgetApi.js
│   ├── utils/              # Utility functions
│   │   ├── rateLimit.js
│   │   ├── ssrf.js
│   │   ├── userWebsite.js
│   │   └── widgetScript.js
│   ├── chunker.js          # Content chunking logic
│   ├── crawler.js          # Web crawling engine
│   ├── embeddings.js       # Embedding generation
│   ├── rag.js              # RAG system core
│   ├── server.js           # Main application entry
│   └── vectordb.js         # Vector database operations
├── docs/                   # Comprehensive documentation
└── package.json
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable request rate limiting
- **SSRF Protection**: Advanced URL validation to prevent SSRF attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers and protections
- **Session Security**: Secure session management with Redis

## 🚢 Deployment

### Docker Deployment
```bash
# Build image
docker build -t askit-backend .

# Run with docker-compose
docker-compose up -d
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB instance
- [ ] Set up Redis cluster
- [ ] Configure Pinecone production index
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (nginx)
- [ ] Configure environment variables
- [ ] Set up automated backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API Documentation](docs/api/)** - Complete API reference
- **[Setup Guide](docs/guides/setup.md)** - Development environment setup
- **[Deployment Guide](docs/guides/deployment.md)** - Production deployment
- **[Testing Guide](docs/guides/api-testing.md)** - Testing strategies
- **[Core Features](docs/features/core-features.md)** - RAG system details
- **[Database Models](docs/models/models-overview.md)** - Database schema
- **[Postman Collection](docs/postman/README.md)** - API testing collection

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**webcrafter011** - [GitHub Profile](https://github.com/webcrafter011)

## 🆘 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: [GitHub Issues](https://github.com/webcrafter011/Nexa-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/webcrafter011/Nexa-backend/discussions)

## 🎯 Roadmap

- [ ] **Frontend Dashboard**: React-based admin dashboard
- [ ] **Analytics**: Advanced usage analytics and insights
- [ ] **Multi-language Support**: Internationalization support
- [ ] **Custom AI Models**: Support for custom embedding models
- [ ] **Enterprise Features**: SSO, advanced security, audit logs
- [ ] **Mobile App**: Native mobile application
- [ ] **Webhook Support**: Real-time notifications and integrations

---

<div align="center">

**[⭐ Star this repository](https://github.com/webcrafter011/Nexa-backend)** if you find it helpful!

Made with ❤️ by [webcrafter011](https://github.com/webcrafter011)

</div>

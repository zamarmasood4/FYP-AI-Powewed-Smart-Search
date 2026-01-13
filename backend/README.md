# AI-Powered Smart Search & Recommendation System - Backend

This project implements a hybrid backend architecture for an AI-powered smart search and recommendation system. The system consists of two main servers: an Express.js server for handling API requests and web scraping, and a Flask server for AI/ML tasks including BERT-based recommendations.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Server │    │  Flask Server   │
│                 │◄──►│                 │◄──►│                 │
│  - User Interface│    │  - Authentication│    │  - BERT Models  │
│  - Search UI    │    │  - Web Scraping │    │  - Recommendations│
│  - Results      │    │  - NLP Processing│    │  - ML Pipeline  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Supabase DB   │
                       │                 │
                       │  - User Data    │
                       │  - Search History│
                       │  - Item Data    │
                       │  - Embeddings   │
                       └─────────────────┘
```

## Features

### Express.js Server (Port 3000)
- **Authentication**: Supabase-based user authentication (signup/login)
- **Web Scraping**: Intelligent web scraping based on user queries
- **NLP Processing**: Query understanding and semantic analysis
- **API Management**: RESTful API endpoints for frontend communication
- **Data Management**: CRUD operations with Supabase database

### Flask Server (Port 5000)
- **BERT-based Recommendations**: Advanced recommendation system using BERT embeddings
- **Machine Learning Pipeline**: Processing and generating recommendations
- **Similarity Search**: Vector-based similarity search using pgvector
- **Model Management**: Loading and caching of ML models

### Database (Supabase)
- **PostgreSQL with pgvector**: Vector similarity search capabilities
- **User Management**: Authentication and user profiles
- **Search History**: Tracking user search patterns
- **Item Storage**: Storing scraped data and embeddings
- **Recommendations Cache**: Caching recommendation results

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Supabase account and project

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install Express server dependencies
cd express-server
npm install

# Install Flask server dependencies
cd ../flask-server
pip install -r requirements.txt
```

### 2. Environment Configuration

#### Express Server (.env)
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your Supabase credentials
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
PORT=3000
NODE_ENV=development
FLASK_SERVER_URL=http://localhost:5000
```

#### Flask Server (.env)
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key-here
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Enable the pgvector extension in your Supabase project

### 4. Start the Servers

#### Terminal 1 - Express Server
```bash
cd express-server
npm run dev
```

#### Terminal 2 - Flask Server
```bash
cd flask-server
python app.py
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
  },
  "session": { ... }
}
```

#### POST /api/auth/signin
Login an existing user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### GET /api/auth/me
Get current user information.

### Search Endpoints

#### POST /api/search
Perform intelligent search with web scraping.

**Request Body:**
```json
{
  "query": "best wireless headphones under $100",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "originalQuery": "best wireless headphones under $100",
  "processedQuery": {
    "entities": { ... },
    "keyTerms": ["wireless", "headphone", "best"],
    "categories": ["ecommerce"]
  },
  "results": [
    {
      "title": "Sony WH-CH720N Wireless Headphones",
      "price": "$99.99",
      "image": "https://...",
      "link": "https://amazon.com/...",
      "source": "Amazon",
      "type": "product"
    }
  ],
  "totalResults": 10
}
```

### Recommendation Endpoints

#### POST /api/recommendations
Get personalized recommendations.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "query": "gaming accessories",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "item-uuid",
      "title": "Mechanical Gaming Keyboard",
      "description": "RGB mechanical keyboard...",
      "category": "electronics",
      "price": 149.99,
      "similarity_score": 0.85,
      "recommendation_type": "bert_similarity"
    }
  ],
  "totalRecommendations": 10
}
```

#### GET /api/recommendations/trending
Get trending recommendations.

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 10)

## Development

### Project Structure

```
backend/
├── express-server/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── searchController.js
│   │   │   └── recommendationController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── search.js
│   │   │   └── recommendations.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── flask-server/
│   ├── models/
│   │   └── recommendation_model.py
│   ├── routes/
│   │   ├── health.py
│   │   └── recommendations.py
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── .env
├── database/
│   └── schema.sql
└── README.md
```

### Key Technologies

- **Express.js**: Web framework for Node.js
- **Flask**: Python web framework
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **BERT/Sentence Transformers**: Natural language processing
- **Puppeteer**: Web scraping
- **Cheerio**: HTML parsing
- **Natural**: NLP utilities
- **pgvector**: Vector similarity search

### Adding New Scraping Sources

1. Create a new scraping function in `searchController.js`
2. Add the function to the appropriate category in `performWebScraping()`
3. Update the NLP categorization in `categorizeQuery()`

### Extending the Recommendation System

1. Modify the `RecommendationModel` class in `models/recommendation_model.py`
2. Add new recommendation strategies
3. Update the API endpoints in `routes/recommendations.py`

## Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- Supabase credentials
- Flask secret key
- Database URLs
- API keys for external services

### Production Considerations

- Use a process manager like PM2 for Node.js
- Use Gunicorn for Flask in production
- Set up proper logging and monitoring
- Configure rate limiting
- Use HTTPS in production
- Set up database backups

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

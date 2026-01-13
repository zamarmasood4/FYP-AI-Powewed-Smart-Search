# Setup Guide - AI-Powered Smart Search & Recommendation System

This guide will help you set up the complete backend system with Express.js and Flask servers.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## Quick Setup (Windows)

### 1. Install Dependencies
```bash
# Run the installation script
install-dependencies.bat
```

### 2. Configure Environment Variables

#### Express Server Configuration
```bash
# Copy the example file
copy express-server\env.example express-server\.env

# Edit express-server\.env with your Supabase credentials
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### Flask Server Configuration
```bash
# Copy the example file
copy flask-server\env.example flask-server\.env

# Edit flask-server\.env (optional - defaults are provided)
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key-here
```

### 3. Set Up Supabase Database

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created

2. **Run the database schema:**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Copy the contents of `database/schema.sql`
   - Paste and run the SQL script

3. **Enable pgvector extension:**
   - In the SQL Editor, run: `CREATE EXTENSION IF NOT EXISTS vector;`
   - This enables vector similarity search capabilities

4. **Get your Supabase credentials:**
   - Go to "Settings" → "API"
   - Copy the "Project URL" and "anon public" key
   - For service role key, copy the "service_role" key (keep this secret!)

### 4. Start the Servers

```bash
# Start both servers
start-servers.bat
```

This will start:
- Express Server on http://localhost:3000
- Flask Server on http://localhost:5000

### 5. Test the System

```bash
# Run the test script
node test-api.js
```

## Manual Setup (All Platforms)

### 1. Install Express Server Dependencies
```bash
cd express-server
npm install
```

### 2. Install Flask Server Dependencies
```bash
cd flask-server
pip install -r requirements.txt
```

### 3. Install Test Dependencies
```bash
# In the root directory
npm install axios
```

### 4. Configure Environment Variables

Create `.env` files in both server directories with the appropriate values.

### 5. Start Servers Manually

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

## Verification

### Health Checks
- Express Server: http://localhost:3000/health
- Flask Server: http://localhost:5000/health

### API Endpoints
- Authentication: http://localhost:3000/api/auth/signup
- Search: http://localhost:3000/api/search
- Recommendations: http://localhost:3000/api/recommendations

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes using ports 3000 and 5000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

#### 2. Python Dependencies Issues
```bash
# Create a virtual environment
python -m venv venv

# Activate it
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Node.js Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check if your Supabase project is active
- Ensure the database schema has been applied
- Check your internet connection

#### 5. Flask Server Not Starting
- Check if Python is installed correctly
- Verify all dependencies are installed
- Check the Flask server logs for specific errors
- Ensure port 5000 is available

### Logs and Debugging

#### Express Server Logs
The Express server will show detailed logs in the console, including:
- Server startup information
- API request logs
- Error messages

#### Flask Server Logs
The Flask server will show:
- Model loading progress
- Recommendation processing logs
- Error messages

### Performance Optimization

#### For Development
- Use `npm run dev` for Express (with nodemon)
- Use `python app.py` for Flask (with debug mode)

#### For Production
- Use PM2 for Node.js: `pm2 start src/server.js`
- Use Gunicorn for Flask: `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
- Set `NODE_ENV=production` and `FLASK_ENV=production`

## Next Steps

1. **Test the API endpoints** using the provided test script
2. **Integrate with your frontend** using the API endpoints
3. **Customize the scraping sources** in `searchController.js`
4. **Fine-tune the recommendation model** in `recommendation_model.py`
5. **Add more data sources** to improve recommendations

## Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that Supabase is properly configured
5. Run the test script to identify specific issues

For additional help, refer to the main README.md file or create an issue in the repository.

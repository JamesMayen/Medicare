# Backend Deployment Guide

This guide provides step-by-step instructions for deploying the Medicare backend to various cloud platforms.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git repository

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure the following environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=https://your-frontend-domain.com
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Deploy to Render

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up

2. **Connect GitHub Repository**
   - Connect your GitHub account
   - Select the Medicare repository

3. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure build settings:
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

4. **Environment Variables**
   - Add all environment variables from your `.env` file
   - Set `NODE_ENV=production`

5. **Database Setup**
   - Use MongoDB Atlas for database
   - Add `MONGO_URI` environment variable

6. **Deploy**
   - Render will automatically deploy on git push

### Option 2: Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **Create Project**
   - Click "New Project"
   - Connect GitHub repository

3. **Configure Environment**
   - Add environment variables
   - Railway auto-detects Node.js projects

4. **Database**
   - Add MongoDB plugin or use external MongoDB Atlas

5. **Deploy**
   - Automatic deployment on git push

### Option 3: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create medicare-backend
   ```

3. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret
   heroku config:set MONGO_URI=your_mongodb_uri
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## Database Configuration

### MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create cluster
3. Create database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string and update `MONGO_URI`

### Database Permissions

Ensure your database user has the following permissions:
- Read and write access to the database
- Create collections and indexes

## Security Considerations

- Use strong JWT secrets
- Enable HTTPS in production
- Configure CORS properly
- Use environment variables for sensitive data
- Regularly update dependencies

## Monitoring

The backend includes:
- Health check endpoint: `GET /health`
- Morgan logging middleware
- Error handling middleware

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT environment variable

2. **MongoDB connection failed**
   - Check connection string
   - Verify network access
   - Check database user permissions

3. **Build failures**
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility

### Logs

Check application logs:
- **Render**: Dashboard → Logs
- **Railway**: Dashboard → Deployments → Logs
- **Heroku**: `heroku logs --tail`

## Performance Optimization

- Connection pooling is configured in `config/db.js`
- Compression middleware enabled
- Rate limiting implemented
- Security headers via Helmet

## API Documentation

Once deployed, your API will be available at:
- Base URL: `https://your-backend-url.com`
- Health Check: `GET /health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Appointments: `GET /api/appointments`, `POST /api/appointments`
- Chat: `GET /api/chats`, `POST /api/chats`
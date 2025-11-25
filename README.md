# Medicare - Healthcare Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for healthcare management, enabling patients to book appointments and communicate with doctors through a secure chat system.
**Frontend URL**: https://medicare-system.vercel.app/
**Backend URL**:https://medicare-system-5027.onrender.com/

## 🚀 Features

- **User Authentication**: Secure registration and login for patients, doctors, and admins
- **Appointment Booking**: Schedule appointments with healthcare providers
- **Real-time Chat**: Communicate with doctors through integrated messaging
- **Role-based Access**: Different permissions for patients, doctors, and administrators
- **Responsive Design**: Mobile-friendly interface built with React and Tailwind CSS
- **Production Ready**: Optimized for deployment with monitoring and security features

## 🏗️ Architecture

### Backend (Express.js + MongoDB)
- RESTful API with JWT authentication
- MongoDB with Mongoose ODM
- Security middleware (Helmet, CORS, Rate limiting)
- Error handling and logging
- Health checks and monitoring endpoints

### Frontend (React + Vite)
- Modern React with hooks and context
- Vite for fast development and optimized builds
- Tailwind CSS for responsive styling
- React Router for navigation
- Code splitting for performance

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/medicare.git
cd medicare
```

### 2. Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 4. Database Setup

Create a MongoDB database and update the `MONGO_URI` in your backend `.env` file.

## 🔧 Configuration

### Backend Environment Variables

Create `Backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
VITE_APP_NAME=Medicare
```

## 📦 Deployment

### Backend Deployment

Choose one of the following platforms:

#### Render (Recommended)
1. Connect your GitHub repository
2. Set build settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add environment variables
4. Deploy

#### Railway
1. Connect GitHub repository
2. Automatic Node.js detection
3. Add environment variables
4. Deploy

#### Heroku
1. Install Heroku CLI
2. `heroku create medicare-backend`
3. `git push heroku main`

### Frontend Deployment

#### Vercel (Recommended)
1. Connect GitHub repository
2. Configure build settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variables
4. Deploy

#### Netlify
1. Connect GitHub repository
2. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add environment variables
4. Deploy

#### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to `package.json`
3. `npm run deploy`

## 🔄 CI/CD Pipeline

GitHub Actions workflows are configured for:
- **Continuous Integration**: Linting, testing, and building
- **Continuous Deployment**: Automatic deployment on main branch pushes
- **Security Scanning**: Vulnerability checks with Trivy

### Available Workflows

- `ci.yml`: Runs on PRs and pushes to main/develop
- `deploy.yml`: Deploys to production on main branch pushes

## 📊 Monitoring & Health Checks

### Health Endpoints

- **Backend Health**: `GET /health` - System status and database connectivity
- **Metrics**: `GET /metrics` - Detailed system metrics

### Monitoring Setup

1. **Sentry**: Error tracking and performance monitoring
2. **UptimeRobot/Pingdom**: Uptime monitoring
3. **PM2**: Process management and monitoring
4. **Winston**: Structured logging

## 🗄️ Database

### MongoDB Setup

1. **Local MongoDB**:
   ```bash
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **MongoDB Atlas** (Cloud):
   - Create cluster
   - Create database user
   - Whitelist IP addresses
   - Get connection string

### Database Models

- **User**: Authentication and profile data
- **Appointment**: Booking and scheduling data
- **Chat**: Messaging between users

## 🔒 Security

- JWT authentication with secure secrets
- Password hashing with bcrypt
- Rate limiting and CORS protection
- Security headers with Helmet
- Input validation and sanitization

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
```

### Appointment Endpoints

```
GET    /api/appointments      # Get user's appointments
POST   /api/appointments      # Create appointment
PUT    /api/appointments/:id  # Update appointment
DELETE /api/appointments/:id  # Delete appointment
```

### Chat Endpoints

```
GET    /api/chats                    # Get user's chats
POST   /api/chats                    # Create/get chat
GET    /api/chats/:id/messages       # Get messages
POST   /api/chats/:id/messages       # Send message
```

## 🚀 Performance Optimization

- Code splitting with Vite
- Compression middleware
- Database connection pooling
- CDN for static assets
- Lazy loading for components

## 🔧 Development

### Available Scripts

```bash
# Backend
npm run dev      # Development server with nodemon
npm start        # Production server
npm test         # Run tests

# Frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Project Structure

```
medicare/
├── Backend/
│   ├── controllers/     # Route handlers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   ├── styles/     # Stylesheets
│   │   └── main.jsx    # App entry point
│   └── public/         # Static assets
├── .github/
│   └── workflows/      # CI/CD pipelines
└── docs/               # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the troubleshooting guide

## 🔄 Updates and Maintenance

- Regularly update dependencies
- Monitor security vulnerabilities
- Backup database regularly
- Review and update monitoring alerts
- Test deployment procedures

## 📈 Roadmap

- [ ] Video consultations
- [ ] Prescription management
- [ ] Medical records integration
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

---

**Note**: This application is for educational and demonstration purposes. For production healthcare applications, ensure compliance with relevant regulations (HIPAA, GDPR, etc.) and consult with healthcare and legal professionals.
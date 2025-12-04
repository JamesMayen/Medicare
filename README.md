# Medicare - Healthcare Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for healthcare management, enabling patients to book appointments and communicate with doctors through a secure chat system.
**Frontend URL**: https://medicare-system.vercel.app/
**Backend URL**:https://medicare-system-5027.onrender.com/
**Main Project Repo URL**: https://github.com/JamesMayen/Medicare

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [API Documentation](#-api-documentation)
- [User Guide](#-user-guide)
- [Technical Architecture](#-technical-architecture)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Security](#-security)
- [Monitoring](#-monitoring--health-checks)
- [License](#-license)

## 🎯 Project Overview

Medicare is a comprehensive healthcare management platform that connects patients with healthcare providers. The system allows patients to easily book appointments, communicate with doctors through real-time chat, and manage their healthcare needs efficiently. Doctors can manage their schedules, communicate with patients, and provide better care through the integrated platform.

### Key Objectives
- Simplify healthcare appointment booking
- Enable secure communication between patients and doctors
- Provide role-based access control
- Ensure data privacy and security compliance
- Deliver a responsive, user-friendly experience

## 🚀 Features

- **User Authentication**: Secure registration and login for patients, doctors, and admins with JWT tokens
- **Appointment Booking**: Schedule appointments with healthcare providers with real-time availability
- **Real-time Chat**: Communicate with doctors through integrated messaging with Socket.IO
- **Role-based Access**: Different permissions for patients, doctors, and administrators
- **Responsive Design**: Mobile-friendly interface built with React and Tailwind CSS
- **Real-time Notifications**: Live updates for appointments and messages
- **Dashboard Analytics**: Overview of appointments, chats, and system metrics
- **Production Ready**: Optimized for deployment with monitoring and security features

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, Helmet, CORS, express-rate-limit
- **Real-time**: Socket.IO 4.8.1
- **Validation**: Custom middleware with input sanitization
- **Logging**: Morgan, Winston
- **Testing**: Jest, Supertest, MongoDB Memory Server

### Frontend
- **Framework**: React 18.3.1 with Vite 7.1.9
- **Routing**: React Router DOM 7.9.4
- **Styling**: Tailwind CSS 4.0.0 with custom components
- **State Management**: React Context API
- **Real-time**: Socket.IO Client 4.8.1
- **Icons**: Lucide React, React Icons
- **Animations**: Framer Motion 12.23.24
- **Testing**: Vitest 4.0.14, React Testing Library

### DevOps & Tools
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker (optional)
- **Deployment**: Vercel, Render, Railway, Netlify
- **Monitoring**: Sentry, UptimeRobot, PM2
- **Security Scanning**: Trivy
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Latest version (comes with Node.js)
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control
- **Text Editor**: VS Code recommended

### System Requirements
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: 2GB free space
- **Network**: Stable internet connection for development

## 🚀 Installation and Setup

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
# Edit .env with your configuration (see Environment Variables section)
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)
npm run dev
```

The frontend application will start on `http://localhost:3000`

### 4. Database Setup

#### Option A: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user and whitelist IP addresses
4. Get connection string and update `MONGO_URI` in backend `.env`

#### Option B: Local MongoDB
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Windows
# Download and install from https://www.mongodb.com/try/download/community
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
VITE_APP_NAME=Medicare
```

## 📸 Screenshots

![Landing page](Screenshots/landing.png)

![Doctor card](Screenshots/doctor-card.png)

![Doctor dashboard](Screenshots/doctor.png)

![Admin dashboard](Screenshots/admin.png)

![AI chat](Screenshots/AI.png)

![Appointments](Screenshots/appointments.png)

![Map location](Screenshots/map-location.png)

![Profile](Screenshots/profile.png)

## 📚 API Documentation

Base URL: `http://localhost:5000/api` (development) or `https://your-backend-url.com/api` (production)

All API endpoints require authentication except registration and login. Include the JWT token in the Authorization header: `Authorization: Bearer <token>`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "patient"  // "patient" or "doctor"
}
```

**Response (201):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient"
}
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "specialization": "Cardiology",  // For doctors only
  "experience": 5,
  "contactDetails": "+1234567890",
  "workLocation": "New York, NY",
  "consultationFee": 150,
  "availability": ["Monday 9-5", "Wednesday 10-4"]
}
```

### Appointment Endpoints

#### Get User Appointments
```http
GET /api/appointments
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "patient": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "doctor": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Dr. Smith",
      "email": "smith@example.com"
    },
    "date": "2024-01-15",
    "time": "10:00",
    "reason": "Regular checkup",
    "status": "confirmed",
    "notes": "Patient reports mild headache"
  }
]
```

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor": "64f1a2b3c4d5e6f7g8h9i0j3",
  "date": "2024-01-15",
  "time": "10:00",
  "reason": "Regular checkup - minimum 10 characters"
}
```

**Response (201):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "patient": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "doctor": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "name": "Dr. Smith",
    "email": "smith@example.com"
  },
  "date": "2024-01-15",
  "time": "10:00",
  "reason": "Regular checkup",
  "status": "pending"
}
```

#### Update Appointment
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",  // "pending", "confirmed", "completed", "cancelled"
  "notes": "Patient arrived on time",
  "date": "2024-01-16",
  "time": "11:00"
}
```

#### Delete Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Appointment removed"
}
```

### Chat Endpoints

#### Get User Chats
```http
GET /api/chats
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
    "participants": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "patient"
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Dr. Smith",
        "email": "smith@example.com",
        "role": "doctor"
      }
    ],
    "lastMessage": "2024-01-10T10:30:00.000Z"
  }
]
```

#### Create/Get Chat
```http
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "64f1a2b3c4d5e6f7g8h9i0j3"
}
```

**Response (201):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
  "participants": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "role": "doctor"
    }
  ],
  "messages": [],
  "lastMessage": null
}
```

#### Send Message
```http
POST /api/chats/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello doctor, I have a question about my medication."
}
```

**Response (201):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
  "participants": [...],
  "messages": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "sender": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "patient"
      },
      "content": "Hello doctor, I have a question about my medication.",
      "timestamp": "2024-01-10T10:30:00.000Z"
    }
  ],
  "lastMessage": "2024-01-10T10:30:00.000Z"
}
```

#### Get Chat Messages
```http
GET /api/chats/:id/messages
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "sender": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "content": "Hello doctor, I have a question about my medication.",
    "timestamp": "2024-01-10T10:30:00.000Z"
  },
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "sender": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "role": "doctor"
    },
    "content": "Hi John, I'm here to help. What questions do you have?",
    "timestamp": "2024-01-10T10:32:00.000Z"
  }
]
```

## 👥 User Guide

### For Patients

#### Getting Started
1. **Register**: Create an account with your name, email, and password
2. **Login**: Use your credentials to access the platform
3. **Complete Profile**: Add any additional information as needed

#### Booking Appointments
1. Navigate to the "Doctors" section
2. Browse available doctors by specialty and location
3. View doctor profiles including experience, fees, and availability
4. Click "Book Appointment" on a doctor's profile
5. Select date, time, and provide reason for visit
6. Confirm booking - you'll receive real-time confirmation

#### Managing Appointments
- View all appointments in your dashboard
- Update appointment details if needed
- Cancel appointments (only by patient)
- Receive notifications for status changes

#### Communicating with Doctors
1. After booking, a chat is automatically created
2. Access chat from dashboard or appointment details
3. Send messages in real-time
4. Receive instant notifications for new messages

### For Doctors

#### Getting Started
1. **Register as Doctor**: Select "doctor" role during registration
2. **Complete Profile**: Add specialization, experience, contact details, work location, consultation fee, and availability
3. **Login**: Access your doctor dashboard

#### Managing Appointments
- View all patient appointments in your dashboard
- Confirm pending appointments
- Update appointment status (confirmed, completed, cancelled)
- Add notes to appointments
- Reschedule appointments when necessary

#### Patient Communication
- Access chats with patients from dashboard
- Respond to patient messages in real-time
- Maintain professional communication
- Reference appointment history in conversations

#### Profile Management
- Update availability and contact information
- Modify consultation fees
- Add or update specialization details

## 🏗️ Technical Architecture

### System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - Components    │    │ - Controllers   │    │ - Users         │
│ - Pages         │    │ - Routes        │    │ - Appointments  │
│ - Context       │    │ - Middleware    │    │ - Chats         │
│ - Socket Client │    │ - Socket Server │    │ - Messages      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Real-time     │
                    │   (Socket.IO)   │
                    │                 │
                    │ - Live Chat     │
                    │ - Notifications │
                    │ - Dashboard     │
                    │   Updates       │
                    └─────────────────┘
```

### Backend Architecture

#### Layered Architecture
- **Routes Layer**: API endpoint definitions and request routing
- **Controller Layer**: Business logic and request handling
- **Model Layer**: Data models and database interactions
- **Middleware Layer**: Authentication, validation, security
- **Utils Layer**: Helper functions and utilities

#### Key Components
- **Authentication Middleware**: JWT token validation and user context
- **Socket.IO Integration**: Real-time communication server
- **Error Handling**: Centralized error management with custom error classes
- **Validation**: Input sanitization and validation middleware
- **Logging**: Request/response logging with Morgan

### Frontend Architecture

#### Component Structure
```
frontend/src/
├── components/          # Reusable UI components
│   ├── UI/             # Basic UI elements (buttons, inputs, etc.)
│   ├── layout/         # Layout components (header, footer, etc.)
│   ├── sections/       # Page sections (hero, doctor card, etc.)
│   └── images/         # Image components
├── pages/              # Page components
├── context/            # React Context providers
├── styles/             # Global styles and Tailwind config
└── __tests__/          # Component tests
```

#### State Management
- **React Context**: Global state for authentication and socket connections
- **Local State**: Component-level state with useState/useReducer
- **Real-time Updates**: Socket.IO client for live data synchronization

### Database Architecture

#### MongoDB Collections
- **Users**: User profiles with role-based data
- **Appointments**: Booking data with status tracking
- **Chats**: Conversation threads between users
- **Messages**: Individual chat messages with timestamps

#### Data Relationships
- Users can have multiple appointments (patient/doctor roles)
- Users can participate in multiple chats
- Chats contain multiple messages
- Appointments link patients to doctors

### Real-time Features

#### Socket.IO Implementation
- **Namespaces**: Separate communication channels
- **Rooms**: User-specific and chat-specific rooms
- **Events**: Custom events for different real-time features

#### Real-time Events
- `appointment_created`: Notify users of new appointments
- `appointment_updated`: Real-time appointment status changes
- `new_message`: Instant message delivery
- `chat_updated`: Chat list updates
- `dashboard_update`: Dashboard data refresh

## 🧪 Testing

### Testing Strategy

The application implements a comprehensive testing strategy covering unit, integration, and end-to-end tests.

### Backend Testing

#### Unit Tests
```bash
cd Backend
npm test
```

**Test Coverage:**
- Controller functions (auth, appointments, chat)
- Utility functions (token generation)
- Model validations
- Middleware functions

**Testing Stack:**
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP endpoint testing
- **MongoDB Memory Server**: In-memory database for tests

#### Integration Tests
```bash
cd Backend
npm test -- --testPathPattern=integration
```

**Integration Test Coverage:**
- API route testing with authentication
- Database operations
- Middleware integration
- Error handling scenarios

### Frontend Testing

#### Component Tests
```bash
cd frontend
npm test
```

**Testing Stack:**
- **Vitest**: Fast test runner
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for testing

### End-to-End Testing

#### E2E Tests with Playwright
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Generate test report
npx playwright show-report
```

**E2E Test Scenarios:**
- User registration and login
- Appointment booking workflow
- Real-time chat functionality
- Dashboard interactions
- Responsive design testing

**Test Configuration:**
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Tests run in parallel for speed
- **CI Integration**: Automated testing in deployment pipeline

### Test Structure

```
Backend/tests/
├── setup.js                    # Test environment setup
├── models.test.js             # Model validation tests
├── generateToken.test.js      # Utility function tests
├── authController.test.js     # Auth controller unit tests
├── appointmentController.test.js  # Appointment controller tests
├── chatController.test.js     # Chat controller tests
├── authRoutes.integration.test.js    # Auth routes integration
└── appointmentRoutes.integration.test.js  # Appointment routes integration

e2e/
├── auth.spec.js               # Authentication E2E tests
├── chat.spec.js               # Chat functionality tests
├── dashboard-updates.spec.js  # Dashboard real-time updates
├── doctor.spec.js             # Doctor workflow tests
├── patient.spec.js            # Patient workflow tests
└── pages/                     # Page object models
    ├── DoctorDashboardPage.js
    ├── LandingPage.js
    ├── LoginPage.js
    └── RegisterPage.js
```

### Running Tests Locally

#### Prerequisites for Testing
```bash
# Backend tests
cd Backend
npm install  # Installs Jest, Supertest, etc.

# Frontend tests
cd frontend
npm install  # Installs Vitest, Testing Library

# E2E tests
npm install -g @playwright/test
npx playwright install  # Install browser binaries
```

#### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

The project uses GitHub Actions for automated CI/CD with comprehensive testing and deployment.

#### CI Pipeline (ci.yml)

**Triggers:**
- Push to `main` and `develop` branches
- Pull requests to `main` branch

**Jobs:**

1. **Backend Testing**
   - Node.js versions: 18.x, 20.x
   - Dependency installation with caching
   - Linting and testing
   - Security vulnerability scanning
   - Build verification

2. **Frontend Testing**
   - Node.js 18.x
   - Dependency installation with caching
   - Linting and type checking
   - Unit testing
   - Build verification
   - Bundle size analysis

3. **Security Scanning**
   - Trivy vulnerability scanner
   - SARIF report generation
   - Automated security checks

4. **Code Quality**
   - ESLint for both backend and frontend
   - Prettier code formatting checks
   - Automated code quality gates

#### Deployment Pipeline (deploy.yml)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

1. **Backend Deployment**
   - Automated deployment to Render/Railway
   - Environment variable management
   - Health checks post-deployment

2. **Frontend Deployment**
   - Build with production environment variables
   - Deployment to Vercel/Netlify/GitHub Pages
   - CDN optimization and caching

3. **E2E Testing**
   - Post-deployment verification
   - Automated browser testing
   - Test result artifacts

4. **Notifications**
   - Deployment status notifications
   - Slack/Discord integration ready

### Pipeline Configuration

#### Environment Variables for CI/CD
```yaml
# GitHub Secrets Required:
- RENDER_DEPLOY_HOOK_URL    # For Render deployment
- RAILWAY_TOKEN            # For Railway deployment
- VERCEL_TOKEN             # For Vercel deployment
- NETLIFY_AUTH_TOKEN       # For Netlify deployment
- NETLIFY_SITE_ID          # For Netlify deployment
- VITE_API_URL             # Frontend API URL
- VITE_APP_NAME            # Application name
- BASE_URL                 # For E2E testing
```

#### Workflow Features
- **Parallel Jobs**: Independent testing for backend and frontend
- **Caching**: npm cache for faster builds
- **Matrix Builds**: Multiple Node.js versions for backend
- **Artifact Upload**: Test results and reports
- **Conditional Deployment**: Only on main branch
- **Rollback Ready**: Versioned deployments

## 🚀 Deployment

### Backend Deployment

#### Render (Recommended)
1. Connect GitHub repository
2. Set build settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Configure environment variables
4. Deploy automatically on push to main

#### Railway
1. Connect GitHub repository
2. Automatic Node.js detection
3. Add environment variables in dashboard
4. Deploy with `railway up` command

#### Heroku
1. Install Heroku CLI
2. Create app: `heroku create medicare-backend`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

### Frontend Deployment

#### Vercel (Recommended)
1. Connect GitHub repository
2. Configure build settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variables
4. Automatic deployments on push

#### Netlify
1. Connect GitHub repository
2. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Configure environment variables
4. Deploy with CDN optimization

#### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to `package.json`
3. Configure GitHub Pages in repository settings
4. Deploy: `npm run deploy`

### Production Environment Setup

#### Environment Variables
```env
# Backend Production
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/medicare_prod
JWT_SECRET=your_production_jwt_secret_here
FRONTEND_URL=https://your-frontend-domain.com

# Frontend Production
VITE_API_URL=https://your-backend-api.com/api
VITE_APP_NAME=Medicare
```

#### Database Migration
- Ensure production database is backed up
- Run database migrations if schema changes
- Validate data integrity post-migration

#### Performance Optimization
- Enable gzip compression
- Configure CDN for static assets
- Set up database connection pooling
- Implement caching strategies

## 🤝 Contributing

We welcome contributions to the Medicare project! Please follow these guidelines to ensure smooth collaboration.

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/medicare.git
   cd medicare
   git checkout -b feature/your-feature-name
   ```

2. **Set Up Development Environment**
   ```bash
   # Backend
   cd Backend
   npm install
   cp .env.example .env
   # Configure environment variables

   # Frontend
   cd ../frontend
   npm install
   cp .env.example .env
   # Configure environment variables
   ```

3. **Run Tests**
   ```bash
   # Backend tests
   cd Backend && npm test

   # Frontend tests
   cd frontend && npm test

   # E2E tests
   npx playwright test
   ```

4. **Make Changes**
   - Follow existing code style and conventions
   - Write tests for new features
   - Update documentation as needed
   - Ensure all tests pass

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description of changes
   - Reference related issues
   - Ensure CI/CD checks pass

### Code Standards

#### JavaScript/TypeScript
- Use ESLint and Prettier configurations
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

#### Git Commit Messages
```
feat: add user authentication
fix: resolve appointment booking bug
docs: update API documentation
style: format code with Prettier
refactor: simplify chat controller logic
test: add unit tests for user model
chore: update dependencies
```

#### Branch Naming
```
feature/add-user-authentication
bugfix/fix-appointment-validation
hotfix/critical-security-patch
docs/update-readme
```

### Testing Requirements
- Maintain >80% code coverage for backend
- Write unit tests for new functions
- Add integration tests for API endpoints
- Include E2E tests for user workflows
- Test across different browsers and devices

### Documentation
- Update README for new features
- Add API documentation for new endpoints
- Include code comments for complex logic
- Update deployment guides if needed

### Code Review Process
1. Automated checks (linting, testing, security)
2. Peer review by maintainers
3. Integration testing in staging environment
4. Approval and merge to main branch

### Issue Reporting
- Use GitHub Issues for bug reports and feature requests
- Provide detailed steps to reproduce bugs
- Include browser/OS information
- Attach screenshots for UI issues

### Security Considerations
- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Follow OWASP security guidelines
- Report security vulnerabilities privately

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with secure secret keys
- Password hashing using bcryptjs with salt rounds
- Role-based access control (patient, doctor, admin)
- Token expiration and refresh mechanisms

### Data Protection
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with input escaping
- CSRF protection middleware

### API Security
- Rate limiting (100 requests per 15 minutes per IP)
- CORS configuration for allowed origins
- Helmet.js for security headers
- Request/response compression

### Infrastructure Security
- Environment variable management
- Secure database connections
- HTTPS enforcement in production
- Regular security updates and patches

## 📊 Monitoring & Health Checks

### Health Endpoints

#### Backend Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T10:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "responseTime": 45
  },
  "memory": {
    "used": 120,
    "free": 380,
    "total": 500
  }
}
```

#### Metrics Endpoint
```http
GET /metrics
```
Provides detailed system metrics for monitoring.

### Monitoring Setup

#### Application Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Winston**: Structured logging with multiple transports
- **Morgan**: HTTP request logging

#### Infrastructure Monitoring
- **PM2**: Process management and monitoring
- **UptimeRobot**: External uptime monitoring
- **Pingdom**: Performance monitoring

#### Database Monitoring
- MongoDB connection pooling
- Query performance monitoring
- Database backup automation

### Logging

#### Log Levels
- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information messages
- **DEBUG**: Detailed debugging information

#### Log Structure
```json
{
  "timestamp": "2024-01-10T10:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the `/docs` directory
- **Troubleshooting**: Review the troubleshooting guide
- **Community**: Join our Discord server

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies monthly
- Monitor security vulnerabilities
- Review and rotate API keys
- Backup database regularly
- Update monitoring alerts

### Versioning
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

### Roadmap
- [ ] Video consultations
- [ ] Prescription management
- [ ] Medical records integration
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered health insights

---

**Note**: This application is for educational and demonstration purposes. For production healthcare applications, ensure compliance with relevant regulations (HIPAA, GDPR, etc.) and consult with healthcare and legal professionals.

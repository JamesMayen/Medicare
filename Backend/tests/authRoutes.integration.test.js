import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe(userData.role);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 for existing user', async () => {
      // First create a user
      await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashedpass'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Please provide name, email, and password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2a$10$examplehashedpassword', // bcrypt hash for 'password123'
        role: 'patient'
      });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.name).toBe('John Doe');
    });

    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpass',
        role: 'patient'
      });
      token = generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      });
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized, no token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token, user;

    beforeEach(async () => {
      user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpass',
        role: 'doctor',
        specialization: 'Cardiology'
      });
      token = generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      });
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Updated',
          specialization: 'Neurology'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Updated');
      expect(response.body.specialization).toBe('Neurology');
    });
  });
});
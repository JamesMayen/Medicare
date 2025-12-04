import { registerUser, loginUser, getProfile, updateProfile } from '../controllers/authController.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// Mock dependencies
jest.mock('../models/user.js');
jest.mock('bcryptjs');
jest.mock('../utils/generateToken.js');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { _id: 'user123' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'patient'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient'
      });
      generateToken.mockReturnValue('token123');

      await registerUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'patient'
      });
      expect(generateToken).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient',
        token: 'token123'
      });
    });

    it('should return 400 if user already exists', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ email: 'john@example.com' });

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { name: 'John' };

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Please provide name, email, and password' });
    });

    it('should handle server errors', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      User.findOne.mockRejectedValue(new Error('DB error'));

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      mockReq.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue('token123');

      await loginUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(generateToken).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient'
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient',
        token: 'token123'
      });
    });

    it('should return 400 for invalid credentials', async () => {
      mockReq.body = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue({ password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 400 if user not found', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient'
      };

      User.findById.mockResolvedValue(mockUser);

      await getProfile(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient'
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      mockReq.body = {
        name: 'John Updated',
        specialization: 'Cardiology'
      };

      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'doctor',
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          name: 'John Updated',
          email: 'john@example.com',
          role: 'doctor',
          specialization: 'Cardiology'
        })
      };

      User.findById.mockResolvedValue(mockUser);

      await updateProfile(mockReq, mockRes);

      expect(mockUser.name).toBe('John Updated');
      expect(mockUser.specialization).toBe('Cardiology');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'John Updated',
        email: 'john@example.com',
        role: 'doctor',
        specialization: 'Cardiology'
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});
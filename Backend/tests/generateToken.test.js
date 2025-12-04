import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// Mock jwt
jest.mock('jsonwebtoken');

describe('generateToken', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'testsecret';
    jest.clearAllMocks();
  });

  it('should generate a JWT token with correct payload and options', () => {
    const userData = {
      _id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient'
    };

    const mockToken = 'mocked.jwt.token';
    jwt.sign.mockReturnValue(mockToken);

    const token = generateToken(userData);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: userData._id, name: userData.name, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    expect(token).toBe(mockToken);
  });

  it('should handle different user roles', () => {
    const userData = {
      _id: '456',
      name: 'Dr. Smith',
      email: 'smith@example.com',
      role: 'doctor'
    };

    const mockToken = 'doctor.jwt.token';
    jwt.sign.mockReturnValue(mockToken);

    const token = generateToken(userData);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: userData._id, name: userData.name, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    expect(token).toBe(mockToken);
  });
});
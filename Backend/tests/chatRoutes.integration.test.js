import request from 'supertest';
import express from 'express';
import chatRoutes from '../routes/chatRoutes.js';
import User from '../models/user.js';
import Chat from '../models/chat.js';
import generateToken from '../utils/generateToken.js';

const app = express();
app.use(express.json());
app.use('/api/chats', chatRoutes);

describe('Chat Routes Integration Tests', () => {
  let user1Token, user2Token, user1, user2;

  beforeEach(async () => {
    user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      password: 'hashedpass',
      role: 'patient'
    });
    user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'hashedpass',
      role: 'doctor'
    });
    user1Token = generateToken({
      _id: user1._id.toString(),
      name: user1.name,
      email: user1.email,
      role: user1.role
    });
    user2Token = generateToken({
      _id: user2._id.toString(),
      name: user2.name,
      email: user2.email,
      role: user2.role
    });
  });

  describe('GET /api/chats', () => {
    it('should return user chats', async () => {
      await Chat.create({
        participants: [user1._id, user2._id],
        messages: []
      });

      const response = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].participants).toHaveLength(2);
    });
  });

  describe('POST /api/chats', () => {
    it('should create or get chat between users', async () => {
      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2._id.toString() });

      expect(response.status).toBe(201);
      expect(response.body.participants).toHaveLength(2);
    });

    it('should return existing chat', async () => {
      const existingChat = await Chat.create({
        participants: [user1._id, user2._id],
        messages: []
      });

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(existingChat._id.toString());
    });
  });

  describe('POST /api/chats/:id/messages', () => {
    let chat;

    beforeEach(async () => {
      chat = await Chat.create({
        participants: [user1._id, user2._id],
        messages: []
      });
    });

    it('should send message', async () => {
      const response = await request(app)
        .post(`/api/chats/${chat._id}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Hello!' });

      expect(response.status).toBe(201);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].content).toBe('Hello!');
      expect(response.body.messages[0].sender._id).toBe(user1._id.toString());
    });

    it('should return 404 for non-existent chat', async () => {
      const response = await request(app)
        .post('/api/chats/507f1f77bcf86cd799439011/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Hello!' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Chat not found');
    });

    it('should return 401 if not participant', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'hashedpass',
        role: 'patient'
      });
      const otherToken = generateToken({
        _id: otherUser._id.toString(),
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role
      });

      const response = await request(app)
        .post(`/api/chats/${chat._id}/messages`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: 'Hello!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
    });
  });

  describe('GET /api/chats/:id/messages', () => {
    let chat;

    beforeEach(async () => {
      chat = await Chat.create({
        participants: [user1._id, user2._id],
        messages: [
          {
            sender: user1._id,
            content: 'Hello',
            timestamp: new Date()
          },
          {
            sender: user2._id,
            content: 'Hi there',
            timestamp: new Date()
          }
        ]
      });
    });

    it('should return chat messages', async () => {
      const response = await request(app)
        .get(`/api/chats/${chat._id}/messages`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].content).toBe('Hello');
      expect(response.body[1].content).toBe('Hi there');
    });

    it('should return 401 if not participant', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'hashedpass',
        role: 'patient'
      });
      const otherToken = generateToken({
        _id: otherUser._id.toString(),
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role
      });

      const response = await request(app)
        .get(`/api/chats/${chat._id}/messages`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
    });
  });
});
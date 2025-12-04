import {
  getChats,
  createOrGetChat,
  sendMessage,
  getMessages
} from '../controllers/chatController.js';
import Chat from '../models/chat.js';
import Appointment from '../models/appointment.js';
import { io } from '../server.js';

// Mock dependencies
jest.mock('../models/chat.js');
jest.mock('../models/appointment.js');
jest.mock('../server.js', () => ({
  io: {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  }
}));

describe('Chat Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: { _id: 'user123' },
      params: { id: 'chat123' },
      body: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getChats', () => {
    it('should return user chats', async () => {
      const mockChats = [
        { _id: 'chat1', participants: ['user123', 'user456'] },
        { _id: 'chat2', participants: ['user123', 'user789'] }
      ];

      Chat.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockChats)
      });

      await getChats(mockReq, mockRes);

      expect(Chat.find).toHaveBeenCalledWith({ participants: 'user123' });
      expect(mockRes.json).toHaveBeenCalledWith(mockChats);
    });

    it('should handle errors', async () => {
      Chat.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      await getChats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('createOrGetChat', () => {
    it('should return existing chat', async () => {
      mockReq.body = { participantId: 'user456' };

      const mockChat = {
        _id: 'chat123',
        participants: ['user123', 'user456']
      };

      Chat.findOne.mockResolvedValue(mockChat);
      Appointment.findOne.mockResolvedValue({ _id: 'appt123', status: 'confirmed' }); // Mock confirmed appointment

      await createOrGetChat(mockReq, mockRes);

      expect(Chat.findOne).toHaveBeenCalledWith({
        participants: { $all: ['user123', 'user456'] }
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockChat);
    });

    it('should create new chat if not exists', async () => {
      mockReq.body = { participantId: 'user456' };

      const mockChat = {
        _id: 'chat123',
        participants: ['user123', 'user456']
      };

      Chat.findOne.mockResolvedValue(null);
      Chat.create.mockResolvedValue(mockChat);
      Chat.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockChat)
      });
      Appointment.findOne.mockResolvedValue({ _id: 'appt123', status: 'confirmed' }); // Mock confirmed appointment

      await createOrGetChat(mockReq, mockRes);

      expect(Chat.create).toHaveBeenCalledWith({
        participants: ['user123', 'user456']
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockChat);
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      mockReq.body = { content: 'Hello world' };

      const mockChat = {
        _id: 'chat123',
        participants: ['user123', 'user456'],
        messages: [],
        lastMessage: new Date(),
        save: jest.fn().mockResolvedValue()
      };

      const mockPopulatedChat = {
        ...mockChat,
        messages: [{
          sender: 'user123',
          content: 'Hello world',
          timestamp: expect.any(Date)
        }]
      };

      Chat.findById.mockResolvedValue(mockChat);
      Chat.findById.mockReturnValueOnce(mockChat).mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockPopulatedChat)
      });
      Appointment.findOne.mockResolvedValue({ _id: 'appt123', status: 'confirmed' }); // Mock confirmed appointment

      await sendMessage(mockReq, mockRes);

      expect(mockChat.messages).toHaveLength(1);
      expect(mockChat.messages[0].content).toBe('Hello world');
      expect(mockChat.save).toHaveBeenCalled();
      expect(io.to).toHaveBeenCalledWith('chat_chat123');
      expect(io.emit).toHaveBeenCalledWith('new_message', {
        chatId: 'chat123',
        message: mockPopulatedChat.messages[0]
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockPopulatedChat);
    });

    it('should return 404 if chat not found', async () => {
      Chat.findById.mockResolvedValue(null);

      await sendMessage(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Chat not found' });
    });

    it('should return 401 if not participant', async () => {
      const mockChat = {
        participants: ['user456', 'user789'] // user123 not in participants
      };

      Chat.findById.mockResolvedValue(mockChat);

      await sendMessage(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
  });

  describe('getMessages', () => {
    it('should return chat messages', async () => {
      const mockMessages = [
        { sender: 'user123', content: 'Hello', timestamp: new Date() },
        { sender: 'user456', content: 'Hi', timestamp: new Date() }
      ];

      const mockChat = {
        messages: mockMessages
      };

      Chat.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockChat)
      });

      await getMessages(mockReq, mockRes);

      expect(Chat.findById).toHaveBeenCalledWith('chat123');
      expect(mockRes.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should return 404 if chat not found', async () => {
      Chat.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Chat not found' });
    });

    it('should return 401 if not participant', async () => {
      const mockChat = {
        participants: ['user456'] // user123 not in participants
      };

      Chat.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockChat)
      });

      await getMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
  });
});
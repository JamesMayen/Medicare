import Chat from "../models/chat.js";
import Appointment from "../models/appointment.js";
import { io } from "../server.js";

// Helper function to check if two users can chat (have confirmed appointment)
const canChat = async (user1, user2) => {
  try {
    const User = (await import("../models/user.js")).default;
    const u1 = await User.findById(user1);
    const u2 = await User.findById(user2);

    if (!u1 || !u2) return false;

    let patient, doctor;
    if (u1.role === 'patient' && u2.role === 'doctor') {
      patient = user1;
      doctor = user2;
    } else if (u2.role === 'patient' && u1.role === 'doctor') {
      patient = user2;
      doctor = user1;
    } else {
      return false; // Not a patient-doctor pair
    }

    const appointment = await Appointment.findOne({
      patient,
      doctor,
      status: 'confirmed'
    });

    return !!appointment;
  } catch (error) {
    console.error('Error in canChat:', error);
    return false;
  }
};

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name email role")
      .sort({ lastMessage: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get or create chat between two users
// @route   POST /api/chats
// @access  Private
export const createOrGetChat = async (req, res) => {
  const { participantId } = req.body;

  // Validate participantId
  if (!participantId) {
    return res.status(400).json({ message: "Participant ID is required" });
  }

  try {
    // Check if participant exists
    const User = (await import("../models/user.js")).default;
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Cannot chat with self
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot create chat with yourself" });
    }

    // Check if users can chat (have confirmed appointment)
    const canChatResult = await canChat(req.user._id, participantId);
    if (!canChatResult) {
      return res.status(403).json({ message: "Chat can only be initiated after appointment confirmation" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
    }).populate("participants", "name email role");

    if (chat) {
      return res.json(chat);
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.user._id, participantId],
    });

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "name email role"
    );

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Send message in chat
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  const { content } = req.body;

  // Validate input
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ message: "Message content is required" });
  }

  if (content.length > 1000) {
    return res.status(400).json({ message: "Message too long (max 1000 characters)" });
  }

  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Check if users can chat (have confirmed appointment)
    const otherParticipant = chat.participants.find(p => p.toString() !== req.user._id.toString());
    const canChatResult = await canChat(req.user._id, otherParticipant);
    if (!canChatResult) {
      return res.status(403).json({ message: "Chat is only allowed after appointment confirmation" });
    }

    const message = {
      sender: req.user._id,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    chat.lastMessage = new Date();

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name email role")
      .populate("messages.sender", "name email role");

    // Emit real-time message to chat room
    io.to(`chat_${chat._id}`).emit("new_message", {
      chatId: chat._id,
      message: populatedChat.messages[populatedChat.messages.length - 1],
    });

    // Emit chat update to all participants
    populatedChat.participants.forEach(participant => {
      io.to(`user_${participant._id}`).emit("chat_updated", {
        chat: {
          _id: populatedChat._id,
          participants: populatedChat.participants,
          lastMessage: populatedChat.lastMessage,
          messages: [populatedChat.messages[populatedChat.messages.length - 1]],
        },
      });
    });

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chats/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "messages.sender",
      "name email role"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
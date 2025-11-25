import Chat from "../models/chat.js";

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

  try {
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

  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Not authorized" });
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
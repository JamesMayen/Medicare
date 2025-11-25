import express from "express";
import {
  getChats,
  createOrGetChat,
  sendMessage,
  getMessages,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getChats).post(protect, createOrGetChat);
router.route("/:id/messages").get(protect, getMessages).post(protect, sendMessage);

export default router;
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
chatSchema.index({ participants: 1 });

export default mongoose.model("chat", chatSchema);
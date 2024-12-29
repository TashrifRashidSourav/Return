import mongoose from 'mongoose';

// Schema for individual messages
const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Schema for chats
const chatSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users in the chat
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Create models
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export { Chat, Message };

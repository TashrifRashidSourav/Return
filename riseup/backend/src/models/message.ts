import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  sender: mongoose.Types.ObjectId; // ID of the sender (User)
  chat: mongoose.Types.ObjectId; // ID of the chat this message belongs to
  content: string; // The text or content of the message
  timestamp: Date; // When the message was sent
}

const messageSchema = new Schema<IMessage>({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Use existing model if already compiled, or create a new one
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;

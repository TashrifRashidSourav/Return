import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId; // Reference to the User model
  text: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to `User`
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;

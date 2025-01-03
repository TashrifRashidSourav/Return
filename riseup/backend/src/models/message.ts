import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId; // Change this from senderId to sender
  text: string;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Rename to `sender`
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;

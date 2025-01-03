import mongoose, { Schema, Document } from 'mongoose';

interface IChat extends Document {
  members: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // Reference to the last message
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
export { Chat };

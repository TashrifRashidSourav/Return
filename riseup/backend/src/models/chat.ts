import mongoose, { Schema, Document } from 'mongoose';

interface IChat extends Document {
  members: mongoose.Types.ObjectId[];
}

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  },
  { timestamps: true }
);

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export { Chat };

import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  online: boolean;
  chats: mongoose.Types.ObjectId[]; // Array of chat IDs the user is a part of
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false }, // Track if the user is online
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }], // References to chats
});

// Use existing model if already compiled, or create a new one
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;

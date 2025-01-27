import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  online: boolean;
  profilePicture?: string; // URL or file path for the profile picture
  chats: mongoose.Types.ObjectId[]; // Array of chat IDs the user is a part of
  preferences?: {
    learningPriority: string; // Example: 'React', 'Python', 'Data Science'
    productivityTips: boolean; // Whether to suggest productivity tips
  };
  dailySchedule?: Array<{
    activity: string;
    startTime: string; // e.g., '15:00'
    endTime: string; // e.g., '19:00'
  }>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
  profilePicture: { type: String, default: '' }, // Add profile picture field
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  preferences: {
    learningPriority: { type: String, default: '' },
    productivityTips: { type: Boolean, default: true },
  },
  dailySchedule: [
    {
      activity: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});

// Use existing model if already compiled, or create a new one
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;

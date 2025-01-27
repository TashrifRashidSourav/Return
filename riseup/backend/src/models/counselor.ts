import mongoose, { Schema, Document } from 'mongoose';

interface ICounselor extends Document {
  name: string;
  email: string;
  password: string;
  online: boolean;
  profilePicture?: string; // URL or file path for the profile picture
  expertise: string[]; // Areas of expertise, e.g., 'Career', 'Mental Health'
  availability: Array<{
    day: string; // Day of the week, e.g., 'Monday', 'Tuesday'
    startTime: string; // Start time, e.g., '09:00'
    endTime: string; // End time, e.g., '17:00'
  }>;
  reviews: Array<{
    userId: mongoose.Types.ObjectId; // Reference to the user who left the review
    rating: number; // Rating out of 5
    comment?: string; // Optional comment
  }>;
  certifications?: string[]; // List of certifications
  chatHistory: mongoose.Types.ObjectId[]; // Array of chat IDs the counselor is part of
  specialization?: string; // Primary area of counseling specialization
}

const counselorSchema = new Schema<ICounselor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
  profilePicture: { type: String, default: '' },
  expertise: { type: [String], default: [] }, // List of expertise areas
  availability: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, default: '' },
    },
  ],
  certifications: { type: [String], default: [] },
  chatHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  specialization: { type: String, default: '' },
});

// Use existing model if already compiled, or create a new one
const Counselor = mongoose.models.Counselor || mongoose.model<ICounselor>('Counselor', counselorSchema);

export default Counselor;

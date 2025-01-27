import mongoose, { Schema, Document } from 'mongoose';

// Define the CounselorStory interface
interface ICounselorStory extends Document {
  title: string; // Title of the story
  author: mongoose.Types.ObjectId; // Counselor ID of the story author
  content: string; // Story content
  likes: number; // Number of likes the story has received
  createdAt: Date; // Timestamp of when the story was created
}

// Create the schema for CounselorStory
const counselorStorySchema = new Schema<ICounselorStory>(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt timestamps
);

// Use existing model if already compiled, or create a new one
const CounselorStory =
  mongoose.models.CounselorStory ||
  mongoose.model<ICounselorStory>('CounselorStory', counselorStorySchema);

export default CounselorStory;

import mongoose, { Schema, Document } from 'mongoose';

interface IStory extends Document {
  title: string;
  author: mongoose.Types.ObjectId; // User ID of the story author
  content: string;
  likes: number; // Number of likes the story has received
  createdAt: Date; // Timestamp of when the story was created
}

const storySchema = new Schema<IStory>({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Use existing model if already compiled, or create a new one
const Story = mongoose.models.Story || mongoose.model<IStory>('Story', storySchema);

export default Story;

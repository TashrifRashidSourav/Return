import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IHabitTracker extends Document {
  userId: Types.ObjectId;
  questions: { question: string; answer: string }[];
  mood: {
    feeling: string;
    energyLevel: string;
  };
  date: Date;
}

const HabitTrackerSchema: Schema<IHabitTracker> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    mood: {
      feeling: { type: String, required: true },
      energyLevel: { type: String, required: true },
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const HabitTracker = mongoose.model<IHabitTracker>('HabitTracker', HabitTrackerSchema);
export default HabitTracker;

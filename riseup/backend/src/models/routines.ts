import mongoose, { Schema, Document } from 'mongoose';

export interface IRoutine extends Document {
  userId: mongoose.Types.ObjectId; // User associated with the routine
  date: string; // Date in YYYY-MM-DD format
  startTime: string; // Start time of the task, e.g., '10:00 AM'
  endTime: string; // End time of the task, e.g., '11:00 AM'
  activity: string; // Description of the activity
}

const RoutineSchema = new Schema<IRoutine>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Store date as string for easier querying
    startTime: { type: String, required: true }, // Start time of the task
    endTime: { type: String, required: true }, // End time of the task
    activity: { type: String, required: true }, // Description of the activity
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const Routine = mongoose.models.Routine || mongoose.model<IRoutine>('Routine', RoutineSchema);

export default Routine;

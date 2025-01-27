import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  userId: string;
  schedule: {
    start: string;
    end: string;
    task: string;
    priority: number;
  }[];
}

const ScheduleSchema: Schema = new Schema<ISchedule>({
  userId: { type: String, required: true },
  schedule: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
      task: { type: String, required: true },
      priority: { type: Number, required: true },
    },
  ],
});

const Schedule = mongoose.model<ISchedule>('Schedule', ScheduleSchema);
export default Schedule;

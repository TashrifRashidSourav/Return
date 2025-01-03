import mongoose, { Schema, Document } from 'mongoose';

export interface IRoutine extends Document {
  userId: mongoose.Types.ObjectId;
  time: string;
  activity: string;
}

const RoutineSchema = new Schema<IRoutine>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: String, required: true },
  activity: { type: String, required: true },
});

const Routine = mongoose.models.Routine || mongoose.model<IRoutine>('Routine', RoutineSchema);

export default Routine;

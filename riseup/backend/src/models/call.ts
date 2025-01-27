import mongoose, { Schema, Document } from 'mongoose';

interface ICall extends Document {
  roomName: string;
  callerId: mongoose.Types.ObjectId; // ID of the user initiating the call
  receiverId: mongoose.Types.ObjectId; // ID of the user being called
  timestamp: Date;
  status: string; // "active", "completed", or "missed"
}

const callSchema = new Schema<ICall>({
  roomName: { type: String, required: true },
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'missed'], default: 'active' },
});

const Call = mongoose.models.Call || mongoose.model<ICall>('Call', callSchema);

export default Call;

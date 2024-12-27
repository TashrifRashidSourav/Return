import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Use existing model if already compiled, or create a new one
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Enable CORS to allow cross-origin requests from mobile devices
const corsOptions = {
  origin: '*', // Allows all origins (for development purposes)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow necessary methods
};
app.use(cors(corsOptions));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
import registrationRoutes from './routes/registration';
import authenticationRoutes from './routes/authentication';
import profileRoutes from './routes/profile';
import updateProfileRoutes from './routes/updateProfile';

// Use routes
app.use('/register', registrationRoutes);
app.use('/login', authenticationRoutes);
app.use('/profile', profileRoutes);
app.use('/update-profile', updateProfileRoutes);

// Start server and make it accessible from any device in the same network
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000; // Convert the port to a number if provided
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// Create an HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust origin settings for your app
  },
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific chat room
  socket.on('joinRoom', ({ chatId }) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', ({ chatId, senderId, text }) => {
    const message = { chatId, senderId, text, createdAt: new Date() };

    // Broadcast the message to other users in the chat room
    io.to(chatId).emit('messageReceived', message);
    console.log('Message sent:', message);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Import routes
import registrationRoutes from './routes/registration';
import authenticationRoutes from './routes/authentication';
import profileRoutes from './routes/profile';
import updateProfileRoutes from './routes/updateProfile';
import postRoutes from './routes/postRoutes';
import chatRoutes from './routes/chatRoutes'; // Chat routes

// Use routes
app.use('/register', registrationRoutes);
app.use('/login', authenticationRoutes);
app.use('/profile', profileRoutes);
app.use('/update-profile', updateProfileRoutes);
app.use('/posts', postRoutes);
app.use('/chats', chatRoutes); // Use chat routes

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000; // Convert the port to a number if provided
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

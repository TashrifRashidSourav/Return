import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY);

// Initialize Express app
const app = express();
app.use(express.json());

// Enable CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Serve static files for uploads
const uploadsDir = path.join(__dirname, '../src/uploads');
app.use('/uploads', express.static(uploadsDir)); // Static route for uploaded files

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
    origin: '*',
  },
});

// Socket.IO logic for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join room for a specific chat
  socket.on('joinRoom', ({ chatId }) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  // Send a message in a chat
  socket.on('sendMessage', ({ chatId, senderId, text }) => {
    if (!chatId || !senderId || !text) {
      console.error('Invalid message data');
      return;
    }

    const message = { chatId, senderId, text, createdAt: new Date() };
    io.to(chatId).emit('messageReceived', message); // Emit the 'messageReceived' event to the room
    console.log('Message sent:', message);
  });

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
import chatRoutes from './routes/chatRoutes';
import userRoutes from './routes/userRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import quoteRoutes from './routes/quoteRoutes';
import storyRoutes from './routes/storyRoutes';
import aiResponseRoutes from './routes/aiResponseRoutes';

// Use routes
app.use('/register', registrationRoutes);
app.use('/login', authenticationRoutes);
app.use('/profile', profileRoutes);
app.use('/update-profile', updateProfileRoutes);
app.use('/api/posts', postRoutes);
app.use('/chats', chatRoutes);
app.use('/users', userRoutes);
app.use('/routines', scheduleRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/stories', storyRoutes);
app.use('/airesponse', aiResponseRoutes);

// Hugging Face API route
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HUGGINGFACE_API_KEY) {
  console.error('HUGGINGFACE_API_KEY is not set in the .env file.');
  throw new Error('HUGGINGFACE_API_KEY is missing in environment variables.');
}

app.post('/airesponse', async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: `Provide a concise answer: ${input}` },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
        params: {
          max_length: 20, // Limit output length for concise responses
        },
      }
    );

    // Ensure only the relevant data is returned
    const output = response.data[0]?.generated_text || 'No output generated';
    res.json({ output });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Axios error:', err.response?.data || err.message);
    } else {
      console.error('Unexpected error:', err);
    }
    res.status(500).json({ error: 'Failed to fetch response from Hugging Face API' });
  }
});

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000; // Convert PORT to a number
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

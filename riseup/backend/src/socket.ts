import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/message';
import { Chat } from './models/chat';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create HTTP and Socket.IO servers
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific chat room
  socket.on('joinRoom', ({ chatId }: { chatId: string }) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', async ({ chatId, senderId, text }: { chatId: string, senderId: string, text: string }) => {
    if (!chatId || !senderId || !text) {
      console.error('Missing required fields for message');
      return;
    }

    try {
      // Save the message to the database
      const message = await new Message({
        chat: chatId,
        sender: senderId,
        content: text,
      }).save();

      // Update the chat's `updatedAt` field
      await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

      // Broadcast the message to the chat room
      io.to(chatId).emit('messageReceived', message);
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

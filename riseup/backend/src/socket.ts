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
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining a specific room
  socket.on('joinRoom', (userId: string) => {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId received for joinRoom:', userId);
      return;
    }
    socket.join(userId);
    console.log(`User ${userId} joined their room.`);
  });

  // Handle sending a message
  socket.on(
    'sendMessage',
    async ({ chatId, senderId, text }: { chatId: string; senderId: string; text: string }) => {
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
    }
  );

  // Handle call initiation
  socket.on('callUser', ({ callerId, receiverId }: { callerId: string; receiverId: string }) => {
    if (!callerId || !receiverId) {
      console.error('CallerId and ReceiverId are required for a call');
      return;
    }
    console.log(`Call initiated from ${callerId} to ${receiverId}`);
  
    // Ensure the receiver's room exists
    const receiverRoom = io.sockets.adapter.rooms.get(receiverId);
    if (receiverRoom && receiverRoom.size > 0) {
      console.log(`Receiver ${receiverId} is connected. Emitting incomingCall.`);
      io.to(receiverId).emit('incomingCall', { callerId });
    } else {
      console.error(`Receiver ${receiverId} is not connected or their room does not exist.`);
      io.to(callerId).emit('callFailed', { message: 'Receiver is not connected.' });
    }
  });
  

  // Handle call acceptance
  socket.on('acceptCall', ({ callerId, receiverId }: { callerId: string; receiverId: string }) => {
    if (!callerId || !receiverId) {
      console.error('CallerId and ReceiverId are required to accept a call');
      return;
    }
    console.log(`Call accepted by ${receiverId}`);
    io.to(callerId).emit('callAccepted', { receiverId });
  });

  // Handle call rejection
  socket.on('rejectCall', ({ callerId, receiverId }: { callerId: string; receiverId: string }) => {
    if (!callerId || !receiverId) {
      console.error('CallerId and ReceiverId are required to reject a call');
      return;
    }
    console.log(`Call rejected by ${receiverId}`);
    io.to(callerId).emit('callRejected', { receiverId });
  });

  // Handle call ending
  socket.on('endCall', ({ callerId, receiverId }: { callerId: string; receiverId: string }) => {
    if (!callerId || !receiverId) {
      console.error('CallerId and ReceiverId are required to end a call');
      return;
    }
    console.log(`Call ended between ${callerId} and ${receiverId}`);
    io.to(callerId).emit('callEnded', { receiverId });
    io.to(receiverId).emit('callEnded', { callerId });
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

import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';

interface UserSocketMap {
  [userId: string]: string; // Maps user ID to their socket ID
}

const userSocketMap: UserSocketMap = {};

// Initialize the Socket.IO server
const initializeSocket = (server: http.Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: '*', // Allows all origins for now, you can restrict this
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // Event: User joins with their userId
    socket.on('join', (userId: string) => {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} joined with socket ID ${socket.id}`);
    });

    // Event: Sending a message
    socket.on('sendMessage', (data: { senderId: string; receiverId: string; message: string }) => {
      const { senderId, receiverId, message } = data;

      // Find the receiver's socket ID
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        // Send the message to the receiver
        io.to(receiverSocketId).emit('receiveMessage', {
          senderId,
          message,
        });
        console.log(`Message sent from ${senderId} to ${receiverId}`);
      } else {
        console.log(`User ${receiverId} is offline`);
      }
    });

    // Event: User disconnects
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);

      // Remove the user from the userSocketMap
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          console.log(`User ${userId} removed from socket map`);
        }
      }
    });
  });

  return io;
};

export default initializeSocket;

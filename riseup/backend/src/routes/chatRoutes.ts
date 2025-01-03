import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Chat } from '../models/chat';
import Message from '../models/message';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

let io: SocketIOServer;

// Socket authentication middleware
const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Authentication token is required'));
  }

  try {
    const decoded = jwt.verify(token as string, JWT_SECRET) as any;
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

export const initializeSocketServer = (server: SocketIOServer) => {
  io = server;
  
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.data.user.id);

    // Handle joining chat rooms
    socket.on('joinRoom', ({ chatId }: { chatId: string }) => {
      socket.join(chatId);
      console.log(`User ${socket.data.user.id} joined chat: ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on('leaveRoom', ({ chatId }: { chatId: string }) => {
      socket.leave(chatId);
      console.log(`User ${socket.data.user.id} left chat: ${chatId}`);
    });

    // Handle new messages
    socket.on('sendMessage', async (payload: {
      chatId: string;
      text: string;
      receiverId: string;
    }) => {
      try {
        const { chatId, text, receiverId } = payload;
        const senderId = socket.data.user.id;

        // Save message to database
        const newMessage = new Message({
          chat: chatId,
          sender: senderId,
          text,
        });
        await newMessage.save();

        // Update chat's lastMessage and updatedAt
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
          updatedAt: new Date(),
        });

        // Populate sender information
        await newMessage.populate('sender', '_id name');

        // Emit message to room
        io.to(chatId).emit('message', newMessage);

        // Emit typing stopped event
        socket.to(chatId).emit('userStoppedTyping', { userId: senderId });

      } catch (error) {
        console.error('Error handling new message:', error);
        socket.emit('messageError', {
          error: 'Failed to send message',
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ chatId }: { chatId: string }) => {
      socket.to(chatId).emit('userTyping', { userId: socket.data.user.id });
    });

    socket.on('stopTyping', ({ chatId }: { chatId: string }) => {
      socket.to(chatId).emit('userStoppedTyping', { userId: socket.data.user.id });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.user.id);
    });
  });
};

// Helper function to authenticate HTTP requests
const authenticateRequest = (req: Request, res: Response): { isValid: boolean; user?: any } => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing or invalid' });
    return { isValid: false };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { isValid: true, user: decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
    return { isValid: false };
  }
};

// Error handling helper
const handleError = (error: unknown, res: Response, message: string) => {
  if (error instanceof Error) {
    console.error(`${message}: ${error.message}`);
    res.status(500).json({ message, error: error.message });
  } else {
    console.error(`${message}:`, error);
    res.status(500).json({ message, error: 'An unknown error occurred' });
  }
};

// Route: Get messages for a chat
router.get('/:chatId/messages', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chat: chatId })
      .populate('sender', '_id name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .exec();

    const total = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      messages: messages.reverse(),
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    handleError(error, res, 'Error fetching messages');
  }
});

// Route: Send a message
router.post('/:chatId/messages', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { chatId } = req.params;
  const { text } = req.body;
  const senderId = auth.user.id;

  if (!text?.trim()) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.members.includes(senderId)) {
      return res.status(403).json({ message: 'User is not a member of this chat' });
    }

    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      text: text.trim()
    });

    await newMessage.save();
    await newMessage.populate('sender', '_id name');

    // Update chat's lastMessage and updatedAt
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    res.status(201).json({ message: 'Message sent', newMessage });
  } catch (error) {
    handleError(error, res, 'Error sending message');
  }
});

// Route: Start or get a chat
router.post('/start', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { receiverId } = req.body;
  const senderId = auth.user.id;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  if (receiverId === senderId) {
    return res.status(400).json({ message: 'Cannot start chat with yourself' });
  }

  try {
    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] }
    }).populate('members', '_id name');

    if (!chat) {
      chat = new Chat({ members: [senderId, receiverId] });
      await chat.save();
      await chat.populate('members', '_id name');
    }

    res.status(200).json({ chat });
  } catch (error) {
    handleError(error, res, 'Error starting chat');
  }
});

// Route: Get user's chats
router.get('/', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const userId = auth.user.id;

  try {
    const chats = await Chat.find({ members: userId })
      .populate('members', '_id name')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();

    res.status(200).json({ chats });
  } catch (error) {
    handleError(error, res, 'Error fetching chats');
  }
});

export default router;
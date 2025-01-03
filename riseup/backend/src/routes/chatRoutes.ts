import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Chat } from '../models/chat';
import Message from '../models/message';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Helper function to authenticate requests
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

// Helper function for consistent error handling
const handleError = (error: unknown, res: Response, message: string) => {
  if (error instanceof Error) {
    console.error(`${message}: ${error.message}`);
    res.status(500).json({ message, error: error.message });
  } else {
    console.error(`${message}:`, error);
    res.status(500).json({ message, error: 'An unknown error occurred' });
  }
};

// Route: Get all messages for a specific chat
router.get('/:chatId/messages', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { chatId } = req.params;

  try {
    console.log(`Fetching messages for chatId: ${chatId}`);
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name') // Populate `sender` with only `name`
      .sort({ createdAt: 1 }) // Sort messages by creation time
      .exec();

    if (!messages || messages.length === 0) {
      console.warn(`No messages found for chatId: ${chatId}`);
      return res.status(404).json({ message: 'No messages found for this chat' });
    }

    res.status(200).json({ messages });
  } catch (error) {
    handleError(error, res, 'Error fetching messages');
  }
});

// Route: Send a message in a chat
router.post('/:chatId/messages', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { chatId } = req.params;
  const { text } = req.body;
  const senderId = auth.user.id;

  if (!text) {
    console.error('Message text is required.');
    return res.status(400).json({ message: 'Message text is required' });
  }

  try {
    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const newMessage = new Message({ chat: chatId, sender: senderId, text });
    await newMessage.save();

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.status(201).json({ message: 'Message sent', newMessage });
  } catch (error) {
    handleError(error, res, 'Error sending message');
  }
});

// Route: Start a chat or get an existing one
router.post('/start', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { receiverId } = req.body;
  const senderId = auth.user.id;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  try {
    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    // If no chat exists, create one
    if (!chat) {
      chat = new Chat({ members: [senderId, receiverId] });
      await chat.save();
    }

    res.status(200).json({ chat });
  } catch (error) {
    handleError(error, res, 'Error starting chat');
  }
});

// Route: Get all chats for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const userId = auth.user.id;

  try {
    const chats = await Chat.find({ members: userId })
      .populate('members', 'name') // Populate only `name` for members
      .sort({ updatedAt: -1 }) // Sort by most recently updated chats
      .exec();

    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: 'No chats found for the user' });
    }

    res.status(200).json({ chats });
  } catch (error) {
    handleError(error, res, 'Error fetching chats');
  }
});

export default router;

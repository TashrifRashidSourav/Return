import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Chat } from '../models/chat';
import Message from '../models/message';
import User from '../models/user';

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
    res.status(401).json({ message: 'Invalid or expired token' });
    return { isValid: false };
  }
};

// Route: Get all chats for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const userId = auth.user.id;

  try {
    const chats = await Chat.find({ members: userId })
      .populate('members', 'name') // Populate only `name` for members
      .sort({ updatedAt: -1 }) // Sort by the most recently updated chats
      .exec();

    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: 'No chats found for the user' });
    }

    res.status(200).json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Get all messages for a specific chat
router.get('/:chatId/messages', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name') // Populate sender's name
      .sort({ timestamp: 1 }) // Sort messages in chronological order
      .exec();

    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No messages found for this chat' });
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
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
      members: { $all: [senderId, receiverId] }, // Both members should exist in the chat
    });

    // If no chat exists, create one
    if (!chat) {
      chat = new Chat({ members: [senderId, receiverId] });
      await chat.save();
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Send a message in a chat
router.post('/:chatId/messages', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = auth.user.id;

  if (!content) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    // Create a new message
    const newMessage = new Message({ chat: chatId, sender: senderId, content });
    await newMessage.save();

    // Update the chat's updatedAt field
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.status(201).json({ message: 'Message sent', newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

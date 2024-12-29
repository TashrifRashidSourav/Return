import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Chat } from '../models/chat';

import  User from '../models/user';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Helper function for authentication inside routes
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

// Route: Get all chats for a user
router.get('/', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return; // Stop execution if authentication fails

  const userId = auth.user.id;

  try {
    const chats = await Chat.find({ $or: [{ senderId: userId }, { receiverId: userId }] });
    res.status(200).json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Send a message
router.post('/', async (req: Request, res: Response) => {
  const auth = authenticateRequest(req, res);
  if (!auth.isValid) return;

  const { receiverId, message } = req.body;
  const senderId = auth.user.id;

  try {
    const newChat = new Chat({ senderId, receiverId, message });
    await newChat.save();
    res.status(201).json({ message: 'Message sent successfully', chat: newChat });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

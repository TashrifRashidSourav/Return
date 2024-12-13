import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Middleware to authenticate token
const authenticate = (req: Request, res: Response, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

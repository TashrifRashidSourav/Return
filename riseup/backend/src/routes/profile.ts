import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user'; // Assuming you have a User model

dotenv.config();
const router = express.Router();

// Profile route
router.get('/profile', async (req: Request, res: Response) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT secret is not configured' });
  }

  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Decode the token to extract the user's ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    const userId = decodedToken.userId;

    // Fetch the user's details from the database
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user's profile details
    res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
});

export default router;

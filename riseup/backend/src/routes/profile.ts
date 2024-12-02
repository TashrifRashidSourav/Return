import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user'; // Assuming you have a User model
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Define a custom type for the Request object with the 'user' property
interface CustomRequest extends Request {
  user?: { userId: string; email: string }; // Define the structure of 'user' based on your JWT payload
}

// Middleware to verify JWT token
const verifyToken = (req: CustomRequest, res: Response, next: Function) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Get the token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("Decoded JWT Payload:", decoded); // Log the decoded payload for debugging
    req.user = decoded as { userId: string; email: string }; // Attach decoded info to req.user
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// Get user profile endpoint
router.get('/profile', verifyToken, async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log("User ID from token:", req.user.userId); // Log the userId from the token for debugging

    // Find the user by their ID (from the token payload)
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password from the response
    if (!user) {
      console.log("User not found in the database for ID:", req.user.userId); // Log if no user is found
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Return the user profile data
    res.json({
      userId: user._id,
      email: user.email,
      name: user.name, // Assuming 'name' field is stored in the model
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// Models
import User from '../models/user'; // User model
import Consultant from '../models/Counselor'; // Consultant model

dotenv.config();

const router = express.Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  // Input validation
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  try {
    let account;

    // Check role and find the account in the appropriate collection
    if (role === 'user') {
      account = await User.findOne({ email });
    } else if (role === 'consultant') {
      account = await Consultant.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // If the account does not exist
    if (!account) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the provided password matches the stored hashed password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure JWT_SECRET is defined in the environment variables
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { accountId: account._id, email: account.email, role },
      process.env.JWT_SECRET as string, // Ensure JWT_SECRET is a string
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the token and account information in the response
    res.json({
      message: 'Login successful',
      token,
      role,
      account: {
        id: account._id,
        name: account.name,
        email: account.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

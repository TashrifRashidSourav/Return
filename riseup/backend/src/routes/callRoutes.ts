import express, { Request, Response } from 'express';
import User from '../models/user'; // User model from the database

const router = express.Router();

// Get all users (For calling purposes)
router.get('/users', async (req: Request, res: Response) => {
  try {
    // Fetch all users, returning only essential fields for calling
    const users = await User.find({}, 'name _id email online'); // Include 'online' status if applicable
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Start a call (optional endpoint for logging or initiating calls)
router.post('/start', async (req: Request, res: Response) => {
  const { callerId, receiverId } = req.body;

  if (!callerId || !receiverId) {
    return res.status(400).json({ message: 'CallerId and ReceiverId are required' });
  }

  try {
    // Fetch the caller and receiver from the database
    const caller = await User.findById(callerId, 'name _id email');
    const receiver = await User.findById(receiverId, 'name _id email');

    if (!caller || !receiver) {
      return res.status(404).json({ message: 'Caller or Receiver not found' });
    }

    // Optional: Log the call in a `calls` collection if needed in the future

    res.status(200).json({
      message: 'Call initiated successfully',
      caller,
      receiver,
    });
  } catch (error) {
    console.error('Error starting the call:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch online users
router.get('/online-users', async (req: Request, res: Response) => {
  try {
    // Fetch users who are online
    const users = await User.find({ online: true }, 'name _id email');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'Failed to fetch online users' });
  }
});

// Update user's online status
router.put('/status', async (req: Request, res: Response) => {
  const { userId, online } = req.body;

  if (!userId || online === undefined) {
    return res.status(400).json({ message: 'UserId and online status are required' });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { online }, { new: true, select: 'name _id email online' });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

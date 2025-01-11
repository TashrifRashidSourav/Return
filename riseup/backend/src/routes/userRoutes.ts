import express, { Request, Response } from 'express';
import User from '../models/user';

const router = express.Router();

// Search users by name
router.get('/search', async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name parameter is required' });
  }

  try {
    // Find users whose names match the query (case-insensitive)
    const users = await User.find(
      { name: { $regex: name, $options: 'i' } },
      'name _id' // Return only the name and _id fields
    );

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id, 'name _id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

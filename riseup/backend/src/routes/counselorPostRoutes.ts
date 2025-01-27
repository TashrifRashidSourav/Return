import express, { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/user';

const router = express.Router();

// Get all posts for counselors
router.get('/', async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name profilePicture') // Populate userId with name and profile picture
      .sort({ createdAt: -1 }); // Sort by newest posts first

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a single post by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate('userId', 'name profilePicture') // Populate userId with name and profile picture
      .exec();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get posts by a specific user for counselors
router.get('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ userId })
      .populate('userId', 'name profilePicture') // Populate userId with name and profile picture
      .sort({ createdAt: -1 }); // Sort by newest posts first

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

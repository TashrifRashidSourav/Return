import express, { Request, Response } from 'express';
import Post from '../models/Post';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Middleware for authentication
const authenticate = (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create a new post
router.post('/create', authenticate, async (req: Request, res: Response) => {
  try {
    const { text, imageUrl } = req.body;
    const post = new Post({
      userId: (req as any).user.id,
      text,
      imageUrl,
      likes: []
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Get all posts
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.put('/like/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = (req as any).user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the user already liked the post
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // If not liked, add to likes
      post.likes.push(userId);
    } else {
      // If already liked, remove from likes (unlike)
      post.likes = post.likes.filter(id => id !== userId);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like/unlike post' });
  }
});
 

//   a post
router.put('/update/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = (req as any).user.id;

    const post = await Post.findOneAndUpdate(
      { _id: id, userId },
      { text },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/delete/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const post = await Post.findOneAndDelete({ _id: id, userId });
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

export default router;

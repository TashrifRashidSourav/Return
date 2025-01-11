import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import Post from '../models/Post';

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
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed'));
    }
  },
});

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

// Route: Create a new post
router.post(
  '/create',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const post = new Post({
        userId: (req as any).user.id,
        text,
        imageUrl,
        likes: [],
      });

      await post.save();
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Failed to create post' });
    }
  }
);

// Route: Get all posts (with pagination)
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
      totalPosts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Route: Get user-specific posts
router.get('/my-posts', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const posts = await Post.find({ userId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user-specific posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Route: Like or unlike a post
router.put('/like/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = (req as any).user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Failed to like/unlike post' });
  }
});

// Route: Update a post
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
    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Route: Delete a post
router.delete('/delete/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const post = await Post.findOneAndDelete({ _id: id, userId });
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });

    res.status(200).json({ message: 'Post deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import Post from '../models/Post';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Middleware to authenticate token
const authenticate = (req: Request, res: Response, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded; // Attach user info to request object
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory for storing uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Route: Create a new post
router.post('/create', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newPost = new Post({
      userId: (req as any).user.id,
      text,
      imageUrl,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Get posts with pagination
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Get pagination params from query
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 posts per page
    const skip = (page - 1) * limit;

    // Fetch posts with pagination
    const posts = await Post.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)  // Skip posts for previous pages
      .limit(limit); // Limit the number of posts per page

    // Count total posts to calculate total pages
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    // Respond with posts and pagination info
    res.status(200).json({
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Like or Unlike a post
router.put('/like/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = (req as any).user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(userId)) {
      // Unlike post
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      // Like post
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: 'Post updated successfully', likes: post.likes });
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Update a post
router.put('/update/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = (req as any).user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the post belongs to the logged-in user
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    post.text = text || post.text; // Update text if provided
    await post.save();

    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Delete a post
router.delete('/delete/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = (req as any).user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the post belongs to the logged-in user
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

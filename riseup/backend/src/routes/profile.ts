import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/user';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});

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

// Get user profile
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure the profile picture URL is served correctly
    if (user.profilePicture) {
      user.profilePicture = `${req.protocol}://${req.get('host')}${user.profilePicture}`;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put(
  '/update',
  authenticate,
  upload.single('profilePicture') as express.RequestHandler, // Explicitly cast multer middleware
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const userId = (req as any).user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields as needed
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      if (profilePicture) {
        // Delete old profile picture if it exists
        if (user.profilePicture && user.profilePicture.startsWith('/uploads')) {
          const oldPath = path.join(__dirname, `..${user.profilePicture}`);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        user.profilePicture = profilePicture;
      }

      // Save updated user data
      await user.save();

      // Append full URL to the profile picture in the response
      if (user.profilePicture) {
        user.profilePicture = `${req.protocol}://${req.get('host')}${user.profilePicture}`;
      }

      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Serve static files for uploaded images
router.use('/uploads', express.static(uploadDir));

export default router;

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the User model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
});

const User = mongoose.model('User', UserSchema);

const router = express.Router();

// Multer setup for file uploads
const uploadDir = path.join(__dirname, '../uploads');

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

const upload: multer.Multer = multer({
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
});

// Registration endpoint
router.post(
  '/register',
  upload.single('profilePicture') as unknown as express.RequestHandler, // Explicit casting
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (profilePicture) {
          const uploadedFilePath = path.join(__dirname, `..${profilePicture}`);
          if (fs.existsSync(uploadedFilePath)) {
            fs.unlinkSync(uploadedFilePath);
          }
        }
        return res.status(400).json({ message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        profilePicture: profilePicture || '',
      });

      await newUser.save();

      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Error during registration:', error);
      if (profilePicture) {
        const uploadedFilePath = path.join(__dirname, `..${profilePicture}`);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;

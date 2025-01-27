import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Quote from '../models/Quote';

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

// Route: Add a new quote
router.post('/add', authenticate, async (req: Request, res: Response) => {
  try {
    const { text, author } = req.body;

    if (!text) return res.status(400).json({ message: 'Quote text is required' });

    const quote = new Quote({
      text,
      author: author || 'Anonymous',
    });

    await quote.save();
    res.status(201).json({ message: 'Quote added successfully', quote });
  } catch (error) {
    console.error('Error adding quote:', error);
    res.status(500).json({ message: 'Failed to add quote' });
  }
});

// Route: Get all quotes
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.status(200).json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ message: 'Failed to fetch quotes' });
  }
});

// Route: Update a quote
router.put('/update/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }

    const quote = await Quote.findByIdAndUpdate(
      id,
      { text, author },
      { new: true, runValidators: true }
    );

    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    res.status(200).json({ message: 'Quote updated successfully', quote });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ message: 'Failed to update quote' });
  }
});

// Route: Delete a quote
router.delete('/delete/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }

    const quote = await Quote.findByIdAndDelete(id);

    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    res.status(200).json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ message: 'Failed to delete quote' });
  }
});

export default router;

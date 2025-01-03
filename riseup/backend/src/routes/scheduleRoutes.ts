import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Routine from '../models/routines';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Helper function for authentication
const authenticateRequest = (req: Request): { userId?: string; error?: string } => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return { error: 'No token provided' };
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.id };
  } catch {
    return { error: 'Invalid or expired token' };
  }
};

// Fetch all routines
router.get('/', async (req: Request, res: Response) => {
  const { userId, error } = authenticateRequest(req);
  if (error) {
    return res.status(401).json({ message: error });
  }

  try {
    const routines = await Routine.find({ userId });
    res.status(200).json({ routines });
  } catch (err) {
    console.error('Error fetching routines:', err);
    res.status(500).json({ message: 'Failed to fetch routines' });
  }
});

// Add a new routine
router.post('/', async (req: Request, res: Response) => {
  const { userId, error } = authenticateRequest(req);
  if (error) {
    return res.status(401).json({ message: error });
  }

  const { time, activity } = req.body;
  if (!time || !activity) {
    return res.status(400).json({ message: 'Time and activity are required' });
  }

  try {
    const newRoutine = new Routine({ userId, time, activity });
    await newRoutine.save();
    res.status(201).json({ routine: newRoutine });
  } catch (err) {
    console.error('Error adding routine:', err);
    res.status(500).json({ message: 'Failed to add routine' });
  }
});

// Delete a routine
router.delete('/:id', async (req: Request, res: Response) => {
  const { userId, error } = authenticateRequest(req);
  if (error) {
    return res.status(401).json({ message: error });
  }

  const { id } = req.params;
  try {
    const routine = await Routine.findOneAndDelete({ _id: id, userId });
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found or unauthorized' });
    }
    res.status(200).json({ message: 'Routine deleted successfully' });
  } catch (err) {
    console.error('Error deleting routine:', err);
    res.status(500).json({ message: 'Failed to delete routine' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import HabitTracker from '../models/habitTracker';

const router = express.Router();

// **1. Create a habit tracker entry**
router.post('/create', async (req: Request, res: Response) => {
  const { userId, questions, mood } = req.body;

  // Validate input fields
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid or missing userId' });
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({ message: 'Questions must be an array with at least one item' });
  }
  if (!mood || !mood.feeling || !mood.energyLevel) {
    return res.status(400).json({
      message: 'Mood must include both "feeling" and "energyLevel".',
    });
  }

  try {
    // Create a new habit tracker entry
    const entry = new HabitTracker({
      userId,
      questions,
      mood,
      date: new Date(),
    });
    await entry.save();
    res.status(201).json({
      message: 'Habit tracker entry created successfully',
      entry,
    });
  } catch (error) {
    console.error('Error creating habit tracker entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// **2. Get all habit tracker entries for a user**
router.get('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Validate userId
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    // Fetch habit tracker entries for the user
    const entries = await HabitTracker.find({ userId }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching habit tracker entries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// **3. Get a specific habit tracker entry by ID**
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate habit tracker entry ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid habit tracker entry ID' });
  }

  try {
    const entry = await HabitTracker.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Habit tracker entry not found' });
    }
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching habit tracker entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// **4. Update a habit tracker entry**
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { questions, mood } = req.body;

  // Validate habit tracker entry ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid habit tracker entry ID' });
  }

  // Validate input fields
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Questions must be a valid array' });
  }
  if (!mood || !mood.feeling || !mood.energyLevel) {
    return res.status(400).json({
      message: 'Mood must include both "feeling" and "energyLevel".',
    });
  }

  try {
    const updatedEntry = await HabitTracker.findByIdAndUpdate(
      id,
      { questions, mood },
      { new: true } // Return the updated document
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: 'Habit tracker entry not found' });
    }

    res.status(200).json({
      message: 'Habit tracker entry updated successfully',
      updatedEntry,
    });
  } catch (error) {
    console.error('Error updating habit tracker entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// **5. Delete a habit tracker entry**
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate habit tracker entry ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid habit tracker entry ID' });
  }

  try {
    const result = await HabitTracker.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Habit tracker entry not found' });
    }
    res.status(200).json({
      message: 'Habit tracker entry deleted successfully',
      result,
    });
  } catch (error) {
    console.error('Error deleting habit tracker entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// **6. Delete all habit tracker entries for a user**
router.delete('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Validate userId
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const result = await HabitTracker.deleteMany({ userId });
    res.status(200).json({
      message: 'All habit tracker entries for the user have been deleted',
      result,
    });
  } catch (error) {
    console.error('Error deleting user habit tracker entries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

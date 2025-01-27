import express, { Request, Response } from 'express';
import CounselorStory from '../models/counselorStory';
import Counselor from '../models/Counselor';

const router = express.Router();

// Create a new counselor story
router.post('/create', async (req: Request, res: Response) => {
  const { title, authorId, content } = req.body;

  if (!title || !authorId || !content) {
    return res.status(400).json({ error: 'Title, author ID, and content are required.' });
  }

  try {
    const story = new CounselorStory({ title, author: authorId, content });
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to create story', details: message });
  }
});

// Get all counselor stories
router.get('/', async (req: Request, res: Response) => {
  try {
    const stories = await CounselorStory.find().populate('author', 'name email profilePicture');
    res.status(200).json(stories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to fetch stories', details: message });
  }
});

// Get a single counselor story by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const story = await CounselorStory.findById(id).populate('author', 'name email profilePicture');
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(200).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to fetch story', details: message });
  }
});

// Update a counselor story
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updatedStory = await CounselorStory.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(200).json(updatedStory);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to update story', details: message });
  }
});

// Delete a counselor story
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedStory = await CounselorStory.findByIdAndDelete(id);
    if (!deletedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to delete story', details: message });
  }
});

// Like a counselor story
router.post('/:id/like', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const story = await CounselorStory.findById(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    story.likes += 1;
    await story.save();
    res.status(200).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to like story', details: message });
  }
});

export default router;

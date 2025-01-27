import express from 'express';
import Story from '../models/story';
import User from '../models/user'; // Assuming your `user.ts` is in `models/user`
import { Request, Response } from 'express';

const router = express.Router();

// Create a new story
router.post('/create', async (req: Request, res: Response) => {
  const { title, authorId, content } = req.body;

  if (!title || !authorId || !content) {
    return res.status(400).json({ error: 'Title, author ID, and content are required.' });
  }

  try {
    const story = new Story({ title, author: authorId, content });
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to create story', details: message });
  }
});

// Get all stories
router.get('/', async (req: Request, res: Response) => {
  try {
    const stories = await Story.find().populate('author', 'name email profilePicture');
    res.status(200).json(stories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to fetch stories', details: message });
  }
});

// Get a single story by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const story = await Story.findById(id).populate('author', 'name email profilePicture');
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(200).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to fetch story', details: message });
  }
});

// Update a story
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updatedStory = await Story.findByIdAndUpdate(
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

// Delete a story
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedStory = await Story.findByIdAndDelete(id);
    if (!deletedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to delete story', details: message });
  }
});

// Like a story
router.post('/:id/like', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const story = await Story.findById(id);
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

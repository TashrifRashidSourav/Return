import express, { Request, Response } from 'express';
import Counselor from '../models/Counselor';

const router = express.Router();

router.get('/search', async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name parameter is required' });
  }

  try {
    // Find counselors whose names match the query (case-insensitive)
    const counselors = await Counselor.find(
      { name: { $regex: name, $options: 'i' } },
      'name _id specialization profilePicture' // Return only name, _id, specialization, and profilePicture
    );

    res.status(200).json({ counselors });
  } catch (error) {
    console.error('Error searching counselors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get counselor by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const counselor = await Counselor.findById(
      id,
      'name _id specialization expertise profilePicture reviews'
    ); // Return specific fields
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    res.status(200).json({ counselor });
  } catch (error) {
    console.error('Error fetching counselor by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

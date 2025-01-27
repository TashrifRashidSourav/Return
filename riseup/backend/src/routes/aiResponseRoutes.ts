import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Schedule from '../models/Schedule';

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
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper function to adjust the schedule
const adjustSchedule = (schedule: any[], newTask: any) => {
  const timeNeeded =
    new Date(`1970-01-01T${newTask.end}:00`).getTime() -
    new Date(`1970-01-01T${newTask.start}:00`).getTime();
  const newPriority = newTask.priority;
  const adjustedSchedule = [];

  for (const slot of schedule) {
    const slotStart = new Date(`1970-01-01T${slot.start}:00`);
    const slotEnd = new Date(`1970-01-01T${slot.end}:00`);
    const slotDuration = slotEnd.getTime() - slotStart.getTime();

    if (newPriority > slot.priority && timeNeeded > 0) {
      if (slotDuration >= timeNeeded) {
        adjustedSchedule.push({
          start: slot.start,
          end: new Date(slotStart.getTime() + timeNeeded)
            .toISOString()
            .slice(11, 16),
          task: newTask.task,
          priority: newPriority,
        });

        if (slotDuration > timeNeeded) {
          adjustedSchedule.push({
            start: new Date(slotStart.getTime() + timeNeeded)
              .toISOString()
              .slice(11, 16),
            end: slot.end,
            task: slot.task,
            priority: slot.priority,
          });
        }
      } else {
        adjustedSchedule.push({ ...slot, task: newTask.task, priority: newPriority });
      }
    } else {
      adjustedSchedule.push(slot);
    }
  }

  return adjustedSchedule;
};

// Create or update schedule
router.post('/airesponse/update', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { tasks } = req.body;

    let userSchedule = await Schedule.findOne({ userId });
    const newSchedule = tasks.map((task: any) => ({
      start: task.start,
      end: task.end,
      task: task.task,
      priority: task.priority,
    }));

    if (userSchedule) {
      userSchedule.schedule = newSchedule;
    } else {
      userSchedule = new Schedule({ userId, schedule: newSchedule });
    }

    await userSchedule.save();
    res.status(200).json(userSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error });
  }
});

// Add a new task
router.post('/airesponse/add-task', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { newTask } = req.body;

    let userSchedule = await Schedule.findOne({ userId });

    // Initialize schedule if not found
    if (!userSchedule) {
      userSchedule = new Schedule({ userId, schedule: [] });
    }

    userSchedule.schedule = adjustSchedule(userSchedule.schedule, newTask);
    userSchedule.schedule.push(newTask);

    await userSchedule.save();
    res.status(200).json(userSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error adding task', error });
  }
});

// Get schedule
router.get('/airesponse', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    let userSchedule = await Schedule.findOne({ userId });

    // Initialize schedule if not found
    if (!userSchedule) {
      userSchedule = new Schedule({ userId, schedule: [] });
      await userSchedule.save();
    }

    res.status(200).json(userSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule', error });
  }
});

export default router;

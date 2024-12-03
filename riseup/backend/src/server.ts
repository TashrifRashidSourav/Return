import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import profileRoute from './routes/profile';
import { User } from './models/user';

// Load environment variables
dotenv.config();

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Add manual CORS headers for every request
app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081'); // Replace with your frontend's URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Enable credentials if needed
  if (req.method === 'OPTIONS') {
    // Preflight request, return a success response
    return res.sendStatus(200);
  }
  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Add the registration, login, and profile routes
app.use('/api', registerRoute);
app.use('/api', loginRoute);
app.use('/api', profileRoute);

// Handle not found routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

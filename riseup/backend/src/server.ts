import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import profileRoute from './routes/profile';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for specific origin (your frontend URL)
app.use(cors({
  origin: 'http://localhost:5000',  // Frontend running on localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Middleware for parsing JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test API endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Add the registration, login, and profile routes
app.use('/api', registerRoute);
app.use('/api', loginRoute); 
app.use('/api', profileRoute); 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for specific origin (your frontend URL)
app.use(cors({
  origin: 'http://localhost:8081',  // Allow requests only from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow the necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
  preflightContinue: false,  // Preflight requests are handled automatically by default
  optionsSuccessStatus: 200  // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Middleware for parsing JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test API endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Add the registration route
app.use('/api', registerRoute);
app.use('/api', loginRoute); 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

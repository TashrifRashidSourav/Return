import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
app.use(express.json()); // Middleware for parsing JSON

connectDB(); // Connect to MongoDB

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

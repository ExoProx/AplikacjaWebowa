import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/user'; // Make sure you are correctly importing the userRoutes
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('Type of password:', typeof process.env.DB_PASSWORD);
app.use(cors());
app.use(bodyParser.json());  // Make sure the body parser middleware is correctly in place

// Register /api/users route with the userRoutes from user.ts
app.use('/api/users', userRoutes);  // The '/api/users' endpoint will be handled by the userRoutes

// Test route
app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
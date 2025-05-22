import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user'; 
import usersRoutes from './routes/users';
import loginRoutes from './routes/login';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logoutRoute from './routes/logout';
import foodSearch from './routes/fatSecret/search';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from './middlewares/authMiddleware';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.',
});

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(apiLimiter);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    message: 'Too many requests, please try again later.'
});



app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());



app.use('/api/users', userRoutes);  
app.use('/api/login', loginRoutes);
app.use('/api/logout', logoutRoute);
app.use('/foodSecret/search', authenticateToken, foodSearch);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
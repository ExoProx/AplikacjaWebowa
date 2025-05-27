import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user'; 
import loginRoutes from './routes/login';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logoutRoute from './routes/logout';
import foodSearch from './routes/fatSecret/search';
import rateLimit from 'express-rate-limit';
import mealPlanRoute from './routes/mealPlan'
import passport from './config/passport';
import auth from './routes/auth';
import favoritesRoute from './routes/favorites';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false,  
  message: 'Too many requests from this IP, please try again later.',
});

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(apiLimiter);

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes);  
app.use('/api/login', loginRoutes);
app.use('/api/logout', logoutRoute);
app.use('/api/menuList', mealPlanRoute);
app.use('/api/auth', auth)
app.use('/api/favorites', favoritesRoute)
app.use('/foodSecret/search', foodSearch);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
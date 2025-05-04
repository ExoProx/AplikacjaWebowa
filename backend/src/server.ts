import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user'; 
import loginRoutes from './routes/login';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mainPageRoute from './routes/MainPage';
import logoutRoute from './routes/logout';
import foodSearch from './routes/fatSecret/search'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());



app.use('/api/users', userRoutes);  
app.use('/api/login', loginRoutes);
app.use('/mainPage', mainPageRoute);
app.use('/api/logout', logoutRoute);
app.use('/foodSecret/search', foodSearch);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
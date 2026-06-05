import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorMiddleware.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Booking System API is healthy 🚀' });
});



app.use(errorHandler);

export default app;

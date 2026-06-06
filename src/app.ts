import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorMiddleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import resourceRoutes from './modules/resource/resource.routes.js';
import employeeRoutes from './modules/user/user.routes.js';
import bookingRoutes from './modules/booking/booking.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Booking System API is healthy 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', employeeRoutes);
app.use('/api/bookings', bookingRoutes);

// Remaining routes will be added here later
// app.use('/api/organizations', orgRoutes);

app.use(errorHandler);

export default app;

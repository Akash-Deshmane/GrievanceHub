const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// ─── Create Express App ──────────────────────────────────
const app = express();

// ─── Route Imports ────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ─── Core Middlewares ─────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(
    morgan(
        process.env.NODE_ENV === 'development'
            ? 'dev'
            : 'combined'
    )
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 GrievanceHub API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.VERCEL) {
  app.use('/uploads', express.static('/tmp'));
}

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Export App ───────────────────────────────────────────
module.exports = app;
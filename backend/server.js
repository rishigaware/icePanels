require('dotenv').config();
const express = require('express');
const path = require('path'); // Add this line
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const cors = require('cors');
const connectDB = require('./config/db');
connectDB();

const app = express();

// Serving static files (optional, depending on your use case)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse JSON
app.use(express.json());

// // CORS configuration
// const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

// app.use(
//   cors({
//     origin: allowedOrigins,  // Allow all origins if '*'
//     // origin: "*",  // Allow all origins if '*'
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  // Add 'PATCH' here
//     credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
//   })
// );

app.get('/health', (req, res) => res.status(200).send('OK'));


app.use(
  cors({
    origin: true, // Dynamically allow any origin (required for credentials: true)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
// Registering routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Handling dynamic port for Vercel or fallback to local port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

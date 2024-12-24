require('dotenv').config();
const express = require('express');
const path = require('path'); // Add this line
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

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

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // If the origin is not provided (e.g., for server-to-server requests), allow it
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);  // Allow the origin
      } else {
        callback(new Error('Not allowed by CORS'));  // Reject the origin
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Registering routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Handling dynamic port for Vercel or fallback to local port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

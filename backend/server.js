require('dotenv').config();
const express = require('express');
const path = require('path');  // Add this line
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Same for admin routes
const authRoutes = require('./routes/authRoutes'); // Same for admin routes
const cors = require('cors');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // Middleware to parse JSON

// app.use(
//     cors({
//         origin: '*',
//         methods: '*',        // Allow all HTTP methods
//         credentials: true,    // Allow cookies if needed
//     })
// );

const allowedOrigins = process.env.CORS_ORIGINS.split(',');

app.use(
  cors({
    origin: allowedOrigins,
    methods: '*',
    credentials: true,
  })
);


// Registering routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


const express = require('express');
const path = require('path');  // Add this line
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Same for admin routes
const authRoutes = require('./routes/authRoutes'); // Same for admin routes
const cors = require('cors');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // Middleware to parse JSON
app.use(
    cors({
        origin: [
            'http://localhost:5173',           // Your local development URL
            'http://192.168.158.221:5173',     // Your laptop's local IP address
            'http://192.168.30.239:5173'       // Your mobile device's IP address
        ],
        methods: '*',        // Allow all HTTP methods
        credentials: true,    // Allow cookies if needed
    })
);

// Registering routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(3000, 'localhost', () => {
    console.log('Server running on http://localhost:3000');
  });
  

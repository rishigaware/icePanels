const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');

dotenv.config();

const seedData = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/the247panel';
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Admin.deleteMany({});
        console.log('Cleared existing Users and Admins');

        // Create Admin
        const admin = new Admin({
            username: 'admin',
            password: '1234',
            name: 'Admin User',
            email: 'admin@example.com',
            phoneNumber: '1234567890'
        });
        await admin.save();
        console.log('Admin created: admin / 1234');

        // Create User
        const user = new User({
            username: 'user',
            password: '1234',
            name: 'Test User',
            email: 'user@example.com',
            phoneNumber: '0987654321'
        });
        await user.save();
        console.log('User created: user / 1234');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Define the storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname,"..", 'uploads', 'carousel');
    // Create the directory if it doesn't exist
    fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Use the original filename
    cb(null, file.originalname);
  }
});

// Initialize Multer with the storage configuration
const uploadCarousel = multer({ storage: storage });

module.exports = uploadCarousel;

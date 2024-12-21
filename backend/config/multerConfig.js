const multer = require('multer');
const path = require('path');

// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/userDeposit'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Get file extension
        cb(null, Date.now() + fileExtension); // Unique filename based on timestamp
    },
});

// Create multer instance for single file upload
const upload = multer({ storage: storage });

module.exports = upload;

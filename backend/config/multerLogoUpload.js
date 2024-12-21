const multer = require('multer');
const path = require('path');

// Set up storage configuration for multer (logo files)
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logo'); // Directory for logo files
  },
  filename: (req, file, cb) => {
    // Use the original filename (without any modifications)
    cb(null, file.originalname); // Save with the original filename
  },
});

// Create multer instance for single file upload (logo)
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 1000000 }, // Limit to 1MB for logo files
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true); // Accept the file
    } else {
      cb(new Error('Error: Images Only!')); // Reject if it's not an image
    }
  },
}).single('logo'); // Ensure the field name in the form is 'logo'

module.exports = uploadLogo;

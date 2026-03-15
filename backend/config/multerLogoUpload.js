const multer = require('multer');
const path = require('path');
const { cloudinary, CloudinaryStorage } = require('./cloudinaryConfig');

// Cloudinary storage for website logo files
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'the247panel/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image',
  },
});

// Create multer instance for single file upload (logo)
const uploadLogo = multer({
  storage: logoStorage,
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

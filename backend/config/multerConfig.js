const multer = require('multer');
const { cloudinary, CloudinaryStorage } = require('./cloudinaryConfig');

// Cloudinary storage for user deposit proof images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'the247panel/userDeposit',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  },
});

// Create multer instance for single file upload
const upload = multer({ storage });

module.exports = upload;

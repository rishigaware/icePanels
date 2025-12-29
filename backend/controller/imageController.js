const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const ImageCarousel = require('../models/ImageCarousel');
const fs = require('fs');

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all images for a specific carousel
const getImages = async (req, res) => {
  try {
    const { carouselId } = req.params;

    const images = await ImageCarousel.find({ carouselId }).sort({ createdAt: -1 });

    if (images.length === 0) {
      return res.status(200).json([]);
    }

    const formattedImages = images.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Upload a new image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const { type, carouselId } = req.body;

    if (!type || !carouselId) {
      return res.status(400).json({ message: 'Type and carouselId are required.' });
    }

    const imagePath = path.join('uploads', 'images', req.file.filename);

    const newImage = new ImageCarousel({
      imagePath,
      type,
      carouselId,
      originalName: req.file.originalname,
      size: req.file.size
    });

    await newImage.save();

    res.status(201).json({
      message: 'Image uploaded successfully.',
      image: { id: newImage._id, ...newImage.toObject() }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { carouselId, type } = req.body;

    if (!carouselId || !type) {
      return res.status(400).json({ message: 'CarouselId and type are required.' });
    }

    const image = await ImageCarousel.findByIdAndDelete(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Delete the actual file from the filesystem
    if (image.imagePath) {
      const filePath = path.join(__dirname, '..', image.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      message: 'Image deleted successfully.',
      deletedImageId: imageId
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get image statistics
const getImageStats = async (req, res) => {
  try {
    const { carouselId } = req.params;

    const count = await ImageCarousel.countDocuments({ carouselId });

    const stats = {
      totalImages: count,
      carouselId: carouselId,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching image stats:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = {
  upload,
  getImages,
  uploadImage,
  deleteImage,
  getImageStats
};

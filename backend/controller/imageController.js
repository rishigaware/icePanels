const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');

// Initialize Firestore
const db = admin.firestore();

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
    
    // Reference to the images collection for this carousel
    const imagesRef = db.collection('imageCarousels').doc(carouselId).collection('images');
    
    // Fetch all documents in the collection
    const snapshot = await imagesRef.orderBy('createdAt', 'desc').get();
    
    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    // Map the documents to an array of data
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Respond with the fetched data
    res.status(200).json(images);
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
    const imageId = uuidv4();

    const newImage = {
      id: imageId,
      imagePath,
      type,
      carouselId,
      originalName: req.file.originalname,
      size: req.file.size,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    const imageRef = db.collection('imageCarousels').doc(carouselId).collection('images').doc(imageId);
    await imageRef.set(newImage);

    res.status(201).json({
      message: 'Image uploaded successfully.',
      image: newImage
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

    // Reference to the specific image document
    const imageRef = db.collection('imageCarousels').doc(carouselId).collection('images').doc(imageId);
    
    // Get the image document to get the file path
    const imageDoc = await imageRef.get();
    
    if (!imageDoc.exists) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const imageData = imageDoc.data();
    
    // Delete the document from Firestore
    await imageRef.delete();

    // TODO: Delete the actual file from the filesystem
    // const fs = require('fs');
    // const filePath = path.join(__dirname, '..', imageData.imagePath);
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }

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
    
    const imagesRef = db.collection('imageCarousels').doc(carouselId).collection('images');
    const snapshot = await imagesRef.get();
    
    const stats = {
      totalImages: snapshot.size,
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

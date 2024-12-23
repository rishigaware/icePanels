const express = require('express');
const adminController = require('../controller/adminController');
const uploadLogo = require('../config/multerLogoUpload'); // Import multer configuration
const uploadCorousel = require('../config/multerCorusel'); // Import multer configuration

const router = express.Router();

// Admin routes
router.get('/', adminController.getAllAdmins); // Fetch all admins
router.get("/get-all-users", adminController.getAllUsers);//get all users
router.get('/get-all-ids', adminController.getAllIds);

router.post('/signup', adminController.addAdmin);    // Add a new admin
router.patch('/update-transaction', adminController.updateTransaction); // Update transaction
router.patch('/update-id', adminController.updateIdStatus); // Update website status to Accepted

router.post('/update-accountdetails', adminController.updateAccountDetails);   // Add a new user (Signup)
router.get('/get-accountdetails', adminController.getAccountDetails); // Add a new website record
router.get('/get-accountdetails-deposit', adminController.getAccountDetailsDeposit); // Add a new website record
router.get('/admin-transaction', adminController.getAllTransactions);
router.get('/get-websites', adminController.getAllWebsites);

// POST route for adding a website
router.post("/add-website", uploadLogo, adminController.addWebsite);
router.post("/update-profile", adminController.updateProfileController);

router.get('/get/top-carousel', adminController.getAllTopCorousel);
router.get('/get/middle-carousel', adminController.getMiddleTopCorousel);
router.get('/get/bottom-carousel', adminController.getAllBottomCorousel);
router.get('/get/top-card-carousel', adminController.getAllTopCardCorousel);
router.get('/get/bottom-card-carousel', adminController.getAllBottomCardCorousel);
router.post("/upload/top-carousel", uploadCorousel.single('image'), adminController.addTopCorousel);
router.post("/upload/middle-carousel", uploadCorousel.single('image'), adminController.addMiddleCorousel);
router.post("/upload/bottom-carousel", uploadCorousel.single('image'), adminController.addBottomCorousel);
router.post("/upload/top-card-carousel", uploadCorousel.single('image'), adminController.addTopMiddleCorousel);
router.post("/upload/bottom-card-carousel", uploadCorousel.single('image'), adminController.addBottomMiddleCorousel);

// Accept ID Route
router.post("/accept-id", adminController.acceptId);
// Reject ID Route
router.post("/reject-id", adminController.rejectId);

router.patch('/accept-transaction/:txnId', adminController.acceptTransaction);
// Route to reject a transaction
router.patch('/reject-transaction/:txnId', adminController.rejectTransaction);

// Route to update user balance
router.patch('/update-user-balance/:id', adminController.updateUserBalance);


router.delete('/delete-website/:id',adminController.deleteWebsite);
router.delete('/delete-one/topcarousel', adminController.deleteOneTopCarousel);
router.delete('/delete-one/middlecarousel', adminController.deleteOneMiddleCarousel);
router.delete('/delete-one/bottomcarousel', adminController.deleteOneBottomCarousel);
router.delete('/delete-one/top-card-carousel', adminController.deleteOneTopCardCarousel);
router.delete('/delete-one/bottom-card-carousel', adminController.deleteOneBottomCardCarousel);


// Route to delete a user by userId
router.delete('/delete-user/:userId', adminController.deleteUser);


module.exports = router;

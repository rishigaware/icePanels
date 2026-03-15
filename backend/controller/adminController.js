const Admin = require('../models/Admin');
const User = require('../models/User');
const WebsiteId = require('../models/WebsiteId');
const Transaction = require('../models/Transaction');
const AdminAccount = require('../models/AdminAccount');
const Website = require('../models/Website');
const Carousel = require('../models/Carousel');
const Category = require('../models/Category');
const IdRequest = require('../models/IdRequest');
const CloseRequest = require('../models/CloseRequest');
const PasswordChangeRequest = require('../models/PasswordChangeRequest');
const ClosedId = require('../models/ClosedId');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinaryConfig');


// Fetch all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    const formattedAdmins = admins.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));
    res.status(200).json(formattedAdmins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error retrieving admins', error: error.message });
  }
};

// Fetch all users
// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const formattedUsers = users.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};



// Controller to fetch all IDs
// Controller to fetch all IDs
exports.getAllIds = async (req, res) => {
  try {
    const ids = await WebsiteId.find();

    if (ids.length === 0) {
      return res.status(404).json({ message: "No IDs found" });
    }

    const formattedIds = ids.map(doc => {
      return { id: doc._id, ...doc.toObject() };
    });

    res.status(200).json(formattedIds);
  } catch (error) {
    console.error("Error fetching IDs:", error);
    res.status(500).json({ error: "Failed to fetch IDs" });
  }
};

// Get admin balance
// Get admin balance
exports.getAdminBalance = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const balance = admin.balance || 0;

    res.status(200).json({
      balance: balance,
      adminId: adminId
    });
  } catch (error) {
    console.error('Error fetching admin balance:', error);
    res.status(500).json({ message: 'Error fetching admin balance', error: error.message });
  }
};

exports.updateProfileController = async (req, res) => {
  try {
    const { id, name, email, username, password } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (username) admin.username = username;
    if (password) admin.password = password;

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: { id: admin._id, ...admin.toObject() },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Add a new admin (Signup)
// Add a new admin (Signup)
exports.addAdmin = async (req, res) => {
  const { name, phoneNumber, email, password, username } = req.body;

  // Basic validation
  if (!name || !phoneNumber || !email || !password || !username) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check for duplicate username
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const newAdmin = new Admin({
      name,
      phoneNumber,
      email,
      password,
      username,
      role: 'admin',
      balance: 0
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin signed up successfully', admin: { id: newAdmin._id, ...newAdmin.toObject() } });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ message: 'Error adding admin', error: error.message });
  }
};


// Controller for handling the addition of a new website
exports.addWebsite = async (req, res) => {
  const { website, url, coinRate, minimumCoins, category } = req.body;

  // Validation: Ensure all fields are provided
  if (!website || !url || !coinRate || !minimumCoins) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    let logoPath = '';
    if (req.file) {
      logoPath = req.file.path; // Cloudinary URL
    }

    const newWebsite = new Website({
      website,
      url,
      coinRate: parseFloat(coinRate),
      minimumCoins: parseInt(minimumCoins, 10),
      category: category || '', // Add category field
      logo: logoPath
    });

    await newWebsite.save();

    res.status(201).json({
      message: 'Website added successfully',
      website: { id: newWebsite._id, ...newWebsite.toObject() }
    });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ message: 'Error adding website', error: error.message });
  }
};


// Update transaction details by admin
// Update transaction details by admin
exports.updateTransaction = async (req, res) => {
  const { id, transactionId, acceptedAt, status } = req.body;

  // Validation: Ensure `id` is provided
  if (!id) {
    return res.status(400).json({ message: 'Transaction ID (id) is required for updating.' });
  }

  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Update only the fields provided in the request
    if (transactionId) transaction.transactionId = transactionId;
    if (acceptedAt) transaction.acceptedAt = acceptedAt;
    if (status) transaction.status = status;

    await transaction.save();

    res.status(200).json({
      message: 'Transaction updated successfully',
      updatedTransaction: { id, ...transaction.toObject() }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};


exports.updateIdStatus = async (req, res) => {
  const { id } = req.body;

  // Validation: Ensure ID is provided
  if (!id) {
    return res.status(400).json({ message: 'ID is required to update the status.' });
  }

  try {
    const websiteId = await WebsiteId.findById(id);

    if (!websiteId) {
      return res.status(404).json({ message: 'Website record not found.' });
    }

    websiteId.status = 'Accepted';
    await websiteId.save();

    res.status(200).json({
      message: 'Website status updated to Accepted.',
      updatedWebsite: { id, status: 'Accepted' },
    });
  } catch (error) {
    console.error('Error updating website status:', error);
    res.status(500).json({ message: 'Error updating website status', error: error.message });
  }
};

// Controller function to fetch all transactions
// Controller function to fetch all transactions
// Controller function to fetch all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found.' });
    }

    // Fetch all users to map names
    const users = await User.find({}, 'username name');
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.name;
      if (user.username) userMap[user.username] = user.name;
    });

    console.log('User Map created with', Object.keys(userMap).length, 'entries');

    const formattedTransactions = transactions.map(doc => {
      const docObj = doc.toObject();
      let userName = 'Unknown';

      // Debug log for the first few transactions to check createdBy format
      // if (docObj.amount === 48900) console.log('Transaction 48900 createdBy:', doc.createdBy, 'Type:', typeof doc.createdBy);

      if (userMap[doc.createdBy]) {
        userName = userMap[doc.createdBy];
      } else if (mongoose.Types.ObjectId.isValid(doc.createdBy) && userMap[doc.createdBy.toString()]) {
        userName = userMap[doc.createdBy.toString()];
      }

      return {
        id: doc._id,
        ...docObj,
        userDetails: { name: userName }
      };
    });

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};

// Controller to accept a transaction
exports.acceptTransaction = async (req, res) => {
  const txnId = req.params.txnId;
  console.log('Accepting transaction:', txnId);

  try {
    const transaction = await Transaction.findById(txnId);

    if (!transaction) {
      console.log('Transaction not found');
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status === 'Completed' || transaction.status === 'Accepted') {
      console.log('Transaction already completed');
      return res.status(400).json({ message: 'Transaction already completed' });
    }

    transaction.status = 'Completed';
    transaction.acceptedAt = new Date().toISOString();
    await transaction.save();

    // Determine if it is a withdrawal or a deposit
    const isWithdrawal = transaction.paymentMethod === 'Withdraw From Wallet' ||
      transaction.transactionType === 'withdrawal' ||
      transaction.transactionType === 'wallet_withdrawal';

    console.log('Transaction Type:', isWithdrawal ? 'Withdrawal' : 'Deposit', 'Created By:', transaction.createdBy);

    // Update user balance based on transaction type
    let user;
    if (mongoose.Types.ObjectId.isValid(transaction.createdBy)) {
      console.log('Searching user by ID:', transaction.createdBy);
      user = await User.findById(transaction.createdBy);
    }

    if (!user) {
      console.log('Searching user by username:', transaction.createdBy);
      user = await User.findOne({ username: transaction.createdBy });
    }

    if (user) {
      const currentBalance = user.balance || 0;
      let newBalance = currentBalance;

      if (!isWithdrawal) {
        // It's a deposit (Bank, UPI, Card, GPay, etc.)
        newBalance = currentBalance + parseFloat(transaction.amount);
        console.log(`Deposit: Added ${transaction.amount} to user ${user.username} (${user._id}). Old: ${currentBalance}, New: ${newBalance}`);
      } else {
        // It's a withdrawal
        newBalance = Math.max(0, currentBalance - parseFloat(transaction.amount)); // Ensure balance doesn't go negative
        console.log(`Withdrawal: Deducted ${transaction.amount} from user ${user.username}. Old: ${currentBalance}, New: ${newBalance}`);
      }

      user.balance = newBalance;
      await user.save();
    } else {
      console.log('User not found for transaction createdBy:', transaction.createdBy);
    }

    res.status(200).json({ message: 'Transaction accepted', transactionId: txnId, status: 'Completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept transaction', error: error.message });
  }
};
// Controller to reject a transaction
// Controller to reject a transaction
exports.rejectTransaction = async (req, res) => {
  const txnId = req.params.txnId;

  try {
    const transaction = await Transaction.findById(txnId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'Failed';
    await transaction.save();

    res.status(200).json({ message: 'Transaction rejected', transactionId: txnId, status: 'Failed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reject transaction', error: error.message });
  }
};



// Update user balance
// Update user balance
exports.updateUserBalance = async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;

  if (!balance) {
    return res.status(400).json({ message: 'Balance is required' });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance = balance;
    await user.save();

    res.status(200).json({ id, balance });
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ message: 'Error updating user balance', error: error.message });
  }
};




// Get Account Details
// Get Account Details
exports.getAccountDetails = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userAccount = await AdminAccount.findOne({ userId });

    if (!userAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    return res.status(200).json({
      accountNumber: userAccount.accountNumber,
      accountHolderName: userAccount.accountHolderName,
      ifscCode: userAccount.ifscCode,
      bankName: userAccount.bankName,
      upiId: userAccount.upiId
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.updateAccountDetails = async (req, res) => {
  const { accountNumber, accountHolderName, ifscCode, bankName, upiId } = req.body;

  const userId = "1";

  try {
    const defaultData = {
      accountNumber: "1234567890",
      accountHolderName: "John Doe",
      ifscCode: "ABCD0123456",
      bankName: "XYZ Bank",
      upiId: "sample@upi",
    };

    const updatedData = {
      accountNumber: accountNumber || defaultData.accountNumber,
      accountHolderName: accountHolderName || defaultData.accountHolderName,
      ifscCode: ifscCode || defaultData.ifscCode,
      bankName: bankName || defaultData.bankName,
      upiId: upiId || defaultData.upiId,
    };

    const account = await AdminAccount.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Account details updated successfully",
      updatedAccount: { userId, ...updatedData },
    });
  } catch (error) {
    console.error("Error upserting account details:", error);
    res.status(500).json({ message: "Error handling account details", error: error.message });
  }
};


// Get Account Details (First Record)
// Get Account Details (First Record)
exports.getAccountDetailsDeposit = async (req, res) => {
  try {
    const userAccount = await AdminAccount.findOne();

    if (!userAccount) {
      return res.status(404).json({ message: "No account found" });
    }

    return res.status(200).json({
      accountNumber: userAccount.accountNumber,
      accountHolderName: userAccount.accountHolderName,
      ifscCode: userAccount.ifscCode,
      bankName: userAccount.bankName,
      upiId: userAccount.upiId,
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.acceptId = async (req, res) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    idDoc.status = 'Created';
    await idDoc.save();

    res.status(200).json({ message: 'ID Accepted', id: id, status: 'Created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept ID', error: error.message });
  }
};

exports.rejectId = async (req, res) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    idDoc.status = 'Username Exists';
    await idDoc.save();

    res.status(200).json({ message: 'ID rejected due to username already exist', id: id, status: 'Username Already Exist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reject ID', error: error.message });
  }
};

// Controller to update ID information (username, password, comment)
// Controller to update ID information (username, password, comment)
exports.updateId = async (req, res) => {
  const { id, username, password, comment } = req.body;

  // Validation: Ensure required fields are provided
  if (!id) {
    return res.status(400).json({ message: 'ID is required to update the information.' });
  }

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    idDoc.username = username.trim();
    idDoc.password = password.trim();
    idDoc.updatedAt = new Date().toISOString();

    if (comment && comment.trim()) {
      idDoc.comment = comment.trim();
    }

    await idDoc.save();

    res.status(200).json({
      message: 'ID information updated successfully',
      id: { id: idDoc._id, ...idDoc.toObject() }
    });
  } catch (error) {
    console.error('Error updating ID:', error);
    res.status(500).json({ message: 'Failed to update ID information', error: error.message });
  }
};


// Controller for updating a website
exports.updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { website: newName, url, coinRate, minimumCoins, category } = req.body;

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({ message: 'Website not found.' });
    }

    if (newName) website.website = newName;
    if (url) website.url = url;
    if (coinRate) website.coinRate = parseFloat(coinRate);
    if (minimumCoins) website.minimumCoins = parseInt(minimumCoins, 10);
    if (category !== undefined) website.category = category;

    if (req.file) {
      website.logo = req.file.path; // Cloudinary URL
    }

    await website.save();

    res.status(200).json({
      message: 'Website updated successfully.',
      website: { id: website._id, ...website.toObject() }
    });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller to fetch all websites
exports.getAllWebsites = async (req, res) => {
  try {
    const websites = await Website.find();

    if (websites.length === 0) {
      return res.status(404).json({ message: 'No websites found.' });
    }

    const formattedWebsites = websites.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedWebsites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller for deleting a website by its ID
// Controller to delete a website
exports.deleteWebsite = async (req, res) => {
  try {
    const websiteId = req.params.id;

    const website = await Website.findByIdAndDelete(websiteId);

    if (!website) {
      return res.status(404).json({ message: 'Website not found.' });
    }

    res.status(200).json({ message: 'Website deleted successfully.' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
//corousel-->>>

exports.getAllTopCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'top' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getMiddleTopCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'middle' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllBottomCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'bottom' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllTopCardCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'topCard' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllBottomCardCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'bottomCard' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addTopCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'top'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addMiddleCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'middle'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addBottomCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'bottom'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addTopMiddleCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'topCard'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addBottomMiddleCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'bottomCard'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller to delete the first record from the topCarousel collection
// Controller to delete the first record from the topCarousel collection
exports.deleteOneTopCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'top' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the topCarousel collection' });
    }

    await Carousel.findByIdAndDelete(firstRecord._id);

    const filePath = firstRecord.imagePath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneMiddleCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'middle' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the middleCarousel collection' });
    }

    await Carousel.findByIdAndDelete(firstRecord._id);

    const filePath = firstRecord.imagePath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneBottomCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'bottom' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the bottomCarousel collection' });
    }

    await Carousel.findByIdAndDelete(firstRecord._id);

    const filePath = firstRecord.imagePath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneTopCardCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'topCard' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the topCardCarousel collection' });
    }

    await Carousel.findByIdAndDelete(firstRecord._id);

    const filePath = firstRecord.imagePath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneBottomCardCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'bottomCard' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the bottomCardCarousel collection' });
    }

    await Carousel.findByIdAndDelete(firstRecord._id);

    const filePath = firstRecord.imagePath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};



// Controller to delete a user
// Controller to delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Controller to change user password
exports.changeUserPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'User password changed successfully' });
  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ message: 'Failed to change user password', error: error.message });
  }
};

// Get unique categories from existing websites
// Get unique categories from existing websites
exports.getWebsiteCategories = async (req, res) => {
  try {
    // Get categories from websites
    const websites = await Website.find();
    const websiteCategories = new Set();

    websites.forEach(website => {
      if (website.category && website.category.trim()) {
        websiteCategories.add(website.category.trim());
      }
    });

    // Get categories from categories collection
    const categories = await Category.find();
    const dbCategories = [];

    categories.forEach(category => {
      if (category.name && category.name.trim()) {
        dbCategories.push(category);
        websiteCategories.add(category.name.trim()); // Add to set for unique names
      }
    });

    // Convert set to array and sort alphabetically
    const allCategories = Array.from(websiteCategories).sort();

    res.status(200).json({
      message: "Categories retrieved successfully.",
      categories: allCategories,
      dbCategories: dbCategories // Include the full category objects for reference
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get all categories for dropdown (combines both sources)
exports.getAllCategoriesForDropdown = async (req, res) => {
  try {
    // Get categories from websites
    const websites = await Website.find();
    const websiteCategories = new Set();

    websites.forEach(website => {
      if (website.category && website.category.trim()) {
        websiteCategories.add(website.category.trim());
      }
    });

    // Get categories from categories collection
    const categories = await Category.find();
    const dbCategories = [];

    categories.forEach(category => {
      if (category.name && category.name.trim()) {
        dbCategories.push(category);
        websiteCategories.add(category.name.trim()); // Add to set for unique names
      }
    });

    // Convert set to array and sort alphabetically
    const allCategories = Array.from(websiteCategories).sort();

    res.status(200).json({
      message: "All categories retrieved successfully.",
      categories: allCategories,
      dbCategories: dbCategories
    });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Remove a category from all websites (set to empty string)
exports.removeCategoryFromWebsites = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    // Find all websites using this category
    const websitesUsingCategory = await Website.find({ category: categoryName });

    if (websitesUsingCategory.length === 0) {
      return res.status(404).json({ message: 'No websites found with this category.' });
    }

    // Update all websites to remove the category
    await Website.updateMany({ category: categoryName }, { category: '' });

    // Respond with success message
    res.status(200).json({
      message: `Category "${categoryName}" removed from ${websitesUsingCategory.length} website(s).`,
      affectedWebsites: websitesUsingCategory.length
    });
  } catch (error) {
    console.error('Error removing category:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = name.trim();

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: trimmedName });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists.' });
    }

    // Create a new category object
    const newCategory = new Category({
      name: trimmedName,
    });

    // Save the new category
    await newCategory.save();

    // Respond with a success message and the saved category data
    res.status(201).json({
      message: 'Category added successfully.',
      category: { id: newCategory._id, ...newCategory.toObject() },
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ===== REQUEST HANDLING APIs =====

// Get all pending requests (deposit, withdrawal, close ID, password change)
// Get all ID creation requests
// Get all ID creation requests
exports.getAllIdRequests = async (req, res) => {
  try {
    const idRequests = await IdRequest.find().sort({ createdAt: -1 });

    if (idRequests.length === 0) {
      return res.status(404).json({ message: 'No ID requests found.' });
    }

    const formattedRequests = idRequests.map(doc => ({
      id: doc._id,
      ...doc.toObject()
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error('Error fetching ID requests:', error);
    res.status(500).json({ message: 'Error fetching ID requests', error: error.message });
  }
};

// Update ID request status (Accept/Reject)
// Update ID request status (Accept/Reject)
exports.updateIdRequestStatus = async (req, res) => {
  const { requestId, status, adminNotes, processedBy } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ message: 'Request ID and status are required.' });
  }

  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be either Accepted or Rejected.' });
  }

  try {
    const requestDoc = await IdRequest.findById(requestId);

    if (!requestDoc) {
      return res.status(404).json({ message: 'ID request not found.' });
    }

    const processedAt = new Date().toISOString();

    // Update the ID request
    requestDoc.status = status;
    requestDoc.processedAt = processedAt;
    requestDoc.processedBy = processedBy || 'admin';
    if (adminNotes) requestDoc.adminNotes = adminNotes;
    await requestDoc.save();

    // Update the corresponding transaction
    const transaction = await Transaction.findOne({ idRequestId: requestId });

    if (transaction) {
      transaction.status = status === 'Accepted' ? 'Completed' : 'Rejected';
      transaction.acceptedAt = processedAt;
      if (adminNotes) transaction.adminNotes = adminNotes;
      await transaction.save();
    }

    // If accepted, create the actual ID and deduct balance from user
    if (status === 'Accepted') {
      // Deduct amount from user balance NOW (when admin accepts)
      let user;
      if (mongoose.Types.ObjectId.isValid(requestDoc.createdBy)) {
        user = await User.findById(requestDoc.createdBy);
      } else {
        user = await User.findOne({ username: requestDoc.createdBy });
      }

      if (user) {
        const currentBalance = user.balance || 0;
        const amountToDeduct = parseFloat(requestDoc.convertedCoins);

        // Check if user still has sufficient balance
        if (currentBalance < amountToDeduct) {
          return res.status(400).json({
            message: 'User has insufficient balance to complete this request.',
            currentBalance: currentBalance,
            requiredAmount: amountToDeduct
          });
        }

        const newBalance = currentBalance - amountToDeduct;
        user.balance = newBalance;
        await user.save();

        console.log(`Deducted ₹${amountToDeduct} from user ${user.username}. Old balance: ₹${currentBalance}, New balance: ₹${newBalance}`);
      } else {
        return res.status(404).json({ message: 'User not found for balance deduction.' });
      }

      // Create the actual ID
      const newId = new WebsiteId({
        websiteName: requestDoc.websiteName,
        websiteUrl: requestDoc.websiteUrl,
        username: requestDoc.username,
        password: requestDoc.password || '', // Include password from request
        imgUrl: requestDoc.imgUrl,
        createdBy: requestDoc.createdBy,
        coinAmount: requestDoc.coinAmount,
        convertedCoins: requestDoc.convertedCoins,
        coinRate: requestDoc.coinRate,
        minimumCoins: requestDoc.minimumCoins,
        refundable: requestDoc.refundable,
        accountType: requestDoc.accountType,
        currency: requestDoc.currency,
        status: 'Active',
        createdAt: processedAt,
        idRequestId: requestId,
        balance: parseFloat(requestDoc.coinAmount) // Initialize balance with the coin amount requested
      });

      await newId.save();

      // Delete the ID request after successful approval to avoid duplication
      await IdRequest.findByIdAndDelete(requestId);
    } else if (status === 'Rejected') {
      // If rejected, no balance deduction occurs (since we removed it from createIdRequest)
      // Just delete the request
      await IdRequest.findByIdAndDelete(requestId);
      console.log(`ID request ${requestId} rejected. No balance was deducted.`);
    }

    res.status(200).json({
      message: `ID request ${status.toLowerCase()} successfully`,
      requestId: requestId,
      status: status,
      processedAt: processedAt
    });
  } catch (error) {
    console.error('Error updating ID request status:', error);
    res.status(500).json({ message: 'Error updating ID request status', error: error.message });
  }
};

exports.getAllPendingRequests = async (req, res) => {
  try {
    const allRequests = [];

    // Get deposit requests
    const depositTransactions = await Transaction.find({
      status: 'Pending',
      transactionType: 'deposit'
    });

    depositTransactions.forEach(doc => {
      const data = doc.toObject();
      allRequests.push({
        ...data,
        id: doc._id,
        transactionDocumentId: doc._id,
        idDocumentId: data.idDocumentId,
        requestType: 'deposit'
      });
    });

    // Get withdrawal requests
    const withdrawalTransactions = await Transaction.find({
      status: 'Pending',
      transactionType: 'withdrawal'
    });

    withdrawalTransactions.forEach(doc => {
      const data = doc.toObject();
      allRequests.push({
        ...data,
        id: doc._id,
        transactionDocumentId: doc._id,
        idDocumentId: data.idDocumentId,
        requestType: 'withdrawal'
      });
    });

    // Get close ID requests
    const closeRequests = await CloseRequest.find({ status: 'Pending' });

    closeRequests.forEach(doc => {
      allRequests.push({
        id: doc._id,
        ...doc.toObject(),
        requestType: 'close_id'
      });
    });

    // Get password change requests
    const passwordRequests = await PasswordChangeRequest.find({ status: 'Pending' });

    passwordRequests.forEach(doc => {
      allRequests.push({
        id: doc._id,
        ...doc.toObject(),
        requestType: 'password_change'
      });
    });

    // Sort by creation date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(allRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Approve deposit request
// Approve deposit request
exports.approveDepositRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    console.log('Approving deposit request with ID:', requestId);

    // Get the transaction
    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      console.log('Transaction not found with ID:', requestId);

      // Try to find transaction by idDocumentId field
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: 'deposit',
        status: 'Pending'
      });

      if (!transaction) {
        // Try to find by transactionId field as well
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: 'deposit',
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (transaction.transactionType !== 'deposit') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update transaction status
    transaction.status = 'Accepted';
    transaction.acceptedAt = new Date().toISOString();
    transaction.processedBy = req.user?.id || 'admin';
    await transaction.save();

    // Deduct user balance when deposit is approved
    let user;
    if (mongoose.Types.ObjectId.isValid(transaction.createdBy)) {
      user = await User.findById(transaction.createdBy);
    } else {
      user = await User.findOne({ username: transaction.createdBy });
    }

    if (user) {
      const currentBalance = user.balance || 0;
      const amountToDeduct = transaction.amount;

      // Check if user has sufficient balance
      if (currentBalance < amountToDeduct) {
        return res.status(400).json({
          message: 'User has insufficient balance for this deposit request.',
          currentBalance: currentBalance,
          requiredAmount: amountToDeduct
        });
      }

      const newBalance = currentBalance - amountToDeduct;
      user.balance = newBalance;
      await user.save();

      console.log(`Deducted ₹${amountToDeduct} from user ${user.username}. Old balance: ₹${currentBalance}, New balance: ₹${newBalance}`);
    } else {
      return res.status(404).json({ message: 'User not found for balance deduction.' });
    }

    // Update ID balance
    if (transaction.idDocumentId) {
      const idDoc = await WebsiteId.findById(transaction.idDocumentId);

      if (idDoc) {
        const currentBalance = parseFloat(idDoc.balance) || 0;

        // Validate and parse coinsToReceive
        const coinsToAdd = parseFloat(transaction.coinsToReceive) || 0;

        if (coinsToAdd === 0) {
          console.warn('Warning: coinsToReceive is 0 or invalid:', transaction.coinsToReceive);
        }

        const newIdBalance = currentBalance + coinsToAdd;

        console.log(`Updating ID balance for ${transaction.idDocumentId}:`);
        console.log(`- Current balance: ${currentBalance} coins`);
        console.log(`- Adding: ${coinsToAdd} coins`);
        console.log(`- New balance: ${newIdBalance} coins`);
        console.log(`- Deposit amount: ₹${transaction.amount}`);
        console.log(`- Coin rate: ₹${transaction.coinRate} per coin`);

        // Validate the new balance before saving
        if (isNaN(newIdBalance)) {
          throw new Error(`Invalid balance calculation: currentBalance=${currentBalance}, coinsToAdd=${coinsToAdd}`);
        }

        idDoc.balance = newIdBalance;
        await idDoc.save();
      }
    }

    res.status(200).json({
      message: 'Deposit request approved successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error approving deposit request:', error);
    res.status(500).json({ message: 'Error approving deposit request', error: error.message });
  }
};

// Reject deposit request
// Reject deposit request
exports.rejectDepositRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      // Try to find transaction by idDocumentId field
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: 'deposit',
        status: 'Pending'
      });

      if (!transaction) {
        // Try to find by transactionId field as well
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: 'deposit',
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (transaction.transactionType !== 'deposit') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update transaction status
    transaction.status = 'Rejected';
    transaction.rejectedAt = new Date().toISOString();
    transaction.processedBy = req.user?.id || 'admin';
    await transaction.save();

    // No refund needed since balance was never deducted on request creation

    res.status(200).json({
      message: 'Deposit request rejected successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error rejecting deposit request:', error);
    res.status(500).json({ message: 'Error rejecting deposit request', error: error.message });
  }
};

// Approve withdrawal request
// Approve withdrawal request
exports.approveWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get the transaction
    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      // Try to find transaction by idDocumentId field
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: 'withdrawal',
        status: 'Pending'
      });

      if (!transaction) {
        // Try to find by transactionId field as well
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: 'withdrawal',
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (transaction.transactionType !== 'withdrawal') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update ID balance
    if (transaction.idDocumentId) {
      const idDoc = await WebsiteId.findById(transaction.idDocumentId);

      if (idDoc) {
        const currentBalance = parseFloat(idDoc.balance) || 0;

        // Validate and parse coinsToDeduct
        const coinsToDeduct = parseFloat(transaction.coinsToDeduct) || parseFloat(transaction.coinsNeeded) || parseFloat(transaction.amount) || 0;

        if (coinsToDeduct === 0) {
          console.warn('Warning: coinsToDeduct is 0 or invalid:', transaction.coinsToDeduct);
        }

        // Check if balance is sufficient
        if (currentBalance < coinsToDeduct) {
          // Insufficient balance - update status and return error
          transaction.status = 'Insufficient Balance';
          transaction.processedBy = req.user?.id || 'admin';
          transaction.processedAt = new Date().toISOString();
          await transaction.save();

          console.log(`Insufficient balance for withdrawal:`);
          console.log(`- Required: ${coinsToDeduct} coins`);
          console.log(`- Available: ${currentBalance} coins`);

          return res.status(400).json({
            message: 'Insufficient balance',
            error: `Required: ${coinsToDeduct} coins, Available: ${currentBalance} coins`
          });
        }

        // Balance is sufficient - proceed with deduction
        const newIdBalance = currentBalance - coinsToDeduct;

        console.log(`Updating ID balance for withdrawal:`);
        console.log(`- Current balance: ${currentBalance} coins`);
        console.log(`- Coins to deduct: ${coinsToDeduct} coins`);
        console.log(`- New balance: ${newIdBalance} coins`);

        idDoc.balance = newIdBalance;
        await idDoc.save();
      }
    }

    // Update transaction status to Accepted (only if balance was sufficient)
    transaction.status = 'Accepted';
    transaction.acceptedAt = new Date().toISOString();
    transaction.processedBy = req.user?.id || 'admin';
    await transaction.save();

    res.status(200).json({
      message: 'Withdrawal request approved successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error approving withdrawal request:', error);
    res.status(500).json({ message: 'Error approving withdrawal request', error: error.message });
  }
};

// Reject withdrawal request
exports.rejectWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      // Try to find transaction by idDocumentId field
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: 'withdrawal',
        status: 'Pending'
      });

      if (!transaction) {
        // Try to find by transactionId field as well
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: 'withdrawal',
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (transaction.transactionType !== 'withdrawal') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update transaction status
    transaction.status = 'Rejected';
    transaction.rejectedAt = new Date().toISOString();
    transaction.processedBy = req.user?.id || 'admin';
    await transaction.save();

    // Refund the amount to user balance
    let user;
    if (mongoose.Types.ObjectId.isValid(transaction.createdBy)) {
      user = await User.findById(transaction.createdBy);
    } else {
      user = await User.findOne({ username: transaction.createdBy });
    }

    if (user) {
      const newBalance = (user.balance || 0) + transaction.amount;
      user.balance = newBalance;
      await user.save();
    }

    res.status(200).json({
      message: 'Withdrawal request rejected successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error rejecting withdrawal request:', error);
    res.status(500).json({ message: 'Error rejecting withdrawal request', error: error.message });
  }
};

// Approve close ID request
exports.approveCloseIdRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const closeRequest = await CloseRequest.findById(requestId);

    if (!closeRequest) {
      return res.status(404).json({ message: 'Close request not found' });
    }

    // Update close request status
    closeRequest.status = 'Accepted';
    closeRequest.processedAt = new Date().toISOString();
    closeRequest.processedBy = req.user?.id || 'admin';
    await closeRequest.save();

    // Update ID status to Closed
    const idDoc = await WebsiteId.findById(closeRequest.originalId);

    if (idDoc) {
      idDoc.status = 'Closed';
      await idDoc.save();

      // Create a record in closedIds collection
      const closedId = new ClosedId({
        ...idDoc.toObject(),
        originalId: closeRequest.originalId, // Add the required originalId field
        closedAt: new Date().toISOString(),
        closedBy: req.user?.id || 'admin',
        closeRequestId: requestId
      });

      await closedId.save();

      // Delete the original ID
      await WebsiteId.findByIdAndDelete(closeRequest.originalId);
    }

    res.status(200).json({
      message: 'Close ID request approved successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error approving close ID request:', error);
    res.status(500).json({ message: 'Error approving close ID request', error: error.message });
  }
};

// Reject close ID request
exports.rejectCloseIdRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const closeRequest = await CloseRequest.findById(requestId);

    if (!closeRequest) {
      return res.status(404).json({ message: 'Close request not found' });
    }

    // Update close request status
    closeRequest.status = 'Rejected';
    closeRequest.processedAt = new Date().toISOString();
    closeRequest.processedBy = req.user?.id || 'admin';
    await closeRequest.save();

    res.status(200).json({
      message: 'Close ID request rejected successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error rejecting close ID request:', error);
    res.status(500).json({ message: 'Error rejecting close ID request', error: error.message });
  }
};

// Approve password change request
exports.approvePasswordChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const passwordRequest = await PasswordChangeRequest.findById(requestId);

    if (!passwordRequest) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    // Update password request status
    passwordRequest.status = 'Accepted';
    passwordRequest.processedAt = new Date().toISOString();
    passwordRequest.processedBy = req.user?.id || 'admin';
    await passwordRequest.save();

    // Update ID password
    const idDoc = await WebsiteId.findById(passwordRequest.idDocumentId);

    if (idDoc) {
      // In a real application, you might want to store the new password or notify the user
      // For now, we'll just acknowledge the request was approved
      // If the ID model has a password field, update it here
      // idDoc.password = passwordRequest.newPassword;
      // await idDoc.save();
    }

    res.status(200).json({
      message: 'Password change request approved successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error approving password change request:', error);
    res.status(500).json({ message: 'Error approving password change request', error: error.message });
  }
};

// Reject password change request
exports.rejectPasswordChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const passwordRequest = await PasswordChangeRequest.findById(requestId);

    if (!passwordRequest) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    // Update password request status
    passwordRequest.status = 'Rejected';
    passwordRequest.processedAt = new Date().toISOString();
    passwordRequest.processedBy = req.user?.id || 'admin';
    await passwordRequest.save();

    res.status(200).json({
      message: 'Password change request rejected successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error rejecting password change request:', error);
    res.status(500).json({ message: 'Error rejecting password change request', error: error.message });
  }
};


// ===== HOME BANNER CAROUSEL =====

// GET all home banner images
exports.getHomeBannerImages = async (req, res) => {
  try {
    const images = await Carousel.find({ type: 'homeBanner' }).sort({ createdAt: -1 });
    const formatted = images.map(img => ({
      id: img._id,
      imagePath: img.imagePath,
      createdAt: img.createdAt,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching home banner images:', error);
    res.status(500).json({ message: 'Error fetching home banner images', error: error.message });
  }
};

// POST upload a new home banner image
exports.addHomeBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const newImage = new Carousel({
      imagePath: req.file.path, // Cloudinary URL
      type: 'homeBanner',
    });
    await newImage.save();
    res.status(201).json({
      message: 'Home banner image uploaded successfully',
      image: {
        id: newImage._id,
        imagePath: newImage.imagePath,
        createdAt: newImage.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading home banner image:', error);
    res.status(500).json({ message: 'Error uploading home banner image', error: error.message });
  }
};

// DELETE a home banner image (removes from MongoDB + Cloudinary)
exports.deleteHomeBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Carousel.findById(id);
    if (!image || image.type !== 'homeBanner') {
      return res.status(404).json({ message: 'Home banner image not found' });
    }
    // Extract Cloudinary public_id from the URL
    const urlParts = image.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      // Skip optional version segment (e.g., v1234567890)
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }
    await Carousel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Home banner image deleted successfully' });
  } catch (error) {
    console.error('Error deleting home banner image:', error);
    res.status(500).json({ message: 'Error deleting home banner image', error: error.message });
  }
};

const { db } = require('../config/firebase');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Correct import of uuidv4
const fs = require('fs');


// Fetch all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const snapshot = await db.collection('admin').get();
        const admins = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error retrieving admins', error: error.message });
    }
};

// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all documents from the 'user' collection
    const snapshot = await db.collection('user').get();

    // Map the snapshot to an array of users with their data
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Send the list of users as a JSON response
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    // Send error response if something goes wrong
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};



// Controller to fetch all IDs
exports.getAllIds  = async (req, res) => {
  try {
    const idsCollection = db.collection('id'); // Replace 'ids' with your Firestore collection name
    const snapshot = await idsCollection.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No IDs found" });
    }

    const ids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(ids);
  } catch (error) {
    console.error("Error fetching IDs:", error);
    res.status(500).json({ error: "Failed to fetch IDs" });
  }
};


// Add a new admin (Signup)
exports.addAdmin = async (req, res) => {
    const { name, phoneNumber, email, password, username } = req.body;

    // Basic validation
    if (!name || !phoneNumber || !email || !password || !username) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check for duplicate username
        const existingAdmin = await db
            .collection('admin')
            .where('username', '==', username)
            .get();

        if (!existingAdmin.empty) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // Fetch all admins to determine the next ID
        const snapshot = await db.collection('admin').get();
        let highestId = 0;
        snapshot.forEach(doc => {
            const adminId = parseInt(doc.id, 10); // Ensure numeric comparison
            if (adminId > highestId) {
                highestId = adminId;
            }
        });

        const newId = highestId + 1; // Next ID after the highest existing one

        const newAdmin = {
            id: newId,
            name,
            phoneNumber,
            email,
            password,
            username,
        };

        // Add the admin to Firestore
        await db.collection('admin').doc(newId.toString()).set(newAdmin);

        res.status(201).json({ message: 'Admin signed up successfully', admin: newAdmin });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ message: 'Error adding admin', error: error.message });
    }
};


// Update transaction details by admin
exports.updateTransaction = async (req, res) => {
    const { id, transactionId, acceptedAt, status } = req.body;

    // Validation: Ensure `id` is provided
    if (!id) {
        return res.status(400).json({ message: 'Transaction ID (id) is required for updating.' });
    }

    try {
        // Reference the transaction document
        const transactionRef = db.collection('transactions').doc(id);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // Update only the fields provided in the request
        const updates = {};
        if (transactionId) updates.transactionId = transactionId;
        if (acceptedAt) updates.acceptedAt = acceptedAt;
        if (status) updates.status = status;

        // Update the transaction in Firestore
        await transactionRef.update(updates);

        res.status(200).json({
            message: 'Transaction updated successfully',
            updatedTransaction: { id, ...updates }
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
        // Reference to the document in the collection
        const websiteRef = db.collection('id').doc(id);

        // Check if the document exists
        const websiteDoc = await websiteRef.get();

        if (!websiteDoc.exists) {
            return res.status(404).json({ message: 'Website record not found.' });
        }

        // Update the status to "Accepted"
        await websiteRef.update({ status: 'Accepted' });

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
exports.getAllTransactions = async (req, res) => {
    try {
      // Reference to the Firestore collection
      const transactionsRef = db.collection('transactions');
  
      // Fetch all transactions (no query filter)
      const snapshot = await transactionsRef.get();
  
      // If no transactions are found
      if (snapshot.empty) {
        return res.status(404).json({ message: 'No transactions found.' });
      }
  
      // Map Firestore snapshot to a list of transactions
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id, // Get document ID
        ...doc.data(), // Get document fields
      }));
  
      // Respond with the found transactions
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      // If there is a server error
      res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
  };
  
// Controller to accept a transaction
exports.acceptTransaction = async (req, res) => {
    const txnId = req.params.txnId; // Get the transaction ID from the URL params
    // console.log('Received txnId:', txnId);
  
    try {
      // Reference to the transactions collection
      const transactionsRef = db.collection('transactions');
      
      // Get the document by txnId
      const txnDoc = await transactionsRef.doc(txnId).get();
  
      // Check if the document exists
      if (!txnDoc.exists) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Get the data of the document
      const transaction = txnDoc.data();
      // console.log(transaction);
  
      // Update the status of the transaction to 'Completed'
      await txnDoc.ref.update({ status: 'Completed' });
  
      // Respond with the updated transaction
      res.status(200).json({ message: 'Transaction accepted', transactionId: txnId, status: 'Completed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to accept transaction', error: error.message });
    }
  };
  // Controller to reject a transaction
exports.rejectTransaction = async (req, res) => {
    const txnId = req.params.txnId; // Get the transaction ID from the URL params
    // console.log('Received txnId:', txnId);
  
    try {
      // Reference to the transactions collection
      const transactionsRef = db.collection('transactions');
      
      // Get the document by txnId
      const txnDoc = await transactionsRef.doc(txnId).get();
  
      // Check if the document exists
      if (!txnDoc.exists) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Get the data of the document
      const transaction = txnDoc.data();
      // console.log(transaction);
  
      // Update the status of the transaction to 'Failed'
      await txnDoc.ref.update({ status: 'Failed' });
  
      // Respond with the updated transaction
      res.status(200).json({ message: 'Transaction rejected', transactionId: txnId, status: 'Failed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to reject transaction', error: error.message });
    }
  };
  


// Update user balance
exports.updateUserBalance = async (req, res) => {
  const { id } = req.params; // Get user ID from URL
  const { balance } = req.body; // Get balance from request body

  if (!balance) {
    return res.status(400).json({ message: 'Balance is required' });
  }

  try {
    const userRef = db.collection('user').doc(id); // Reference to the user document
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the balance
    await userRef.update({ balance });

    res.status(200).json({ id, balance }); // Respond with updated user details
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ message: 'Error updating user balance', error: error.message });
  }
};



  
// Get Account Details
exports.getAccountDetails = async (req, res) => {
    try {
      const userId = req.query.userId; // Get the userId from the query parameter
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // Query Firestore for a document where userId matches recordName
      const userAccountRef = db.collection('adminAccountDetails').doc(userId); // Use userId as the document name in the 'adminAccountDetails' collection
      const doc = await userAccountRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: "User account not found" });
      }
  
      // Get user account data
      const userAccount = doc.data();
  
      // Send data as response, including the UPI ID
      return res.status(200).json({
        accountNumber: userAccount.accountNumber,
        accountHolderName: userAccount.accountHolderName,
        ifscCode: userAccount.ifscCode,
        bankName: userAccount.bankName,
        upiId: userAccount.upiId // Include UPI ID here
      });
    } catch (error) {
      console.error('Error fetching account details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  exports.updateAccountDetails = async (req, res) => {
    // Extract other account details from the request body
    const { accountNumber, accountHolderName, ifscCode, bankName, upiId } = req.body;
  
    // Force userId to always be "1"
    const userId = "1";
  
    try {
      // console.log(userId, accountNumber, accountHolderName, ifscCode, bankName, upiId);
  
      // Reference to the adminAccountDetails collection
      const userAccountsRef = db.collection("adminAccountDetails");
      const userDocRef = userAccountsRef.doc(userId); // Use the fixed userId "1" as the document ID
  
      // Default data to be used if any field is missing
      const defaultData = {
        accountNumber: "1234567890",
        accountHolderName: "John Doe",
        ifscCode: "ABCD0123456",
        bankName: "XYZ Bank",
        upiId: "sample@upi", // Default UPI ID
      };
  
      // Prepare updated data, using provided values or default data
      const updatedData = {
        accountNumber: accountNumber || defaultData.accountNumber,
        accountHolderName: accountHolderName || defaultData.accountHolderName,
        ifscCode: ifscCode || defaultData.ifscCode,
        bankName: bankName || defaultData.bankName,
        upiId: upiId || defaultData.upiId, // Include UPI ID here
      };
  
      const doc = await userDocRef.get();
  
      if (doc.exists) {
        // Update the document if it exists
        await userDocRef.update(updatedData);
        return res.status(200).json({
          message: "Account details updated successfully",
          updatedAccount: { userId, ...updatedData },
        });
      } else {
        // Create the document if it doesn't exist
        await userDocRef.set({ userId, ...updatedData });
        return res.status(201).json({
          message: "Account details created successfully",
          newAccount: { userId, ...updatedData },
        });
      }
    } catch (error) {
      console.error("Error upserting account details:", error);
      res.status(500).json({ message: "Error handling account details", error: error.message });
    }
  };
  

    // Get Account Details (First Record)
exports.getAccountDetailsDeposit = async (req, res) => {
    try {
      // Query Firestore to get the first document from 'adminAccountDetails'
      const userAccountRef = db.collection('adminAccountDetails').limit(1); // Limit to 1 document
      const snapshot = await userAccountRef.get();
  
      if (snapshot.empty) {
        return res.status(404).json({ message: "No account found" });
      }
  
      // Get the first document from the snapshot
      const doc = snapshot.docs[0];
      const userAccount = doc.data(); // Get the data from the document
  
      // Send data as response, including the UPI ID
      return res.status(200).json({
        accountNumber: userAccount.accountNumber,
        accountHolderName: userAccount.accountHolderName,
        ifscCode: userAccount.ifscCode,
        bankName: userAccount.bankName,
        upiId: userAccount.upiId, // Include UPI ID here
      });
    } catch (error) {
      console.error('Error fetching account details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


  exports.acceptId = async (req, res) => {
    const { id } = req.body; // Get the ID from the request body
    
    try {
      if (!id) {
        return res.status(400).json({ message: 'ID is required' });
      }
  
      // Reference to the 'ids' collection
      const idsRef = db.collection('id');
      
      // Get the document by id
      const idDoc = await idsRef.doc(id).get();
      
      // Check if the document exists
      if (!idDoc.exists) {
        return res.status(404).json({ message: 'ID not found' });
      }
  
      // Get the data of the document
      const idData = idDoc.data();
      // console.log(idData);
  
      // Update the status of the ID to 'Accepted'
      await idDoc.ref.update({ status: 'Created' });
  
      // Respond with the updated ID
      res.status(200).json({ message: 'ID Accepted', id: id, status: 'Created' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to accept ID', error: error.message });
    }
  };

  exports.rejectId = async (req, res) => {
    const { id } = req.body; // Get the ID from the request body
    
    try {
      if (!id) {
        return res.status(400).json({ message: 'ID is required' });
      }
  
      // Reference to the 'ids' collection
      const idsRef = db.collection('id');
      
      // Get the document by id
      const idDoc = await idsRef.doc(id).get();
      
      // Check if the document exists
      if (!idDoc.exists) {
        return res.status(404).json({ message: 'ID not found' });
      }
  
      // Get the data of the document
      const idData = idDoc.data();
      // console.log(idData);
  
      // Update the status of the ID to 'Username Already Exist'
      await idDoc.ref.update({ status: 'Username Exists' });
  
      // Respond with the updated ID
      res.status(200).json({ message: 'ID rejected due to username already exist', id: id, status: 'Username Already Exist' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to reject ID', error: error.message });
    }
  };
  

// Controller for handling the addition of a new website
exports.addWebsite = async (req, res) => {
  try {
    // Extract form data from the request body
    const { website, url, category } = req.body;
    
    // Get the logo filename from the uploaded file
    const logo = req.file ? path.join('uploads/logo', req.file.filename) : ''; // Save the full path

    // Validate required fields
    if (!website || !url || !category) {
      return res.status(400).json({ message: 'Website, URL, and Category are required.' });
    }

    // Generate a unique ID for the website
    const websiteId = uuidv4(); // Generates a unique ID

    // Create a new website object with the unique ID
    const newWebsite = {
      id: websiteId, // Unique ID for the website
      website,
      url,
      category,
      logo, // Save the full path of the logo in the database
    };
    // Save the new website to Firestore using the website ID as the document ID
    const websiteRef = db.collection('websites').doc(websiteId); // Use the unique ID as the document ID
    await websiteRef.set(newWebsite);

    // Respond with a success message and the saved website data
    res.status(201).json({
      message: 'Website added successfully.',
      website: newWebsite,
    });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// updateProfile
exports.updateProfileController = async (req, res) => {
  const { userId, name, phoneNumber, email, password } = req.body;
// console.log("inside admin update profile")
  // Validate incoming data
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Get a reference to the 'admin' collection and ensure userId is in string format
    const adminRef = db.collection('admin').doc(userId.toString());

    // Fetch the admin document
    const adminDoc = await adminRef.get();

    // Check if the document exists
    if (!adminDoc.exists) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prepare the update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    // Update the admin document with the provided fields
    await adminRef.update(updateData);

    // Fetch the updated admin document
    const updatedAdminDoc = await adminRef.get();

    // Return the updated admin data (excluding password if not necessary)
    res.status(200).json({
      message: 'Profile updated successfully',
      updatedAdmin: {
        userId,
        name: updatedAdminDoc.data().name,
        phoneNumber: updatedAdminDoc.data().phoneNumber,
        email: updatedAdminDoc.data().email,
        // Avoid sending password unless absolutely necessary
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


// Controller for retrieving all websites
exports.getAllWebsites = async (req, res) => {
  try {
    // Reference to the websites collection
    const websitesRef = db.collection('websites');

    // Fetch all documents in the collection
    const snapshot = await websitesRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No websites found.' });
    }

    // Map over the documents to build an array of website objects
    const websites = snapshot.docs.map(doc => ({
      id: doc.id, // Use the document ID as the unique identifier
      ...doc.data(), // Spread the rest of the document data
    }));

    // Respond with the array of websites
    res.status(200).json({
      message: 'Websites retrieved successfully.',
      websites,
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller for deleting a website by its ID
exports.deleteWebsite = async (req, res) => {
  try {
    const websiteId = req.params.id; // Extract website ID from URL params
    // console.log(websiteId)

    // Reference to the website document using the ID
    const websiteRef = db.collection('websites').doc(websiteId);

    // Fetch the website document
    const websiteDoc = await websiteRef.get();

    // Check if the website exists
    if (!websiteDoc.exists) {
      return res.status(404).json({ message: 'Website not found.' });
    }

    // Delete the website document
    await websiteRef.delete();

    // Respond with a success message
    res.status(200).json({ message: 'Website deleted successfully.' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
//corousel-->>>

exports.getAllTopCorousel = async (req, res) => {
  try {
    // Reference to the 'topCorousel' collection
    const carouselRef = db.collection('topCorousel');

    // Fetch all documents in the collection
    const snapshot = await carouselRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    // Map the documents to an array of data
    const carouselImages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Respond with the fetched data
    res.status(200).json(carouselImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
exports.getMiddleTopCorousel = async (req, res) => {
  try {
    // Reference to the 'topCorousel' collection
    const carouselRef = db.collection('middleCorousel');

    // Fetch all documents in the collection
    const snapshot = await carouselRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    // Map the documents to an array of data
    const carouselImages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Respond with the fetched data
    res.status(200).json(carouselImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllBottomCorousel = async (req, res) => {
  try {
    // Reference to the 'topCorousel' collection
    const carouselRef = db.collection('bottomCorousel');

    // Fetch all documents in the collection
    const snapshot = await carouselRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    // Map the documents to an array of data
    const carouselImages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Respond with the fetched data
    res.status(200).json(carouselImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
exports.getAllTopCardCorousel = async (req, res) => {
  try {
    // Reference to the 'topCorousel' collection
    const carouselRef = db.collection('topCardCorousel');

    // Fetch all documents in the collection
    const snapshot = await carouselRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    // Map the documents to an array of data
    const carouselImages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Respond with the fetched data
    res.status(200).json(carouselImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
exports.getAllBottomCardCorousel = async (req, res) => {
  try {
    // Reference to the 'topCorousel' collection
    const carouselRef = db.collection('bottomCardCorousel');

    // Fetch all documents in the collection
    const snapshot = await carouselRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    // Map the documents to an array of data
    const carouselImages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Respond with the fetched data
    res.status(200).json(carouselImages);
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

    // console.log('Uploaded file:', req.file); // Debugging log

    const imagePath = path.join('uploads', 'carousel', req.file.filename);

    const newCarouselImage = {
      id: uuidv4(),
      imagePath,
    };

    const carouselRef = db.collection('topCorousel').doc(newCarouselImage.id);
    await carouselRef.set(newCarouselImage);

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

    // console.log('Uploaded file:', req.file); // Debugging log

    const imagePath = path.join('uploads', 'carousel', req.file.filename);

    const newCarouselImage = {
      id: uuidv4(),
      imagePath,
    };

    const carouselRef = db.collection('middleCorousel').doc(newCarouselImage.id);
    await carouselRef.set(newCarouselImage);

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

    // console.log('Uploaded file:', req.file); // Debugging log

    const imagePath = path.join('uploads', 'carousel', req.file.filename);

    const newCarouselImage = {
      id: uuidv4(),
      imagePath,
    };

    const carouselRef = db.collection('bottomCorousel').doc(newCarouselImage.id);
    await carouselRef.set(newCarouselImage);

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

    // console.log('Uploaded file:', req.file); // Debugging log

    const imagePath = path.join('uploads', 'carousel', req.file.filename);

    const newCarouselImage = {
      id: uuidv4(),
      imagePath,
    };

    const carouselRef = db.collection('topCardCorousel').doc(newCarouselImage.id);
    await carouselRef.set(newCarouselImage);

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

    // console.log('Uploaded file:', req.file); // Debugging log

    const imagePath = path.join('uploads', 'carousel', req.file.filename);

    const newCarouselImage = {
      id: uuidv4(),
      imagePath,
    };

    const carouselRef = db.collection('bottomCardCorousel').doc(newCarouselImage.id);
    await carouselRef.set(newCarouselImage);

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
exports.deleteOneTopCarousel = async (req, res) => {
  try {

    // 1. Get the first record (no sorting, just take the first document in the collection)
    const firstRecord = await db.collection('topCorousel')
      .limit(1)  // Get only the first document
      .get();

    if (firstRecord.empty) {
      return res.status(404).json({ error: 'No records found in the topCarousel collection' });
    }

    const firstDoc = firstRecord.docs[0];
    const fileId = firstDoc.id;

    // 2. Delete the file from the database
    await db.collection('topCorousel').doc(fileId).delete();

    // 3. Delete the local file (assuming the file name is stored in the document and it is a .jpg file)
    const filePath = path.join(__dirname, 'uploads', 'carousel', `${fileId}.jpg`); // Adjust file path as necessary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Respond with a success message
    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};
exports.deleteOneMiddleCarousel = async (req, res) => {
  try {

    // 1. Get the first record (no sorting, just take the first document in the collection)
    const firstRecord = await db.collection('middleCorousel')
      .limit(1)  // Get only the first document
      .get();

    if (firstRecord.empty) {
      return res.status(404).json({ error: 'No records found in the topCarousel collection' });
    }

    const firstDoc = firstRecord.docs[0];
    const fileId = firstDoc.id;

    // 2. Delete the file from the database
    await db.collection('middleCorousel').doc(fileId).delete();

    // 3. Delete the local file (assuming the file name is stored in the document and it is a .jpg file)
    const filePath = path.join(__dirname, 'uploads', 'carousel', `${fileId}.jpg`); // Adjust file path as necessary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Respond with a success message
    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

// Controller to delete the first record from the topCarousel collection
exports.deleteOneBottomCarousel = async (req, res) => {
  try {

    // 1. Get the first record (no sorting, just take the first document in the collection)
    const firstRecord = await db.collection('bottomCorousel')
      .limit(1)  // Get only the first document
      .get();

    if (firstRecord.empty) {
      return res.status(404).json({ error: 'No records found in the bottomCarousel collection' });
    }

    const firstDoc = firstRecord.docs[0];
    const fileId = firstDoc.id;

    // 2. Delete the file from the database
    await db.collection('bottomCorousel').doc(fileId).delete();

    // 3. Delete the local file (assuming the file name is stored in the document and it is a .jpg file)
    const filePath = path.join(__dirname, 'uploads', 'carousel', `${fileId}.jpg`); // Adjust file path as necessary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Respond with a success message
    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};
exports.deleteOneTopCardCarousel = async (req, res) => {
  try {

    // 1. Get the first record (no sorting, just take the first document in the collection)
    const firstRecord = await db.collection('topCardCorousel')
      .limit(1)  // Get only the first document
      .get();

    if (firstRecord.empty) {
      return res.status(404).json({ error: 'No records found in the bottomCarousel collection' });
    }

    const firstDoc = firstRecord.docs[0];
    const fileId = firstDoc.id;

    // 2. Delete the file from the database
    await db.collection('topCardCorousel').doc(fileId).delete();

    // 3. Delete the local file (assuming the file name is stored in the document and it is a .jpg file)
    const filePath = path.join(__dirname, 'uploads', 'carousel', `${fileId}.jpg`); // Adjust file path as necessary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Respond with a success message
    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};
exports.deleteOneBottomCardCarousel = async (req, res) => {
  try {

    // 1. Get the first record (no sorting, just take the first document in the collection)
    const firstRecord = await db.collection('bottomCardCorousel')
      .limit(1)  // Get only the first document
      .get();

    if (firstRecord.empty) {
      return res.status(404).json({ error: 'No records found in the bottomCarousel collection' });
    }

    const firstDoc = firstRecord.docs[0];
    const fileId = firstDoc.id;

    // 2. Delete the file from the database
    await db.collection('bottomCardCorousel').doc(fileId).delete();

    // 3. Delete the local file (assuming the file name is stored in the document and it is a .jpg file)
    const filePath = path.join(__dirname, 'uploads', 'carousel', `${fileId}.jpg`); // Adjust file path as necessary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Respond with a success message
    res.status(200).json({ message: 'First record deleted successfully from the database and locally' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};



// Controller to delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameters

  try {
    // Reference to the user document in Firestore
    const userRef = db.collection('user').doc(userId);

    // Check if the user exists
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user document from Firestore
    await userRef.delete();

    // Respond with success message
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

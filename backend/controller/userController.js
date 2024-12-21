const { db } = require('../config/firebase');
const bcrypt = require('bcrypt');  // Add bcrypt import here
// console.log("Firestore DB:", db);  // Log the db object
const { uploadUserDeposite } = require('../config/multerConfig');



exports.getUserByUsername = async (req, res) => {
    try {
        const { username } = req.body; // Assuming username comes from query parameters

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        // Query Firestore to find the user with the matching username
        const snapshot = await db.collection('user').where('username', '==', username).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the first user
        const user = snapshot.docs[0].data();
        const userId = snapshot.docs[0].id;
        // console.log(user,">>>>")

        // Respond with user data
        res.status(200).json({
            id: userId,
            ...user,
        });
    } catch (error) {
        console.error('Error retrieving user:', error); // Log the full error to the console
        res.status(500).json({
            message: 'Error retrieving user',
            error: error.message || 'Unknown error occurred', // Return a meaningful error message
        });
    }
};


// Fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};


// Add a new user (Signup)
exports.addUser = async (req, res) => {
    const { name, phoneNumber, email, password, username } = req.body;

    // Basic validation
    if (!name || !phoneNumber || !email || !password || !username) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the username is already taken
        const usernameSnapshot = await db
            .collection('user')
            .where('username', '==', username)
            .get();

        if (!usernameSnapshot.empty) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // Generate a new ID (auto-increment simulation)
        const snapshot = await db.collection('user').get();
        const newId = snapshot.size + 1; // Use the total count as the new ID

        // Create the user object
        const newUser = {
            id: newId,
            name,
            phoneNumber,
            email,
            password, // NOTE: Hash the password before saving in production
            username,
            balance: 0, // Add the balance field with a default value of 0
            role: 'user', // Default role is 'user'
        };

        // Add the user to Firestore
        await db.collection('user').doc(newId.toString()).set(newUser);

        // Respond with success
        res.status(201).json({ message: 'User signed up successfully', user: newUser });
    } catch (error) {
        console.error('Error details:', error); // Log the full error details
        res.status(500).json({ message: 'Error adding user', error: error.message });
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
      const userAccountRef = db.collection('userAccounts').doc(userId); // Use userId as the document name
      const doc = await userAccountRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: "User account not found" });
      }
  
      // Get user account data
      const userAccount = doc.data();
      return res.status(200).json(userAccount); // Send data as response
  
    } catch (error) {
      console.error('Error fetching account details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  exports.updateAccountDetails = async (req, res) => {
    const { userId, accountNumber, accountHolderName, ifscCode, bankName } = req.body;
  
    // Validation: Ensure `userId` is provided and is a valid non-empty value
    if (!userId || typeof userId === "undefined" || userId.toString().trim() === "") {
      return res.status(400).json({ message: "Invalid userId. It must be a non-empty string or number." });
    }
  
    // console.log("Validated userId (before conversion):", userId);
  
    try {
      const userAccountsRef = db.collection("userAccounts");
  
      // Convert userId to string to satisfy Firestore's requirement
      const userDocRef = userAccountsRef.doc(userId.toString());
  
      const defaultData = {
        accountNumber: "1234567890",
        accountHolderName: "John Doe",
        ifscCode: "ABCD0123456",
        bankName: "XYZ Bank",
      };
  
      const updatedData = {
        accountNumber: accountNumber || defaultData.accountNumber,
        accountHolderName: accountHolderName || defaultData.accountHolderName,
        ifscCode: ifscCode || defaultData.ifscCode,
        bankName: bankName || defaultData.bankName,
      };
  
      const doc = await userDocRef.get();
  
      if (doc.exists) {
        await userDocRef.update(updatedData);
        return res.status(200).json({
          message: "Account details updated successfully",
          updatedAccount: { userId, ...updatedData },
        });
      } else {
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

  
  exports.updateProfileController = async (req, res) => {
    const { userId, name, phoneNumber, email, password } = req.body;
    // console.log('Received userId:', userId);  // Log the received userId from frontend
  
    // Validate incoming data
    if (!userId || !name || !phoneNumber || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      // Get a reference to the 'users' collection and convert the userId to string
      const userRef = db.collection('user').doc(userId.toString());  // Ensure userId is in string format
  
      // Fetch the user document
      const userDoc = await userRef.get();
  
      // Check if the document exists
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Prepare the update data
      const updateData = {};
  
      // Only update the provided fields
      if (name) updateData.name = name;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
  
      // Update the user document with the provided fields
      await userRef.update(updateData);
  
      // Fetch the updated user document
      const updatedUserDoc = await userRef.get();
  
      // Return the updated user data (excluding password if not necessary)
      res.status(200).json({
        message: 'Profile updated successfully',
        updatedUser: {
          userId,
          name: updatedUserDoc.data().name,
          phoneNumber: updatedUserDoc.data().phoneNumber,
          email: updatedUserDoc.data().email,
          password: updatedUserDoc.data().password,  // **Not recommended to include**
        },
      })
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  
exports.createTransaction = async (req, res) => {
    const { amount, createdAt, createdBy, paymentMethod } = req.body;
    const imageFile = req.file; // The uploaded file will be available in req.file

    // console.log('Form Data:', req.body);
    // console.log('Uploaded File:', imageFile);

    // Validation: Ensure required fields are provided
    if (!amount || !createdAt || !createdBy || !imageFile) {
        return res.status(400).json({ message: 'Amount, createdAt, createdBy, and image are required.' });
    }

    try {
        // Generate a unique transaction ID (this can be updated later)
        const transactionId = "Not Updated"; // Placeholder for unique transaction ID
        // Prepare the transaction data
        const transactionData = {
            description : "Payment For Deposite",
            transactionId,
            paymentMethod: paymentMethod, // Payment method
            createdAt,
            acceptedAt: "Not updated",   // Default value
            status: "Pending",           // Default status
            amount,
            createdBy,
            imagePath: imageFile.path,   // Store the path to the uploaded file
        };

        // Save transaction data to Firestore (or your DB of choice)
        const transactionRef = await db.collection('transactions').add(transactionData);

        // Send a successful response with the transaction data
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: {
                id: transactionRef.id,
                ...transactionData,
            },
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
};

exports.createTransactionById = async (req, res) => {
  const {
    amount,
    createdAt,
    createdBy,
    websiteName,
    websiteUrl,
    username,
    status,
    createdAtSelectedId,
    id, // The unique ID from selectedId
  } = req.body;

  // Validation: Ensure required fields are provided
  if (!amount || !createdAt || !createdBy || !websiteName || !id) {
    return res.status(400).json({
      message: "Amount, createdAt, createdBy, websiteName, and ID are required.",
    });
  }

  try {
    // Generate a unique transaction ID (this can be updated later)
    const transactionId = `txn_${Date.now()}`; // You can replace this with a better unique ID generation method
    
    // Prepare the transaction data
    const transactionData = {
      description: `Payment For Deposit - ${websiteName} (${username})`, // Updated description
      transactionId,
      paymentMethod:"Withdraw From Wallet", // Use the paymentMethod passed from the client
      createdAt,
      acceptedAt: "Not updated",   // Default value
      status: "Pending",           // Default status
      amount,
      createdBy: createdBy, // Use createdBy from the client (e.g., user's username)
    };

    // Save transaction data to Firestore (or your DB of choice)
    const transactionRef = await db.collection('transactions').add(transactionData);

    // Send a successful response with the transaction data
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transactionRef.id,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};


exports.createWithdrawalTransactionBy = async (req, res) => {
  try {
      const { amount, createdAt, createdBy, websiteName, websiteUrl, username, status, id } = req.body;

        // console.log('Received data:', req.body);

      // Validate data (ensure that all necessary fields are received)
      if (!amount || !createdAt || !createdBy || !websiteName || !websiteUrl || !username || !status || !id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const transactionId = "Not Updated"; // Placeholder for unique transaction ID

      // Prepare transaction data
      const transactionData = {
        description: `Request for Withdrawal - ${websiteName} (${username})`, // Updated description
        transactionId, // Assuming you have a way to generate a unique transaction ID
        paymentMethod: 'Bank Account', // Hardcoded as per your requirement
        createdAt,
        acceptedAt: 'Not updated',  // Default value
        status: 'Pending',          // Default status
        amount,
        createdBy,
        imagePath: 'No path',       // No file path provided
      };

      // Save transaction data to Firestore (or your database of choice)
      const transactionRef = await db.collection('transactions').add(transactionData);

      // Send a successful response
      res.status(201).json({
        message: 'Transaction created successfully'
      });
    } catch (error) {
      console.error('Error creating withdrawal transaction:', error);
      res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
  };




exports.createId = async (req, res) => {
    const { websiteName, websiteUrl, username, password, imgUrl, createdBy } = req.body;
    // console.log(req.body);

    // Validation: Ensure required fields are provided
    if (!websiteName || !websiteUrl || !username || !password || !imgUrl || !createdBy) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Generate a unique ID for the new document
        const newId = db.collection('id').doc().id;

        // Get the current date and time
        const createdAt = new Date();

        // Create the new website record with default status and createdAt field
        const newWebsite = {
            id: newId,
            websiteName,
            websiteUrl,
            username,
            password,
            imgUrl,
            createdBy,
            status: 'Requested', // Default status
            createdAt, // Add the timestamp
        };

        // Add to Firestore
        await db.collection('id').doc(newId).set(newWebsite);

        res.status(201).json({
            message: 'New ID added successfully',
            website: newWebsite,
        });
    } catch (error) {
        console.error('Error adding ID:', error);
        res.status(500).json({ message: 'Error adding ID', error: error.message });
    }
};
exports.getAllIds = async (req, res) => {
  try {
    // Extract userId from the query parameters
    const { userId } = req.query;

    // Validate the userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Reference to the Firestore collection
    const idsRef = db.collection("id");

    // Query Firestore to get all documents where 'createdBy' matches 'userId'
    const snapshot = await idsRef.where("createdBy", "==", userId).get();

    // If no matching documents are found
    if (snapshot.empty) {
      return res.status(404).json({ message: "No IDs found for this user" });
    }

    // Map the Firestore documents to an array
    const userIds = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return the fetched data
    res.status(200).json(userIds);
  } catch (error) {
    console.error("Error fetching IDs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

  
  
exports.changeIdPassword = async (req, res) => {

    const { userId, selectedId, newPassword } = req.body;

    if (!userId || !selectedId || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
    }
    // console.log(userId, selectedId, newPassword);

    try {
    // Get the "id" collection document using the selectedId
    const selectedItemRef = db.collection('id').doc(selectedId); // Assuming the document ID is selectedId
    const selectedItemDoc = await selectedItemRef.get();

    if (!selectedItemDoc.exists) {
        return res.status(404).json({ message: 'Selected ID not found' });
    }

    // You can also check if the user matches with the userId if necessary.
    const selectedItemData = selectedItemDoc.data();

        // Log values and their types
        // console.log("selectedItemData.createdBy:", selectedItemData.createdBy, "Type:", typeof selectedItemData.createdBy);
        // console.log("userId:", userId, "Type:", typeof userId);
    
        // If you need to verify that the selectedId belongs to the correct user (optional step)
    if (selectedItemData.createdBy != userId) {
        return res.status(403).json({ message: 'Unauthorized to change this password' });
    }

    // Update the password field
    await selectedItemRef.update({ password: newPassword });

    res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    }
};


// Get Account Details (Record where id == 1)
exports.getAccountDetailsDeposit = async (req, res) => {
  try {
    const userId = "1"; // The value you're searching for in the userId field

    // Query Firestore to find a document where 'userId' field equals 1
    const userAccountRef = db.collection('adminAccountDetails').where('userId', '==', userId);
    const snapshot = await userAccountRef.get();

    // If no matching document is found
    if (snapshot.empty) {
      return res.status(404).json({ message: "No account found with id = 1" });
    }

    // Get the first document from the snapshot (assuming only one document matches)
    const doc = snapshot.docs[0];
    const userAccount = doc.data(); // Get the data from the document

    // Send data as response, including the account details
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


// get the user deposite history

// Controller function to fetch transactions for a user
exports.getDepositTransactions = async (req, res) => {
  // Extract userId from the query string
  const userId = req.query.userId;

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Reference to the Firestore collection
    const transactionsRef = db.collection('transactions');

    // Query to fetch transactions where createdBy is equal to the userId
    const snapshot = await transactionsRef
      .where('createdBy', '==', userId)
      .get();

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




// Controller to get user balance
exports.getBalanceController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch user data from Firestore
    const userDoc = await db.collection('user').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract balance from user data
    const userData = userDoc.data();
    const balance = userData.balance || 0; // Default to 0 if balance is not set

    // Send the balance as a response
    return res.status(200).json({ balance });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


// Controller to get a simple Hello message
exports.getHelloController = async (req, res) => {
  try {
    console.log("Request received for Hello endpoint");

    // Respond with a simple message
    res.status(200).json({ message: 'Hello' });
  } catch (error) {
    console.error('Error in getHelloController:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const { db } = require('../config/firebase-config');
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

    // Generate a unique ID using Firestore's auto-generated document ID
    const userRef = db.collection('user').doc(); // Auto-generate a string ID
    const newId = userRef.id;

    // Create the user object
    const newUser = {
      id: newId, // Use the auto-generated string ID
      name,
      phoneNumber,
      email: email.toLowerCase(), // Convert email to lowercase
      password, // NOTE: Hash the password before saving in production
      username,
      balance: 0, // Default balance
      role: 'user', // Default role
    };

    // Add the user to Firestore
    await userRef.set(newUser);

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
      if (password && password.trim() !== '') updateData.password = password;
  
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
      const { 
        amount, 
        coinsNeeded, 
        coinRate, 
        withdrawalMethod, 
        withdrawalDetails, 
        createdAt, 
        createdBy, 
        websiteName, 
        websiteUrl, 
        username, 
        status, 
        id 
      } = req.body;

      console.log('Received withdrawal data:', req.body);

      // Validate data (ensure that all necessary fields are received)
      if (!amount || !createdAt || !createdBy || !websiteName || !websiteUrl || !username || !status || !id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Parse withdrawal details if it's a string
      let parsedWithdrawalDetails = withdrawalDetails;
      if (typeof withdrawalDetails === 'string') {
        try {
          parsedWithdrawalDetails = JSON.parse(withdrawalDetails);
        } catch (e) {
          console.error('Error parsing withdrawal details:', e);
          parsedWithdrawalDetails = {};
        }
      }

      const transactionId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare transaction data with enhanced information
      const transactionData = {
        description: `Withdrawal Request - ${websiteName} (${username}) - ₹${amount} (${coinsNeeded} coins)`,
        transactionId,
        paymentMethod: withdrawalMethod === 'upi' ? 'UPI' : 'Bank Transfer',
        createdAt,
        acceptedAt: 'Not updated',
        status: 'Pending',
        amount: parseFloat(amount),
        coinsNeeded: parseInt(coinsNeeded),
        coinRate: parseFloat(coinRate),
        withdrawalMethod,
        withdrawalDetails: parsedWithdrawalDetails,
        websiteName,
        websiteUrl,
        username,
        id, // ID reference
        createdBy,
        imagePath: 'No path',
        transactionType: 'withdrawal'
      };

      // Save transaction data to Firestore
      const transactionRef = await db.collection('transactions').add(transactionData);

      console.log('Withdrawal transaction created:', transactionRef.id);

      // Send a successful response
      res.status(201).json({
        message: 'Withdrawal request created successfully',
        transactionId: transactionRef.id,
        coinsNeeded: coinsNeeded,
        amount: amount
      });
    } catch (error) {
      console.error('Error creating withdrawal transaction:', error);
      res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
  };




exports.createId = async (req, res) => {
    const { websiteName, websiteUrl, username, imgUrl, createdBy } = req.body;
    // console.log(req.body);

    // Validation: Ensure required fields are provided
    if (!websiteName || !websiteUrl || !username || !imgUrl || !createdBy) {
        return res.status(400).json({ message: 'All required fields are provided.' });
    }

    try {
        // Check user's wallet balance
        const userSnapshot = await db.collection('user').where('username', '==', createdBy).get();
        
        if (userSnapshot.empty) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userData = userSnapshot.docs[0].data();
        const userBalance = userData.balance || 0;

        // Check if user has sufficient balance (≥100)
        if (userBalance < 100) {
            return res.status(400).json({ 
                message: 'Insufficient balance. Minimum balance of ₹100 required to create ID.',
                currentBalance: userBalance,
                requiredBalance: 100
            });
        }

        // Fetch website details to get coin rate
        let coinRate = 1; // Default coin rate
        let minimumCoins = 0; // Default minimum coins
        
        try {
            const websitesSnapshot = await db.collection('websites').get();
            const websites = websitesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const website = websites.find(w => w.website === websiteName);
            
            if (website) {
                coinRate = parseFloat(website.coinRate) || 1;
                minimumCoins = parseFloat(website.minimumCoins) || 0;
            }
        } catch (error) {
            console.error('Error fetching website details:', error);
            // Continue with default values
        }

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
            password: '', // Empty password as it's not required
            imgUrl,
            createdBy,
            status: 'Requested', // Default status
            balance: 0, // Default balance for this ID
            coinRate, // Store coin rate from website
            minimumCoins, // Store minimum coins from website
            createdAt, // Add the timestamp
        };

        // Add to Firestore
        await db.collection('id').doc(newId).set(newWebsite);

        res.status(201).json({
            message: 'New ID created successfully',
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

  
  
// Close ID - Move ID to close collection
exports.closeId = async (req, res) => {
    const { id, createdBy } = req.body;

    // Validation: Ensure required fields are provided
    if (!id || !createdBy) {
        return res.status(400).json({ message: 'ID and createdBy are required.' });
    }

    try {
        // Get the ID document from the main collection
        const idDoc = await db.collection('id').doc(id).get();
        
        if (!idDoc.exists) {
            return res.status(404).json({ message: 'ID not found.' });
        }

        const idData = idDoc.data();

        // Verify the user owns this ID
        if (idData.createdBy !== createdBy) {
            return res.status(403).json({ message: 'You are not authorized to close this ID.' });
        }

        // Create the closed ID document
        const closedIdData = {
            ...idData,
            closedAt: new Date().toISOString(),
            status: 'Closed',
            originalId: id
        };

        // Add to close collection with auto-generated ID
        const closeDocRef = db.collection('close').doc();
        await closeDocRef.set(closedIdData);

        // Delete from main collection
        await db.collection('id').doc(id).delete();

        res.status(200).json({
            message: 'ID closed successfully',
            closedId: closedIdData
        });
    } catch (error) {
        console.error('Error closing ID:', error);
        res.status(500).json({ message: 'Error closing ID', error: error.message });
    }
};

// Get transactions for specific ID
exports.getIdTransactions = async (req, res) => {
    const { id, userId } = req.query;

    if (!id || !userId) {
        return res.status(400).json({ message: 'ID and userId are required.' });
    }

    try {
        console.log('Getting transactions for ID:', id, 'User:', userId);
        
        // Get the ID details first to get website information
        const idDoc = await db.collection('id').doc(id).get();
        if (!idDoc.exists) {
            return res.status(404).json({ message: 'ID not found.' });
        }
        
        const idData = idDoc.data();
        const websiteName = idData.websiteName || '';
        const websiteUrl = idData.websiteUrl || '';
        const username = idData.username || '';

        console.log('ID Data:', { websiteName, websiteUrl, username, createdBy: idData.createdBy });

        // Get all transactions for this user (without ordering to avoid index requirement)
        const transactionsSnapshot = await db.collection('transactions')
            .where('createdBy', '==', userId)
            .get();

        console.log('Found transactions:', transactionsSnapshot.size);

        // If no transactions found, return empty array instead of error
        if (transactionsSnapshot.empty) {
            return res.status(200).json([]);
        }

        // Filter transactions that are related to this specific ID
        const allTransactions = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by creation date in JavaScript (newest first)
        allTransactions.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        // Enhanced filtering to find all transactions related to this ID
        const relatedTransactions = allTransactions.filter(transaction => {
            const description = transaction.description || '';
            const transactionWebsiteName = transaction.websiteName || '';
            const transactionWebsiteUrl = transaction.websiteUrl || '';
            const transactionUsername = transaction.username || '';
            
            // Check multiple criteria for ID-related transactions
            return (
                // Direct ID matches
                transaction.id === id ||
                transaction.websiteId === id ||
                
                // Website name matches
                (websiteName && transactionWebsiteName.toLowerCase().includes(websiteName.toLowerCase())) ||
                (websiteName && description.toLowerCase().includes(websiteName.toLowerCase())) ||
                
                // Website URL matches
                (websiteUrl && transactionWebsiteUrl.toLowerCase().includes(websiteUrl.toLowerCase())) ||
                (websiteUrl && description.toLowerCase().includes(websiteUrl.toLowerCase())) ||
                
                // Username matches
                (username && transactionUsername.toLowerCase().includes(username.toLowerCase())) ||
                (username && description.toLowerCase().includes(username.toLowerCase())) ||
                
                // Description contains ID or website info
                description.toLowerCase().includes(id.toLowerCase()) ||
                
                // Check for deposit/withdrawal transactions that might be related
                (transaction.paymentMethod && (
                    transaction.paymentMethod.toLowerCase().includes('deposit') ||
                    transaction.paymentMethod.toLowerCase().includes('withdrawal') ||
                    transaction.paymentMethod.toLowerCase().includes('withdraw')
                ))
            );
        });

        // Add ID information to each transaction for better context
        const enrichedTransactions = relatedTransactions.map(transaction => ({
            ...transaction,
            relatedId: {
                id: id,
                websiteName: websiteName,
                websiteUrl: websiteUrl,
                username: username
            }
        }));

        res.status(200).json(enrichedTransactions);
    } catch (error) {
        console.error('Error fetching ID transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// Request password change for ID
exports.requestPasswordChange = async (req, res) => {
    const { id, createdBy, newPassword, reason } = req.body;

    if (!id || !createdBy || !newPassword) {
        return res.status(400).json({ message: 'ID, createdBy, and newPassword are required.' });
    }

    try {
        // Verify the ID exists and user owns it
        const idDoc = await db.collection('id').doc(id).get();
        
        if (!idDoc.exists) {
            return res.status(404).json({ message: 'ID not found.' });
        }

        const idData = idDoc.data();

        if (idData.createdBy !== createdBy) {
            return res.status(403).json({ message: 'You are not authorized to change password for this ID.' });
        }

        // Create password change request
        const passwordChangeRequest = {
            id: db.collection('passwordChangeRequests').doc().id,
            originalId: id,
            createdBy,
            newPassword,
            reason: reason || 'User requested password change',
            status: 'Pending',
            createdAt: new Date().toISOString(),
            websiteName: idData.websiteName,
            websiteUrl: idData.websiteUrl,
            username: idData.username
        };

        // Save the request
        await db.collection('passwordChangeRequests').doc(passwordChangeRequest.id).set(passwordChangeRequest);

        res.status(201).json({
            message: 'Password change request submitted successfully',
            request: passwordChangeRequest
        });
    } catch (error) {
        console.error('Error requesting password change:', error);
        res.status(500).json({ message: 'Error requesting password change', error: error.message });
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

// Controller to get ID balance
exports.getIdBalanceController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    // Fetch ID data from Firestore
    const idDoc = await db.collection('id').doc(id).get();

    if (!idDoc.exists) {
      return res.status(404).json({ message: 'ID not found' });
    }

    // Extract balance from ID data
    const idData = idDoc.data();
    const balance = idData.balance || 0; // Default to 0 if balance is not set

    // Send the balance as a response
    return res.status(200).json({ 
      id: id,
      balance: balance,
      websiteName: idData.websiteName,
      username: idData.username
    });
  } catch (error) {
    console.error('Error fetching ID balance:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


// API to add coin rates to websites that are missing them
exports.addCoinRatesToWebsites = async (req, res) => {
  try {
    console.log('Adding coin rates to websites that are missing them...');
    
    // Get all websites
    const websitesSnapshot = await db.collection('websites').get();
    const websites = websitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Found websites:', websites.length);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each website
    for (const websiteDoc of websitesSnapshot.docs) {
      const websiteData = websiteDoc.data();
      
      // Check if website already has coin rate
      if (websiteData.coinRate !== undefined && websiteData.minimumCoins !== undefined) {
        console.log(`Skipping website ${websiteDoc.id} - already has coin rate:`, websiteData.coinRate);
        skippedCount++;
        continue;
      }
      
      // Set default coin rate based on website name or use 1.0 as default
      let coinRate = 1.0;
      let minimumCoins = 0;
      
      // You can customize coin rates for specific websites here
      if (websiteData.website === 'qweqweqqwe') {
        coinRate = 0.25;
        minimumCoins = 12000;
      } else if (websiteData.website === 'asd') {
        coinRate = 2.0;
        minimumCoins = 100;
      } else if (websiteData.website === 'jhgjh') {
        coinRate = 1.5;
        minimumCoins = 200;
      } else if (websiteData.website === 'sdf') {
        coinRate = 0.5;
        minimumCoins = 500;
      }
      
      const updateData = {
        coinRate: coinRate.toString(),
        minimumCoins: minimumCoins.toString()
      };
      
      await websiteDoc.ref.update(updateData);
      console.log(`Updated website ${websiteDoc.id} (${websiteData.website}) with coin rate:`, coinRate, 'minimum coins:', minimumCoins);
      updatedCount++;
    }
    
    res.status(200).json({
      message: 'Coin rates added to websites successfully',
      totalWebsites: websites.length,
      updated: updatedCount,
      skipped: skippedCount
    });
    
  } catch (error) {
    console.error('Error adding coin rates to websites:', error);
    res.status(500).json({ 
      message: 'Failed to add coin rates to websites', 
      error: error.message 
    });
  }
};

// New deposit API with coin conversion and validation
exports.createNewDepositTransaction = async (req, res) => {
  try {
    const {
      amount,
      coinsToReceive,
      coinRate,
      refundable,
      websiteName,
      websiteUrl,
      username,
      id,
      createdBy,
      createdAt,
      status
    } = req.body;

    // Validation
    if (!amount || !coinsToReceive || !coinRate || !websiteName || !username || !id || !createdBy) {
      return res.status(400).json({ 
        message: 'Missing required fields: amount, coinsToReceive, coinRate, websiteName, username, id, createdBy' 
      });
    }

    // Check if user has sufficient wallet balance
    console.log('Looking for user with ID:', createdBy);
    let userDoc = await db.collection('user').doc(createdBy).get();
    
    // If not found by ID, try to find by username
    if (!userDoc.exists) {
      console.log('User document not found with ID, trying username:', createdBy);
      const userSnapshot = await db.collection('user').where('username', '==', createdBy).get();
      if (userSnapshot.empty) {
        console.log('User not found with username either:', createdBy);
        return res.status(404).json({ message: 'User not found' });
      }
      // Use the first matching user
      const userData = userSnapshot.docs[0].data();
      userDoc = { exists: true, data: () => userData };
    }

    const userData = userDoc.data();
    const userBalance = userData.balance || 0;

    if (parseFloat(amount) > userBalance) {
      return res.status(400).json({ 
        message: 'Insufficient wallet balance',
        currentBalance: userBalance,
        requiredAmount: parseFloat(amount)
      });
    }

    // Generate unique transaction ID
    const transactionId = `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare transaction data
    const transactionData = {
      description: `Deposit Request - ${websiteName} (${username}) - ₹${amount} (${coinsToReceive} coins)`,
      transactionId,
      paymentMethod: 'Deposit',
      createdAt: createdAt || new Date().toISOString(),
      acceptedAt: 'Not updated',
      status: status || 'Pending',
      amount: parseFloat(amount),
      coinsToReceive: parseInt(coinsToReceive),
      coinRate: parseFloat(coinRate),
      refundable: refundable === true || refundable === 'true',
      websiteName,
      websiteUrl,
      username,
      id, // ID reference
      createdBy,
      imagePath: 'No image required for deposit',
      transactionType: 'deposit'
    };

    // Save transaction to Firestore
    const transactionRef = await db.collection('transactions').add(transactionData);

    console.log('New deposit transaction created:', transactionRef.id);

    res.status(201).json({
      message: 'Deposit request submitted successfully',
      transaction: {
        id: transactionRef.id,
        ...transactionData,
      },
    });

  } catch (error) {
    console.error('Error creating deposit transaction:', error);
    res.status(500).json({ 
      message: 'Error creating deposit transaction', 
      error: error.message 
    });
  }
};

// Migration script to update existing IDs with coin rates
exports.migrateIdsWithCoinRates = async (req, res) => {
  try {
    console.log('Starting migration to add coin rates to existing IDs...');
    
    // Get all websites to create a lookup map
    const websitesSnapshot = await db.collection('websites').get();
    const websites = websitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Found websites:', websites.length);
    
    // Create a lookup map for faster searching
    const websiteMap = {};
    websites.forEach(website => {
      websiteMap[website.website] = {
        coinRate: parseFloat(website.coinRate) || 1,
        minimumCoins: parseFloat(website.minimumCoins) || 0
      };
    });
    
    console.log('Website map:', websiteMap);
    
    // Get all IDs
    const idsSnapshot = await db.collection('id').get();
    const ids = idsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Found IDs:', ids.length);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each ID
    for (const idDoc of idsSnapshot.docs) {
      const idData = idDoc.data();
      const websiteName = idData.websiteName;
      
      // Check if ID already has coin rate
      if (idData.coinRate !== undefined) {
        console.log(`Skipping ID ${idDoc.id} - already has coin rate:`, idData.coinRate);
        skippedCount++;
        continue;
      }
      
      // Get coin rate from website
      const websiteInfo = websiteMap[websiteName];
      if (websiteInfo) {
        const updateData = {
          coinRate: websiteInfo.coinRate,
          minimumCoins: websiteInfo.minimumCoins,
          balance: idData.balance !== undefined ? idData.balance : 0
        };
        
        await idDoc.ref.update(updateData);
        console.log(`Updated ID ${idDoc.id} for website ${websiteName} with coin rate:`, websiteInfo.coinRate);
        updatedCount++;
      } else {
        console.log(`Website not found for ID ${idDoc.id}, website: ${websiteName}`);
        // Set default values
        const updateData = {
          coinRate: 1,
          minimumCoins: 0,
          balance: idData.balance !== undefined ? idData.balance : 0
        };
        
        await idDoc.ref.update(updateData);
        console.log(`Updated ID ${idDoc.id} with default coin rate: 1`);
        updatedCount++;
      }
    }
    
    res.status(200).json({
      message: 'Migration completed successfully',
      totalIds: ids.length,
      updated: updatedCount,
      skipped: skippedCount,
      websiteMap: websiteMap
    });
    
  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({ 
      message: 'Migration failed', 
      error: error.message 
    });
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

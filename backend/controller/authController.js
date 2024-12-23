const { db } = require('../config/firebase');

// loginController.js
exports.loginController = async (req, res) => {
  try {
    // Extract data from the request body
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check in the admin collection first
    let snapshot = await db.collection('admin').where('username', '==', username).get();

    if (!snapshot.empty) {
      // Admin found, check the password
      const admin = snapshot.docs[0].data();
      const adminId = snapshot.docs[0].id;

      if (admin.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Structure the admin object to match the user structure
      const adminWithId = {
        id: adminId,
        username: admin.username,
        email: admin.email || '', // Add email if available
        role: 'admin', // Explicitly define the role
        ...admin, // Include other admin fields
      };
      delete adminWithId.password; // Exclude the password

      return res.status(200).json({
        message: 'Admin login successful',
        user: adminWithId,
      });
    }
    // If not found in the admin collection, check in the user collection
    snapshot = await db.collection('user').where('username', '==', username).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    // User found, check the password
    const user = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Log the user object before returning
    // console.log('User found:', user);

    // Combine user data with the id and exclude the password
    const userWithId = { id: userId, ...user };
    return res.status(200).json({
      message: 'User login successful',
      user: userWithId, // Exclude password
    });

  } catch (error) {
    console.error("Error in loginController:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

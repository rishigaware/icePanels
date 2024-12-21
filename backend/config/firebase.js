// const admin = require('firebase-admin');

// // Ensure this is the correct path to your Firebase service account JSON file
// const serviceAccount = require('./service-account-key.json');  // Adjust the path as needed

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://plateform-manager.firebaseio.com", // Optional for Firestore
// });

// const db = admin.firestore(); // Firestore database instance
// module.exports = { db };  // Ensure db is being exported correctly


const admin = require('firebase-admin');

// Ensure this is the correct path to your Firebase service account JSON file
const serviceAccount = require('./service-account-key.json');  // Adjust the path as needed

let db;

// Try to initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://plateform-manager.firebaseio.com", // Optional for Firestore
  });

  db = admin.firestore(); // Firestore database instance
  console.log("Firebase connection established successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
  // Optionally, set db to null or a mock object if you need to prevent further operations
  db = null;
}

// Export db if initialized, otherwise, handle db as null or with fallback logic
module.exports = { db };

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


// const admin = require('firebase-admin');

// // Ensure this is the correct path to your Firebase service account JSON file
// const serviceAccount = require('./service-account-key.json');  // Adjust the path as needed

// let db;

// // Try to initialize Firebase Admin SDK
// try {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://plateform-manager.firebaseio.com", // Optional for Firestore
//   });

//   db = admin.firestore(); // Firestore database instance
//   console.log("Firebase connection established successfully");
// } catch (error) {
//   console.error("Error initializing Firebase Admin SDK:", error.message);
//   // Optionally, set db to null or a mock object if you need to prevent further operations
//   db = null;
// }

// // Export db if initialized, otherwise, handle db as null or with fallback logic
// module.exports = { db };







const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables
const path = require('path'); // Import path module

const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);

const serviceAccount = require(serviceAccountPath); // Load service account from env
const databaseURL = process.env.FIREBASE_DATABASE_URL; // Use database URL from env
// console.log(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
let db;

// Try to initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL, // Use the environment variable for the database URL
  });

  db = admin.firestore(); // Firestore database instance
  console.log("Firebase connection established successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
  db = null;
}

// Export db if initialized, otherwise handle db as null or with fallback logic
module.exports = { db };

const admin = require('firebase-admin');
const path = require('path');

// Configuration object - update these values when you get new Firebase credentials
const firebaseConfig = {
  serviceAccountPath: './the247-2.json', // Update this path
  databaseURL: 'https://the247-2.firebaseio.com', // Update this URL to match your new project
  projectId: 'the247-2' // Update this project ID
};

let db;
let rtdb; // Realtime Database instance

// Try to initialize Firebase Admin SDK
try {
  const serviceAccount = require(path.resolve(__dirname, firebaseConfig.serviceAccountPath));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId
  });

  // Try Firestore first
  try {
    db = admin.firestore();
    console.log("Firestore connection established successfully");
    console.log(`Connected to project: ${firebaseConfig.projectId}`);
  } catch (firestoreError) {
    console.log("Firestore failed, falling back to Realtime Database");
    db = null;
  }

  // Initialize Realtime Database as backup
  try {
    rtdb = admin.database();
    console.log("Realtime Database connection established successfully");
  } catch (rtdbError) {
    console.log("Realtime Database also failed");
    rtdb = null;
  }

} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
  console.error("Please check your service account key path and configuration");
  db = null;
  rtdb = null;
}

module.exports = { db, rtdb, firebaseConfig };

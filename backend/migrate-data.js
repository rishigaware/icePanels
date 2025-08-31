const { db: newDb } = require('./config/firebase-config');
const { db: oldDb } = require('./config/firebase');

// Data migration script - Run this after setting up new Firebase project
async function migrateData() {
  try {
    console.log('Starting data migration from old to new Firebase project...');
    
    if (!oldDb) {
      console.error('Old database connection not available');
      return;
    }
    
    if (!newDb) {
      console.error('New database connection not available');
      return;
    }
    
    // List of collections to migrate
    const collections = [
      'admin',
      'adminAccountDetails', 
      'bottomCardCorousel',
      'bottomCorousel',
      'id',
      'middleCorousel',
      'topCardCorousel',
      'topCorousel',
      'transactions',
      'user',
      'userAccounts',
      'websites'
    ];
    
    for (const collectionName of collections) {
      try {
        console.log(`\nMigrating collection: ${collectionName}`);
        
        // Get all documents from old collection
        const snapshot = await oldDb.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`Collection ${collectionName} is empty, skipping...`);
          continue;
        }
        
        console.log(`Found ${snapshot.docs.length} documents in ${collectionName}`);
        
        // Migrate each document
        let migratedCount = 0;
        for (const doc of snapshot.docs) {
          try {
            const data = doc.data();
            const docId = doc.id;
            
            // Add migration metadata
            const migrationData = {
              ...data,
              _migratedAt: new Date().toISOString(),
              _originalId: docId,
              _sourceProject: 'plateform-manager'
            };
            
            // Save to new database
            await newDb.collection(collectionName).doc(docId).set(migrationData);
            migratedCount++;
            
            if (migratedCount % 10 === 0) {
              console.log(`  Migrated ${migratedCount}/${snapshot.docs.length} documents...`);
            }
            
          } catch (docError) {
            console.error(`  Error migrating document ${doc.id}:`, docError.message);
          }
        }
        
        console.log(`✅ Successfully migrated ${migratedCount} documents from ${collectionName}`);
        
      } catch (collectionError) {
        console.error(`❌ Error migrating collection ${collectionName}:`, collectionError.message);
      }
    }
    
    console.log('\n🎉 Data migration completed!');
    console.log('Check your new Firebase project to verify all data was migrated.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Function to migrate specific collection
async function migrateCollection(collectionName) {
  try {
    console.log(`Migrating only collection: ${collectionName}`);
    
    const snapshot = await oldDb.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`Collection ${collectionName} is empty`);
      return;
    }
    
    console.log(`Found ${snapshot.docs.length} documents`);
    
    let migratedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docId = doc.id;
      
      const migrationData = {
        ...data,
        _migratedAt: new Date().toISOString(),
        _originalId: docId,
        _sourceProject: 'plateform-manager'
      };
      
      await newDb.collection(collectionName).doc(docId).set(migrationData);
      migratedCount++;
    }
    
    console.log(`✅ Migrated ${migratedCount} documents from ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error);
  }
}

// Function to check data counts
async function checkDataCounts() {
  try {
    console.log('Checking data counts in old database...');
    
    const collections = [
      'admin', 'adminAccountDetails', 'bottomCardCorousel', 'bottomCorousel',
      'id', 'middleCorousel', 'topCardCorousel', 'topCorousel',
      'transactions', 'user', 'userAccounts', 'websites'
    ];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await oldDb.collection(collectionName).get();
        console.log(`${collectionName}: ${snapshot.docs.length} documents`);
      } catch (error) {
        console.log(`${collectionName}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking data counts:', error);
  }
}

module.exports = { 
  migrateData, 
  migrateCollection, 
  checkDataCounts 
};

// Uncomment the function you want to run:
// migrateData();           // Migrate all collections
// migrateCollection('user'); // Migrate specific collection
// checkDataCounts();       // Check data counts first

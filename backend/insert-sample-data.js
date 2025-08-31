const { db } = require('./config/firebase-config');

// Sample data for each collection
const sampleData = {
  admin: [
    {
      username: 'admin1',
      email: 'admin1@the247panel.com',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      username: 'admin2',
      email: 'admin2@the247panel.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ],
  
  transactions: [
    {
      userId: 'user001',
      type: 'deposit',
      amount: 1000,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: 'Sample deposit transaction'
    },
    {
      userId: 'user002',
      type: 'withdrawal',
      amount: 500,
      status: 'pending',
      timestamp: new Date().toISOString(),
      description: 'Sample withdrawal transaction'
    }
  ],
  
  user: [
    {
      username: 'user001',
      email: 'user001@example.com',
      phone: '+1234567890',
      isActive: true,
      createdAt: new Date().toISOString(),
      balance: 1000
    },
    {
      username: 'user002',
      email: 'user002@example.com',
      phone: '+0987654321',
      isActive: true,
      createdAt: new Date().toISOString(),
      balance: 500
    }
  ],
  
  userAccounts: [
    {
      userId: 'user001',
      accountNumber: 'ACC001',
      accountType: 'savings',
      balance: 1000,
      createdAt: new Date().toISOString()
    },
    {
      userId: 'user002',
      accountNumber: 'ACC002',
      accountType: 'current',
      balance: 500,
      createdAt: new Date().toISOString()
    }
  ],
  
  websites: [
    {
      name: 'Sample Website 1',
      url: 'https://sample1.com',
      logo: 'sample1-logo.jpg',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Sample Website 2',
      url: 'https://sample2.com',
      logo: 'sample2-logo.jpg',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  
  topCardCorousel: [
    {
      title: 'Top Carousel Item 1',
      image: 'top1.jpg',
      link: 'https://example1.com',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Top Carousel Item 2',
      image: 'top2.jpg',
      link: 'https://example2.com',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  
  middleCorousel: [
    {
      title: 'Middle Carousel Item 1',
      image: 'middle1.jpg',
      link: 'https://example1.com',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Middle Carousel Item 2',
      image: 'middle2.jpg',
      link: 'https://example2.com',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  
  bottomCorousel: [
    {
      title: 'Bottom Carousel Item 1',
      image: 'bottom1.jpg',
      link: 'https://example1.com',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Bottom Carousel Item 2',
      image: 'bottom2.jpg',
      link: 'https://example2.com',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  
  topCardCarousel: [
    {
      title: 'Top Card Carousel Item 1',
      image: 'topcard1.jpg',
      link: 'https://example1.com',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Top Card Carousel Item 2',
      image: 'topcard2.jpg',
      link: 'https://example2.com',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  
  bottomCardCarousel: [
    {
      title: 'Bottom Card Carousel Item 1',
      image: 'bottomcard1.jpg',
      link: 'https://example1.com',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Bottom Card Carousel Item 2',
      image: 'bottomcard2.jpg',
      link: 'https://example2.com',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  
  id: [
    {
      userId: 'user001',
      idType: 'driving_license',
      idNumber: 'DL001',
      isVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      userId: 'user002',
      idType: 'passport',
      idNumber: 'PP001',
      isVerified: false,
      createdAt: new Date().toISOString()
    }
  ],
  
  adminAccountDetails: [
    {
      adminId: 'admin001',
      bankName: 'Sample Bank 1',
      accountNumber: 'BANK001',
      ifscCode: 'SAMP0000001',
      createdAt: new Date().toISOString()
    },
    {
      adminId: 'admin002',
      bankName: 'Sample Bank 2',
      accountNumber: 'BANK002',
      ifscCode: 'SAMP0000002',
      createdAt: new Date().toISOString()
    }
  ]
};

async function insertSampleData() {
  try {
    console.log('🚀 Starting to insert sample data...\n');
    
    if (!db) {
      console.error('❌ Database connection not available');
      return;
    }
    
    let totalInserted = 0;
    
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      try {
        console.log(`📝 Inserting data into ${collectionName}...`);
        
        for (const docData of documents) {
          try {
            // Generate a unique ID for each document
            const docId = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await db.collection(collectionName).doc(docId).set(docData);
            console.log(`  ✅ Inserted: ${docId}`);
            totalInserted++;
            
          } catch (docError) {
            console.error(`  ❌ Error inserting document in ${collectionName}:`, docError.message);
          }
        }
        
        console.log(`✅ Completed ${collectionName}\n`);
        
      } catch (collectionError) {
        console.error(`❌ Error with collection ${collectionName}:`, collectionError.message);
      }
    }
    
    console.log(`🎉 Sample data insertion completed!`);
    console.log(`📊 Total documents inserted: ${totalInserted}`);
    console.log(`\n🔍 You can now check your Firebase console to see the new data.`);
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Function to insert data into specific collection
async function insertIntoCollection(collectionName, count = 2) {
  try {
    console.log(`📝 Inserting ${count} records into ${collectionName}...`);
    
    if (!db) {
      console.error('❌ Database connection not available');
      return;
    }
    
    const documents = sampleData[collectionName];
    if (!documents) {
      console.error(`❌ No sample data found for collection: ${collectionName}`);
      return;
    }
    
    let inserted = 0;
    for (let i = 0; i < count; i++) {
      const docData = documents[i % documents.length]; // Cycle through available data
      const docId = `${collectionName}_${Date.now()}_${i}`;
      
      await db.collection(collectionName).doc(docId).set(docData);
      console.log(`  ✅ Inserted: ${docId}`);
      inserted++;
    }
    
    console.log(`✅ Successfully inserted ${inserted} records into ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Error inserting into ${collectionName}:`, error);
  }
}

// Export functions for use in other scripts
module.exports = { insertSampleData, insertIntoCollection };

// Run the full insertion if this script is run directly
if (require.main === module) {
  insertSampleData();
}

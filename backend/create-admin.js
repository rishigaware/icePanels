const { db } = require('./config/firebase-config');

// Sample admin data
const adminData = [
  {
    name: 'Super Admin',
    phoneNumber: '+1234567890',
    email: 'superadmin@the247panel.com',
    password: 'superadmin123',
    username: 'superadmin',
    role: 'super_admin',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Admin User',
    phoneNumber: '+0987654321',
    email: 'admin@the247panel.com',
    password: 'admin123',
    username: 'admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

async function createAdmins() {
  try {
    console.log('🚀 Creating admin accounts...\n');
    
    if (!db) {
      console.error('❌ Database connection not available');
      return;
    }
    
    for (const admin of adminData) {
      try {
        // Check if username already exists
        const existingAdmin = await db
          .collection('admin')
          .where('username', '==', admin.username)
          .get();
        
        if (!existingAdmin.empty) {
          console.log(`⚠️ Admin with username '${admin.username}' already exists, skipping...`);
          continue;
        }
        
        // Get next available ID
        const snapshot = await db.collection('admin').get();
        let highestId = 0;
        snapshot.forEach(doc => {
          const adminId = parseInt(doc.id, 10);
          if (adminId > highestId) {
            highestId = adminId;
          }
        });
        
        const newId = highestId + 1;
        
        // Create admin document
        const newAdminDoc = {
          id: newId,
          ...admin
        };
        
        await db.collection('admin').doc(newId.toString()).set(newAdminDoc);
        console.log(`✅ Created admin: ${admin.name} (${admin.username})`);
        
      } catch (error) {
        console.error(`❌ Error creating admin ${admin.username}:`, error.message);
      }
    }
    
    console.log('\n🎉 Admin creation completed!');
    console.log('\n📋 Created Admin Accounts:');
    console.log('   Username: superadmin, Password: superadmin123');
    console.log('   Username: admin, Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admins:', error);
  }
}

// Function to create a single admin
async function createSingleAdmin(adminData) {
  try {
    console.log(`📝 Creating admin: ${adminData.name}...`);
    
    if (!db) {
      console.error('❌ Database connection not available');
      return;
    }
    
    // Check if username already exists
    const existingAdmin = await db
      .collection('admin')
      .where('username', '==', adminData.username)
      .get();
    
    if (!existingAdmin.empty) {
      console.log(`❌ Admin with username '${adminData.username}' already exists`);
      return;
    }
    
    // Get next available ID
    const snapshot = await db.collection('admin').get();
    let highestId = 0;
    snapshot.forEach(doc => {
      const adminId = parseInt(doc.id, 10);
      if (adminId > highestId) {
        highestId = adminId;
      }
    });
    
    const newId = highestId + 1;
    
    // Create admin document
    const newAdminDoc = {
      id: newId,
      ...adminData,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('admin').doc(newId.toString()).set(newAdminDoc);
    console.log(`✅ Admin created successfully: ${adminData.name} (${adminData.username})`);
    console.log(`   ID: ${newId}`);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

// Export functions
module.exports = { createAdmins, createSingleAdmin };

// Run admin creation if this script is run directly
if (require.main === module) {
  createAdmins();
}

#!/usr/bin/env node

const { insertSampleData, insertIntoCollection } = require('./insert-sample-data');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const collectionName = args[1];
const count = parseInt(args[2]) || 2;

console.log('🚀 Firebase Sample Data Insertion Tool');
console.log('=====================================\n');

switch (command) {
  case 'all':
    console.log('📝 Inserting sample data into ALL collections...\n');
    insertSampleData();
    break;
    
  case 'collection':
    if (!collectionName) {
      console.log('❌ Please specify a collection name');
      console.log('Usage: node insert-data.js collection <collectionName> [count]');
      console.log('\nAvailable collections:');
      console.log('  - admin, transactions, user, userAccounts');
      console.log('  - websites, topCardCorousel, middleCorousel');
      console.log('  - bottomCorousel, topCardCarousel, bottomCardCarousel');
      console.log('  - id, adminAccountDetails');
      break;
    }
    
    console.log(`📝 Inserting ${count} records into ${collectionName}...\n`);
    insertIntoCollection(collectionName, count);
    break;
    
  case 'transactions':
    console.log('💰 Inserting sample transactions...\n');
    insertIntoCollection('transactions', count);
    break;
    
  case 'users':
    console.log('👥 Inserting sample users...\n');
    insertIntoCollection('user', count);
    break;
    
  case 'help':
  default:
    console.log('Available commands:');
    console.log('  node insert-data.js all                           - Insert data into all collections');
    console.log('  node insert-data.js collection <name> [count]     - Insert into specific collection');
    console.log('  node insert-data.js transactions [count]          - Insert transactions (default: 2)');
    console.log('  node insert-data.js users [count]                 - Insert users (default: 2)');
    console.log('  node insert-data.js help                          - Show this help message');
    console.log('\nExamples:');
    console.log('  node insert-data.js all');
    console.log('  node insert-data.js collection transactions 5');
    console.log('  node insert-data.js transactions 3');
    console.log('  node insert-data.js users 4');
    console.log('\nCollections available:');
    console.log('  - admin, transactions, user, userAccounts');
    console.log('  - websites, topCardCorousel, middleCorousel');
    console.log('  - bottomCorousel, topCardCarousel, bottomCardCarousel');
    console.log('  - id, adminAccountDetails');
    break;
}

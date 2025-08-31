const { db, rtdb } = require('./firebase-config');

class DatabaseAdapter {
  constructor() {
    this.db = db;
    this.rtdb = rtdb;
    this.useFirestore = !!db;
    this.useRTDB = !!rtdb;
    
    if (!this.useFirestore && !this.useRTDB) {
      throw new Error('No database connection available');
    }
    
    console.log(`Using database: ${this.useFirestore ? 'Firestore' : 'Realtime Database'}`);
  }

  // Generic collection/document operations
  async get(collection, docId = null) {
    if (this.useFirestore) {
      if (docId) {
        const doc = await this.db.collection(collection).doc(docId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      } else {
        const snapshot = await this.db.collection(collection).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } else if (this.useRTDB) {
      if (docId) {
        const snapshot = await this.rtdb.ref(`${collection}/${docId}`).once('value');
        const data = snapshot.val();
        return data ? { id: docId, ...data } : null;
      } else {
        const snapshot = await this.rtdb.ref(collection).once('value');
        const data = snapshot.val();
        return data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      }
    }
  }

  async set(collection, docId, data) {
    if (this.useFirestore) {
      await this.db.collection(collection).doc(docId).set(data);
    } else if (this.useRTDB) {
      await this.rtdb.ref(`${collection}/${docId}`).set(data);
    }
  }

  async update(collection, docId, data) {
    if (this.useFirestore) {
      await this.db.collection(collection).doc(docId).update(data);
    } else if (this.useRTDB) {
      await this.rtdb.ref(`${collection}/${docId}`).update(data);
    }
  }

  async delete(collection, docId) {
    if (this.useFirestore) {
      await this.db.collection(collection).doc(docId).delete();
    } else if (this.useRTDB) {
      await this.rtdb.ref(`${collection}/${docId}`).remove();
    }
  }

  async add(collection, data) {
    if (this.useFirestore) {
      const docRef = await this.db.collection(collection).add(data);
      return docRef.id;
    } else if (this.useRTDB) {
      const newRef = this.rtdb.ref(collection).push();
      await newRef.set(data);
      return newRef.key;
    }
  }

  // Query operations
  async where(collection, field, operator, value) {
    if (this.useFirestore) {
      const snapshot = await this.db.collection(collection).where(field, operator, value).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (this.useRTDB) {
      // RTDB doesn't support complex queries, so we'll get all and filter
      const snapshot = await this.rtdb.ref(collection).once('value');
      const data = snapshot.val();
      if (!data) return [];
      
      return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .filter(item => {
          switch (operator) {
            case '==': return item[field] === value;
            case '!=': return item[field] !== value;
            case '>': return item[field] > value;
            case '<': return item[field] < value;
            case '>=': return item[field] >= value;
            case '<=': return item[field] <= value;
            default: return true;
          }
        });
    }
  }

  // Transaction operations
  async runTransaction(updateFunction) {
    if (this.useFirestore) {
      return await this.db.runTransaction(updateFunction);
    } else if (this.useRTDB) {
      // RTDB doesn't support transactions, so we'll use a simple update
      return await updateFunction();
    }
  }
}

module.exports = DatabaseAdapter;


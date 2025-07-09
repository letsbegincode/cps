const mongoose = require('mongoose');

async function fixIndex() {
  try {
    // Connect to MongoDB Atlas (same as the running server)
    await mongoose.connect('mongodb+srv://ayush:ayush123@cluster0.xfvgvpo.mongodb.net/test?retryWrites=true&w=majority');
    
    console.log('Connected to MongoDB');
    
    // Get the collection
    const db = mongoose.connection.db;
    const collection = db.collection('userconceptprogresses');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the problematic index on userId only
    try {
      await collection.dropIndex('userId_1');
      console.log('Successfully dropped userId_1 index');
    } catch (err) {
      console.log('Index userId_1 not found or already dropped:', err.message);
    }
    
    // Ensure the compound index exists
    try {
      await collection.createIndex(
        { userId: 1, conceptId: 1, courseId: 1 }, 
        { unique: true, name: 'userId_conceptId_courseId_unique' }
      );
      console.log('Created compound unique index');
    } catch (err) {
      console.log('Compound index already exists or error:', err.message);
    }
    
    // Create other indexes
    try {
      await collection.createIndex({ userId: 1, courseId: 1 });
      await collection.createIndex({ conceptId: 1 });
      console.log('Created additional indexes');
    } catch (err) {
      console.log('Additional indexes already exist or error:', err.message);
    }
    
    console.log('All indexes fixed successfully');
    
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndex(); 
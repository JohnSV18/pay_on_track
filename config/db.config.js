const mongoose = require("mongoose");
require('dotenv').config();

const uri = process.env.NODE_ENV === 'production'
  ? process.env.MONGODB_URI
  : process.env.MONGODB_LOCAL;

mongoose.Promise = global.Promise;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Cannot connect to database:", err.message);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error("Database connection error:", err.message);
});

mongoose.connection.once('open', async () => {
  try {
    const userCollection = mongoose.connection.collection('users');
    const indexes = await userCollection.indexes();
    const staleIndex = indexes.find(i => i.name === 'username_1');
    if (staleIndex) {
      await userCollection.dropIndex('username_1');
      console.log('Dropped stale username_1 index');
    }
  } catch (err) {
    console.error('Index cleanup error:', err.message);
  }
});

mongoose.set('debug', process.env.NODE_ENV === 'development');

module.exports = mongoose.connection;

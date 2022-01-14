const mongoose = require("mongoose");
assert = require("assert")
require('dotenv').config();

const url = process.env.MONGOD_URI
mongoose.connect(
  url,
  {
    useNewUrlParser: true, useUnifiedTopology: true
  },
  (err) => {
    assert.equal(null, err);
    console.log('Connected succesfully to database');
  }
);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.set('debug', true);

module.exports = mongoose.connection;


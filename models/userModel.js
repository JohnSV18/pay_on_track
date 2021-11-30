const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new  Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true }
}, { timestamps: true }); 


module.exports = model('User', userSchema);
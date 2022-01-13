const { Schema, model, Mongoose } = require('mongoose');

const billSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    description:{ type: String, minlength: 1, maxlength:20, required: true },
    amount: { type: Number, required: true },
    due_date: Date,
}, { timestamps: true });




module.exports = model('Bill', billSchema); 
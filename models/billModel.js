const { required } = require('joi');
const { Schema, model, mongoose } = require('mongoose');

const billSchema = new Schema({
    title: { 
        type: String, 
        required: true,
        maxlength: 100,
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    originalAmount: { 
        type: Number, 
        required: true,
        min: 0.01 
    },
    currentBalance: {
        type: Number,
        min: 0,
        required: true,
    },
    interestRate: {
        type: Number,
        min: 0,
        max: 100
    },
    minimumPayment: {
        type: Number,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    payments: [
        {
            paymentDate: {
                type: Date,
                default: Date.now(),
                required: true
            },
            paymentAmount: {
                type: Number,
                min: 0.01,
                required: true
            }
        }
    ],
    billStatus: {
        type: String,
        enum: ['active', 'paid', 'overdue'],
        default: 'active'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // ← Make this required!
        index: true // ← Add index for faster queries
  }
}, { 
    timestamps: true 
});

module.exports = model('Bill', billSchema); 
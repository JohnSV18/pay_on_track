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
    description: { 
        type: String, 
        minlength: 1, 
        maxlength: 50, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0.01 
    },
    dueDate: {
        type: Date,
        required: true
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
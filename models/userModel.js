const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new  Schema({
    username: { 
        type: String, 
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 10,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    }
}, { 
    timestamps: true 
}); 

userSchema.pre('save', function (next) {
  //ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified('password')) {
      return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (_, hash) => {
          user.password = hash;
          next();
      });
  });
});

userSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
      done(err, isMatch);
  });
};

module.exports = model('User', userSchema);
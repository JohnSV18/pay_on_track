const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();

const showHome = (req, res) => {
  try {
    const currentUser = req.user;
    return res.render('home', { currentUser });
  } catch (error) {
    console.error('Home page error: ', error.message);
    res.status(500).render('error', { message: 'Page load failed' });
  }
};

const showSignup = (req, res) => {
  try {
    return res.render('signup');
  } catch (error) {
    console.log('Signup page error: ', error.message);
    res.status(500).render('error', { message: 'Unable to load signup page'})
  }
};

const showLogin = (req, res) => {
  try {
    return res.render('login');
  } catch (error) {
    console.log('Login page error: ', error.message);
    res.status(500).render('error', { message: 'Unable to load login page'})
  }
};

const signup = async (req, res) => {
  try {
    const { username, email, password, passwordVerify } = req.body;

    if (!username || !password || !passwordVerify) {
      return res.status(400).json({
        success: false,
        message: 'Please enter all required fields.',
        formData: { username: username || '', email: email || '' }
      });
    }
    if (password.length < 6){
        return res
          .status(400)
          .json({ errorMessage: "Password must be at least 6 characters long." })
    }
    if (password !== passwordVerify){
      return res.status(400).json({
        errorMessage: "Passwords do not match."
      });
    }
    const existingUser = await User.findOne({ username });
      
    if (existingUser){
      return res
        .status(400)
        .json({ errorMessage: "Username already exists." });
    }

        // save a new user account to the database
    const user = new User(req.body);
    user
      .save()
      .then((user) => {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "60 days" });
        console.log(token);
        res.cookie("token", token, { maxAge: 900000, httpOnly: true });
        return res.redirect("/login");
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Account creation failed. Please try again.'
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  //validate 
  if (!username || !password){
    return res.render('login')
    // .status(400)
    //  .json({ errorMessage: "Please enter all required fields." })
  }
  
  User.findOne({ username }, 'username password')
    .then(user => {
      if (!user) {
        return res.status(401).send({ message: "Wrong Username or Password" })
      }
      user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).send({ message: "Wrong Username or password" })
      //   .json({ errorMessage: "Wrong username or password" });
      }
      //sign the token
      const token = jwt.sign({ _id: user._id , username: user.username}, process.env.JWT_SECRET, { expiresIn: "60 days" });
      // send the token in a HTTP-only cookie
      res.cookie("token", token, { maxAge: 900000, httpOnly: true });
      return res.redirect("/");
    })
    })
    .catch(err => {
    return console.log(err);
  })
}

const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.redirect("/");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
}

  module.exports = {
    showHome,
    showSignup,
    showLogin,
    signup, 
    login,
    logout
  }
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
    const { username, password, passwordVerify } = req.body;

    if (!username || !password || !passwordVerify) {
      return res.status(400).json({
        success: false,
        message: 'Please enter all required fields.',
        formData: { username: username || '' }
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ 
        errorMessage: "Password must be at least 6 characters long." 
      });
    }
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Passwords do not match."
      });
    }
    const existingUser = await User.findOne({ username });
      
    if (existingUser){
      return res.status(400).json({ 
        errorMessage: "Username already exists." 
      });
    }

    // save a new user account to the database 
    const user = new User(req.body);
    const savedUser = await user.save();

    console.log('User created:', savedUser.username);
    return res.redirect("/login");

  } catch (error) {
    console.log('Sign Up error: ', error.message);
    res.status(500).render('error', { message: 'Unable to complete sign up request'})
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    //validate 
    if (!username || !password){
      return res.render('login')
    }
    
    const user = await User.findOne({ username }, 'username password')
    if (!user) {
      return res.status(401).send({ message: "Wrong Username or Password" })
    }
    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).send({ message: "Wrong Username or password" })
      //   .json({ errorMessage: "Wrong username or password" });
      }
      //sign the token
      const token = jwt.sign({ _id: user._id , username: user.username}, process.env.JWT_SECRET, { expiresIn: "15m" });
      // send the token in a HTTP-only cookie
      res.cookie("token", token, {
      httpOnly: true,      // XSS protection
      secure: true,        // HTTPS only
      sameSite: 'strict',  // CSRF protection
      maxAge: 15 * 60 * 1000
    });
    return res.redirect("/");
  })
  } catch (error) {
    console.log('Log In error: ', error.message);
    res.status(500).render('error', { message: 'Unable to complete log in request'})
  }
}

const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.redirect("/");
  } catch (error) {
    console.log('Sign Out error: ', error.message);
    res.status(500).render('error', { message: 'Sign out request crashed, go back home to see if you have been logged out.'})
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
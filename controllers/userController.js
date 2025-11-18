const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const articleList = require('../data/financeArticles.json')

dotenv.config();

// Shows the homepage dashbboard
const showHome = (req, res) => {
  try {
    const currentUser = req.user;
    return res.render('home', { currentUser });
  } catch (error) {
    console.error('Home page error: ', error.message);
    req.flash('error', 'Page load failed');
    return res.redirect('/');
  }
};

// shows the articles page with links to financial articles
const showArticles = (req, res) => {
  try {
    const currentUser = req.user;
    res.render('articles', { articles: articleList, currentUser })
  } catch (error) {
    console.error('Articles Error', error.message)
    res.status(500).render('error', { message: 'Error getting all the articles' });  
  }
};

// Displays the signup form to create a new user
const showSignup = (req, res) => {
  try {
    return res.render('signup');
  } catch (error) {
    console.log('Signup page error: ', error.message);
    req.flash('error', 'Unable to load signup page');
    return res.redirect('/signup');
  }
};

// Displays the login form to login existing user
const showLogin = (req, res) => {
  try {
    return res.render('login');
  } catch (error) {
    console.log('Login page error: ', error.message);
    req.flash('error', 'Unable to load login page');
    return res.redirect('/login');
  }
};

// POST request submitting the filled out form to sign up
const signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/signup')
    }

    // save a new user account to the database 
    const user = new User(req.body);
    const savedUser = await user.save();

    req.flash('success', 'Username created')
    console.log('User created:', savedUser.username);
    return res.redirect("/login");

  } catch (error) {
      console.error('Signup error:', error);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/signup');
  }
};

// POST request logging in an existing user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username }, 'username password')
    if (!user) {
      req.flash('error', 'Wrong Username or Password');
      return res.redirect('/login');
    }
    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) {
        req.flash('error', 'Wrong Username or Password');
        return res.redirect('/login');
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
    req.flash('error', 'Unable to complete log in request');
    return res.redirect('/login');
  }
}

// Loging out of exsting user account
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
    showArticles,
    showLogin,
    signup, 
    login,
    logout
  }
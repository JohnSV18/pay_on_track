const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const articleList = require('../data/financeArticles.json');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

dotenv.config();

const showHome = (req, res) => {
  try {
    const currentUser = req.user;
    return res.render('home', { currentUser });
  } catch (error) {
    console.error('Home page error: ', error.message);
    return res.status(500).render('error', {
      pageTitle: 'Error',
      statusCode: 500,
      message: 'Page load failed.'
    });
  }
};

const showArticles = (req, res) => {
  try {
    const currentUser = req.user;
    res.render('articles', { articles: articleList, currentUser })
  } catch (error) {
    console.error('Articles Error', error.message)
    res.status(500).render('error', { message: 'Error getting all the articles' });
  }
};

const showSignup = (req, res) => {
  try {
    return res.render('signup');
  } catch (error) {
    console.log('Signup page error: ', error.message);
    req.flash('error', 'Unable to load signup page');
    return res.redirect('/signup');
  }
};

const showLogin = (req, res) => {
  try {
    return res.render('login');
  } catch (error) {
    console.log('Login page error: ', error.message);
    req.flash('error', 'Unable to load login page');
    return res.redirect('/login');
  }
};

const showVerify = (req, res) => {
  try {
    if (!req.session.pendingEmail) {
      return res.redirect('/signup');
    }
    return res.render('verifyEmail');
  } catch (error) {
    console.log('Verify page error: ', error.message);
    return res.redirect('/signup');
  }
};

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.emailVerified) {
      req.flash('error', 'An account with that email already exists');
      return res.redirect('/signup');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    if (existingUser && !existingUser.emailVerified) {
      // Resend a fresh code to an existing unverified account
      existingUser.password = password;
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpiry = verificationCodeExpiry;
      await existingUser.save();
    } else {
      const user = new User({ email, password, verificationCode, verificationCodeExpiry });
      await user.save();
    }

    await sendVerificationEmail(email, verificationCode);

    req.session.pendingEmail = email;
    req.flash('success', 'Check your email for a 6-digit verification code');
    return res.redirect('/verify-email');
  } catch (error) {
    console.error('Signup error:', error.message);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/signup');
  }
};

const verifyEmail = async (req, res) => {
  try {
    const email = req.session.pendingEmail;
    const { code } = req.body;

    if (!email) {
      req.flash('error', 'Session expired. Please sign up again.');
      return res.redirect('/signup');
    }

    const user = await User.findOne({ email, emailVerified: false });

    if (!user) {
      req.flash('error', 'No pending verification found. Please sign up again.');
      return res.redirect('/signup');
    }

    if (user.verificationCode !== code || Date.now() > user.verificationCodeExpiry) {
      req.flash('error', 'Invalid or expired verification code');
      return res.redirect('/verify-email');
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    delete req.session.pendingEmail;
    req.flash('success', 'Email verified! You can now log in.');
    return res.redirect('/login');
  } catch (error) {
    console.error('Verify email error:', error.message);
    req.flash('error', 'Verification failed. Please try again.');
    return res.redirect('/verify-email');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }, 'email password emailVerified');
    if (!user) {
      req.flash('error', 'Wrong email or password');
      return res.redirect('/login');
    }

    if (!user.emailVerified) {
      req.session.pendingEmail = email;
      req.flash('error', 'Please verify your email before logging in.');
      return res.redirect('/verify-email');
    }

    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) {
        req.flash('error', 'Wrong email or password');
        return res.redirect('/login');
      }
      const token = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });
      return res.redirect('/');
    });
  } catch (error) {
    console.log('Log In error: ', error.message);
    req.flash('error', 'Unable to complete log in request');
    return res.redirect('/login');
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('token');
    return res.redirect('/');
  } catch (error) {
    console.log('Sign Out error: ', error.message);
    res.status(500).render('error', { message: 'Sign out request crashed, go back home to see if you have been logged out.' });
  }
};

const showForgotPassword = (req, res) => {
  try {
    return res.render('forgotPassword');
  } catch (error) {
    console.log('Forgot password page error: ', error.message);
    return res.redirect('/forgot-password');
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, emailVerified: true });

    // Always show the same message to avoid leaking whether the email exists
    req.flash('success', 'If an account with that email exists, a reset link has been sent.');

    if (!user) {
      return res.redirect('/forgot-password');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    return res.redirect('/forgot-password');
  } catch (error) {
    console.error('Forgot password error:', error.message);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/forgot-password');
  }
};

const showResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      req.flash('error', 'This password reset link is invalid or has expired.');
      return res.redirect('/forgot-password');
    }

    return res.render('resetPassword', { token });
  } catch (error) {
    console.log('Reset password page error: ', error.message);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/forgot-password');
  }
};

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  passwordVerify: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password',
    'string.empty': 'Please confirm your password'
  })
});

const resetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      req.flash('error', error.details[0].message);
      return res.redirect(`/reset-password/${token}`);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      req.flash('error', 'This password reset link is invalid or has expired.');
      return res.redirect('/forgot-password');
    }

    user.password = value.password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    req.flash('success', 'Password updated! You can now log in with your new password.');
    return res.redirect('/login');
  } catch (error) {
    console.error('Reset password error:', error.message);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect(`/reset-password/${token}`);
  }
};

module.exports = {
  showHome,
  showSignup,
  showArticles,
  showLogin,
  showVerify,
  signup,
  verifyEmail,
  login,
  logout,
  showForgotPassword,
  forgotPassword,
  showResetPassword,
  resetPassword
};

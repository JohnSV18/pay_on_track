const db = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = db.users;

dotenv.config();

exports.showHome = (req, res) => {
    res.render("home");
}
exports.showSignup = (req, res) => {
    res.render("signup");
}
exports.showLogin = (req, res) => {
    res.render("login");
}
//Sign up user with authentication
exports.signup = async (req, res) => {
    try {
      const { username, password, passwordVerify } = req.body;
  
      if (!username || !password || !passwordVerify)
        return res
          .status(400)
          .json({ errorMessage: "Please enter all required fields." })
  
      if (password.length < 6)
        return res
          .status(400)
          .json({ errorMessage: "Password must be at least 6 characters long." })
  
      if (password !== passwordVerify)
        return res.status(400).json({
          errorMessage: "Passwords do not match."
        });
      
      const existingUser = await User.findOne({ username });
      
      if (existingUser)
        return res
          .status(400)
          .json({ errorMessage: "Username already exists." });
  
      // hash the password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
  
      // save a new user account to the database
      
      const newUser = new User({
        username,
        passwordHash
      });
  
      const savedUser = await newUser.save();
  
      //sign the token
  
      const token = jwt.sign(
        {
          user: savedUser._id,
        },
        process.env.JWT_SECRET
      );
      
  
      // send the token in a HTTP-only cookie
      res
      .cookie("token", token, {
        httpOnly: true,
      }).send()
      .redirect("/")
  
    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
      
  };
//Log in user 
// log in a user
exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
      //validate 
      if (!username || !password)
      return res.render('login')
        // .status(400)
         .json({ errorMessage: "Please enter all required fields." })
        
      
      const existingUser = await User.findOne({ username });
      if (!existingUser)
        return res
          .status(401)
          .json({ errorMessage: "Wrong username or password" });
      const passwordCorrect = await bcrypt.compare(
        password,
        existingUser.passwordHash
      );
      if (!passwordCorrect)
        return res
          .status(401)
          .json({ errorMessage: "Wrong username or password" });
  
      //sign the token
      const token = jwt.sign(
        {
          user: existingUser._id,
        },
        process.env.JWT_SECRET
      );

      // send the token in a HTTP-only cookie
      res
      .redirect("/")
      .cookie("token", token, {
        httpOnly: true,
      }).send()
        
    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
  };

  exports.logout = (req, res) => {
    res
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
      })
      .send();
  };
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require("../models/userModel");

dotenv.config();

exports.showHome = (req, res) => {
  try {
    const currentUser = req.user;
    return res.render("home", { currentUser });
  } catch (err) {
    console.log(err.message);
  }
};
exports.showSignup = (req, res) => {
    return res.render("signup");
};
exports.showLogin = (req, res) => {
    return res.render("login");
};

//Sign up user contoller with password verification. Also logs user in automatically after sign up.
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
    } catch (err) {
      console.error(err);
      return res.status(500).send({ err });
    }
      
  };

// log in a user
exports.login = async (req, res) => {

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
      
  };

  exports.logout = (req, res) => {
    res.clearCookie("token");
    return res.redirect("/");
  };
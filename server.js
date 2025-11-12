const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const flash = require('connect-flash');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const checkAuth = require('./middleware/auth');
assert = require("assert");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600 // lazy session update - only update once per 24 hours
  }),
    cookie: { maxAge: 60000 }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use("/bootstrap", express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(checkAuth);
app.use(express.static('public'));

app.set('view engine', 'hbs')
app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'index'
}))

require("./config/db.config.js");
require("./routes/billRoutes")(app);
require("./routes/userRoutes")(app);

app.listen("0.0.0.0", () => {
  console.log(`Pay-On-Track server running on port ${PORT}`);
});

module.exports = app;
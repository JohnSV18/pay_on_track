const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const checkAuth = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Trust Railway's reverse proxy so rate limiting and cookies work correctly
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
      fontSrc: ["'self'", "cdn.jsdelivr.net", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_LOCAL,
      touchAfter: 24 * 3600
    }),
    cookie: {
      maxAge: 60000,
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict'
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

app.use(cors({
  origin: process.env.BASE_URL || false,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use("/bootstrap", express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(checkAuth);
app.use(express.static('public'));

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'index'
}));

require("./config/db.config.js");
require("./jobs/billReminder");
require("./routes/billRoutes")(app);
require("./routes/userRoutes")(app);

app.listen(PORT, () => {
  console.log(`Pay-On-Track server running on port ${PORT}`);
});

module.exports = app;

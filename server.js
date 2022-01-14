const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const handlebars = require('express-handlebars')
const methodOverride = require('method-override');
const checkAuth = require('./middleware/auth')
const paginate = require('express-paginate')

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use("/bootstrap", express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(checkAuth);




app.set('view engine', 'hbs')
app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'index'
}))
app.use(express.static('public'));

require("./config/db.config.js");
require("./routes/billRoutes")(app);
require("./routes/userRoutes")(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
});

module.exports = app;
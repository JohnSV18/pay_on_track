const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const handlebars = require('express-handlebars')
const methodOverride = require('method-override');

const app = express();
const port = 8000;
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use("/bootstrap", express.static(__dirname + '/node_modules/bootstrap/dist/'));




app.set('view engine', 'hbs')
app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'index'
}))
require("./config/db.config.js");
require("./routes/billRoutes")(app);
require("./routes/userRoutes")(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
});
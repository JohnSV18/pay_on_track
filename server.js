const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const handlebars = require('express-handlebars')

const app = express();
const port = 8000;
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/bootstrap", express.static(__dirname + '/node_modules/bootstrap/dist/'));



const db = require("./models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


app.set('view engine', 'hbs')
app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'index'
}))

require("./routes/billRoutes")(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});
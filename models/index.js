const dbConfig = require("../config/db.config");
const mongoose = require("mongoose");

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.bills = require("./billModel")(mongoose)
db.users = require("./userModel")(mongoose)

module.exports = db;

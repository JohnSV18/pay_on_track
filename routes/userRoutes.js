module.exports = app => {
    const users = require("../controllers/userController.js");
    const { validate } = require('../middleware/validation.js')
    var router = require("express").Router();

    //go home
    router.get("/", users.showHome);

    router.get("/signup", users.showSignup);

    router.post("/signup", validate('user'), users.signup);

    router.get("/login", users.showLogin);

    router.post("/login", validate('login'), users.login);

    router.get("/logout", users.logout);

    app.use("/", router);
}
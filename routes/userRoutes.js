module.exports = app => {
    const { showHome, 
            showSignup,
            showLogin,
            signup, 
            login,
            logout } = require("../controllers/userController.js");
    // const users = require("../controllers/userController.js");
    const { validate } = require('../middleware/validation.js')
    var router = require("express").Router();

    //go home
    router.get("/", showHome);

    router.get("/signup", showSignup);

    router.post("/signup", validate('user'), signup);

    router.get("/login", showLogin);

    router.post("/login", validate('login'), login);

    router.get("/logout", logout);

    app.use("/", router);
}
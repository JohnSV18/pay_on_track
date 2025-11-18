module.exports = app => {
    const { showHome, 
            showSignup,
            showLogin,
            signup, 
            login,
            logout, 
            showArticles} = require("../controllers/userController.js");
    const { validate } = require('../middleware/validation.js');
    const noCache = require('../middleware/noCache');
    var router = require("express").Router();

    //go home
    router.get("/", showHome);

    router.get("/signup", showSignup);

    router.get("/articles", showArticles);

    router.post("/signup", validate('user'), signup);

    router.get("/login", showLogin);

    router.post("/login", noCache, validate('login'), login);

    router.get("/logout", noCache, logout);

    app.use("/", router);
}
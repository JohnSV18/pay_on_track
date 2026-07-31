module.exports = app => {
    const { showHome,
            showSignup,
            showLogin,
            showVerify,
            signup,
            verifyEmail,
            login,
            logout,
            showArticles,
            showForgotPassword,
            forgotPassword,
            showResetPassword,
            resetPassword } = require("../controllers/userController.js");
    const { validate } = require('../middleware/validation.js');
    const noCache = require('../middleware/noCache');
    var router = require("express").Router();

    router.get("/", noCache, showHome);

    router.get("/signup", showSignup);
    router.post("/signup", validate('user'), signup);

    router.get("/verify-email", noCache, showVerify);
    router.post("/verify-email", noCache, verifyEmail);

    router.get("/login", showLogin);
    router.post("/login", noCache, validate('login'), login);

    router.get("/logout", noCache, logout);

    router.get("/articles", noCache, showArticles);

    router.get("/forgot-password", showForgotPassword);
    router.post("/forgot-password", validate('forgotPassword'), forgotPassword);

    router.get("/reset-password/:token", showResetPassword);
    router.post("/reset-password/:token", resetPassword);

    app.use("/", router);
}
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
    const rateLimit = require('express-rate-limit');
    var router = require("express").Router();

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            req.flash('error', 'Too many attempts. Please wait 15 minutes and try again.');
            res.redirect('back');
        }
    });

    router.get("/", noCache, showHome);

    router.get("/signup", showSignup);
    router.post("/signup", authLimiter, validate('user'), signup);

    router.get("/verify-email", noCache, showVerify);
    router.post("/verify-email", authLimiter, noCache, verifyEmail);

    router.get("/login", showLogin);
    router.post("/login", authLimiter, noCache, validate('login'), login);

    router.get("/logout", noCache, logout);

    router.get("/articles", noCache, showArticles);

    router.get("/forgot-password", showForgotPassword);
    router.post("/forgot-password", authLimiter, validate('forgotPassword'), forgotPassword);

    router.get("/reset-password/:token", showResetPassword);
    router.post("/reset-password/:token", authLimiter, resetPassword);

    app.use("/", router);
}
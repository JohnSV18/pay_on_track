const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        req.user = null;
        next();
    }
}
module.exports = auth;
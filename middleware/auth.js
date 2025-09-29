const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    try {
        const token = req.cookies.token;
        console.log('Checking Authentication');
        if (token === 'undefined' || token === null) {
            req.user = null;
            return res.status(401).json({ errorMessage: "Unauthorized" });
        } else {
            const decodedToken = jwt.decode(token, { complete: true }) || {};
            req.user = decodedToken.payload;
            
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({errorMessage: 'Unauthorized'});
     }
}
module.exports = auth;
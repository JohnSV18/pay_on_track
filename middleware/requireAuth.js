const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).render('error', {
            pageTitle: 'Access Denied',
            statusCode: 401,
            message: 'You must be logged in to view this page.'
        });
    }
    next();
};

module.exports = requireAuth;

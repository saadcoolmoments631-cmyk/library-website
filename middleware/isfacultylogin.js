const jwt = require('jsonwebtoken');

const isFacultyLoggedIn = (req, res, next) => {
    try {
        const token = req.cookies.facultytoken;

        if (!token) {
            return res.redirect('/faculty/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();

    } catch (err) {
        res.clearCookie('facultytoken');
        return res.redirect('/');
    }
};

module.exports = { isFacultyLoggedIn };
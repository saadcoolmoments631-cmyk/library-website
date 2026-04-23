const jwt = require('jsonwebtoken');

const isStudentLoggedIn = (req, res, next) => {
    try {
        const token = req.cookies.studenttoken;

        if (!token) {
            return res.redirect('/student/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;   // { id, role }
        next();

    } catch (err) {
        res.clearCookie('studenttoken');
        return res.redirect('/');
    }
};

module.exports = { isStudentLoggedIn };



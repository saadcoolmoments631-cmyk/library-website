const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentModel = require('../models/Student');
const Issue = require('../models/Issue');

const { isStudentLoggedIn } = require('../middleware/isStudentLoggedIn'); // ✅ FIXED

// ================= REGISTER =================
router.get('/register', (req, res) => {
    res.render('student-register');
});

router.post('/register', async (req, res) => {
    try {
        const { name,studentID, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = new studentModel({
            name,
            email,
            studentID,
            password: hashedPassword,
            role: 'student'
        });

        await student.save();

        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('studenttoken', token, { httpOnly: true });

        res.json({
            success: true,
            message: "Student Registered Successfully!"
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ================= LOGIN =================
router.get('/login', (req, res) => {
    res.render('student-login');
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await studentModel.findOne({ email });

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('studenttoken', token, { httpOnly: true });

        res.redirect('/student/dashboard');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ================= DASHBOARD =================
router.get('/dashboard', isStudentLoggedIn, async (req, res) => {
    try {
        const student = await studentModel.findById(req.user.id);

        const myBooks = await Issue.find({ studentId: req.user.id })
            .populate('bookId');

        res.render('student-dashboard', {
            student,
            books: myBooks
        });
      

    } catch (err) {
        res.status(500).send("Error loading dashboard");
    }
});


// ================= MY BOOKS =================
router.get('/my-books', isStudentLoggedIn, async (req, res) => {
    try {
        const myBooks = await Issue.find({ studentId: req.user.id })
            .populate('bookId');

        res.json({
            success: true,
            data: myBooks
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// ================= LOGOUT =================
router.get('/logout', (req, res) => {
    res.clearCookie('studenttoken');
    res.redirect('/student/login');
});

module.exports = router;
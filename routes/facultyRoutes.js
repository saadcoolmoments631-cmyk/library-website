const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const Student = require('../models/student');
const facultyModel = require('../models/Faculty');
const Issue = require('../models/Issue');
const { isFacultyLoggedIn } = require('../middleware/isFacultyLoggedIn');



// ================= REGISTER =================
router.get('/register', (req, res) => {
    res.render('faculty-register');
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, employeeID, department } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const faculty = new facultyModel({
            name,
            email,
            password: hashedPassword,
            employeeID,
            department,
            role: 'faculty'
        });

        await faculty.save();

        res.status(201).json({
            success: true,
            message: "Faculty Registered Successfully!"
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ================= LOGIN =================
router.get('/login', (req, res) => {
    res.render('faculty-login');
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const faculty = await facultyModel.findOne({ email });

        if (!faculty) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, faculty.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('facultytoken', token, { httpOnly: true });
        
    
        res.redirect('/faculty/dashboard');

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ================= DASHBOARD =================
router.get('/dashboard', isFacultyLoggedIn, async (req, res) => {
    const books = await Book.find();
    const students = await Student.find();

    res.render('faculty-dashboard', {
        books,
        students
    });
});


// ================= ADD BOOK =================
router.post('/add-book', isFacultyLoggedIn, async (req, res) => {
    const { title, author, isbn, qty } = req.body;

    await Book.create({
        title,
        author,
        isbn,
        totalQty: qty,
        availableQty: qty
    });

    res.redirect('/faculty/dashboard');
});


// ================= DELETE BOOK =================
router.get('/delete-book/:id', isFacultyLoggedIn, async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/faculty/dashboard');
});


// ================= EDIT BOOK PAGE =================
router.get('/edit-book/:id', isFacultyLoggedIn, async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('edit-book', { book });
});


// ================= UPDATE BOOK =================
router.post('/update-book/:id', isFacultyLoggedIn, async (req, res) => {
    const { title, author, qty } = req.body;

    await Book.findByIdAndUpdate(req.params.id, {
        title,
        author,
        availableQty: qty
    });

    res.redirect('/faculty/dashboard');
});


// ================= ISSUE BOOK =================
router.post('/issue-book', isFacultyLoggedIn, async (req, res) => {
    const { studentId, bookId } = req.body;

    const book = await Book.findById(bookId);

    if (book.availableQty <= 0) {
        return res.send("No books available");
    }

    await Issue.create({ studentId, bookId });

    book.availableQty -= 1;
    await book.save();

    res.redirect('/faculty/dashboard');
});


// ================= LOGOUT =================
router.get('/logout', (req, res) => {
    res.clearCookie('facultytoken');
    res.redirect('/faculty/login');
});

module.exports = router;
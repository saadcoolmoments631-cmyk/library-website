const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Routes
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

// Middleware
const { isStudentLoggedIn } = require('./middleware/isStudentLogin');
const { isFacultyLoggedIn } = require('./middleware/isFacultyLogin');

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.use('/student', studentRoutes);
app.use('/faculty', facultyRoutes);



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server on http://localhost:${port}`));
const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true
    },
    email: {
        type: String,   
        required: true,                                 
    },
    studentID: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true  
    },
    role: {
        type: String,
        default: 'student'
    }

});     


// Purana code: 
// module.exports = mongoose.model('Student', studentSchema);

// Naya code (Safe way):
module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);

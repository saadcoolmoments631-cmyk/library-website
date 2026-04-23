const mongoose = require('mongoose');
const issueSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issueDate: { type: Date, default: Date.now },
    dueDate: Date
});
module.exports = mongoose.model('Issue', issueSchema);




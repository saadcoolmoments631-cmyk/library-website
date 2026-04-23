const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MONGO_URI variable ko .env se utha raha hai
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error: ", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;